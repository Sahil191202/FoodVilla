import { useState } from "react";
import { motion } from "framer-motion";
import {
  UtensilsCrossed, Check, Crown,
  Star, Zap, ArrowRight, Sparkles,
  BarChart3, MessageSquare, Image,
} from "lucide-react";
import { useSelector } from "react-redux";
import { selectUser } from "../features/auth/authSlice.js";
import { usePlans, useMySubscription, useSubscribe } from "../hooks/useSubscription.js";
import PlanCard from "../features/subscription/PlanCard.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import Button from "../components/ui/Button.jsx";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../utils/formatters.js";
import Badge from "../components/ui/Badge.jsx";

const BENEFITS = [
  {
    icon: <UtensilsCrossed size={22} className="text-primary-500" />,
    title: "List Your Restaurant",
    desc: "Add your restaurant with rich images, menu, and operating hours",
  },
  {
    icon: <MessageSquare size={22} className="text-primary-500" />,
    title: "AI-Powered Discovery",
    desc: "Your restaurant gets discovered by thousands of users via AI chat",
  },
  {
    icon: <BarChart3 size={22} className="text-primary-500" />,
    title: "Analytics Dashboard",
    desc: "Track bookings, views, and customer trends in real-time",
  },
  {
    icon: <Sparkles size={22} className="text-primary-500" />,
    title: "Featured Placement",
    desc: "Appear first in AI search results with Featured plan",
  },
  {
    icon: <Image size={22} className="text-primary-500" />,
    title: "Rich Media Portal",
    desc: "Upload high quality images and update menus in real-time",
  },
  {
    icon: <Star size={22} className="text-primary-500" />,
    title: "Verified Badge",
    desc: "Build trust with customers through our verification system",
  },
];

const BecomeOwnerPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const { data: plans, isLoading: plansLoading } = usePlans();
  const { data: subscription, isLoading: subLoading } = useMySubscription();
  const { mutate: subscribe, isPending: isSubscribing } = useSubscribe();

  const isLoading = plansLoading || subLoading;

  // Already subscribed — go to dashboard
  if (!isLoading && subscription?.status === "active") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            You're Already Subscribed! 🎉
          </h2>
          <p className="text-gray-500 text-sm mb-2">
            Active Plan:{" "}
            <span className="font-semibold capitalize text-primary-600">
              {subscription.planName}
            </span>
          </p>
          <p className="text-gray-400 text-xs mb-6">
            Valid until {formatDate(subscription.currentPeriodEnd)}
          </p>
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate("/owner")}
            rightIcon={<ArrowRight size={18} />}
          >
            Go to Owner Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    subscribe(
      { planId: plan._id, planName: plan.name },
      {
        onSuccess: () => {
          setSelectedPlan(null);
          navigate("/owner");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-linear-to-br from-gray-900 via-gray-800 to-primary-900 text-white py-20 px-4 relative overflow-hidden">
        {/* Background decoration */}
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
              List your restaurant on GoodFoods and get discovered by
              thousands of food lovers daily through our AI assistant.
            </p>

            {!user && (
              <div className="flex items-center justify-center gap-3">
                <Button
                  size="lg"
                  onClick={() => navigate("/register")}
                  className="bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-500/30"
                  rightIcon={<ArrowRight size={18} />}
                >
                  Create Account First
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Login
                </Button>
              </div>
            )}
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
              Everything You Need to Succeed 🚀
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
      {user?.role === "owner" && (
        <section className="py-16 px-4 bg-white">
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
                Start free, upgrade anytime. No hidden charges.
              </p>
            </motion.div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size="xl" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans?.map((plan, i) => (
                  <PlanCard
                    key={plan._id}
                    plan={plan}
                    currentPlan={subscription?.planName || "none"}
                    onSelect={handleSelectPlan}
                    isLoading={
                      isSubscribing &&
                      selectedPlan?._id === plan._id
                    }
                    delay={i * 0.1}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Not logged in or not owner CTA */}
      {user && user.role !== "owner" && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Owner Account Required
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              You need an owner account to list your restaurant.
              Please contact admin to upgrade your account.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate("/")}
            >
              Back to Home
            </Button>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-16 px-4">
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
                q: "Can I start for free?",
                a: "Yes! Our Free plan lets you list 1 restaurant with basic features. Upgrade anytime for more.",
              },
              {
                q: "How does Featured placement work?",
                a: "Featured restaurants appear FIRST when users ask our AI for recommendations. More visibility = more bookings!",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes, cancel anytime. You'll be downgraded to Free plan at the end of your billing period.",
              },
              {
                q: "Is there a commission on bookings?",
                a: "No! We don't charge any commission on bookings. You only pay the flat monthly subscription fee.",
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  {faq.q}
                </h3>
                <p className="text-sm text-gray-500">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BecomeOwnerPage;