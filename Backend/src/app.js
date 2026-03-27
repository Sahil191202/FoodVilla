import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { ENV } from "./config/env.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { apiRateLimiter } from "./middlewares/rateLimit.middleware.js";
// Import all routes
import authRoutes from "./routes/auth.routes.js";
import restaurantRoutes from "./routes/restaurant.routes.js";
import menuRoutes from "./routes/menu.routes.js";
import reservationRoutes from "./routes/reservation.routes.js";
import chatRoutes from "./routes/chat.routes.js";

const app = express();

// Security middlewares
app.use(helmet());
app.use(cors({
  origin: ENV.CORS_ORIGIN,
  credentials: true,
}));

// Request parsing
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Logging — only in development
if (ENV.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "GoodFoods API is running" });
});

// Register routes — all under /api/v1
// v1 is important — if API changes in future, make v2!
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/restaurants", restaurantRoutes);
app.use("/api/v1/restaurants", menuRoutes);   // /restaurants/:id/menu
app.use("/api/v1/reservations", reservationRoutes);
app.use("/api/v1/chat", chatRoutes);

// 404 handler — route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Apply general rate limiter to all API routes
app.use("/api", apiRateLimiter);

// Global error handler — always last!
app.use(errorMiddleware);

export { app };