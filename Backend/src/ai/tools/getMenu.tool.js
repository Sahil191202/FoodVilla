import {
  getMenuGroupedByCategory,
  searchMenuItems,
  getVegItems,
  getBestsellerItems,
} from "../../services/menu.service.js";

export const getMenuTool = {
  type: "function",
  function: {
    name: "getMenu",
    description: "Get menu of a restaurant with images and details",
    parameters: {
      type: "object",
      properties: {
        restaurantId: {
          type: "string",
          description: "Restaurant ID",
        },
        vegOnly: {
          type: "boolean",
          description: "True to get only vegetarian items",
        },
        searchQuery: {
          type: "string",
          description: "Search specific dish or category",
        },
        bestsellersOnly: {
          type: "boolean",
          description: "True to get only bestseller items",
        },
      },
      required: ["restaurantId"],
    },
  },
};

export const executeGetMenu = async (args) => {
  const { restaurantId, vegOnly, searchQuery, bestsellersOnly } = args;

  try {
    // Bestsellers only
    if (bestsellersOnly) {
      const items = await getBestsellerItems(restaurantId);
      return {
        success: true,
        type: "bestsellers",
        items: items.map((item) => ({
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          isVeg: item.isVeg,
          image: item.image || null,
          tags: item.tags,
          spiceLevel: item.spiceLevel,
        })),
      };
    }

    // Search query
    if (searchQuery) {
      const items = await searchMenuItems(restaurantId, searchQuery);
      return {
        success: true,
        type: "search",
        searchQuery,
        items: items.map((item) => ({
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          isVeg: item.isVeg,
          image: item.image || null,
          tags: item.tags,
          spiceLevel: item.spiceLevel,
        })),
      };
    }

    // Veg only
    if (vegOnly) {
      const items = await getVegItems(restaurantId);
      return {
        success: true,
        type: "veg",
        items: items.map((item) => ({
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          image: item.image || null,
          tags: item.tags,
        })),
      };
    }

    // Full menu grouped
    const grouped = await getMenuGroupedByCategory(restaurantId);

    // Format for AI — include images!
    const formattedMenu = {};
    Object.entries(grouped).forEach(([category, items]) => {
      formattedMenu[category] = items.map((item) => ({
        name: item.name,
        description: item.description,
        price: item.price,
        isVeg: item.isVeg,
        image: item.image || null,
        tags: item.tags || [],
        spiceLevel: item.spiceLevel,
        calories: item.calories,
      }));
    });

    return {
      success: true,
      type: "full",
      menu: formattedMenu,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};