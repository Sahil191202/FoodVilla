import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, setCredentials } from "../features/auth/authSlice.js";
import { authService } from "../services/auth.service.js";
import Button from "../components/ui/Button.jsx";
import { Home, Clock, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import BackButton from "../components/common/BackButton.jsx";

const OwnerPendingPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  // ✅ Poll every 15 seconds to check approval status
  useEffect(() => {
    if (user?.ownerStatus === "approved") {
      navigate("/owner");
      return;
    }

    const checkApproval = async () => {
      try {
        const result = await authService.getMe();
        const freshUser = result.data;

        if (freshUser.ownerStatus === "approved") {
          const currentToken = localStorage.getItem("accessToken");
          dispatch(setCredentials({
            user: freshUser,
            accessToken: currentToken,
          }));
          toast.success("🎉 Your account has been approved!");
          navigate("/owner");
        }
      } catch (err) {
        console.error("Status check failed:", err.message);
      }
    };

    const interval = setInterval(checkApproval, 15000); // every 15s
    return () => clearInterval(interval);
  }, [user?.ownerStatus]);

  const handleManualRefresh = async () => {
    try {
      const result = await authService.getMe();
      const freshUser = result.data;
      const currentToken = localStorage.getItem("accessToken");

      dispatch(setCredentials({
        user: freshUser,
        accessToken: currentToken,
      }));

      if (freshUser.ownerStatus === "approved") {
        toast.success("🎉 Approved! Redirecting...");
        navigate("/owner");
      } else {
        toast("Still pending approval ⏳");
      }
    } catch (err) {
      toast.error("Failed to check status");
    }
  };

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
          Our team is reviewing your application. We'll email you at{" "}
          <span className="font-semibold text-gray-700">
            {user?.email}
          </span>{" "}
          within 24 hours.
        </p>

        <div className="bg-primary-50 rounded-2xl p-4 mb-6 text-left">
          <p className="text-sm font-medium text-primary-700 mb-2">
            What happens next?
          </p>
          <ul className="space-y-1.5">
            {[
              "Admin reviews your business details",
              "Approval email sent within 24 hours",
              "Owner dashboard unlocked automatically",
              "Start adding your restaurants!",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-primary-600">
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

        <p className="text-xs text-gray-400 mb-4">
          Auto-checking status every 15 seconds...
        </p>

        <div className="flex gap-3">
          <BackButton to="home" label="Back to Home" className="mt-4" />
          <Button
            variant="primary"
            fullWidth
            leftIcon={<RefreshCw size={16} />}
            onClick={handleManualRefresh}
          >
            Check Status
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default OwnerPendingPage;