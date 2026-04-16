import mongoose from "mongoose";
import { SubscriptionPlan } from "../models/SubscriptionPlan.model.js";
import { ENV } from "../config/env.js";

const plans = [
  {
    name: "free_trial",
    displayName: "Free Trial",
    price: 0,
    trialDays: 14,
    features: [
      "14 days free trial",
      "1 restaurant listing",
      "Up to 3 images",
      "20 menu items",
      "Basic booking management",
      "Email notifications",
    ],
    limits: {
      restaurants: 1,
      imagesPerRestaurant: 3,
      menuItems: 20,
    },
  },
  {
    name: "premium",
    displayName: "Premium",
    price: 2999,
    trialDays: 0,
    features: [
      "Up to 5 restaurants",
      "Up to 10 images per restaurant",
      "Unlimited menu items",
      "Analytics dashboard",
      "AI marketing emails",
      "Priority support",
    ],
    limits: {
      restaurants: 5,
      imagesPerRestaurant: 10,
      menuItems: -1,
    },
  },
  {
    name: "featured",
    displayName: "Featured",
    price: 5999,
    trialDays: 0,
    features: [
      "Unlimited restaurants",
      "Unlimited images",
      "Unlimited menu items",
      "Full analytics",
      "AI marketing campaigns",
      "⭐ Featured in AI search results",
      "✅ Verified badge",
      "Dedicated support",
    ],
    limits: {
      restaurants: -1,
      imagesPerRestaurant: -1,
      menuItems: -1,
    },
  },
];

const seed = async () => {
  await mongoose.connect(ENV.MONGODB_URI);
  await SubscriptionPlan.deleteMany({});
  await SubscriptionPlan.insertMany(plans);
  console.log("✅ Plans seeded!");
  process.exit(0);
};

seed().catch(console.error);