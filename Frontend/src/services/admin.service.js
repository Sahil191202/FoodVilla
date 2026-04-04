import api from "./api.js";

export const adminService = {
  // Stats
  getStats: async () => {
    return await api.get("/admin/stats");
  },

  // Restaurants
  getAllRestaurants: async () => {
    return await api.get("/restaurants");
  },

  addRestaurant: async (data) => {
    return await api.post("/restaurants", data);
  },

  // All reservations
  getAllReservations: async () => {
    return await api.get("/admin/reservations");
  },

  updateReservationStatus: async (id, status) => {
    return await api.patch(`/admin/reservations/${id}`, { status });
  },
};