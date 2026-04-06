export const USER_ROLES = {
  USER: "user",
  OWNER: "owner",      // ✅ Restaurant owner
  ADMIN: "admin",
};

export const CUISINE_TYPES = [
  "Indian", "Italian", "Chinese", "Continental",
  "Mexican", "Japanese", "Thai", "Mediterranean"
];

export const RESERVATION_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
  NO_SHOW: "no_show",
};

export const COMMISSION_RATE = 0.10; // 10% commission to admin

export const COMMISSION_STATUS = {
  PENDING: "pending",       // Reservation confirmed — commission pending
  EARNED: "earned",         // User visited — commission earned
  CANCELLED: "cancelled",   // Reservation cancelled — no commission
};