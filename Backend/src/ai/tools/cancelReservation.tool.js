import { cancelReservation, getReservationByCode } from "../../services/reservation.service.js";

export const cancelReservationTool = {
  type: "function",
  function: {
    name: "cancelReservation",
    description: `Cancel an existing reservation for the user. Ask user for 
    their confirmation code to identify the reservation. Always confirm 
    with user before cancelling!`,
    parameters: {
      type: "object",
      properties: {
        confirmationCode: {
          type: "string",
          description: `The confirmation code of the reservation to cancel. 
          Format is GF-XXXXXX`,
        },
        cancelReason: {
          type: "string",
          description: "Reason for cancellation provided by the user",
        },
      },
      required: ["confirmationCode"],
    },
  },
};

export const executeCancelReservation = async (args, userId) => {
  const { confirmationCode, cancelReason } = args;

  // Find reservation by confirmation code first
  const reservation = await getReservationByCode(confirmationCode);

  // Security check — make sure this reservation belongs to this user!
  if (reservation.user._id.toString() !== userId.toString()) {
    return {
      success: false,
      error: "This reservation does not belong to you",
    };
  }

  await cancelReservation(
    reservation._id,
    userId,
    cancelReason
  );

  return {
    success: true,
    message: "Reservation cancelled successfully",
    cancelledReservation: {
      confirmationCode,
      restaurant: reservation.restaurant.name,
      date: reservation.date,
      time: reservation.time,
    },
  };
};