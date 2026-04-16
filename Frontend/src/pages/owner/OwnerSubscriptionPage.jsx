import { useState } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  AlertTriangle,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  usePlans,
  useMySubscription,
  useUpgradeSubscription,
  useCancelSubscription,
} from "../../hooks/useSubscription.js";
import PlanCard from "../../components/subscription/PlanCard.jsx";
import Button from "../../components/ui/Button.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { formatDate, formatPrice } from "../../utils/formatters.js";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/auth/authSlice.js";

const OwnerSubscriptionPage = () => {
  const user = useSelector(selectUser);
  const [cancelModal, setCancelModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const { data: plans, isLoading: plansLoading } = usePlans();
  const { data: subscription, isLoading: subLoading } = useMySubscription();
  const { mutate: cancelSub, isPending: isCancelling } =
    useCancelSubscription();

  const isLoading = plansLoading || subLoading;
  const currentPlan = user?.currentPlan || "free";
  const { mutate: upgrade, isPending: isUpgrading } = useUpgradeSubscription();

  const upgradePlans = plans?.filter((p) => p.name !== "free_trial");

  const handleUpgrade = (plan) => {
    setSelectedPlan(plan);
    upgrade(
      { planId: plan._id, planName: plan.name },
      { onSuccess: () => setSelectedPlan(null) },
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Subscription 👑</h1>
        <p className="text-gray-500 mt-1">Manage your GoodFoods plan</p>
      </div>

      {/* Current Plan */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-5 mb-8 flex items-center justify-between ${
          currentPlan === "featured"
            ? "bg-linear-to-r from-primary-500 to-primary-600 text-white"
            : currentPlan === "premium"
              ? "bg-linear-to-r from-blue-500 to-blue-600 text-white"
              : "bg-gray-100"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Crown
              size={22}
              className={
                currentPlan === "free" ? "text-gray-500" : "text-white"
              }
            />
          </div>
          <div>
            <p
              className={`font-bold text-lg capitalize ${currentPlan === "free" ? "text-gray-900" : "text-white"}`}
            >
              {currentPlan} Plan
            </p>
            <p
              className={
                currentPlan === "free"
                  ? "text-gray-500 text-sm"
                  : "text-white/80 text-sm"
              }
            >
              {currentPlan === "free"
                ? "Basic features included"
                : subscription?.currentPeriodEnd
                  ? `Renews on ${formatDate(subscription.currentPeriodEnd)}`
                  : "Active"}
            </p>
          </div>
        </div>
        {currentPlan !== "free" && (
          <button
            onClick={() => setCancelModal(true)}
            className="text-white/80 hover:text-white text-sm underline"
          >
            Cancel
          </button>
        )}
      </motion.div>

      {/* Payment History */}
      {subscription?.payments?.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Payment History</h2>
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
                  variant={payment.status === "success" ? "success" : "danger"}
                  size="sm"
                >
                  {payment.status}
                </Badge>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Plans */}
      <h2 className="text-lg font-bold text-gray-900 mb-5">Available Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {upgradePlans?.map((plan, i) => (
          <PlanCard
            key={plan._id}
            plan={plan}
            currentPlan={currentPlan}
            onSelect={handleUpgrade}
            isLoading={isUpgrading && selectedPlan?._id === plan._id}
            delay={i * 0.1}
          />
        ))}
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={cancelModal}
        onClose={() => setCancelModal(false)}
        title="Cancel Subscription"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setCancelModal(false)}>
              Keep Plan
            </Button>
            <Button
              variant="danger"
              isLoading={isCancelling}
              onClick={() =>
                cancelSub(undefined, { onSuccess: () => setCancelModal(false) })
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
            Cancel your {currentPlan} plan?
          </p>
          <p className="text-sm text-gray-500">
            You will be downgraded to Free plan. All premium features will be
            removed.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default OwnerSubscriptionPage;
