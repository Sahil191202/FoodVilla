import { useState } from "react";
import { motion } from "framer-motion";
import {
  Crown, AlertTriangle, CheckCircle,
  XCircle, Check, Star, Zap,
} from "lucide-react";
import {
  usePlans,
  useMySubscription,
  useUpgradeSubscription,
  useCancelSubscription,
} from "../../hooks/useSubscription.js";
import Button from "../../components/ui/Button.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { formatDate, formatPrice } from "../../utils/formatters.js";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/auth/authSlice.js";
import { cn } from "../../utils/cn.js";
import BackButton from "../../components/common/BackButton.jsx";

const PLAN_ICONS = {
  free_trial: <Zap size={18} className="text-gray-600" />,
  premium: <Star size={18} className="text-blue-500" />,
  featured: <Crown size={18} className="text-primary-500" />,
};

const PLAN_STYLES = {
  free_trial: {
    gradient: "from-gray-50 to-gray-100",
    border: "border-gray-200",
    iconBg: "bg-gray-200",
  },
  premium: {
    gradient: "from-blue-50 to-blue-100",
    border: "border-blue-200",
    iconBg: "bg-blue-100",
  },
  featured: {
    gradient: "from-primary-50 to-primary-100",
    border: "border-primary-200",
    iconBg: "bg-primary-100",
  },
};

// Inline upgrade plan card
const UpgradePlanCard = ({
  plan,
  currentPlan,
  onSelect,
  isLoading,
}) => {
  const style = PLAN_STYLES[plan.name] || PLAN_STYLES.free_trial;
  const isCurrent = currentPlan === plan.name;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={cn(
        "rounded-2xl border-2 overflow-hidden transition-all duration-200",
        style.border,
        isCurrent && "ring-2 ring-primary-500 ring-offset-2"
      )}
    >
      <div className={cn("p-5 bg-linear-to-br", style.gradient)}>
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
          style.iconBg
        )}>
          {PLAN_ICONS[plan.name]}
        </div>
        <h3 className="font-bold text-gray-900 mb-1">
          {plan.displayName}
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-gray-900">
            {plan.price === 0
              ? "Free"
              : formatPrice(plan.price)}
          </span>
          {plan.price > 0 && (
            <span className="text-gray-500 text-xs">/month</span>
          )}
        </div>
      </div>

      <div className="p-5 bg-white">
        <ul className="space-y-2 mb-4">
          {plan.features.slice(0, 4).map((f, i) => (
            <li key={i} className="flex items-center gap-2">
              <Check size={13} className="text-green-500 shrink-0" />
              <span className="text-xs text-gray-600">{f}</span>
            </li>
          ))}
        </ul>

        {isCurrent ? (
          <div className="w-full py-2 text-center text-sm font-medium text-gray-500 bg-gray-100 rounded-xl">
            ✅ Current Plan
          </div>
        ) : (
          <Button
            variant="primary"
            size="sm"
            fullWidth
            isLoading={isLoading}
            onClick={() => onSelect(plan)}
          >
            Upgrade to {plan.displayName}
          </Button>
        )}
      </div>
    </motion.div>
  );
};

