import React, { useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { authActions } from "./store/auth";
import { AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

// Layout
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

// Pages (Lazy Loaded)
const Home = lazy(() => import("./pages/Home"));
const AllBooks = lazy(() => import("./pages/AllBooks"));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Cart = lazy(() => import("./pages/Cart"));
const Profile = lazy(() => import("./pages/Profile"));
const AllOrders = lazy(() => import("./pages/AllOrders"));
const AddBook = lazy(() => import("./pages/AddBook"));
const UpdateBook = lazy(() => import("./pages/UpdateBook"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));

// Components (Lazy Loaded)
const ViewBookDetails = lazy(() => import("./components/ViewBookDetails/ViewBookDetails"));
const Favourites = lazy(() => import("./components/Profile/Favourites"));
const UserOrderHistory = lazy(() => import("./components/Profile/UserOrderHistory"));
const Settings = lazy(() => import("./components/Profile/Settings"));
const AuditLog = lazy(() => import("./components/Profile/AuditLog"));
const ManageCoupons = lazy(() => import("./components/Admin/ManageCoupons"));

// ProtectedRoute needs to be eager to avoid layout shift
import ProtectedRoute from "./components/ProtectedRoute";

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

  // Socket.io for Real-time Status Updates
  useEffect(() => {
    const userId = localStorage.getItem("id");
    if (!userId) return;

    const socket = io(import.meta.env.VITE_API_BASE_URL || "http://localhost:1000");

    socket.on(`orderStatusUpdate:${userId}`, (data) => {
      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-bold">Order Update</span>
          <span className="text-sm">Your order for "{data.title}" is now: {data.status}</span>
        </div>,
        { duration: 6000, icon: "📦" }
      );
    });

    return () => socket.disconnect();
  }, [role]);

  return (
    <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 transition-colors duration-300 min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <Suspense fallback={
            <div className="absolute inset-0 flex items-center justify-center min-h-[50vh]">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          }>
            <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/all-books" element={<AllBooks />} />
            <Route path="/view-book-details/:id" element={<ViewBookDetails />} />
            <Route path="/LogIn" element={<Login />} />
            <Route path="/SignUp" element={<SignUp />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />

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

              <Route
                path="/profile/coupons"
                element={
                  <ProtectedRoute role="admin">
                    <ManageCoupons />
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
          </Suspense>
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
};

export default App;
