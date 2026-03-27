import { Router } from "express";
import {
  register,
  login,
  logout,
  refreshToken,
  updatePassword,
  getMe,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authRateLimiter } from "../middlewares/rateLimit.middleware.js";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from "../validators/auth.validator.js";

const router = Router();

// Public routes
router.post("/register", validate(registerSchema), register);
router.post("/login", authRateLimiter, validate(loginSchema), login);
router.post("/refresh-token", refreshToken);

// Protected routes
router.use(verifyJWT); // All routes below need auth
router.post("/logout", logout);
router.get("/me", getMe);
router.patch(
  "/change-password",
  validate(changePasswordSchema),
  updatePassword
);

export default router;