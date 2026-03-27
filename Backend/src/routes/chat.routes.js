import { Router } from "express";
import { chat, getChatHistory, clearChat } from "../controllers/chat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { chatRateLimiter } from "../middlewares/rateLimit.middleware.js";

const router = Router();

// All chat routes need auth
router.use(verifyJWT);

// Chat rate limiter only on message route — not history!
router.post("/", chatRateLimiter, chat);
router.get("/history", getChatHistory);
router.delete("/clear", clearChat);

export default router;