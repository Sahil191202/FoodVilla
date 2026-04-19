import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "../services/analytics.service.js";

export const useRestaurantAnalytics = (restaurantId, days = 30) => {
  return useQuery({
    queryKey: ["analytics", restaurantId, days],
    queryFn: () =>
      analyticsService.getRestaurantAnalytics(restaurantId, days),
    select: (data) => data.data,
    enabled: !!restaurantId,
    staleTime: 1000 * 60 * 5, // 5 min cache
  });
};