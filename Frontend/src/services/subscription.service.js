import api from "./api.js";

export const subscriptionService = {
  getPlans: async () => {
    return await api.get("/subscription/plans");
  },

  getMySubscription: async () => {
    return await api.get("/subscription/my");
  },

  // ✅ User becomes owner
  becomeOwner: async (data) => {
    return await api.post("/subscription/become-owner", data);
  },

  // ✅ Verify payment
  verifyPayment: async (data) => {
    return await api.post("/subscription/verify", data);
  },

  // ✅ Existing owner upgrades
  upgradeOrder: async (planId) => {
    return await api.post("/subscription/upgrade", { planId });
  },

  // ✅ Verify upgrade payment (same verify endpoint)
  verifyUpgrade: async (data) => {
    return await api.post("/subscription/verify", data);
  },

  cancel: async () => {
    return await api.post("/subscription/cancel");
  },
};