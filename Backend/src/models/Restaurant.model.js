import mongoose from "mongoose";
import { CUISINE_TYPES } from "../utils/constants.js";

const operatingHoursSchema = new mongoose.Schema(
  {
    open: { type: String, required: true },
    close: { type: String, required: true },
    isClosed: { type: Boolean, default: false },
  },
  { _id: false }
);

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    cuisine: [
      {
        type: String,
        enum: CUISINE_TYPES,
        required: true,
      },
    ],
    address: {
      street: { type: String, required: true },
      area: { type: String, required: true },
      city: { type: String, default: "Bangalore" },
      pincode: { type: String, required: true },
    },
    contact: {
      phone: { type: String, required: true },
      email: { type: String },
    },
    operatingHours: {
      monday: operatingHoursSchema,
      tuesday: operatingHoursSchema,
      wednesday: operatingHoursSchema,
      thursday: operatingHoursSchema,
      friday: operatingHoursSchema,
      saturday: operatingHoursSchema,
      sunday: operatingHoursSchema,
    },
    totalSeats: {
      type: Number,
      required: true,
    },
    averageCostForTwo: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    images: [{ type: String }],

    // ✅ Owner reference — NOT admin!
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ Commission rate snapshot at restaurant level
    // Owner can negotiate different rates per restaurant
    commissionRate: {
      type: Number,
      default: 10,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // ✅ Admin approval required before listing
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

restaurantSchema.index({ cuisine: 1 });
restaurantSchema.index({ "address.area": 1 });
restaurantSchema.index({ isActive: 1, isApproved: 1 });
restaurantSchema.index({ owner: 1 }); // ✅ Fast lookup by owner

export const Restaurant = mongoose.model("Restaurant", restaurantSchema);