import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, Eye, EyeOff, User, Phone, UtensilsCrossed, ArrowRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter valid Indian phone number"),
  password: z
    .string()
    .min(8, "Min 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      "Must include uppercase, lowercase, number & special character"
    ),
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const RegisterPage = () => {
  const { register: registerUser, isRegistering } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = (data) => registerUser(data);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-8 text-white">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <UtensilsCrossed size={20} className="text-white" />
              </div>
              <span className="font-bold text-lg">GoodFoods</span>
            </div>
            <h1 className="text-2xl font-bold mb-1">Create Account 🎉</h1>
            <p className="text-white/80 text-sm">
              Join thousands of food lovers
            </p>
          </div>

          {/* Form */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="px-8 py-7"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <motion.div variants={itemVariants}>
                <Input
                  label="Full Name"
                  placeholder="Rahul Sharma"
                  leftIcon={<User size={16} />}
                  error={errors.name?.message}
                  required
                  {...register("name")}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Input
                  label="Email"
                  type="email"
                  placeholder="rahul@example.com"
                  leftIcon={<Mail size={16} />}
                  error={errors.email?.message}
                  required
                  {...register("email")}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="9876543210"
                  leftIcon={<Phone size={16} />}
                  error={errors.phone?.message}
                  required
                  {...register("phone")}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 characters"
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
              </motion.div>

              <motion.div variants={itemVariants} className="pt-1">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isRegistering}
                  rightIcon={<ArrowRight size={18} />}
                >
                  Create Account
                </Button>
              </motion.div>
            </form>

            <motion.p
              variants={itemVariants}
              className="text-center text-sm text-gray-600 mt-5"
            >
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary-500 font-semibold hover:text-primary-600 transition-colors"
              >
                Sign in
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;