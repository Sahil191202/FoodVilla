import { Router } from "express";
import {
  addMenu,
  getMenu,
  addItems,
  updateItem,
  toggleAvailability,
  removeItem,
} from "../controllers/menu.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { USER_ROLES } from "../utils/constants.js";

const router = Router();

// Public — anyone can view menu
router.get("/:id/menu", getMenu);

// Protected — only admin or staff can modify menu
router.use(verifyJWT);
router.use(authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.STAFF));

router.post("/:id/menu", addMenu);
router.post("/:id/menu/items", addItems);
router.patch("/:id/menu/items/:itemId", updateItem);
router.patch("/:id/menu/items/:itemId/toggle", toggleAvailability);
router.delete("/:id/menu/items/:itemId", removeItem);

export default router;