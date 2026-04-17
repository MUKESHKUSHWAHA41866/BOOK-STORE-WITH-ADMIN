import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { authActions } from "../store/auth";
import api from "../api";
import { motion } from "framer-motion";

const Login = () => {
  const [values, setValues] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const change = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const submit = async () => {
    if (!values.username || !values.password) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/api/v1/sign-in", values);
      dispatch(authActions.login());
      dispatch(authActions.changeRole(response.data.role));
      localStorage.setItem("id", response.data.id);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);
      toast.success("Welcome back!");
      navigate("/profile");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[80vh] flex items-center justify-center p-4 transition-colors duration-300"
    >
      <div className="bg-white dark:bg-zinc-800 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-zinc-100 dark:border-zinc-700">
        <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 mb-2">Welcome Back</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8">Sign in to your BookHeaven account</p>
        
        <div className="space-y-6">
          <div>
            <label className="text-zinc-700 dark:text-zinc-300 text-sm font-bold mb-2 block">Username</label>
            <input
              type="text"
              className="w-full bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-4 rounded-xl outline-none border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 transition-all font-medium"
              placeholder="Your username"
              name="username"
              value={values.username}
              onChange={change}
            />
          </div>
          <div>
            <label className="text-zinc-700 dark:text-zinc-300 text-sm font-bold mb-2 block">Password</label>
            <input
              type="password"
              className="w-full bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-4 rounded-xl outline-none border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 transition-all font-medium"
              placeholder="••••••••"
              name="password"
              value={values.password}
              onChange={change}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>
          
          <button
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50"
            onClick={submit}
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
          
          <p className="text-center text-zinc-500 dark:text-zinc-400 font-medium">
            New here?{" "}
            <Link to="/SignUp" className="text-blue-600 dark:text-blue-400 hover:underline font-bold">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;