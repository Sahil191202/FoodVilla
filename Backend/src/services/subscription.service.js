import Razorpay from "razorpay";
import crypto from "crypto";
import { Subscription } from "../models/Subscription.model.js";
import { SubscriptionPlan } from "../models/SubscriptionPlan.model.js";
import { User } from "../models/User.model.js";
import { Restaurant } from "../models/Restaurant.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ENV } from "../config/env.js";
import { FREE_TRIAL_DAYS, USER_ROLES } from "../utils/constants.js";
import { sendSubscriptionEmail } from "./notification.service.js";

const razorpay = new Razorpay({
  key_id: ENV.RAZORPAY_KEY_ID,
  key_secret: ENV.RAZORPAY_KEY_SECRET,
});

export const getPlans = async () => {
  return await SubscriptionPlan.find({ isActive: true });
};

export const getOwnerSubscription = async (userId) => {
  const subscription = await Subscription.findOne({
    owner: userId,
    status: "active",
  }).populate("plan");

  return subscription;
};

// ✅ User subscribes → becomes owner (pending approval)
export const subscribeAndBecomeOwner = async ({
  userId,
  planId,
  businessName,
  businessPhone,
}) => {
  const user = await User.findById(userId);
  const shortUser = userId.toString().slice(-6);
  if (!user) throw new ApiError(404, "User not found");

  // Already an owner
  if (user.role === USER_ROLES.OWNER) {
    throw new ApiError(400, "You are already an owner");
  }

  const plan = await SubscriptionPlan.findById(planId);
  if (!plan) throw new ApiError(404, "Plan not found");

  // Check if already has active subscription
  const existingSub = await Subscription.findOne({
    owner: userId,
    status: "active",
  });

  if (existingSub) {
    throw new ApiError(400, "You already have an active subscription");
  }

  // Free trial — no payment needed
  if (plan.name === "free_trial" || plan.name === "free") {
    return await activateFreeTrial(userId, plan, businessName, businessPhone);
  }

  // 🚨 Safety check
  if (!plan.price || plan.price < 1) {
    throw new ApiError(400, "Invalid plan price");
  }

  const order = await razorpay.orders.create({
    amount: plan.price * 100,
    currency: "INR",
    receipt: `own_${shortUser}_${Date.now()}`,
    notes: {
      userId: userId.toString(),
      planId: planId.toString(),
      planName: plan.name,
      type: "become_owner",
    },
  });

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    plan,
    requiresPayment: true,
  };
};

// ✅ Activate free trial
const activateFreeTrial = async (userId, plan, businessName, businessPhone) => {
  const now = new Date();
  const trialEnd = new Date(
    now.getTime() + FREE_TRIAL_DAYS * 24 * 60 * 60 * 1000,
  );

  // Create subscription
  const subscription = await Subscription.create({
    owner: userId,
    plan: plan._id,
    planName: plan.name,
    status: "active",
    isTrial: true,
    trialEndsAt: trialEnd,
    currentPeriodStart: now,
    currentPeriodEnd: trialEnd,
  });

  // ✅ Update user — role → owner, status → pending_approval
  await User.findByIdAndUpdate(userId, {
    role: USER_ROLES.OWNER,
    ownerStatus: "pending_approval",
    currentPlan: plan.name,
    businessName,
    businessPhone,
  });

  // Send email to user
  const user = await User.findById(userId);
  try {
    await sendSubscriptionEmail({
      email: user.email,
      name: user.name,
      planName: plan.displayName,
      isTrial: true,
      trialDays: FREE_TRIAL_DAYS,
    });
  } catch (err) {
    console.error("Subscription email failed:", err.message);
  }

  return {
    subscription,
    requiresPayment: false,
    message: `Free trial activated! ${FREE_TRIAL_DAYS} days free. Pending admin approval.`,
  };
};

