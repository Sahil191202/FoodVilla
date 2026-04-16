import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  UtensilsCrossed,
  Check,
  Crown,
  Star,
  Zap,
  ArrowRight,
  Sparkles,
  BarChart3,
  MessageSquare,
  Image,
  Building,
  Phone,
  ChevronRight,
} from "lucide-react";
import { useSelector } from "react-redux";
import { selectUser } from "../features/auth/authSlice.js";
import { usePlans, useBecomeOwner } from "../hooks/useSubscription.js";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import Modal from "../components/ui/Modal.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import { formatPrice } from "../utils/formatters.js";
import { cn } from "../utils/cn.js";

const businessSchema = z.object({
  businessName: z.string().min(2, "Business name required"),
  businessPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Valid Indian phone number required"),
});

const BENEFITS = [
  {
    icon: <UtensilsCrossed size={22} className="text-primary-500" />,
    title: "List Your Restaurant",
    desc: "Add restaurants with images, menu and operating hours",
  },
  {
    icon: <MessageSquare size={22} className="text-primary-500" />,
    title: "AI-Powered Discovery",
    desc: "Discovered by thousands via our AI assistant",
  },
  {
    icon: <BarChart3 size={22} className="text-primary-500" />,
    title: "Analytics Dashboard",
    desc: "Track bookings, views and customer trends",
  },
  {
    icon: <Sparkles size={22} className="text-primary-500" />,
    title: "Featured Placement",
    desc: "Appear first in AI search with Featured plan",
  },
  {
    icon: <Image size={22} className="text-primary-500" />,
    title: "Rich Media Portal",
    desc: "Upload high quality images, update menus real-time",
  },
  {
    icon: <Star size={22} className="text-primary-500" />,
    title: "Verified Badge",
    desc: "Build customer trust with our verification system",
  },
];

const PLAN_ICONS = {
  free_trial: <Zap size={20} />,
  premium: <Star size={20} />,
  featured: <Crown size={20} />,
};

const PLAN_STYLES = {
  free_trial: {
    gradient: "from-gray-50 to-gray-100",
    iconBg: "bg-gray-200 text-gray-600",
    border: "border-gray-200",
    badge: null,
  },
  premium: {
    gradient: "from-blue-50 to-blue-100",
    iconBg: "bg-blue-500 text-white",
    border: "border-blue-300",
    badge: "Most Popular",
  },
  featured: {
    gradient: "from-primary-50 to-primary-100",
    iconBg: "bg-primary-500 text-white",
    border: "border-primary-300",
    badge: "Best Value",
  },
};

