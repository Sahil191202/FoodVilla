import { Menu } from "../models/Menu.model.js";
import { ApiError } from "../utils/ApiError.js";
import { getRestaurantById } from "./restaurant.service.js";
import cloudinary from "../config/cloudinary.js";

// Upload image to cloudinary
const uploadMenuImage = async (fileBuffer, mimetype) => {
  const base64 = `data:${mimetype};base64,${fileBuffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(base64, {
    folder: "goodfoods/menu",
    transformation: [
      { width: 600, height: 400, crop: "fill" },
      { quality: "auto" },
      { format: "webp" }, // Convert to webp — smaller size!
    ],
  });
  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

// Delete image from cloudinary
const deleteMenuImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Failed to delete image from cloudinary:", error.message);
  }
};

export const createMenu = async (restaurantId, items) => {
  await getRestaurantById(restaurantId);

  const existingMenu = await Menu.findOne({ restaurant: restaurantId });
  if (existingMenu) {
    throw new ApiError(
      409,
      "Menu already exists. Use update to add items."
    );
  }

  const menu = await Menu.create({
    restaurant: restaurantId,
    items,
  });

  return menu;
};

export const getMenuByRestaurant = async (restaurantId) => {
  await getRestaurantById(restaurantId);

  const menu = await Menu.findOne({
    restaurant: restaurantId,
    isActive: true,
  });

  if (!menu) {
    throw new ApiError(404, "Menu not found for this restaurant");
  }

  return menu;
};

export const getMenuGroupedByCategory = async (restaurantId) => {
  const menu = await getMenuByRestaurant(restaurantId);

  const availableItems = menu.items.filter((item) => item.isAvailable);

  const grouped = availableItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return grouped;
};

export const addMenuItems = async (restaurantId, newItems) => {
  const menu = await Menu.findOne({ restaurant: restaurantId });

  if (!menu) {
    throw new ApiError(404, "Menu not found. Create menu first.");
  }

  menu.items.push(...newItems);
  await menu.save();

  return menu;
};

// ✅ Upload image for a specific menu item
export const uploadMenuItemImage = async (
  restaurantId,
  itemId,
  fileBuffer,
  mimetype
) => {
  const menu = await Menu.findOne({ restaurant: restaurantId }).select(
    "+items.imagePublicId"
  );

  if (!menu) {
    throw new ApiError(404, "Menu not found");
  }

  const item = menu.items.id(itemId);
  if (!item) {
    throw new ApiError(404, "Menu item not found");
  }

  // Delete old image if exists
  if (item.imagePublicId) {
    await deleteMenuImage(item.imagePublicId);
  }

  // Upload new image
  const { url, publicId } = await uploadMenuImage(fileBuffer, mimetype);

  item.image = url;
  item.imagePublicId = publicId;
  await menu.save();

  return item;
};

// ✅ Delete image for a specific menu item
export const deleteMenuItemImage = async (restaurantId, itemId) => {
  const menu = await Menu.findOne({ restaurant: restaurantId }).select(
    "+items.imagePublicId"
  );

  if (!menu) {
    throw new ApiError(404, "Menu not found");
  }

  const item = menu.items.id(itemId);
  if (!item) {
    throw new ApiError(404, "Menu item not found");
  }

  if (item.imagePublicId) {
    await deleteMenuImage(item.imagePublicId);
  }

  item.image = null;
  item.imagePublicId = null;
  await menu.save();

  return item;
};

export const updateMenuItem = async (restaurantId, itemId, updates) => {
  const menu = await Menu.findOne({ restaurant: restaurantId });

  if (!menu) {
    throw new ApiError(404, "Menu not found");
  }

  const item = menu.items.id(itemId);
  if (!item) {
    throw new ApiError(404, "Menu item not found");
  }

  // Dont allow image update through this — use uploadMenuItemImage
  const { image, imagePublicId, ...safeUpdates } = updates;
  Object.assign(item, safeUpdates);
  await menu.save();

  return menu;
};

export const toggleItemAvailability = async (restaurantId, itemId) => {
  const menu = await Menu.findOne({ restaurant: restaurantId });

  if (!menu) {
    throw new ApiError(404, "Menu not found");
  }

  const item = menu.items.id(itemId);
  if (!item) {
    throw new ApiError(404, "Menu item not found");
  }

  item.isAvailable = !item.isAvailable;
  await menu.save();

  return item;
};

export const deleteMenuItem = async (restaurantId, itemId) => {
  const menu = await Menu.findOne({ restaurant: restaurantId }).select(
    "+items.imagePublicId"
  );

  if (!menu) {
    throw new ApiError(404, "Menu not found");
  }

  const item = menu.items.id(itemId);
  if (!item) {
    throw new ApiError(404, "Menu item not found");
  }

  // Delete image from cloudinary before removing item
  if (item.imagePublicId) {
    await deleteMenuImage(item.imagePublicId);
  }

  item.deleteOne();
  await menu.save();
};

export const searchMenuItems = async (restaurantId, query) => {
  const menu = await Menu.findOne({
    restaurant: restaurantId,
    isActive: true,
  });

  if (!menu) {
    throw new ApiError(404, "Menu not found");
  }

  const lowerQuery = query.toLowerCase();

  return menu.items.filter(
    (item) =>
      item.isAvailable &&
      (item.name.toLowerCase().includes(lowerQuery) ||
        item.category.toLowerCase().includes(lowerQuery) ||
        item.description?.toLowerCase().includes(lowerQuery) ||
        item.tags?.some((t) => t.toLowerCase().includes(lowerQuery)))
  );
};

export const getVegItems = async (restaurantId) => {
  const menu = await Menu.findOne({
    restaurant: restaurantId,
    isActive: true,
  });

  if (!menu) {
    throw new ApiError(404, "Menu not found");
  }

  return menu.items.filter((item) => item.isVeg && item.isAvailable);
};

// ✅ Get bestseller items — for AI upsell
export const getBestsellerItems = async (restaurantId) => {
  const menu = await Menu.findOne({
    restaurant: restaurantId,
    isActive: true,
  });

  if (!menu) return [];

  return menu.items.filter(
    (item) =>
      item.isAvailable && item.tags?.includes("bestseller")
  );
};