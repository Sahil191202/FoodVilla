import { CUISINE_TYPES } from "../../utils/constants.js";
import { searchRestaurants } from "../../services/restaurant.service.js";
import { parseNaturalDate } from "../../services/datetime.service.js";

// Definition — what OpenAI sees
export const searchRestaurantsTool = {
  type: "function",
  function: {
    name: "searchRestaurants",
    description: `Search for restaurants in Mumbai based on cuisine type, 
    area, date and number of guests. Use this when user wants to discover 
    restaurants or find available options. Always use this before making 
    a reservation if restaurant is not already selected.`,
    parameters: {
      type: "object",
      properties: {
        cuisine: {
          type: "string",
          enum: CUISINE_TYPES,
          description: "Type of cuisine the user wants",
        },
        area: {
          type: "string",
          description:
            "Area or locality in Mumbai. E.g. Dahisar, Mira Road, Borivali",
        },
        date: {
          type: "string",
          description: `Date for the reservation. Can be natural language like 
          'today', 'tomorrow', 'this saturday' or YYYY-MM-DD format`,
        },
        guests: {
          type: "number",
          description: "Number of guests for the reservation",
        },
      },
      required: [], // All optional — AI searches with whatever it has
    },
  },
};

// Execution — actual logic
export const executeSearchRestaurants = async (args) => {
  const { cuisine, area, date, guests } = args;

  // Parse natural language date if provided
  let parsedDate;
  if (date) {
    parsedDate = parseNaturalDate(date);
  }

  const restaurants = await searchRestaurants({
    cuisine,
    area,
    date: parsedDate,
    guests,
  });

  if (restaurants.length === 0) {
    return {
      success: true,
      message: "No restaurants found matching the criteria",
      restaurants: [],
    };
  }

  // Return clean data — dont send everything to AI
  // Less tokens = faster + cheaper!
  return {
    success: true,
    count: restaurants.length,
    restaurants: restaurants.map((r) => ({
      id: r._id,
      name: r.name,
      cuisine: r.cuisine,
      area: r.address.area,
      rating: r.rating,
      averageCostForTwo: r.averageCostForTwo,
      description: r.description,
    })),
  };
};