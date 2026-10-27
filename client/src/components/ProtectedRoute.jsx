import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

// Redirects to login when logged out, and to the user's own dashboard on a role mismatch.
export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="center muted">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === "teacher" ? "/teacher" : "/student"} replace />;
  }
  return children;
}