const OwnerSubscriptionPage = () => {
  const user = useSelector(selectUser);
  const [cancelModal, setCancelModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const { data: plans, isLoading: plansLoading } = usePlans();
  const { data: subscription, isLoading: subLoading } = useMySubscription();
  const { mutate: upgrade, isPending: isUpgrading } = useUpgradeSubscription();
  const { mutate: cancelSub, isPending: isCancelling } = useCancelSubscription();

  const isLoading = plansLoading || subLoading;
  const currentPlan = user?.currentPlan || "none";

  // ✅ Filter out free_trial from upgrade options
  const upgradePlans = plans?.filter((p) => p.name !== "free_trial");

  const handleUpgrade = (plan) => {
    setSelectedPlan(plan);
    upgrade(
      { planId: plan._id, planName: plan.name },
      { onSuccess: () => setSelectedPlan(null) }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <BackButton to="home" label="Back to App" className="mb-6" />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          My Subscription 👑
        </h1>
        <p className="text-gray-500 mt-1">
          Manage your GoodFoods plan
        </p>
      </div>

      {/* Current Plan Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "rounded-2xl p-5 mb-8 flex items-center justify-between",
          currentPlan === "featured"
            ? "bg-linear-to-r from-primary-500 to-primary-600 text-white"
            : currentPlan === "premium"
            ? "bg-linear-to-r from-blue-500 to-blue-600 text-white"
            : "bg-gray-100"
        )}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Crown
              size={22}
              className={
                currentPlan === "free_trial" || currentPlan === "none"
                  ? "text-gray-500"
                  : "text-white"
              }
            />
          </div>
          <div>
            <p className={cn(
              "font-bold text-lg capitalize",
              currentPlan === "free_trial" || currentPlan === "none"
                ? "text-gray-900"
                : "text-white"
            )}>
              {currentPlan === "free_trial"
                ? "Free Trial"
                : currentPlan === "none"
                ? "No Active Plan"
                : `${currentPlan} Plan`}
            </p>
            <p className={cn(
              "text-sm",
              currentPlan === "free_trial" || currentPlan === "none"
                ? "text-gray-500"
                : "text-white/80"
            )}>
              {subscription?.isTrial
                ? `Trial ends: ${formatDate(subscription.trialEndsAt)}`
                : subscription?.currentPeriodEnd
                ? `Renews: ${formatDate(subscription.currentPeriodEnd)}`
                : "No active subscription"}
            </p>
          </div>
        </div>

        {subscription && subscription.status === "active" && currentPlan !== "none" && (
          <button
            onClick={() => setCancelModal(true)}
            className={cn(
              "text-sm underline transition-colors",
              currentPlan === "free_trial" || currentPlan === "none"
                ? "text-gray-500 hover:text-gray-700"
                : "text-white/80 hover:text-white"
            )}
          >
            Cancel
          </button>
        )}
      </motion.div>

      {/* Trial Banner */}
      {subscription?.isTrial && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 flex items-start gap-3"
        >
          <span className="text-xl">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-yellow-800">
              Free Trial Active
            </p>
            <p className="text-xs text-yellow-700 mt-0.5">
              Your free trial ends on{" "}
              <strong>{formatDate(subscription.trialEndsAt)}</strong>.
              Upgrade to a paid plan to continue after trial.
            </p>
          </div>
        </motion.div>
      )}

      {/* Payment History */}
      {subscription?.payments?.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">
              Payment History
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {subscription.payments.map((payment, i) => (
              <div
                key={i}
                className="px-6 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {payment.status === "success" ? (
                    <CheckCircle size={16} className="text-green-500" />
                  ) : (
                    <XCircle size={16} className="text-red-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {formatPrice(payment.amount)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(payment.paidAt)}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    payment.status === "success" ? "success" : "danger"
                  }
                  size="sm"
                >
                  {payment.status}
                </Badge>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Upgrade Plans */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-5">
          {currentPlan === "free_trial"
            ? "Upgrade Your Plan"
            : "Available Plans"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {upgradePlans?.map((plan, i) => (
            <UpgradePlanCard
              key={plan._id}
              plan={plan}
              currentPlan={currentPlan}
              onSelect={handleUpgrade}
              isLoading={
                isUpgrading && selectedPlan?._id === plan._id
              }
            />
          ))}
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={cancelModal}
        onClose={() => setCancelModal(false)}
        title="Cancel Subscription"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setCancelModal(false)}
            >
              Keep Plan
            </Button>
            <Button
              variant="danger"
              isLoading={isCancelling}
              onClick={() =>
                cancelSub(undefined, {
                  onSuccess: () => setCancelModal(false),
                })
              }
            >
              Yes, Cancel
            </Button>
          </>
        }
      >
        <div className="text-center py-2">
          <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} className="text-yellow-500" />
          </div>
          <p className="font-medium text-gray-900 mb-2">
            Cancel your plan?
          </p>
          <p className="text-sm text-gray-500">
            You will lose access to all premium features after cancellation.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default OwnerSubscriptionPage;