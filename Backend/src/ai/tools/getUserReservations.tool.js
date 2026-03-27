import { getUserReservations } from "../../services/reservation.service.js";

export const getUserReservationsTool = {
  type: "function",
  function: {
    name: "getUserReservations",
    description: `Get all reservations of the current logged in user. 
    Use this when user asks 'show my bookings', 'what reservations do I have', 
    'my upcoming bookings' etc.`,
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
};

export const executeGetUserReservations = async (args, userId) => {
  const reservations = await getUserReservations(userId);

  if (reservations.length === 0) {
    return {
      success: true,
      message: "You have no reservations yet",
      reservations: [],
    };
  }

  return {
    success: true,
    count: reservations.length,
    reservations: reservations.map((r) => ({
      confirmationCode: r.confirmationCode,
      restaurant: r.restaurant.name,
      area: r.restaurant.address.area,
      date: r.date,
      time: r.time,
      guests: r.guests,
      status: r.status,
      specialRequests: r.specialRequests,
    })),
  };
};