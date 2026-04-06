import { getBestsellerItems, getMenuByRestaurant } from "../../services/menu.service.js";
import { getRestaurantById } from "../../services/restaurant.service.js";

export const upsellMenuTool = {
  type: "function",
  function: {
    name: "upsellMenu",
    description: `Suggest popular menu items after a reservation is made. 
    Use this AFTER makeReservation to suggest food items to the user.`,
    parameters: {
      type: "object",
      properties: {
        restaurantId: {
          type: "string",
          description: "Restaurant ID to get menu suggestions from",
        },
        isVeg: {
          type: "boolean",
          description: "If user prefers veg items only",
        },
      },
      required: ["restaurantId"],
    },
  },
};

export const executeUpsellMenu = async (args) => {
  const { restaurantId, isVeg } = args;

  try {
    const restaurant = await getRestaurantById(restaurantId);
    let items = await getBestsellerItems(restaurantId);

    // If no bestsellers — get first 5 available items
    if (!items.length) {
      const menu = await getMenuByRestaurant(restaurantId);
      items = menu.items
        .filter((i) => i.isAvailable && (!isVeg || i.isVeg))
        .slice(0, 5);
    }

    // Filter veg if needed
    if (isVeg) {
      items = items.filter((i) => i.isVeg);
    }

    return {
      success: true,
      restaurantName: restaurant.name,
      suggestions: items.slice(0, 5).map((item) => ({
        name: item.name,
        description: item.description,
        price: item.price,
        isVeg: item.isVeg,
        image: item.image || null,
        category: item.category,
        tags: item.tags || [],
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};