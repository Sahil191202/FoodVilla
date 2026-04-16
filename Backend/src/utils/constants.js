export const USER_ROLES = {
  USER: "user",
  OWNER: "owner",
  ADMIN: "admin",
};

export const SUBSCRIPTION_PLANS = {
  FREE_TRIAL: "free_trial",
  PREMIUM: "premium",
  FEATURED: "featured",
};

export const PLAN_PRICES = {
  free_trial: 0,       // 14 days free
  premium: 2999,       // ₹2999/month
  featured: 5999,      // ₹5999/month
};

export const FREE_TRIAL_DAYS = 14;

export const RESERVATION_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
  NO_SHOW: "no_show",
};

export const CUISINE_TYPES = [
  "Indian", "Italian", "Chinese", "Continental",
  "Mexican", "Japanese", "Thai", "Mediterranean",
];

export const AMBIANCE_TYPES = [
  "casual", "fine_dining", "family",
  "romantic", "business", "rooftop",
  "outdoor", "cafe",
];

export const AMENITIES = [
  "wifi", "parking", "live_music", "craft_beer",
  "valet", "outdoor_seating", "private_dining",
  "wheelchair_accessible",
];