import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/auth/authSlice.js";
import { useMySubscription } from "../../hooks/useSubscription.js";
import Spinner from "../ui/Spinner.jsx";

const OwnerRoute = ({ children }) => {
  const user = useSelector(selectUser);
  const { data: subscription, isLoading } = useMySubscription();

  if (!user) return <Navigate to="/login" replace />;

  // ✅ Admin should NEVER see owner dashboard
  if (user.role === "admin") return <Navigate to="/admin" replace />;

  // Not an owner at all
  if (user.role !== "owner") {
    return <Navigate to="/become-owner" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  // Subscribed but pending approval
  if (user.ownerStatus === "pending_approval") {
    return <Navigate to="/owner-pending" replace />;
  }

  // Rejected
  if (user.ownerStatus === "rejected") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Application Rejected
          </h2>
          <p className="text-gray-500 text-sm">
            Your owner application was rejected. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  // No active subscription
  if (!subscription || subscription.status !== "active") {
    return <Navigate to="/become-owner" replace />;
  }

  // ✅ All checks passed — show dashboard
  return children;
};

export default OwnerRoute;