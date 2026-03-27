import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createReservation,
  cancelReservation,
  getUserReservations,
  getReservationByCode,
} from "../services/reservation.service.js";

export const bookTable = asyncHandler(async (req, res) => {
  const { restaurantId, date, time, guests, specialRequests } = req.body;

  const reservation = await createReservation({
    userId: req.user._id,
    restaurantId,
    date,
    time,
    guests,
    specialRequests,
    userEmail: req.user.email,
    userName: req.user.name,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, reservation, "Table booked successfully"));
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const { id: reservationId } = req.params;
  const { cancelReason } = req.body;

  const reservation = await cancelReservation(
    reservationId,
    req.user._id,
    cancelReason
  );

  return res
    .status(200)
    .json(new ApiResponse(200, reservation, "Reservation cancelled successfully"));
});

export const myReservations = asyncHandler(async (req, res) => {
  const reservations = await getUserReservations(req.user._id);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { count: reservations.length, reservations },
        "Reservations fetched successfully"
      )
    );
});

export const getByCode = asyncHandler(async (req, res) => {
  const { code } = req.params;

  const reservation = await getReservationByCode(code);

  return res
    .status(200)
    .json(new ApiResponse(200, reservation, "Reservation fetched successfully"));
});