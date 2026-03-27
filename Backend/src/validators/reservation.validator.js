import { z } from "zod";

export const createReservationSchema = z.object({
  restaurantId: z
    .string({ required_error: "Restaurant ID is required" })
    .regex(/^[a-f\d]{24}$/i, "Invalid restaurant ID"),

  date: z
    .string({ required_error: "Date is required" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .refine((date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(date) >= today;
    }, "Reservation date cannot be in the past"),

  time: z
    .string({ required_error: "Time is required" })
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Invalid time format. Use HH:MM",
    ),

  guests: z.union([
    z.number().int().min(1).max(20),
    z.string().transform((val) => parseInt(val, 10)),
  ]),

  specialRequests: z.string().trim().max(200).optional(),
});

export const cancelReservationSchema = z.object({
  cancelReason: z.string().trim().max(200).optional(),
});

export const updateReservationSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD")
    .refine((date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(date) >= today;
    }, "Reservation date cannot be in the past")
    .optional(),

  time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format")
    .optional(),

  guests: z
    .union([
      z.number().int().min(1).max(20),
      z.string().transform((val) => parseInt(val, 10)),
    ])
    .optional(),

  specialRequests: z.string().trim().max(200).optional(),
});
