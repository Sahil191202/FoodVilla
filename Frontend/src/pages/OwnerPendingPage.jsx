import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../features/auth/authSlice.js";
import Button from "../components/ui/Button.jsx";
import { Home, Clock } from "lucide-react";

const OwnerPendingPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  // If approved — redirect to dashboard
  if (user?.ownerStatus === "approved") {
    navigate("/owner");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md bg-white rounded-3xl shadow-sm border border-gray-100 p-10"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Clock size={36} className="text-yellow-500" />
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Application Under Review! ⏳
        </h1>

        <p className="text-gray-500 mb-2">
          Thank you for subscribing to GoodFoods!
        </p>
        <p className="text-gray-500 text-sm mb-6">
          Our team is reviewing your application. You'll receive an
          email at{" "}
          <span className="font-semibold text-gray-700">
            {user?.email}
          </span>{" "}
          within 24 hours once approved.
        </p>

        <div className="bg-primary-50 rounded-2xl p-4 mb-6 text-left">
          <p className="text-sm font-medium text-primary-700 mb-2">
            What happens next?
          </p>
          <ul className="space-y-1.5">
            {[
              "Admin reviews your business details",
              "Approval email sent within 24 hours",
              "Owner dashboard unlocked",
              "Start adding your restaurants!",
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-xs text-primary-600"
              >
                <div className="w-4 h-4 bg-primary-200 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-primary-700 font-bold text-xs">
                    {i + 1}
                  </span>
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <Button
          variant="outline"
          fullWidth
          leftIcon={<Home size={16} />}
          onClick={() => navigate("/")}
        >
          Back to Home
        </Button>
      </motion.div>
    </div>
  );
};

export default OwnerPendingPage;