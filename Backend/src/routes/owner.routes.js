import { Router } from "express";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { verifyRestaurantOwner, verifyOwnerApproved } from "../middlewares/owner.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Restaurant } from "../models/Restaurant.model.js";
import { Reservation } from "../models/Reservation.model.js";
import { getOwnerCommissionSummary, earnCommission } from "../services/commission.service.js";
import { USER_ROLES } from "../utils/constants.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createRestaurantSchema } from "../validators/restaurant.validator.js";
import cloudinary from "../config/cloudinary.js";
import multer from "multer";

const router = Router();

// All owner routes need auth + owner role + approved
router.use(verifyJWT);
router.use(authorizeRoles(USER_ROLES.OWNER, USER_ROLES.ADMIN));
router.use(verifyOwnerApproved);

// Get my restaurants
router.get("/restaurants", asyncHandler(async (req, res) => {
  const restaurants = await Restaurant.find({
    owner: req.user._id,
  }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      { count: restaurants.length, restaurants },
      "Restaurants fetched"
    )
  );
}));

// Add restaurant
router.post(
  "/restaurants",
  validate(createRestaurantSchema),
  asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.create({
      ...req.body,
      owner: req.user._id,
      commissionRate: req.user.commissionRate,
      isApproved: false, // Admin must approve!
    });

    return res.status(201).json(
      new ApiResponse(201, restaurant, "Restaurant added! Pending admin approval.")
    );
  })
);

// Update restaurant details
router.patch(
  "/restaurants/:id",
  verifyRestaurantOwner,
  asyncHandler(async (req, res) => {
    // Owner cannot change owner or commissionRate
    const { owner, commissionRate, isApproved, ...allowedUpdates } = req.body;

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      allowedUpdates,
      { new: true, runValidators: true }
    );

    return res.status(200).json(
      new ApiResponse(200, restaurant, "Restaurant updated successfully")
    );
  })
);

// Upload restaurant images
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/restaurants/:id/images",
  verifyRestaurantOwner,
  upload.array("images", 5), // Max 5 images
  asyncHandler(async (req, res) => {
    if (!req.files?.length) {
      throw new ApiError(400, "No images provided");
    }

    const imageUrls = [];

    // Upload each image to cloudinary
    for (const file of req.files) {
      const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
      const result = await cloudinary.uploader.upload(base64, {
        folder: "goodfoods/restaurants",
        transformation: [
          { width: 800, height: 600, crop: "fill" },
          { quality: "auto" },
        ],
      });
      imageUrls.push(result.secure_url);
    }

    // Add to restaurant images array
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { $push: { images: { $each: imageUrls } } },
      { new: true }
    );

    return res.status(200).json(
      new ApiResponse(200, restaurant, "Images uploaded successfully")
    );
  })
);

// Delete specific image
router.delete(
  "/restaurants/:id/images",
  verifyRestaurantOwner,
  asyncHandler(async (req, res) => {
    const { imageUrl } = req.body;

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { $pull: { images: imageUrl } },
      { new: true }
    );

    return res.status(200).json(
      new ApiResponse(200, restaurant, "Image deleted successfully")
    );
  })
);

// Get reservations for my restaurants
router.get("/reservations", asyncHandler(async (req, res) => {
  // Get all my restaurant IDs
  const myRestaurants = await Restaurant.find({
    owner: req.user._id,
  }).select("_id");

  const restaurantIds = myRestaurants.map((r) => r._id);

  const reservations = await Reservation.find({
    restaurant: { $in: restaurantIds },
  })
    .populate("user", "name email phone")
    .populate("restaurant", "name address")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      { count: reservations.length, reservations },
      "Reservations fetched"
    )
  );
}));

// Mark reservation as completed — triggers commission!
router.patch(
  "/reservations/:id/complete",
  asyncHandler(async (req, res) => {
    const reservation = await Reservation.findById(req.params.id).populate(
      "restaurant"
    );

    if (!reservation) {
      throw new ApiError(404, "Reservation not found");
    }

    // Verify this reservation is for owner's restaurant
    if (
      reservation.restaurant.owner.toString() !== req.user._id.toString() &&
      req.user.role !== USER_ROLES.ADMIN
    ) {
      throw new ApiError(403, "Not authorized");
    }

    if (reservation.status !== "confirmed") {
      throw new ApiError(400, "Only confirmed reservations can be completed");
    }

    reservation.status = "completed";
    await reservation.save();

    // ✅ Earn commission!
    await earnCommission(reservation._id);

    return res.status(200).json(
      new ApiResponse(200, reservation, "Reservation completed. Commission earned!")
    );
  })
);

// Get my commission summary
router.get("/commissions", asyncHandler(async (req, res) => {
  const data = await getOwnerCommissionSummary(req.user._id);

  return res.status(200).json(
    new ApiResponse(200, data, "Commission summary fetched")
  );
}));

export default router;