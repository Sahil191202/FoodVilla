import api from "./api.js";

export const ownerService = {
  // Restaurants
  getMyRestaurants: async () => {
    return await api.get("/owner/restaurants");
  },

  addRestaurant: async (data) => {
    return await api.post("/owner/restaurants", data);
  },

  updateRestaurant: async (id, data) => {
    return await api.patch(`/owner/restaurants/${id}`, data);
  },

  // Images
  uploadImages: async (id, formData) => {
    return await api.post(`/owner/restaurants/${id}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteImage: async (id, imageUrl) => {
    return await api.delete(`/owner/restaurants/${id}/images`, {
      data: { imageUrl },
    });
  },

  // Reservations
  getMyReservations: async (filters = {}) => {
    return await api.get("/owner/reservations", { params: filters });
  },

  completeReservation: async (id) => {
    return await api.patch(`/owner/reservations/${id}/complete`);
  },

  markNoShow: async (id) => {
    return await api.patch(`/owner/reservations/${id}/noshow`);
  },

  // Commission
  getMyCommissions: async () => {
    return await api.get("/owner/commissions");
  },
};