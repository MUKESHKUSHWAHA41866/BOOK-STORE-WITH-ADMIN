import React, { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiCheckCircle, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/20">
          <FiCheckCircle size={48} />
        </div>
        
        <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-100 mb-4 tracking-tight">
          Payment Successful!
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-8">
          Thank you for your order. Your payment was processed successfully and your books are on their way.
          {sessionId && <span className="block mt-2 text-xs opacity-50 font-mono">ID: {sessionId}</span>}
        </p>

        <div className="space-y-4">
          <Link
            to="/profile/orderHistory"
            className="w-full flex items-center justify-center gap-3 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black rounded-2xl shadow-xl transition-all active:scale-95"
          >
            Track Order <FiArrowRight />
          </Link>
          <Link
            to="/all-books"
            className="block text-sm font-bold text-zinc-400 hover:text-blue-500 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
