import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LoadingScreen from "../ui/LoadingScreen";

export default function AdminRoute() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "admin" && user?.role !== "moderator") return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
