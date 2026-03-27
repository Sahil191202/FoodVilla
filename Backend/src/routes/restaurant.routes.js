import { Router } from "express";
import {
  addRestaurant,
  getRestaurants,
  getRestaurant,
  getSlots,
} from "../controllers/restaurant.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  createRestaurantSchema,
  searchRestaurantSchema,
} from "../validators/restaurant.validator.js";
import { USER_ROLES } from "../utils/constants.js";

const router = Router();

// Public routes — anyone can search restaurants
router.get("/", validate(searchRestaurantSchema, "query"), getRestaurants);
router.get("/:id", getRestaurant);
router.get("/:id/slots", validate(searchRestaurantSchema, "query"), getSlots);

// Protected — only admin can add restaurants
router.post(
  "/",
  verifyJWT,
  authorizeRoles(USER_ROLES.ADMIN),
  validate(createRestaurantSchema),
  addRestaurant
);

export default router;