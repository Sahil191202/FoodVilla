import api from "./api.js";

export const adminService = {
  // Stats
  getStats: async () => {
    return await api.get("/admin/stats");
  },

  // Owner Management
  getAllOwners: async () => {
    return await api.get("/admin/owners");
  },

  approveOwner: async (id, data) => {
    return await api.patch(`/admin/owners/${id}/approval`, data);
  },

  updateOwnerCommission: async (id, commissionRate) => {
    return await api.patch(`/admin/owners/${id}/commission`, {
      commissionRate,
    });
  },

  // Restaurant Management
  getAllRestaurants: async () => {
    return await api.get("/admin/restaurants");
  },

  approveRestaurant: async (id, isApproved) => {
    return await api.patch(`/admin/restaurants/${id}/approval`, {
      isApproved,
    });
  },

  updateRestaurantCommission: async (id, commissionRate) => {
    return await api.patch(`/admin/restaurants/${id}/commission`, {
      commissionRate,
    });
  },

  // Reservations
  getAllReservations: async () => {
    return await api.get("/admin/reservations");
  },

  updateReservationStatus: async (id, status) => {
    return await api.patch(`/admin/reservations/${id}`, { status });
  },

  // Commission
  getCommissions: async () => {
    return await api.get("/admin/commissions");
  },
};