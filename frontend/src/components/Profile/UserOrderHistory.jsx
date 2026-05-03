import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiPackage, FiShoppingBag, FiInfo, FiArrowRight } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { OrderTableSkeleton } from "../Skeleton/OrderRowSkeleton";
import OrderTimeline from "../OrderTimeline/OrderTimeline";
import useOrders from "../../hooks/useOrders";

const getStatusColor = (status) => {
  const map = {
    "Order Placed": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-700/50",
    Confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-700/50",
    Packed: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-700/50",
    Shipped: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-700/50",
    "Out for Delivery": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-700/50",
    Delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-700/50",
    Canceled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-700/50",
  };
  return map[status] || "bg-zinc-100 text-zinc-600 dark:bg-zinc-700/30 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700/50";
};

const UserOrderHistory = () => {
  const { orders, loading } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState(null);

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <div className="h-10 w-64 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
        <OrderTableSkeleton rows={6} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-[70vh] flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-zinc-900 transition-colors rounded-3xl"
      >
        <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-300 dark:text-zinc-700 mb-6 shadow-inner">
          <FiPackage size={48} />
        </div>
        <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 italic">No Orders Found</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-xs mx-auto font-medium">
          Your collection is waiting to grow. Start your journey with a new book!
        </p>
        <Link
          to="/all-books"
          className="mt-8 flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-600/30 transition-all active:scale-95"
        >
          <FiShoppingBag /> Explore Shop
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-8 bg-zinc-50 dark:bg-zinc-900 transition-all duration-300"
    >
      <div className="flex items-center gap-4 mb-10">
        <div className="w-2 h-10 bg-blue-600 rounded-full"></div>
        <h1 className="text-3xl md:text-5xl font-black text-zinc-900 dark:text-zinc-100 italic transition-colors">
          Your Collection
          <span className="ml-3 px-3 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-lg text-zinc-400 font-bold not-italic tracking-tighter shadow-sm">{orders.length}</span>
        </h1>
      </div>

      {/* Cinematic Table Header */}
      <div className="hidden md:flex items-center px-8 py-4 bg-white dark:bg-zinc-800/50 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border border-zinc-100 dark:border-zinc-700/50 shadow-sm mb-6 transition-colors">
        <div className="w-[5%] text-center">#</div>
        <div className="w-[30%]">Edition</div>
        <div className="w-[15%]">Investment</div>
        <div className="w-[35%]">Delivery Status</div>
        <div className="w-[15%] text-right">Activity</div>
      </div>

      {/* Order List */}
      <div className="space-y-4">
        <AnimatePresence>
          {orders.map((order, i) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              layout
              className="bg-white dark:bg-zinc-800 w-full rounded-2xl py-4 px-6 flex flex-wrap md:flex-nowrap items-center gap-4 border border-zinc-100 dark:border-zinc-700 transition-all duration-300 group shadow-sm hover:shadow-xl hover:border-blue-500/20"
            >
              <div className="w-[5%] text-center text-zinc-300 dark:text-zinc-600 font-mono text-sm group-hover:text-blue-500 transition-colors">
                {String(i + 1).padStart(2, '0')}
              </div>

              <div className="w-full md:w-[30%] pr-4">
                {order.book ? (
                  <Link
                    to={`/view-book-details/${order.book._id}`}
                    className="text-zinc-900 dark:text-zinc-100 font-black hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1 text-sm md:text-base"
                  >
                    {order.book.title}
                  </Link>
                ) : (
                  <span className="text-red-500 italic text-xs font-bold uppercase tracking-widest">Deleted Book</span>
                )}
                {order.paymentId && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md uppercase tracking-widest border border-blue-100 dark:border-blue-800">
                      TRAX: {order.paymentId.slice(-12).toUpperCase()}
                    </span>
                  </div>
                )}
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter mt-1 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  REF: {order._id.slice(-8).toUpperCase()}
                </p>
              </div>

              <div className="w-1/2 md:w-[15%] text-base font-black text-zinc-900 dark:text-zinc-100">
                ₹{order.price || order.book?.price || "—"}
              </div>

              <div className="w-full md:w-[35%]">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="w-1/2 md:w-[15%] flex justify-end">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="group/btn relative flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-900 text-blue-600 dark:text-blue-400 rounded-xl border border-zinc-100 dark:border-zinc-700 hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-[10px] font-black uppercase tracking-widest shadow-sm active:scale-95"
                >
                   Track <FiArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Timeline Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <TimelineModal 
            order={selectedOrder} 
            onClose={() => setSelectedOrder(null)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Timeline Modal ─────────────────────────────────────────────────────────────
const TimelineModal = ({ order, onClose }) => (
  <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm"
    ></motion.div>

    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      className="bg-white dark:bg-zinc-800 rounded-[32px] w-full max-w-md relative z-10 shadow-2xl border border-zinc-100 dark:border-zinc-700 transition-colors overflow-hidden"
    >
      <div className="p-8 pb-4">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 italic transition-colors">Order Tracker</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 rounded-xl hover:text-red-500 transition-all active:scale-90"
          >
            <RxCross2 size={24} />
          </button>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-700 mb-8">
          <div className="flex gap-4">
            <img 
              src={order.book?.url} 
              alt={order.book?.title} 
              loading="lazy"
              className="w-16 h-20 object-cover rounded-xl shadow-lg border border-white/10"
            />
            <div className="flex flex-col justify-center">
              <h3 className="font-black text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-tight pr-4">
                {order.book?.title}
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-2">
                Qty: {order.quantity || 1} · Paid: ₹{order.price || order.book?.price}
              </p>
            </div>
          </div>
        </div>

        <div className="px-2">
          <OrderTimeline
            statusHistory={order.statusHistory || []}
            currentStatus={order.status}
          />
        </div>
      </div>

      <div className="bg-zinc-50 dark:bg-zinc-900/30 p-6 flex justify-center border-t border-zinc-100 dark:border-zinc-700 mt-8">
        <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 italic text-[10px] font-bold uppercase tracking-[0.2em]">
          <FiInfo /> Live Tracking Status
        </div>
      </div>
    </motion.div>
  </div>
);

export default UserOrderHistory;