const PlanSelector = ({ plans, selectedPlan, onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {plans?.map((plan, i) => {
        const isSelected = selectedPlan?._id === plan._id;

        const style = PLAN_STYLES[plan.name];
        console.log(plans.map(p => p.name));
        return (
          <motion.button
            key={plan._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -3 }}
            onClick={() => onSelect(plan)}
            className={cn(
              "relative rounded-2xl border-2 overflow-hidden text-left transition-all duration-200",
              style.border,
              isSelected
                ? "ring-2 ring-primary-500 ring-offset-2 shadow-lg"
                : "hover:shadow-md",
            )}
          >
            {style.badge && (
              <div className="absolute top-3 right-3">
                <span className="bg-primary-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  {style.badge}
                </span>
              </div>
            )}

            {isSelected && (
              <div className="absolute top-3 left-3">
                <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              </div>
            )}

            <div className={cn("p-5 bg-linear-to-br", style.gradient)}>
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
                  style.iconBg,
                )}
              >
                {PLAN_ICONS[plan.name]}
              </div>
              <h3 className="font-bold text-gray-900 mb-1">
                {plan.displayName}
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">
                  {plan.price === 0
                    ? `${plan.trialDays} days free`
                    : formatPrice(plan.price)}
                </span>
                {plan.price > 0 && (
                  <span className="text-gray-500 text-xs">/month</span>
                )}
              </div>
            </div>

            <div className="p-5 bg-white">
              <ul className="space-y-2">
                {plan.features.slice(0, 4).map((f, fi) => (
                  <li key={fi} className="flex items-center gap-2">
                    <Check size={13} className="text-green-500 shrink-0" />
                    <span className="text-xs text-gray-600">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

const BecomeOwnerPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { data: plans, isLoading: plansLoading } = usePlans();
  const { mutate: becomeOwner, isPending } = useBecomeOwner();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(businessSchema) });

  const handlePlanSelect = (plan) => {
    if (!user) {
      navigate("/login", { state: { from: "/become-owner" } });
      return;
    }
    if (user.role === "owner") {
      navigate("/owner");
      return;
    }
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const onSubmit = (data) => {
    if (!selectedPlan) return;

    becomeOwner(
      {
        planId: selectedPlan._id,
        planName: selectedPlan.name,
        businessName: data.businessName,
        businessPhone: data.businessPhone,
      },
      {
        onSuccess: () => {
          setShowModal(false);
          navigate("/owner-pending");
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-linear-to-br from-gray-900 via-gray-800 to-primary-900 text-white py-20 px-4 relative overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -right-32 -top-32 w-96 h-96 border-4 border-white/5 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute -left-32 -bottom-32 w-96 h-96 border-4 border-white/5 rounded-full"
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary-500/20 border border-primary-500/30 text-primary-300 text-sm px-4 py-2 rounded-full mb-6">
              <Sparkles size={14} />
              Join 500+ Restaurant Owners on GoodFoods
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold mb-5 leading-tight">
              Grow Your Restaurant with{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary-400 to-primary-300">
                AI-Powered Bookings
              </span>
            </h1>

            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              No commission. Just a simple flat monthly fee. Start with a 14-day
              free trial!
            </p>

            <div className="flex items-center justify-center gap-3">
              <Button
                size="xl"
                onClick={() => {
                  document
                    .getElementById("pricing")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-500/30"
                rightIcon={<ArrowRight size={18} />}
              >
                View Plans
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Everything You Need 🚀
            </h2>
            <p className="text-gray-500">
              Powerful tools to manage and grow your restaurant
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center mb-3">
                  {benefit.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {benefit.title}
                </h3>
                <p className="text-sm text-gray-500">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Choose Your Plan 💳
            </h2>
            <p className="text-gray-500">
              Start with 14 days free. No credit card required for trial.
            </p>
          </motion.div>

          {plansLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="xl" />
            </div>
          ) : (
            <PlanSelector
              plans={plans}
              selectedPlan={selectedPlan}
              onSelect={handlePlanSelect}
            />
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900">How It Works</h2>
          </motion.div>

          <div className="relative">
            {/* Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 hidden sm:block" />

            <div className="space-y-6">
              {[
                {
                  step: "1",
                  title: "Choose a Plan",
                  desc: "Select free trial or a paid plan that fits your needs",
                  icon: "💳",
                },
                {
                  step: "2",
                  title: "Enter Business Details",
                  desc: "Provide your restaurant business information",
                  icon: "📝",
                },
                {
                  step: "3",
                  title: "Wait for Approval",
                  desc: "Our team reviews your application within 24 hours",
                  icon: "⏳",
                },
                {
                  step: "4",
                  title: "Start Listing!",
                  desc: "Access your owner dashboard and add your restaurants",
                  icon: "🚀",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-5"
                >
                  <div className="w-16 h-16 bg-white rounded-2xl border-2 border-primary-100 flex items-center justify-center shrink-0 shadow-sm z-10">
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex-1">
                    <p className="font-semibold text-gray-900 mb-1">
                      {item.title}
                    </p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                q: "Is the free trial really free?",
                a: "Yes! 14 days completely free, no credit card required. After trial ends, choose a paid plan to continue.",
              },
              {
                q: "How does Featured placement work?",
                a: "Featured restaurants appear FIRST when users ask our AI for recommendations. More visibility = more bookings!",
              },
              {
                q: "How long does approval take?",
                a: "Our team reviews applications within 24 hours. You'll receive an email once approved.",
              },
              {
                q: "Is there a commission on bookings?",
                a: "No commission at all! You only pay the flat monthly subscription fee. Keep 100% of your revenue.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes, cancel anytime. Your subscription remains active until the end of your billing period.",
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-gray-50 rounded-2xl border border-gray-100 p-5"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-500">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Enter Business Details"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={isPending}
              onClick={handleSubmit(onSubmit)}
            >
              {selectedPlan?.price === 0
                ? "Start Free Trial"
                : `Pay ${formatPrice(selectedPlan?.price || 0)}`}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Selected plan preview */}
          <div
            className={cn(
              "rounded-xl p-3 flex items-center justify-between",
              selectedPlan?.name === "featured"
                ? "bg-primary-50 border border-primary-100"
                : selectedPlan?.name === "premium"
                  ? "bg-blue-50 border border-blue-100"
                  : "bg-gray-50 border border-gray-100",
            )}
          >
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {selectedPlan?.displayName} Plan
              </p>
              <p className="text-xs text-gray-500">
                {selectedPlan?.price === 0
                  ? `${selectedPlan?.trialDays} days free trial`
                  : `${formatPrice(selectedPlan?.price)}/month`}
              </p>
            </div>
            {PLAN_ICONS[selectedPlan?.name]}
          </div>

          <Input
            label="Business / Restaurant Name"
            placeholder="La Pizzeria Restaurants"
            leftIcon={<Building size={16} />}
            error={errors.businessName?.message}
            required
            {...register("businessName")}
          />

          <Input
            label="Business Phone"
            placeholder="9876543210"
            leftIcon={<Phone size={16} />}
            error={errors.businessPhone?.message}
            required
            {...register("businessPhone")}
          />

          <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
            ℹ️ After subscribing, your account will be reviewed by our team
            within 24 hours. You'll receive an email once approved.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default BecomeOwnerPage;
