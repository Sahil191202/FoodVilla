import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createRestaurant,
  searchRestaurants,
  getRestaurantById,
  getAvailableSlots,
} from "../services/restaurant.service.js";
import { parseNaturalDate } from "../services/datetime.service.js";

export const addRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await createRestaurant(req.body, req.user._id);

  return res
    .status(201)
    .json(new ApiResponse(201, restaurant, "Restaurant added successfully"));
});

export const getRestaurants = asyncHandler(async (req, res) => {
  const { cuisine, area, date, guests, ambiance, amenities } = req.query;

  let parsedDate;
  if (date) parsedDate = parseNaturalDate(date);

  const restaurants = await searchRestaurants({
    cuisine,
    area,
    date: parsedDate,
    guests: guests ? Number(guests) : undefined,
    ambiance,
    // ✅ Convert comma string to array
    amenities: amenities ? amenities.split(",") : undefined,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { count: restaurants.length, restaurants },
        "Restaurants fetched successfully",
      ),
    );
});

export const getRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await getRestaurantById(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, restaurant, "Restaurant fetched successfully"));
});

export const getSlots = asyncHandler(async (req, res) => {
  const { date, guests } = req.query;
  const { id: restaurantId } = req.params;

  if (!date || !guests) {
    throw new ApiError(400, "Date and guests are required");
  }

  const parsedDate = parseNaturalDate(date);
  const slots = await getAvailableSlots(
    restaurantId,
    parsedDate,
    Number(guests),
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { date: parsedDate, slots },
        "Slots fetched successfully",
      ),
    );
});
