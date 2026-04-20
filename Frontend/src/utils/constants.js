export const CUISINE_TYPES = [
  "Indian", "Italian", "Chinese", "Continental",
  "Mexican", "Japanese", "Thai", "Mediterranean",
];

export const RESERVATION_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
  NO_SHOW: "no_show",
};

export const SUBSCRIPTION_PLANS = {
  FREE: "free",
  PREMIUM: "premium",
  FEATURED: "featured",
};

export const PLAN_PRICES = {
  free: 0,
  premium: 2999,
  featured: 5999,
};

export const PLAN_LIMITS = {
  free: {
    restaurants: 1,
    imagesPerRestaurant: 3,
    menuItems: 20,
    analytics: false,
    aiMarketing: false,
    featured: false,
  },
  premium: {
    restaurants: 5,
    imagesPerRestaurant: 10,
    menuItems: -1,
    analytics: true,
    aiMarketing: true,
    featured: false,
  },
  featured: {
    restaurants: -1,
    imagesPerRestaurant: -1,
    menuItems: -1,
    analytics: true,
    aiMarketing: true,
    featured: true,
  },
};

export const PLAN_COLORS = {
  free: "gray",
  premium: "blue",
  featured: "primary",
};

export const AREAS = [
  "Andheri", "Bandra", "Borivali",
  "Kandivali", "Malad", "Goregaon",
  "Dahisar", "Bhayandar", "Marine Lines",
];

export const STATUS_COLORS = {
  confirmed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
  no_show: "bg-gray-100 text-gray-700",
};

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