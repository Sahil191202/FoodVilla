import { Router } from "express";
import multer from "multer";
import {
  addMenu,
  getMenu,
  addItems,
  updateItem,
  toggleAvailability,
  removeItem,
  uploadItemImage,
  deleteItemImage,
} from "../controllers/menu.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { verifyRestaurantOwner } from "../middlewares/owner.middleware.js";
import { USER_ROLES } from "../utils/constants.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images allowed"), false);
    }
  },
});

// ✅ Public — anyone can view menu
router.get("/:id/menu", getMenu);

// ✅ Protected — owner or admin only
router.use(verifyJWT);
router.use(authorizeRoles(
  USER_ROLES.OWNER,
  USER_ROLES.ADMIN
));

router.post("/:id/menu", verifyRestaurantOwner, addMenu);
router.post("/:id/menu/items", verifyRestaurantOwner, addItems);
router.patch("/:id/menu/items/:itemId", verifyRestaurantOwner, updateItem);
router.patch(
  "/:id/menu/items/:itemId/toggle",
  verifyRestaurantOwner,
  toggleAvailability
);

// ✅ Image upload routes
router.post(
  "/:id/menu/items/:itemId/image",
  verifyRestaurantOwner,
  upload.single("image"),
  uploadItemImage
);

router.delete(
  "/:id/menu/items/:itemId/image",
  verifyRestaurantOwner,
  deleteItemImage
);

router.delete(
  "/:id/menu/items/:itemId",
  verifyRestaurantOwner,
  removeItem
);

export default router;