import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiLock, FiCheckCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return toast.error("Password must be at least 8 characters long and contain an uppercase, lowercase, number, and special character.");
    }

    setLoading(true);
    try {
      const res = await api.post(`/api/v1/reset-password/${token}`, { password });
      toast.success(res.data.message);
      setSuccess(true);
      setTimeout(() => navigate("/LogIn"), 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center p-4 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-zinc-800 rounded-3xl p-8 shadow-2xl border border-zinc-100 dark:border-zinc-700"
      >
        {!success ? (
          <>
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 mx-auto">
              <FiLock size={32} />
            </div>
            
            <h2 className="text-3xl font-black text-center text-zinc-900 dark:text-zinc-100 mb-2">New Password</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-center mb-8 font-medium">
              Create a strong password for your account.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 p-4 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 p-4 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-xl shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Set New Password"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
              <FiCheckCircle size={40} />
            </div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mb-2">Password Reset!</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6">
              Your password has been changed successfully.
            </p>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400 animate-pulse">
              Redirecting to login...
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
