import { nanoid } from "nanoid";
import { Reservation } from "../models/Reservation.model.js";
import { TimeSlot } from "../models/TimeSlot.model.js";
import { ApiError } from "../utils/ApiError.js";
import { RESERVATION_STATUS } from "../utils/constants.js";
import { getRestaurantById } from "./restaurant.service.js";
import { isDateInPast } from "./datetime.service.js";
import {
  sendReservationConfirmation,
  sendCancellationEmail,
} from "./notification.service.js";


// Generate unique confirmation code like GF-ABC123
const generateConfirmationCode = () => {
  return `GF-${nanoid(6).toUpperCase()}`;
};

// -------------------------------------------------------
// CREATE RESERVATION
// -------------------------------------------------------
export const createReservation = async ({
  userId,
  restaurantId,
  date,
  time,
  guests,
  specialRequests,
  userEmail,
  userName,
}) => {
  const restaurant = await getRestaurantById(restaurantId);

  // ✅ Check restaurant is approved by admin
  if (!restaurant.isApproved) {
    throw new ApiError(
      400,
      "This restaurant is not accepting reservations yet"
    );
  }

  // ✅ Check restaurant is active
  if (!restaurant.isActive) {
    throw new ApiError(400, "This restaurant is currently unavailable");
  }

  // Find or create time slot
  let timeSlot = await TimeSlot.findOne({
    restaurant: restaurantId,
    date,
    time,
  });

  if (!timeSlot) {
    // Slot doesnt exist yet — create it fully available
    timeSlot = await TimeSlot.create({
      restaurant: restaurantId,
      date,
      time,
      totalSeats: restaurant.totalSeats,
      bookedSeats: 0,
      availableSeats: restaurant.totalSeats,
    });
  }

  // Check seat availability
  if (timeSlot.availableSeats < guests) {
    throw new ApiError(
      400,
      `Only ${timeSlot.availableSeats} seats available for this slot`
    );
  }

  // Generate unique confirmation code
  let confirmationCode;
  let isUnique = false;
  while (!isUnique) {
    confirmationCode = generateConfirmationCode();
    const existing = await Reservation.findOne({ confirmationCode });
    if (!existing) isUnique = true;
  }

  // Create reservation
  let reservation;
  try {
    reservation = await Reservation.create({
      user: userId,
      restaurant: restaurantId,
      timeSlot: timeSlot._id,
      date,
      time,
      guests,
      specialRequests,
      confirmationCode,
      status: RESERVATION_STATUS.CONFIRMED,
    });
  } catch (error) {
    throw new ApiError(500, "Failed to create reservation. Please try again.");
  }

  // Update time slot — reduce available seats
  try {
    await TimeSlot.findByIdAndUpdate(timeSlot._id, {
      $inc: {
        bookedSeats: guests,
        availableSeats: -guests,
      },
    });
  } catch (error) {
    // Slot update failed — rollback reservation!
    await Reservation.findByIdAndDelete(reservation._id);
    throw new ApiError(500, "Failed to update slot. Please try again.");
  }

  // ✅ Create commission record
  // Dont fail reservation if commission creation fails!
  try {
    await createCommission({
      reservationId: reservation._id,
      restaurantId: restaurant._id,
      ownerId: restaurant.owner,
      userId,
      guests,
      averageCostForTwo: restaurant.averageCostForTwo,
      commissionRate: restaurant.commissionRate,
    });
  } catch (commissionError) {
    console.error("Commission creation failed:", commissionError.message);
    // Continue — booking is done, commission can be fixed manually
  }

  // Send confirmation email
  // Dont fail reservation if email fails!
  try {
    await sendReservationConfirmation({
      email: userEmail,
      name: userName,
      restaurantName: restaurant.name,
      date,
      time,
      guests,
      confirmationCode,
    });
  } catch (emailError) {
    console.error("Email sending failed:", emailError.message);
  }

  // Return populated reservation
  return await Reservation.findById(reservation._id)
    .populate("restaurant", "name address contact averageCostForTwo images")
    .populate("timeSlot", "time date");
};

// -------------------------------------------------------
// CANCEL RESERVATION
// -------------------------------------------------------
export const cancelReservation = async (
  reservationId,
  userId,
  cancelReason
) => {
  const reservation = await Reservation.findOne({
    _id: reservationId,
    user: userId,
  })
    .populate("restaurant", "name")
    .populate("user", "name email");

  if (!reservation) {
    throw new ApiError(404, "Reservation not found");
  }

  if (reservation.status === RESERVATION_STATUS.CANCELLED) {
    throw new ApiError(400, "Reservation is already cancelled");
  }

  if (reservation.status === RESERVATION_STATUS.COMPLETED) {
    throw new ApiError(400, "Cannot cancel a completed reservation");
  }

  if (isDateInPast(reservation.date)) {
    throw new ApiError(400, "Cannot cancel a past reservation");
  }

  // Update reservation status
  reservation.status = RESERVATION_STATUS.CANCELLED;
  reservation.cancelledAt = new Date();
  reservation.cancelReason = cancelReason || "Cancelled by user";
  await reservation.save();

  // Release seats back to time slot
  try {
    await TimeSlot.findByIdAndUpdate(reservation.timeSlot, {
      $inc: {
        bookedSeats: -reservation.guests,
        availableSeats: reservation.guests,
      },
    });
  } catch (error) {
    console.error("Failed to release seats:", error.message);
    // Reservation is cancelled — just log, dont throw
  }

  // ✅ Cancel commission record
  try {
    await cancelCommission(reservation._id);
  } catch (commissionError) {
    console.error("Commission cancellation failed:", commissionError.message);
  }

  // Send cancellation email
  try {
    await sendCancellationEmail({
      email: reservation.user?.email,
      name: reservation.user?.name,
      restaurantName: reservation.restaurant.name,
      date: reservation.date,
      time: reservation.time,
      confirmationCode: reservation.confirmationCode,
    });
  } catch (emailError) {
    console.error("Cancellation email failed:", emailError.message);
  }

  return reservation;
};

