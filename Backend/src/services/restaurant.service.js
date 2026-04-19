import { Restaurant } from "../models/Restaurant.model.js";
import { TimeSlot } from "../models/TimeSlot.model.js";
import { ApiError } from "../utils/ApiError.js";
import {
  getDayName,
  generateTimeSlots,
  isSlotBookableToday,
  getTodayIST,
} from "./datetime.service.js";

export const createRestaurant = async (data, managedBy) => {
  const restaurant = await Restaurant.create({ ...data, managedBy });
  return restaurant;
};

// Search restaurants by cuisine and/or area
export const searchRestaurants = async ({
  cuisine,
  area,
  date,
  guests,
  ambiance,
  amenities,
}) => {
  const query = {
    isActive: true,
    isApproved: true,
    isBanned: false,
  };

  if (cuisine) query.cuisine = { $in: [cuisine] };
  if (area) query["address.area"] = { $regex: area, $options: "i" };
  if (ambiance) query.ambiance = ambiance;

  // ✅ Amenities — match all selected
  if (amenities?.length) {
    const amenityList = Array.isArray(amenities)
      ? amenities
      : amenities.split(",");
    query.amenities = { $all: amenityList };
  }

  // Featured first!
  let restaurants = await Restaurant.find(query)
    .sort({ isFeatured: -1, isVerified: -1, rating: -1 })
    .select("-managedBy");

  if (date && guests) {
    const numGuests = Number(guests);
    const availableRestaurants = [];

    for (const restaurant of restaurants) {
      const dayName = getDayName(date);
      const hours = restaurant.operatingHours[dayName];
      if (!hours || hours.isClosed) continue;

      // Check holiday closures
      const isHoliday = restaurant.holidays?.some((h) => h.date === date);
      if (isHoliday) continue;

      const bookedSlots = await TimeSlot.find({
        restaurant: restaurant._id,
        date,
        isAvailable: true,
      });

      if (bookedSlots.length === 0) {
        if (restaurant.totalSeats >= numGuests) {
          availableRestaurants.push(restaurant);
        }
        continue;
      }

      const hasAvailableSlot = bookedSlots.some(
        (slot) => slot.availableSeats >= numGuests,
      );
      if (hasAvailableSlot) availableRestaurants.push(restaurant);
    }

    return availableRestaurants;
  }

  return restaurants;
};

export const getRestaurantById = async (restaurantId) => {
  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
    isActive: true,
  });

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  return restaurant;
};

// Get available time slots for a restaurant on a date
export const getAvailableSlots = async (restaurantId, date, guests) => {
  const restaurant = await getRestaurantById(restaurantId);

  // Check if open that day
  const dayName = getDayName(date);
  const hours = restaurant.operatingHours[dayName];

  if (!hours || hours.isClosed) {
    throw new ApiError(400, `Restaurant is closed on ${dayName}`);
  }

  // Generate all possible slots for the day
  const allSlots = generateTimeSlots(hours.open, hours.close);

  // Get existing slot records from DB
  const existingSlots = await TimeSlot.find({ restaurant: restaurantId, date });
  const existingSlotMap = {};
  existingSlots.forEach((s) => (existingSlotMap[s.time] = s));

  const today = getTodayIST();
  const result = [];

  for (const time of allSlots) {
    // Skip past slots for today
    if (date === today && !isSlotBookableToday(date, time)) continue;

    const existing = existingSlotMap[time];

    if (existing) {
      // Slot exists in DB — check availability
      if (existing.availableSeats >= guests && existing.isAvailable) {
        result.push({
          time,
          availableSeats: existing.availableSeats,
        });
      }
    } else {
      // Slot not in DB yet — means fully available
      result.push({
        time,
        availableSeats: restaurant.totalSeats,
      });
    }
  }

  return result;
};
