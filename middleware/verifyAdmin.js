import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

// Protects admin routes — redirects non-admins to home
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex justify-center py-10">Loading...</div>;

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;