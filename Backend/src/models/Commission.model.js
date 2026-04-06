import mongoose from "mongoose";
import { COMMISSION_STATUS } from "../utils/constants.js";

const commissionSchema = new mongoose.Schema(
  {
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      required: true,
      unique: true, // One commission per reservation
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Booking details snapshot
    guests: {
      type: Number,
      required: true,
    },
    averageCostForTwo: {
      type: Number,
      required: true,
    },

    // Commission calculation
    // estimatedBill = (averageCostForTwo / 2) * guests
    estimatedBill: {
      type: Number,
      required: true,
    },
    commissionRate: {
      type: Number,
      required: true, // Snapshot at time of booking
    },
    commissionAmount: {
      type: Number,
      required: true, // estimatedBill * commissionRate / 100
    },

    status: {
      type: String,
      enum: Object.values(COMMISSION_STATUS),
      default: COMMISSION_STATUS.PENDING,
    },

    earnedAt: {
      type: Date, // When reservation marked complete
    },
    cancelledAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

commissionSchema.index({ owner: 1, status: 1 });
commissionSchema.index({ restaurant: 1 });
commissionSchema.index({ status: 1 });

export const Commission = mongoose.model("Commission", commissionSchema);