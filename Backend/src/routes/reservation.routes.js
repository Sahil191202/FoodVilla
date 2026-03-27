import { Router } from "express";
import {
  bookTable,
  cancelBooking,
  myReservations,
  getByCode,
} from "../controllers/reservation.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createReservationSchema,
  cancelReservationSchema,
} from "../validators/reservation.validator.js";

const router = Router();

// All reservation routes need auth
router.use(verifyJWT);

router.post("/", validate(createReservationSchema, "body"), bookTable);
router.get("/my", myReservations);
router.get("/code/:code", getByCode);
router.patch("/:id/cancel", validate(cancelReservationSchema, "body"), cancelBooking);

export default router;