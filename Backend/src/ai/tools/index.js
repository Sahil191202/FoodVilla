// Export all tool definitions — sent to OpenAI
import { searchRestaurantsTool } from "./searchRestaurants.tool.js";
import { checkAvailabilityTool } from "./checkAvailability.tool.js";
import { makeReservationTool } from "./makeReservation.tool.js";
import { cancelReservationTool } from "./cancelReservation.tool.js";
import { getMenuTool } from "./getMenu.tool.js";
import { getUserReservationsTool } from "./getUserReservations.tool.js";

// This array goes directly to OpenAI — it reads these definitions
// and decides which tool to call!
export const allTools = [
  searchRestaurantsTool,
  checkAvailabilityTool,
  makeReservationTool,
  cancelReservationTool,
  getMenuTool,
  getUserReservationsTool,
];