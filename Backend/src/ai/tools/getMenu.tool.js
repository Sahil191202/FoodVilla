import {
  getMenuGroupedByCategory,
  searchMenuItems,
  getVegItems,
} from "../../services/menu.service.js";

export const getMenuTool = {
  type: "function",
  function: {
    name: "getMenu",
    description: `Get the menu of a restaurant. Use this when user asks about 
    food options, wants to know what a restaurant serves, or after a booking 
    to suggest dishes. Can filter by veg only or search specific items.`,
    parameters: {
      type: "object",
      properties: {
        restaurantId: {
          type: "string",
          description: "The MongoDB ID of the restaurant",
        },
        vegOnly: {
          type: "boolean",
          description: "If true, return only vegetarian items",
        },
        searchQuery: {
          type: "string",
          description: `Search for specific dish or category. 
          E.g. 'pasta', 'desserts', 'biryani'`,
        },
      },
      required: ["restaurantId"],
    },
  },
};

export const executeGetMenu = async (args) => {
  const { restaurantId, vegOnly, searchQuery } = args;

  // If search query provided — search specific items
  if (searchQuery) {
    const items = await searchMenuItems(restaurantId, searchQuery);
    return {
      success: true,
      searchQuery,
      items: items.map((item) => ({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        isVeg: item.isVeg,
      })),
    };
  }

  // If veg only requested
  if (vegOnly) {
    const items = await getVegItems(restaurantId);
    return {
      success: true,
      vegOnly: true,
      items: items.map((item) => ({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
      })),
    };
  }

  // Otherwise return full menu grouped by category
  const grouped = await getMenuGroupedByCategory(restaurantId);

  return {
    success: true,
    menu: grouped,
  };
};