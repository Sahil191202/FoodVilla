import { Router } from "express";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Reservation } from "../models/Reservation.model.js";
import { Restaurant } from "../models/Restaurant.model.js";
import { User } from "../models/User.model.js";
import { getAdminCommissionSummary } from "../services/commission.service.js";
import { USER_ROLES, RESERVATION_STATUS } from "../utils/constants.js";

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles(USER_ROLES.ADMIN));

// -------------------------------------------------------
// OWNER MANAGEMENT
// -------------------------------------------------------

// Get all owners
router.get("/owners", asyncHandler(async (req, res) => {
  const owners = await User.find({ role: USER_ROLES.OWNER })
    .select("-password -refreshToken")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, { owners }, "Owners fetched")
  );
}));

// Approve or reject owner
router.patch("/owners/:id/approval", asyncHandler(async (req, res) => {
  const { isApproved, commissionRate } = req.body;

  const owner = await User.findByIdAndUpdate(
    req.params.id,
    {
      isApproved,
      ...(commissionRate && { commissionRate }),
    },
    { new: true }
  ).select("-password -refreshToken");

  if (!owner) {
    throw new ApiError(404, "Owner not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      owner,
      `Owner ${isApproved ? "approved" : "rejected"} successfully`
    )
  );
}));

// Update owner commission rate
router.patch("/owners/:id/commission", asyncHandler(async (req, res) => {
  const { commissionRate } = req.body;

  if (commissionRate < 0 || commissionRate > 100) {
    throw new ApiError(400, "Commission rate must be between 0 and 100");
  }

  const owner = await User.findByIdAndUpdate(
    req.params.id,
    { commissionRate },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(200, owner, "Commission rate updated")
  );
}));

// -------------------------------------------------------
// RESTAURANT MANAGEMENT
// -------------------------------------------------------

// Get all restaurants with owner details
router.get("/restaurants", asyncHandler(async (req, res) => {
  const restaurants = await Restaurant.find()
    .populate("owner", "name email businessName commissionRate")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      { count: restaurants.length, restaurants },
      "Restaurants fetched"
    )
  );
}));

// Approve or reject restaurant listing
router.patch("/restaurants/:id/approval", asyncHandler(async (req, res) => {
  const { isApproved } = req.body;

  const restaurant = await Restaurant.findByIdAndUpdate(
    req.params.id,
    { isApproved },
    { new: true }
  ).populate("owner", "name email");

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      restaurant,
      `Restaurant ${isApproved ? "approved" : "rejected"}`
    )
  );
}));

// Update restaurant commission rate individually
router.patch("/restaurants/:id/commission", asyncHandler(async (req, res) => {
  const { commissionRate } = req.body;

  const restaurant = await Restaurant.findByIdAndUpdate(
    req.params.id,
    { commissionRate },
    { new: true }
  );

  return res.status(200).json(
    new ApiResponse(200, restaurant, "Restaurant commission rate updated")
  );
}));

// -------------------------------------------------------
// RESERVATIONS
// -------------------------------------------------------

// Get all reservations
router.get("/reservations", asyncHandler(async (req, res) => {
  const reservations = await Reservation.find()
    .populate("user", "name email phone")
    .populate({
      path: "restaurant",
      populate: { path: "owner", select: "name email" },
    })
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, { reservations }, "Reservations fetched")
  );
}));

// Update reservation status
router.patch("/reservations/:id", asyncHandler(async (req, res) => {
  const { status } = req.body;

  const reservation = await Reservation.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  return res.status(200).json(
    new ApiResponse(200, reservation, "Status updated")
  );
}));

// -------------------------------------------------------
// COMMISSIONS
// -------------------------------------------------------

// Get all commission data
router.get("/commissions", asyncHandler(async (req, res) => {
  const data = await getAdminCommissionSummary();

  return res.status(200).json(
    new ApiResponse(200, data, "Commission data fetched")
  );
}));

// -------------------------------------------------------
// DASHBOARD STATS
// -------------------------------------------------------

router.get("/stats", asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalOwners,
    totalRestaurants,
    approvedRestaurants,
    totalReservations,
    completedReservations,
    commissionData,
  ] = await Promise.all([
    User.countDocuments({ role: USER_ROLES.USER }),
    User.countDocuments({ role: USER_ROLES.OWNER }),
    Restaurant.countDocuments(),
    Restaurant.countDocuments({ isApproved: true }),
    Reservation.countDocuments(),
    Reservation.countDocuments({ status: RESERVATION_STATUS.COMPLETED }),
    getAdminCommissionSummary(),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalUsers,
        totalOwners,
        totalRestaurants,
        approvedRestaurants,
        totalReservations,
        completedReservations,
        totalCommissionEarned: commissionData.summary.totalEarned,
        totalCommissionPending: commissionData.summary.totalPending,
      },
      "Stats fetched"
    )
  );
}));

export default router;