// ✅ Verify payment and activate subscription
export const verifyPaymentAndActivate = async ({
  userId,
  planId,
  businessName,
  businessPhone,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  // Verify Razorpay signature
  const expectedSignature = crypto
    .createHmac("sha256", ENV.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    throw new ApiError(400, "Invalid payment signature");
  }

  const plan = await SubscriptionPlan.findById(planId);
  if (!plan) throw new ApiError(404, "Plan not found");

  const now = new Date();
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Deactivate old subscriptions
  await Subscription.updateMany(
    { owner: userId, status: "active" },
    { status: "cancelled", cancelledAt: now },
  );

  // Create new subscription
  const subscription = await Subscription.create({
    owner: userId,
    plan: plan._id,
    planName: plan.name,
    status: "active",
    isTrial: false,
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    razorpaySubscriptionId: razorpayOrderId,
    payments: [
      {
        amount: plan.price,
        paidAt: now,
        razorpayPaymentId,
        status: "success",
      },
    ],
  });

  // Check if user is already an owner (upgrading)
  const user = await User.findById(userId);
  const isUpgrade = user.role === USER_ROLES.OWNER;

  // Update user
  await User.findByIdAndUpdate(userId, {
    role: USER_ROLES.OWNER,
    ownerStatus: isUpgrade ? user.ownerStatus : "pending_approval",
    currentPlan: plan.name,
    ...(businessName && { businessName }),
    ...(businessPhone && { businessPhone }),
  });

  // If featured plan — mark restaurants as featured
  if (plan.name === "featured") {
    await Restaurant.updateMany(
      { owner: userId, isApproved: true },
      { isFeatured: true, featuredUntil: periodEnd },
    );
  }

  // Send email
  try {
    const updatedUser = await User.findById(userId);
    await sendSubscriptionEmail({
      email: updatedUser.email,
      name: updatedUser.name,
      planName: plan.displayName,
      isTrial: false,
      periodEnd,
    });
  } catch (err) {
    console.error("Subscription email failed:", err.message);
  }

  return {
    subscription,
    isUpgrade,
    message: isUpgrade
      ? `Upgraded to ${plan.displayName} successfully!`
      : `Subscribed! Pending admin approval.`,
  };
};

// ✅ Upgrade existing owner subscription
export const upgradeSubscription = async ({ ownerId, planId }) => {
  const plan = await SubscriptionPlan.findById(planId);
  if (!plan) throw new ApiError(404, "Plan not found");

  if (plan.name === "free_trial") {
    throw new ApiError(400, "Cannot upgrade to free trial");
  }

  const order = await razorpay.orders.create({
    amount: plan.price * 100,
    currency: "INR",
    receipt: `upgrade_${ownerId}_${Date.now()}`,
    notes: {
      userId: ownerId.toString(),
      planId: planId.toString(),
      planName: plan.name,
      type: "upgrade",
    },
  });

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    plan,
    requiresPayment: true,
  };
};

// ✅ Cancel subscription
export const cancelSubscription = async (ownerId) => {
  const subscription = await Subscription.findOne({
    owner: ownerId,
    status: "active",
  });

  if (!subscription) {
    throw new ApiError(404, "No active subscription found");
  }

  subscription.status = "cancelled";
  subscription.cancelledAt = new Date();
  await subscription.save();

  // Downgrade user plan
  await User.findByIdAndUpdate(ownerId, {
    currentPlan: "none",
  });

  // Remove featured
  await Restaurant.updateMany(
    { owner: ownerId },
    { isFeatured: false, featuredUntil: null },
  );

  return subscription;
};

// ✅ Check and expire trials/subscriptions — run as cron
export const checkExpiredSubscriptions = async () => {
  const expired = await Subscription.find({
    status: "active",
    currentPeriodEnd: { $lt: new Date() },
  });

  for (const sub of expired) {
    sub.status = "expired";
    await sub.save();

    await User.findByIdAndUpdate(sub.owner, {
      currentPlan: "none",
    });

    await Restaurant.updateMany(
      { owner: sub.owner },
      { isFeatured: false, featuredUntil: null },
    );

    console.log(`Subscription expired for owner: ${sub.owner}`);
  }
};
