import { searchRestaurantsTool } from "./searchRestaurants.tool.js";
import { checkAvailabilityTool } from "./checkAvailability.tool.js";
import { makeReservationTool } from "./makeReservation.tool.js";
import { cancelReservationTool } from "./cancelReservation.tool.js";
import { getMenuTool } from "./getMenu.tool.js";
import { getUserReservationsTool } from "./getUserReservations.tool.js";
import { upsellMenuTool } from "./upsellMenu.tool.js"; // ✅ New!

export const allTools = [
  searchRestaurantsTool,
  checkAvailabilityTool,
  makeReservationTool,
  cancelReservationTool,
  getMenuTool,
  getUserReservationsTool,
  upsellMenuTool, // ✅ New!
];