import { Restaurant } from "../models/Restaurant.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { USER_ROLES } from "../utils/constants.js";

// Verify that the logged in owner owns this restaurant
export const verifyRestaurantOwner = asyncHandler(async (req, res, next) => {
  const restaurantId = req.params.id || req.params.restaurantId;

  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  // Admin can access any restaurant
  if (req.user.role === USER_ROLES.ADMIN) {
    req.restaurant = restaurant;
    return next();
  }

  // Owner can only access their own restaurant
  if (restaurant.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You do not have permission to access this restaurant"
    );
  }

  req.restaurant = restaurant; // Attach for use in controller
  next();
});

// Check if owner is approved by admin
export const verifyOwnerApproved = asyncHandler(async (req, res, next) => {
  if (!req.user.isApproved && req.user.role === USER_ROLES.OWNER) {
    throw new ApiError(
      403,
      "Your account is pending admin approval. Please wait for approval."
    );
  }
  next();
});