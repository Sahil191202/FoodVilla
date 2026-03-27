import { z } from "zod";
import { CUISINE_TYPES } from "../utils/constants.js";

const operatingHoursSchema = z.object({
  open: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:MM"),
  close: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:MM"),
  isClosed: z.boolean().default(false),
});

export const createRestaurantSchema = z.object({
  name: z
    .string({ required_error: "Restaurant name is required" })
    .trim()
    .min(2, "Name too short")
    .max(100, "Name too long"),

  description: z.string().trim().max(500).optional(),

  cuisine: z
    .array(z.enum(CUISINE_TYPES))
    .min(1, "At least one cuisine type is required"),

  address: z.object({
    street: z.string({ required_error: "Street is required" }).trim(),
    area: z.string({ required_error: "Area is required" }).trim(),
    city: z.string().default("Bangalore"),
    pincode: z
      .string()
      .regex(/^\d{6}$/, "Pincode must be 6 digits"),
  }),

  contact: z.object({
    phone: z
      .string({ required_error: "Contact phone is required" })
      .regex(/^[6-9]\d{9}$/, "Invalid phone number"),
    email: z.string().email("Invalid email").optional(),
  }),

  operatingHours: z.object({
    monday: operatingHoursSchema,
    tuesday: operatingHoursSchema,
    wednesday: operatingHoursSchema,
    thursday: operatingHoursSchema,
    friday: operatingHoursSchema,
    saturday: operatingHoursSchema,
    sunday: operatingHoursSchema,
  }),

  totalSeats: z
    .number({ required_error: "Total seats required" })
    .int()
    .min(1)
    .max(500),

  averageCostForTwo: z
    .number({ required_error: "Average cost required" })
    .min(100),
});

export const searchRestaurantSchema = z.object({
  cuisine: z.enum(CUISINE_TYPES).optional(),

  area: z.string().trim().optional(),

  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),

  guests: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(20))
    .optional(),
}).optional(); // whole schema optional — empty query is fine too!