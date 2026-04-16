import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true,
    },
    planName: {
      type: String,
      enum: ["free_trial", "premium", "featured"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired", "past_due"],
      default: "active",
    },

    // ✅ Is this a free trial?
    isTrial: {
      type: Boolean,
      default: false,
    },
    trialEndsAt: {
      type: Date,
      default: null,
    },

    razorpaySubscriptionId: { type: String, default: null },
    razorpayCustomerId: { type: String, default: null },

    currentPeriodStart: {
      type: Date,
      required: true,
      default: Date.now,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    cancelledAt: { type: Date, default: null },

    payments: [
      {
        amount: Number,
        paidAt: Date,
        razorpayPaymentId: String,
        status: {
          type: String,
          enum: ["success", "failed"],
        },
      },
    ],
  },
  { timestamps: true }
);

subscriptionSchema.index({ owner: 1 });
subscriptionSchema.index({ status: 1 });

export const Subscription = mongoose.model("Subscription", subscriptionSchema);