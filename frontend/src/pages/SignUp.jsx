import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";
import { motion } from "framer-motion";

const SignUp = () => {
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const change = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const submit = async () => {
    const { username, email, password, address } = values;
    if (!username || !email || !password || !address) {
      toast.error("All fields are required");
      return;
    }
    
    // Email basic regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/api/v1/sign-up", values);
      toast.success(response.data.message || "Account created successfully!");
      navigate("/LogIn");
    } catch (error) {
      toast.error(error.response?.data?.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[90vh] flex items-center justify-center p-4 py-12 transition-colors duration-300"
    >
      <div className="bg-white dark:bg-zinc-800 rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-zinc-100 dark:border-zinc-700">
        <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 mb-2">Create Account</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8">Join the BookHeaven community today</p>
        
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-700 dark:text-zinc-300 text-sm font-bold mb-2 block">Username</label>
              <input
                type="text"
                className="w-full bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-3 rounded-xl outline-none border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 transition-all font-medium text-sm"
                placeholder="johndoe"
                name="username"
                value={values.username}
                onChange={change}
              />
            </div>
            <div>
              <label className="text-zinc-700 dark:text-zinc-300 text-sm font-bold mb-2 block">Email</label>
              <input
                type="email"
                className="w-full bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-3 rounded-xl outline-none border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 transition-all font-medium text-sm"
                placeholder="xyz@example.com"
                name="email"
                value={values.email}
                onChange={change}
              />
            </div>
          </div>
          
          <div>
            <label className="text-zinc-700 dark:text-zinc-300 text-sm font-bold mb-2 block">Password</label>
            <input
              type="password"
              className="w-full bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-3 rounded-xl outline-none border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 transition-all font-medium text-sm"
              placeholder="••••••••"
              name="password"
              value={values.password}
              onChange={change}
            />
          </div>

          <div>
            <label className="text-zinc-700 dark:text-zinc-300 text-sm font-bold mb-2 block">Delivery Address</label>
            <textarea
              className="w-full bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-3 rounded-xl outline-none border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 transition-all font-medium resize-none text-sm"
              rows="3"
              placeholder="Your full delivery address"
              name="address"
              value={values.address}
              onChange={change}
            />
          </div>
          
          <button
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 mt-4"
            onClick={submit}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Register Now"}
          </button>
          
          <p className="text-center text-zinc-500 dark:text-zinc-400 font-medium">
            Already have an account?{" "}
            <Link to="/LogIn" className="text-blue-600 dark:text-blue-400 hover:underline font-bold">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SignUp;
