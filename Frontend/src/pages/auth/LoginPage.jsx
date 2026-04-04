import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, Eye, EyeOff, UtensilsCrossed, ArrowRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const LoginPage = () => {
  const { login, isLoggingIn } = useAuth();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const from = location.state?.from || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = (data) => login({ ...data, redirectTo: from });

  return (
    <div className="min-h-screen flex">
      {/* Left — Illustration */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 to-primary-700 relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 10, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              style={{
                position: "absolute",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${20 + Math.random() * 30}px`,
              }}
            >
              {["🍕", "🍜", "🍣", "🥗", "🍔", "🍱"][i % 6]}
            </motion.div>
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <UtensilsCrossed size={24} className="text-white" />
              </div>
              <span className="text-2xl font-bold">GoodFoods</span>
            </div>

            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Discover & Book <br />
              Amazing Restaurants
            </h1>
            <p className="text-white/80 text-lg mb-8">
              Your AI-powered dining companion for the best food experiences.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Restaurants", value: "500+" },
                { label: "Bookings", value: "10K+" },
                { label: "Happy Users", value: "8K+" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center"
                >
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-white/70 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right — Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex items-center justify-center p-8 bg-white"
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
              <UtensilsCrossed size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-primary-500">GoodFoods</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-1">
              Welcome back! 👋
            </h2>
            <p className="text-gray-500 mb-8">
              Sign in to continue your food journey
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                leftIcon={<Mail size={16} />}
                error={errors.email?.message}
                required
                {...register("email")}
              />

              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                leftIcon={<Lock size={16} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                error={errors.password?.message}
                required
                {...register("password")}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoggingIn}
                rightIcon={<ArrowRight size={18} />}
              >
                Sign In
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary-500 font-semibold hover:text-primary-600 transition-colors"
              >
                Sign up for free
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;