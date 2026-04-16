import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials, selectUser } from "../features/auth/authSlice.js";
import { subscriptionService } from "../services/subscription.service.js";
import { authService } from "../services/auth.service.js";
import toast from "react-hot-toast";

export const usePlans = () => {
  return useQuery({
    queryKey: ["subscription", "plans"],
    queryFn: subscriptionService.getPlans,
    select: (data) => data.data.plans,
    staleTime: 1000 * 60 * 60,
  });
};

export const useMySubscription = () => {
  const user = useSelector(selectUser);
  return useQuery({
    queryKey: ["subscription", "my"],
    queryFn: subscriptionService.getMySubscription,
    select: (data) => data.data.subscription,
    // Only fetch if user is owner
    enabled: !!user && user.role !== "user",
  });
};

// ✅ Razorpay payment handler
const openRazorpay = ({ orderId, amount, currency, plan, onSuccess, onDismiss }) => {
  return new Promise((resolve, reject) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount,
      currency,
      name: "GoodFoods",
      description: `${plan.displayName} Plan`,
      order_id: orderId,
      handler: (response) => resolve(response),
      modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
      theme: { color: "#ef4444" },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  });
};

// ✅ Become owner hook — for normal users
export const useBecomeOwner = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async ({ planId, planName, businessName, businessPhone }) => {
      // Step 1 — initiate
      const initResult = await subscriptionService.becomeOwner({
        planId,
        businessName,
        businessPhone,
      });

      const data = initResult.data;

      // Free trial — no payment needed
      if (!data.requiresPayment) {
        return data;
      }

      // Step 2 — open Razorpay
      const paymentResponse = await openRazorpay({
        orderId: data.orderId,
        amount: data.amount,
        currency: data.currency,
        plan: data.plan,
      });

      // Step 3 — verify payment
      const verifyResult = await subscriptionService.verifyPayment({
        planId,
        businessName,
        businessPhone,
        razorpayOrderId: paymentResponse.razorpay_order_id,
        razorpayPaymentId: paymentResponse.razorpay_payment_id,
        razorpaySignature: paymentResponse.razorpay_signature,
      });

      return verifyResult.data;
    },
    onSuccess: async (data) => {
      // ✅ Refresh user data — role changed to owner!
      try {
        const meResult = await authService.getMe();
        const currentToken = localStorage.getItem("accessToken");
        dispatch(setCredentials({
          user: meResult.data,
          accessToken: currentToken,
        }));
      } catch (err) {
        console.error("Failed to refresh user:", err);
      }

      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success(
        "🎉 Subscription activated! Pending admin approval.",
        { duration: 5000 }
      );
    },
    onError: (error) => {
      if (error.message === "Payment cancelled") {
        toast.error("Payment cancelled");
      } else {
        toast.error(error?.message || "Subscription failed");
      }
    },
  });
};

// ✅ Upgrade hook — for existing owners
export const useUpgradeSubscription = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async ({ planId, planName }) => {
      // Step 1 — create upgrade order
      const orderResult = await subscriptionService.upgradeOrder(planId);
      const data = orderResult.data;

      // Step 2 — open Razorpay
      const paymentResponse = await openRazorpay({
        orderId: data.orderId,
        amount: data.amount,
        currency: data.currency,
        plan: data.plan,
      });

      // Step 3 — verify
      const verifyResult = await subscriptionService.verifyUpgrade({
        planId,
        razorpayOrderId: paymentResponse.razorpay_order_id,
        razorpayPaymentId: paymentResponse.razorpay_payment_id,
        razorpaySignature: paymentResponse.razorpay_signature,
      });

      return verifyResult.data;
    },
    onSuccess: async () => {
      try {
        const meResult = await authService.getMe();
        const currentToken = localStorage.getItem("accessToken");
        dispatch(setCredentials({
          user: meResult.data,
          accessToken: currentToken,
        }));
      } catch (err) {
        console.error("Failed to refresh user:", err);
      }

      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      queryClient.invalidateQueries({ queryKey: ["owner"] });
      toast.success("Plan upgraded successfully! 🎉");
    },
    onError: (error) => {
      if (error.message === "Payment cancelled") {
        toast.error("Payment cancelled");
      } else {
        toast.error(error?.message || "Upgrade failed");
      }
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subscriptionService.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Subscription cancelled");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to cancel");
    },
  });
};