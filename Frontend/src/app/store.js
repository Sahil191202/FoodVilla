import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice.js";
import restaurantReducer from "../features/restaurant/restaurantSlice.js";
import reservationReducer from "../features/reservation/reservationSlice.js";
import chatReducer from "../features/chat/chatSlice.js";
import adminReducer from "../features/admin/adminSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    restaurant: restaurantReducer,
    reservation: reservationReducer,
    chat: chatReducer,
    admin: adminReducer,
  },
  devTools: import.meta.env.DEV, // Only in development!
});