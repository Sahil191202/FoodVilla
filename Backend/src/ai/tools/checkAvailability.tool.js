import { getAvailableSlots } from "../../services/restaurant.service.js";
import { parseNaturalDate } from "../../services/datetime.service.js";

export const checkAvailabilityTool = {
  type: "function",
  function: {
    name: "checkAvailability",
    description: `Check available time slots for a specific restaurant on a 
    given date for a given number of guests. Use this after user selects 
    a restaurant and wants to see available times.`,
    parameters: {
      type: "object",
      properties: {
        restaurantId: {
          type: "string",
          description: "The MongoDB ID of the restaurant",
        },
        date: {
          type: "string",
          description: `Date to check availability. Can be natural language 
          like 'today', 'tomorrow', 'this saturday' or YYYY-MM-DD format`,
        },
        guests: {
          type: "number",
          description: "Number of guests",
        },
      },
      required: ["restaurantId", "date", "guests"],
    },
  },
};

export const executeCheckAvailability = async (args) => {
  const { restaurantId, date, guests } = args;

  // Parse natural language date
  const parsedDate = parseNaturalDate(date);

  const availableSlots = await getAvailableSlots(
    restaurantId,
    parsedDate,
    guests
  );

  if (availableSlots.length === 0) {
    return {
      success: true,
      message: `No available slots for ${guests} guests on ${parsedDate}`,
      slots: [],
    };
  }

  return {
    success: true,
    date: parsedDate,
    availableSlots: availableSlots.map((slot) => ({
      time: slot.time,
      availableSeats: slot.availableSeats,
    })),
  };
};