import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/auth/authSlice.js";

const AdminRoute = ({ children }) => {
  const user = useSelector(selectUser);

  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== "admin" && user.role !== "staff") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;