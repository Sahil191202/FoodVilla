import api from "./api.js";

export const analyticsService = {
  getRestaurantAnalytics: async (restaurantId, days = 30) => {
    return await api.get(`/owner/analytics/${restaurantId}`, {
      params: { days },
    });
  },
};