// -------------------------------------------------------
// COMPLETE RESERVATION — triggers commission earned!
// Called by owner when user visits restaurant
// -------------------------------------------------------
export const completeReservation = async (reservationId, ownerId) => {
  const reservation = await Reservation.findById(reservationId).populate(
    "restaurant"
  );

  if (!reservation) {
    throw new ApiError(404, "Reservation not found");
  }

  // Verify this reservation belongs to owner's restaurant
  if (
    reservation.restaurant.owner.toString() !== ownerId.toString()
  ) {
    throw new ApiError(
      403,
      "You are not authorized to complete this reservation"
    );
  }

  if (reservation.status !== RESERVATION_STATUS.CONFIRMED) {
    throw new ApiError(
      400,
      `Cannot complete reservation with status: ${reservation.status}`
    );
  }

  reservation.status = RESERVATION_STATUS.COMPLETED;
  await reservation.save();

  // ✅ Earn commission — user visited!
  try {
    await earnCommission(reservation._id);
    console.log(
      `Commission earned for reservation: ${reservation.confirmationCode}`
    );
  } catch (commissionError) {
    console.error("Commission earning failed:", commissionError.message);
  }

  return reservation;
};

// -------------------------------------------------------
// MARK NO SHOW — no commission earned
// -------------------------------------------------------
export const markNoShow = async (reservationId, ownerId) => {
  const reservation = await Reservation.findById(reservationId).populate(
    "restaurant"
  );

  if (!reservation) {
    throw new ApiError(404, "Reservation not found");
  }

  if (
    reservation.restaurant.owner.toString() !== ownerId.toString()
  ) {
    throw new ApiError(403, "Not authorized");
  }

  if (reservation.status !== RESERVATION_STATUS.CONFIRMED) {
    throw new ApiError(
      400,
      `Cannot mark no-show for reservation with status: ${reservation.status}`
    );
  }

  reservation.status = RESERVATION_STATUS.NO_SHOW;
  await reservation.save();

  // ✅ Cancel commission — user didnt show up!
  try {
    await cancelCommission(reservation._id);
  } catch (commissionError) {
    console.error("Commission cancellation failed:", commissionError.message);
  }

  // Release seats back
  try {
    await TimeSlot.findByIdAndUpdate(reservation.timeSlot, {
      $inc: {
        bookedSeats: -reservation.guests,
        availableSeats: reservation.guests,
      },
    });
  } catch (error) {
    console.error("Failed to release seats:", error.message);
  }

  return reservation;
};

// -------------------------------------------------------
// GET USER RESERVATIONS
// -------------------------------------------------------
export const getUserReservations = async (userId) => {
  return await Reservation.find({ user: userId })
    .populate("restaurant", "name address cuisine images averageCostForTwo")
    .sort({ createdAt: -1 });
};

// -------------------------------------------------------
// GET RESERVATION BY CONFIRMATION CODE
// -------------------------------------------------------
export const getReservationByCode = async (confirmationCode) => {
  // Trim and uppercase — handle case sensitivity
  const cleanCode = confirmationCode?.trim().toUpperCase();

  console.log("Searching for code:", cleanCode);

  const reservation = await Reservation.findOne({
    confirmationCode: cleanCode,
  })
    .populate("restaurant", "name address contact images")
    .populate("user", "name email phone");

  if (!reservation) {
    throw new ApiError(404, `Reservation with code ${cleanCode} not found`);
  }

  return reservation;
};

// -------------------------------------------------------
// GET RESERVATIONS BY RESTAURANT — for owner dashboard
// -------------------------------------------------------
export const getReservationsByRestaurant = async (
  restaurantId,
  filters = {}
) => {
  const query = { restaurant: restaurantId };

  // Filter by status if provided
  if (filters.status) {
    query.status = filters.status;
  }

  // Filter by date if provided
  if (filters.date) {
    query.date = filters.date;
  }

  return await Reservation.find(query)
    .populate("user", "name email phone")
    .sort({ date: 1, time: 1 });
};

// -------------------------------------------------------
// GET ALL RESERVATIONS — admin only
// -------------------------------------------------------
export const getAllReservations = async (filters = {}) => {
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.date) query.date = filters.date;
  if (filters.restaurantId) query.restaurant = filters.restaurantId;

  return await Reservation.find(query)
    .populate("user", "name email phone")
    .populate({
      path: "restaurant",
      select: "name address owner",
      populate: {
        path: "owner",
        select: "name email businessName",
      },
    })
    .sort({ createdAt: -1 });
};