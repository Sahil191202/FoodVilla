import { Router } from "express";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { USER_ROLES } from "../utils/constants.js";
import {
  getPlans,
  getOwnerSubscription,
  subscribeAndBecomeOwner,
  verifyPaymentAndActivate,
  upgradeSubscription,
  cancelSubscription,
} from "../services/subscription.service.js";

const router = Router();

// ✅ Public — anyone can see plans
router.get("/plans", asyncHandler(async (req, res) => {
  const plans = await getPlans();
  return res.status(200).json(
    new ApiResponse(200, { plans }, "Plans fetched")
  );
}));

// ✅ Protected routes
router.use(verifyJWT);

// Get my subscription
router.get("/my", asyncHandler(async (req, res) => {
  const subscription = await getOwnerSubscription(req.user._id);
  return res.status(200).json(
    new ApiResponse(200, { subscription }, "Subscription fetched")
  );
}));

// ✅ Any user can subscribe to become owner
router.post("/become-owner", asyncHandler(async (req, res) => {
  const {
    planId,
    businessName,
    businessPhone,
  } = req.body;

  if (!planId) throw new ApiError(400, "Plan is required");
  if (!businessName) throw new ApiError(400, "Business name is required");

  const result = await subscribeAndBecomeOwner({
    userId: req.user._id,
    planId,
    businessName,
    businessPhone,
  });

  return res.status(200).json(
    new ApiResponse(200, result, "Subscription initiated")
  );
}));

// ✅ Verify payment after Razorpay
router.post("/verify", asyncHandler(async (req, res) => {
  const {
    planId,
    businessName,
    businessPhone,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  } = req.body;

  const result = await verifyPaymentAndActivate({
    userId: req.user._id,
    planId,
    businessName,
    businessPhone,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });

  return res.status(200).json(
    new ApiResponse(200, result, result.message)
  );
}));

// ✅ Upgrade — existing owners only
router.post(
  "/upgrade",
  authorizeRoles(USER_ROLES.OWNER),
  asyncHandler(async (req, res) => {
    const { planId } = req.body;
    if (!planId) throw new ApiError(400, "Plan is required");

    const result = await upgradeSubscription({
      ownerId: req.user._id,
      planId,
    });

    return res.status(200).json(
      new ApiResponse(200, result, "Upgrade order created")
    );
  })
);

// ✅ Cancel
router.post(
  "/cancel",
  authorizeRoles(USER_ROLES.OWNER),
  asyncHandler(async (req, res) => {
    const subscription = await cancelSubscription(req.user._id);
    return res.status(200).json(
      new ApiResponse(200, subscription, "Subscription cancelled")
    );
  })
);

export default router;