import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { restaurantService } from "../services/restaurant.service.js";
import { selectFilters } from "../features/restaurant/restaurantSlice.js";

export const useRestaurants = () => {
  const filters = useSelector(selectFilters);

  return useQuery({
    queryKey: ["restaurants", filters],
    queryFn: () => {
      // ✅ Build params properly
      const params = {};
      if (filters.cuisine) params.cuisine = filters.cuisine;
      if (filters.area) params.area = filters.area;
      if (filters.date) params.date = filters.date;
      if (filters.guests && filters.guests !== 2)
        params.guests = filters.guests;
      if (filters.ambiance) params.ambiance = filters.ambiance;
      if (filters.amenities?.length)
        params.amenities = filters.amenities.join(",");

      return restaurantService.getAll(params);
    },
    select: (data) => data.data.restaurants,
  });
};

export const useRestaurant = (id) => {
  return useQuery({
    queryKey: ["restaurant", id],
    queryFn: () => restaurantService.getById(id),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useRestaurantSlots = (id, date, guests) => {
  return useQuery({
    queryKey: ["slots", id, date, guests],
    queryFn: () => restaurantService.getSlots(id, date, guests),
    select: (data) => data.data.slots,
    enabled: !!id && !!date && !!guests,
  });
};
