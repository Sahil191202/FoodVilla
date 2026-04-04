import { Router } from "express";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Reservation } from "../models/Reservation.model.js";
import { USER_ROLES, RESERVATION_STATUS } from "../utils/constants.js";

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.STAFF));

// Get all reservations
router.get("/reservations", asyncHandler(async (req, res) => {
  const reservations = await Reservation.find()
    .populate("user", "name email phone")
    .populate("restaurant", "name address")
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

export default router;