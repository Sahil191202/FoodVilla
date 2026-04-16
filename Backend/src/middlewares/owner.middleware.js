import { Restaurant } from "../models/Restaurant.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { USER_ROLES } from "../utils/constants.js";

export const verifyRestaurantOwner = asyncHandler(async (req, res, next) => {
  const restaurantId = req.params.id || req.params.restaurantId;
  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) throw new ApiError(404, "Restaurant not found");

  if (req.user.role === USER_ROLES.ADMIN) {
    req.restaurant = restaurant;
    return next();
  }

  if (restaurant.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You do not have permission to access this restaurant");
  }

  req.restaurant = restaurant;
  next();
});

export const verifyOwnerApproved = asyncHandler(async (req, res, next) => {
  if (req.user.role === USER_ROLES.ADMIN) return next();

  // ✅ Check ownerStatus instead of isApproved
  if (req.user.ownerStatus !== "approved") {
    throw new ApiError(
      403,
      req.user.ownerStatus === "pending_approval"
        ? "Your account is pending admin approval. Please wait!"
        : "Owner account not approved."
    );
  }
  next();
});