import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  let role = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      role = decoded.role;
    } catch (err) {
      console.error("Invalid token", err);
    }
  }

  console.log("Token:", token, "Role:", role);

  if (!token) return <Navigate to="/auth/login" replace />;

  if (!allowedRoles.includes(role)) {
    return role === "admin" ? (
      <Navigate to="/admin" replace />
    ) : (
      <Navigate to="/dashboard" replace />
    );
  }

  return children;
}
