import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  return <Outlet />;
};

export default ProtectedRoute;


