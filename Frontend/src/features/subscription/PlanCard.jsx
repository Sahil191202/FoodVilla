import { motion } from "framer-motion";
import { Check, Star, Zap, Crown } from "lucide-react";
import Button from "../../components/ui/Button.jsx";
import { formatPrice } from "../../utils/formatters.js";
import { cn } from "../../utils/cn.js";

const PLAN_ICONS = {
  free: <Zap size={20} />,
  premium: <Star size={20} />,
  featured: <Crown size={20} />,
};

const PLAN_STYLES = {
  free: {
    gradient: "from-gray-50 to-gray-100",
    iconBg: "bg-gray-200 text-gray-600",
    badge: null,
    border: "border-gray-200",
    button: "outline",
  },
  premium: {
    gradient: "from-blue-50 to-blue-100",
    iconBg: "bg-blue-500 text-white",
    badge: "Most Popular",
    border: "border-blue-300",
    button: "primary",
  },
  featured: {
    gradient: "from-primary-50 to-primary-100",
    iconBg: "bg-primary-500 text-white",
    badge: "Best Value",
    border: "border-primary-300",
    button: "primary",
  },
};

const PlanCard = ({
  plan,
  currentPlan,
  onSelect,
  isLoading,
  delay = 0,
}) => {
  const style = PLAN_STYLES[plan.name];
  const isCurrentPlan = currentPlan === plan.name;
  const isUpgrade =
    (currentPlan === "free" && plan.name !== "free") ||
    (currentPlan === "premium" && plan.name === "featured");
  const isDowngrade =
    (currentPlan === "featured" && plan.name !== "featured") ||
    (currentPlan === "premium" && plan.name === "free");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className={cn(
        "relative rounded-2xl border-2 overflow-hidden",
        style.border,
        plan.name === "premium" && "shadow-lg shadow-blue-100",
        plan.name === "featured" && "shadow-lg shadow-primary-100"
      )}
    >
      {/* Popular Badge */}
      {style.badge && (
        <div className="absolute top-4 right-4">
          <span className="bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {style.badge}
          </span>
        </div>
      )}

      {/* Header */}
      <div className={cn("p-6 bg-linear-to-br", style.gradient)}>
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
            style.iconBg
          )}
        >
          {PLAN_ICONS[plan.name]}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {plan.displayName}
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-900">
            {plan.price === 0
              ? "Free"
              : formatPrice(plan.price)}
          </span>
          {plan.price > 0 && (
            <span className="text-gray-500 text-sm">/month</span>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="p-6 bg-white">
        <ul className="space-y-3 mb-6">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                <Check size={12} className="text-green-600" />
              </div>
              <span className="text-sm text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        {isCurrentPlan ? (
          <div className="w-full py-2.5 text-center text-sm font-medium text-gray-500 bg-gray-100 rounded-xl">
            ✅ Current Plan
          </div>
        ) : (
          <Button
            variant={style.button}
            fullWidth
            isLoading={isLoading}
            onClick={() => onSelect(plan)}
            className={cn(
              plan.name === "featured" &&
                "shadow-lg shadow-primary-200"
            )}
          >
            {isUpgrade ? `Upgrade to ${plan.displayName}` : ""}
            {isDowngrade ? `Downgrade to ${plan.displayName}` : ""}
            {!isUpgrade && !isDowngrade
              ? `Get ${plan.displayName}`
              : ""}
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default PlanCard;