import { Router } from "express";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.model.js";
import { Restaurant } from "../models/Restaurant.model.js";
import { Reservation } from "../models/Reservation.model.js";
import { Subscription } from "../models/Subscription.model.js";
import { SubscriptionPlan } from "../models/SubscriptionPlan.model.js";
import { getPlatformAnalytics } from "../services/analytics.service.js";
import { USER_ROLES, RESERVATION_STATUS } from "../utils/constants.js";
import { sendOwnerApprovalEmail } from "../services/notification.service.js";

const router = Router();
router.use(verifyJWT);
router.use(authorizeRoles(USER_ROLES.ADMIN));

// -------------------------------------------------------
// DASHBOARD STATS
// -------------------------------------------------------
router.get("/stats", asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalOwners,
    totalRestaurants,
    approvedRestaurants,
    featuredRestaurants,
    totalReservations,
    activeSubscriptions,
    premiumSubs,
    featuredSubs,
    platformAnalytics,
  ] = await Promise.all([
    User.countDocuments({ role: USER_ROLES.USER }),
    User.countDocuments({ role: USER_ROLES.OWNER }),
    Restaurant.countDocuments(),
    Restaurant.countDocuments({ isApproved: true, isBanned: false }),
    Restaurant.countDocuments({ isFeatured: true }),
    Reservation.countDocuments(),
    Subscription.countDocuments({ status: "active" }),
    Subscription.countDocuments({ status: "active", planName: "premium" }),
    Subscription.countDocuments({ status: "active", planName: "featured" }),
    getPlatformAnalytics(),
  ]);

  // Revenue from subscriptions
  const revenueData = await Subscription.aggregate([
    { $match: { status: "active", planName: { $ne: "free" } } },
    { $unwind: "$payments" },
    { $match: { "payments.status": "success" } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$payments.amount" },
      },
    },
  ]);

  const totalRevenue = revenueData[0]?.totalRevenue || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalUsers,
        totalOwners,
        totalRestaurants,
        approvedRestaurants,
        featuredRestaurants,
        totalReservations,
        activeSubscriptions,
        premiumSubs,
        featuredSubs,
        totalRevenue,
        platformAnalytics,
      },
      "Stats fetched"
    )
  );
}));

// -------------------------------------------------------
// OWNER MANAGEMENT
// -------------------------------------------------------
router.get("/owners", asyncHandler(async (req, res) => {
  const owners = await User.find({ role: USER_ROLES.OWNER })
    .select("-password -refreshToken")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, { owners }, "Owners fetched"));
}));

// Approve / reject owner
router.patch("/owners/:id/approval", asyncHandler(async (req, res) => {
  const { isApproved } = req.body;

  const owner = await User.findByIdAndUpdate(
    req.params.id,
    {
      ownerStatus: isApproved ? "approved" : "rejected",
    },
    { returnDocument: "after", runValidators: true },
  ).select("-password -refreshToken");

  if (!owner) throw new ApiError(404, "Owner not found");

  // ✅ Send approval/rejection email
  try {
    await sendOwnerApprovalEmail({
      email: owner.email,
      name: owner.name,
      approved: isApproved,
    });
  } catch (err) {
    console.error("Approval email failed:", err.message);
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      owner,
      `Owner ${isApproved ? "approved! Email sent 📧" : "rejected"}`
    )
  );
}));

// Ban / unban owner
router.patch("/owners/:id/ban", asyncHandler(async (req, res) => {
  const { isBanned, banReason } = req.body;

  const owner = await User.findByIdAndUpdate(
    req.params.id,
    { isBanned, banReason: isBanned ? banReason : null },
    { new: true }
  ).select("-password -refreshToken");

  if (!owner) throw new ApiError(404, "Owner not found");

  // If banned — also ban all their restaurants
  if (isBanned) {
    await Restaurant.updateMany(
      { owner: req.params.id },
      { isBanned: true, banReason: `Owner banned: ${banReason}` }
    );
  } else {
    // Unban restaurants too
    await Restaurant.updateMany(
      { owner: req.params.id },
      { isBanned: false, banReason: null }
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        owner,
        `Owner ${isBanned ? "banned" : "unbanned"}`
      )
    );
}));

// -------------------------------------------------------
// RESTAURANT MANAGEMENT
// -------------------------------------------------------
router.get("/restaurants", asyncHandler(async (req, res) => {
  const restaurants = await Restaurant.find()
    .populate("owner", "name email businessName currentPlan")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { count: restaurants.length, restaurants },
        "Restaurants fetched"
      )
    );
}));

// Approve / reject restaurant
router.patch(
  "/restaurants/:id/approval",
  asyncHandler(async (req, res) => {
    const { isApproved } = req.body;

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    ).populate("owner", "name email");

    if (!restaurant) throw new ApiError(404, "Restaurant not found");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          restaurant,
          `Restaurant ${isApproved ? "approved! Now live 🎉" : "rejected"}`
        )
      );
  })
);

// Verify restaurant — shows verified badge
router.patch(
  "/restaurants/:id/verify",
  asyncHandler(async (req, res) => {
    const { isVerified } = req.body;

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { isVerified },
      { new: true }
    );

    if (!restaurant) throw new ApiError(404, "Restaurant not found");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          restaurant,
          `Restaurant ${isVerified ? "verified ✅" : "unverified"}`
        )
      );
  })
);

// Ban / unban restaurant
router.patch(
  "/restaurants/:id/ban",
  asyncHandler(async (req, res) => {
    const { isBanned, banReason } = req.body;

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      {
        isBanned,
        banReason: isBanned ? banReason : null,
        isActive: !isBanned,
      },
      { new: true }
    );

    if (!restaurant) throw new ApiError(404, "Restaurant not found");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          restaurant,
          `Restaurant ${isBanned ? "banned" : "unbanned"}`
        )
      );
  })
);

// -------------------------------------------------------
// SUBSCRIPTIONS MANAGEMENT
// -------------------------------------------------------
router.get("/subscriptions", asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.find()
    .populate("owner", "name email businessName")
    .populate("plan", "name displayName price")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscriptions },
        "Subscriptions fetched"
      )
    );
}));

// Manage subscription plans
router.post("/plans", asyncHandler(async (req, res) => {
  const plan = await SubscriptionPlan.create(req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, plan, "Plan created"));
}));

router.patch("/plans/:id", asyncHandler(async (req, res) => {
  const plan = await SubscriptionPlan.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, plan, "Plan updated"));
}));

// -------------------------------------------------------
// RESERVATIONS
// -------------------------------------------------------
router.get("/reservations", asyncHandler(async (req, res) => {
  const reservations = await Reservation.find()
    .populate("user", "name email phone")
    .populate({
      path: "restaurant",
      select: "name address owner",
      populate: { path: "owner", select: "name email" },
    })
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { reservations }, "Reservations fetched")
    );
}));

export default router;