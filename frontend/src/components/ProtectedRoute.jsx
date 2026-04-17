import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * ProtectedRoute — Task 1.8
 * Redirects unauthenticated users to /LogIn.
 * Optionally enforces a specific role (e.g., "admin").
 *
 * Usage:
 *   <ProtectedRoute>
 *     <Profile />
 *   </ProtectedRoute>
 *
 *   <ProtectedRoute role="admin">
 *     <AddBook />
 *   </ProtectedRoute>
 */
const ProtectedRoute = ({ children, role }) => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const userRole = useSelector((state) => state.auth.role);

  // Not logged in → redirect to login
  if (!isLoggedIn) {
    return <Navigate to="/LogIn" replace />;
  }

  // Logged in but wrong role → redirect to profile (access denied)
  if (role && userRole !== role) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default ProtectedRoute;
