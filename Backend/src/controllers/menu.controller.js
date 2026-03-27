import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createMenu,
  getMenuByRestaurant,
  getMenuGroupedByCategory,
  addMenuItems,
  updateMenuItem,
  toggleItemAvailability,
  deleteMenuItem,
} from "../services/menu.service.js";

export const addMenu = asyncHandler(async (req, res) => {
  const { items } = req.body;
  const { id: restaurantId } = req.params;

  const menu = await createMenu(restaurantId, items);

  return res
    .status(201)
    .json(new ApiResponse(201, menu, "Menu created successfully"));
});

export const getMenu = asyncHandler(async (req, res) => {
  const { id: restaurantId } = req.params;
  const { grouped } = req.query;

  // If grouped=true return grouped by category — better for frontend!
  const menu =
    grouped === "true"
      ? await getMenuGroupedByCategory(restaurantId)
      : await getMenuByRestaurant(restaurantId);

  return res
    .status(200)
    .json(new ApiResponse(200, menu, "Menu fetched successfully"));
});

export const addItems = asyncHandler(async (req, res) => {
  const { items } = req.body;
  const { id: restaurantId } = req.params;

  const menu = await addMenuItems(restaurantId, items);

  return res
    .status(200)
    .json(new ApiResponse(200, menu, "Items added successfully"));
});

export const updateItem = asyncHandler(async (req, res) => {
  const { id: restaurantId, itemId } = req.params;

  const menu = await updateMenuItem(restaurantId, itemId, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, menu, "Item updated successfully"));
});

export const toggleAvailability = asyncHandler(async (req, res) => {
  const { id: restaurantId, itemId } = req.params;

  const item = await toggleItemAvailability(restaurantId, itemId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        item,
        `Item marked as ${item.isAvailable ? "available" : "unavailable"}`
      )
    );
});

export const removeItem = asyncHandler(async (req, res) => {
  const { id: restaurantId, itemId } = req.params;

  await deleteMenuItem(restaurantId, itemId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Item deleted successfully"));
});