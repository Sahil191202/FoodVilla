import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/auth/authSlice.js";

const OwnerRoute = ({ children }) => {
  const user = useSelector(selectUser);

  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== "owner" && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Owner not approved yet
  if (user.role === "owner" && !user.isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⏳</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Account Pending Approval
          </h2>
          <p className="text-gray-500 text-sm">
            Your owner account is pending admin approval. You will be
            notified once approved!
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default OwnerRoute;