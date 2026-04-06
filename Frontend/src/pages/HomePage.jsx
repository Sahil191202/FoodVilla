import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Star,
  Clock,
  Shield,
  MessageSquare,
  ChevronRight,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { selectUser } from "../features/auth/authSlice.js";
import { openChat } from "../features/chat/chatSlice.js";
import { setFilters } from "../features/restaurant/restaurantSlice.js";
import Button from "../components/ui/Button.jsx";
import { CUISINE_TYPES } from "../utils/constants.js";

const CUISINE_EMOJIS = {
  Indian: "🍛",
  Italian: "🍕",
  Chinese: "🥡",
  Continental: "🥩",
  Mexican: "🌮",
  Japanese: "🍱",
  Thai: "🍜",
  Mediterranean: "🥙",
};

const FEATURES = [
  {
    icon: <MessageSquare size={22} className="text-primary-500" />,
    title: "AI-Powered Booking",
    desc: "Chat naturally to find and book restaurants instantly",
  },
  {
    icon: <Clock size={22} className="text-primary-500" />,
    title: "Real-time Availability",
    desc: "See live slot availability and book in seconds",
  },
  {
    icon: <Star size={22} className="text-primary-500" />,
    title: "Curated Restaurants",
    desc: "Hand-picked top restaurants across the city",
  },
  {
    icon: <Shield size={22} className="text-primary-500" />,
    title: "Instant Confirmation",
    desc: "Get confirmation codes immediately after booking",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const handleCuisineClick = (cuisine) => {
    dispatch(setFilters({ cuisine }));
    navigate("/restaurants");
  };

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center bg-linear-to-br from-stone-950 via-gray-900 to-orange-950 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Gradient Orbs */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute top-20 right-20 w-96 h-96 bg-primary-500 rounded-full blur-3xl opacity-20"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary-400 rounded-full blur-3xl opacity-15"
          />

          {/* Floating Food Emojis */}
          {["🍕", "🍜", "🍣", "🥗", "🍔", "🍱", "🌮", "🥙"].map((emoji, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -30, 0],
                x: [0, Math.sin(i) * 15, 0],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
              style={{
                position: "absolute",
                left: `${10 + i * 12}%`,
                top: `${15 + Math.sin(i * 2) * 30}%`,
                fontSize: "2rem",
                opacity: 0.15,
              }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-3xl"
          >
            {/* Tag */}
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-orange-200 text-sm font-medium px-4 py-1.5 rounded-full mb-6 shadow-lg">
                <TrendingUp size={14} />
                AI-Powered Restaurant Discovery
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={itemVariants}
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1]"
            >
              Find Your Next{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-300 via-amber-200 to-yellow-200 italic">
                Favorite Meal
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-gray-300 text-xl mb-10 leading-relaxed max-w-xl"
            >
              Hey {user?.name?.split(" ")[0]}! 👋 Discover amazing restaurants
              and book tables instantly with our AI assistant.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-4"
            >
              <Button
                size="xl"
                variant="primary"
                onClick={() => navigate("/restaurants")}
                rightIcon={<ChevronRight size={20} />}
                className="shadow-lg shadow-primary-500/30"
              >
                Explore Restaurants
              </Button>
              <Button
                size="xl"
                variant="outline"
                onClick={() => dispatch(openChat())}
                leftIcon={<MessageSquare size={20} />}
                className="border-white/30 bg-white/10 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                Chat with AI
              </Button>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-6 mt-12"
            >
              {[
                { value: "500+", label: "Restaurants" },
                { value: "10K+", label: "Happy Diners" },
                { value: "4.9★", label: "Average Rating" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 80L1440 80L1440 20C1440 20 1080 80 720 80C360 80 0 20 0 20L0 80Z"
              fill="#F9FAFB"
            />
          </svg>
        </div>
      </section>

      {/* Cuisine Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-display text-4xl font-bold text-gray-900 mb-3">
              What Are You{" "}
              <span className="text-gradient italic">Craving?</span>
            </h2>
            <p className="text-gray-500">
              Explore restaurants by your favorite cuisine
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3"
          >
            {CUISINE_TYPES.map((cuisine) => (
              <motion.button
                key={cuisine}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleCuisineClick(cuisine)}
                className="flex flex-col items-center gap-2 bg-white p-4 rounded-2xl border border-orange-100 shadow-sm hover:shadow-lg hover:shadow-orange-100 hover:border-primary-300 hover:-translate-y-1 transition-all duration-300 group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                  {CUISINE_EMOJIS[cuisine]}
                </span>
                <span className="text-xs font-medium text-gray-700 group-hover:text-primary-600">
                  {cuisine}
                </span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl font-bold text-gray-900 mb-3">
              Why Choose{" "}
              <span className="text-primary-500 italic">GoodFoods?</span>
            </h2>

            <p className="text-gray-500 max-w-xl mx-auto">
              We make restaurant discovery and booking effortless with the power
              of AI
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* AI CTA Section */}
      <section className="py-20 bg-linear-to-br from-stone-950 via-orange-950 to-gray-900 relative overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute -right-20 -top-20 w-80 h-80 border-4 border-white/10 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute -left-20 -bottom-20 w-80 h-80 border-4 border-white/10 rounded-full"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageSquare size={28} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Let AI Do The Work! 🤖
            </h2>
            <p className="text-white/80 mb-8 max-w-lg mx-auto text-lg">
              Just tell our AI what you want — cuisine, area, time — and it will
              find and book the perfect table for you!
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="xl"
                onClick={() => dispatch(openChat())}
                className="bg-white text-primary-600 hover:bg-gray-50 shadow-xl"
                rightIcon={<ChevronRight size={20} />}
              >
                Try AI Assistant
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
