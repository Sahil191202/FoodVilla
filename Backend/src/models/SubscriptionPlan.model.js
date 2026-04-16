import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["free_trial", "premium", "featured"],
    },
    displayName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    trialDays: {
      type: Number,
      default: 0, // Only for free_trial plan
    },
    features: [{ type: String }],
    limits: {
      restaurants: { type: Number, default: 1 },
      imagesPerRestaurant: { type: Number, default: 3 },
      menuItems: { type: Number, default: 20 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    razorpayPlanId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export const SubscriptionPlan = mongoose.model(
  "SubscriptionPlan",
  subscriptionPlanSchema
);