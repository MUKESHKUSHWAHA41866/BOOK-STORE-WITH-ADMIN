import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { authActions } from "./store/auth";
import { AnimatePresence } from "framer-motion";

// Layout
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

// Pages
import Home from "./pages/Home";
import AllBooks from "./pages/AllBooks";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import AllOrders from "./pages/AllOrders";
import AddBook from "./pages/AddBook";
import UpdateBook from "./pages/UpdateBook";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

// Components
import ViewBookDetails from "./components/ViewBookDetails/ViewBookDetails";
import Favourites from "./components/Profile/Favourites";
import UserOrderHistory from "./components/Profile/UserOrderHistory";
import Settings from "./components/Profile/Settings";
import ProtectedRoute from "./components/ProtectedRoute";
import AuditLog from "./components/Profile/AuditLog";

const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const role = useSelector((state) => state.auth.role);

  // Restore auth state from localStorage on app load
  useEffect(() => {
    if (
      localStorage.getItem("id") &&
      localStorage.getItem("token") &&
      localStorage.getItem("role")
    ) {
      dispatch(authActions.login());
      dispatch(authActions.changeRole(localStorage.getItem("role")));
    }
  }, []);

  return (
    <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 transition-colors duration-300 min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/all-books" element={<AllBooks />} />
            <Route path="/view-book-details/:id" element={<ViewBookDetails />} />
            <Route path="/LogIn" element={<Login />} />
            <Route path="/SignUp" element={<SignUp />} />

            {/* Protected: Authenticated Users Only */}
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />

            {/* Protected: Profile with nested routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            >
              {/* Default profile index */}
              {role === "user" ? (
                <Route index element={<Favourites />} />
              ) : (
                <Route index element={<AllOrders />} />
              )}

              {/* Admin-only: Add Book */}
              <Route
                path="/profile/add-book"
                element={
                  <ProtectedRoute role="admin">
                    <AddBook />
                  </ProtectedRoute>
                }
              />

              {/* Admin-only: Dashboard inside profile layout */}
              <Route
                path="/profile/dashboard"
                element={
                  <ProtectedRoute role="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin-only: Audit Logs */}
              <Route
                path="/profile/audit"
                element={
                  <ProtectedRoute role="admin">
                    <AuditLog />
                  </ProtectedRoute>
                }
              />

              <Route path="/profile/orderHistory" element={<UserOrderHistory />} />
              <Route path="/profile/settings" element={<Settings />} />
            </Route>

            {/* Protected: Admin Update Book */}
            <Route
              path="/updateBook/:id"
              element={
                <ProtectedRoute role="admin">
                  <UpdateBook />
                </ProtectedRoute>
              }
            />

            {/* 404 Not Found — replaces the old Navigate catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
};

export default App;
