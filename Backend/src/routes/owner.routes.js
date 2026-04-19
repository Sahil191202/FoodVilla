import { Router } from "express";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { verifyRestaurantOwner, verifyOwnerApproved } from "../middlewares/owner.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Restaurant } from "../models/Restaurant.model.js";
import { Reservation } from "../models/Reservation.model.js";
import { Subscription } from "../models/Subscription.model.js";
import { USER_ROLES } from "../utils/constants.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createRestaurantSchema } from "../validators/restaurant.validator.js";
import cloudinary from "../config/cloudinary.js";
import multer from "multer";
import {
  completeReservation,
  markNoShow,
} from "../services/reservation.service.js";
import { getRestaurantAnalytics } from "../services/analytics.service.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(verifyJWT);
router.use(authorizeRoles(USER_ROLES.OWNER, USER_ROLES.ADMIN));
router.use(verifyOwnerApproved);

// -------------------------------------------------------
// Check active subscription middleware
// -------------------------------------------------------
const requireSubscription = asyncHandler(async (req, res, next) => {
  // Admin bypass
  if (req.user.role === USER_ROLES.ADMIN) return next();

  const subscription = await Subscription.findOne({
    owner: req.user._id,
    status: "active",
  });

  if (!subscription) {
    throw new ApiError(
      403,
      "Active subscription required. Please subscribe to access owner features."
    );
  }

  req.subscription = subscription;
  next();
});

router.use(requireSubscription);

// -------------------------------------------------------
// RESTAURANTS
// -------------------------------------------------------
router.get("/restaurants", asyncHandler(async (req, res) => {
  const restaurants = await Restaurant.find({
    owner: req.user._id,
  }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, { count: restaurants.length, restaurants }, "Restaurants fetched")
  );
}));

router.post(
  "/restaurants",
  validate(createRestaurantSchema),
  asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.create({
      ...req.body,
      owner: req.user._id,
      isApproved: false,
    });

    return res.status(201).json(
      new ApiResponse(201, restaurant, "Restaurant added! Pending admin approval.")
    );
  })
);

router.patch(
  "/restaurants/:id",
  verifyRestaurantOwner,
  asyncHandler(async (req, res) => {
    const { owner, isApproved, isBanned, ...allowedUpdates } = req.body;

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
router.post(
  "/restaurants/:id/images",
  verifyRestaurantOwner,
  upload.array("images", 5),
  asyncHandler(async (req, res) => {
    if (!req.files?.length) {
      throw new ApiError(400, "No images provided");
    }

    const imageUrls = [];

    for (const file of req.files) {
      const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
      const result = await cloudinary.uploader.upload(base64, {
        folder: "goodfoods/restaurants",
        transformation: [
          { width: 800, height: 600, crop: "fill" },
          { quality: "auto" },
          { format: "webp" },
        ],
      });
      imageUrls.push(result.secure_url);
    }

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

// Get analytics for a specific restaurant
router.get(
  "/analytics/:restaurantId",
  asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;
    const { days = 30 } = req.query;

    // Verify ownership
    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      owner: req.user._id,
    });

    if (!restaurant && req.user.role !== USER_ROLES.ADMIN) {
      throw new ApiError(403, "Not authorized");
    }

    const analytics = await getRestaurantAnalytics(restaurantId, Number(days));

    return res.status(200).json(
      new ApiResponse(200, analytics, "Analytics fetched")
    );
  })
);

// -------------------------------------------------------
// RESERVATIONS
// -------------------------------------------------------
router.get("/reservations", asyncHandler(async (req, res) => {
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
    new ApiResponse(200, { count: reservations.length, reservations }, "Reservations fetched")
  );
}));

router.patch(
  "/reservations/:id/complete",
  asyncHandler(async (req, res) => {
    const reservation = await completeReservation(
      req.params.id,
      req.user._id
    );

    return res.status(200).json(
      new ApiResponse(200, reservation, "Reservation completed!")
    );
  })
);

router.patch(
  "/reservations/:id/noshow",
  asyncHandler(async (req, res) => {
    const reservation = await markNoShow(req.params.id, req.user._id);

    return res.status(200).json(
      new ApiResponse(200, reservation, "Marked as no-show")
    );
  })
);

export default router;