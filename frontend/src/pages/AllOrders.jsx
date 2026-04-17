import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaUserLarge, FaCheck } from "react-icons/fa6";
import { IoOpenOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { OrderTableSkeleton } from "../components/Skeleton/OrderRowSkeleton";
import SeeUserData from "./SeeUserData";
import api from "../api";

const STATUS_OPTIONS = [
  "Order Placed", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered", "Canceled",
];

const STATUS_COLOR = {
  "Order Placed": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Packed: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  Shipped: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  "Out for Delivery": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  Delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Canceled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const AllOrders = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState(-1);
  const [statusValue, setStatusValue] = useState("");
  const [showUser, setShowUser] = useState(false);
  const [userDivData, setUserDivData] = useState({});

  const fetchOrders = async () => {
    try {
      const response = await api.get("/api/v1/get-all-orders");
      setAllOrders(response.data.data);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const submitStatusChange = async (index) => {
    if (!statusValue) { toast.error("Please select a status"); return; }
    const orderId = allOrders[index]._id;
    try {
      await api.put(`/api/v1/update-status/${orderId}`, { status: statusValue });
      toast.success("Order status updated");
      setOptions(-1);
      setStatusValue("");
      fetchOrders();
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-6 bg-white dark:bg-zinc-900 transition-colors duration-300 min-h-screen">
        <div className="h-12 w-64 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
        <OrderTableSkeleton rows={8} />
      </div>
    );
  }

  if (allOrders.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-white dark:bg-zinc-900 flex flex-col items-center justify-center text-center p-8 transition-colors duration-300"
      >
        <div className="w-24 h-24 bg-zinc-50 dark:bg-zinc-800 rounded-3xl flex items-center justify-center text-zinc-300 dark:text-zinc-600 mb-6 shadow-inner">
           <IoOpenOutline size={48} />
        </div>
        <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 italic">No Orders Found</h2>
        <p className="text-zinc-500 mt-2 font-medium">Wait for the first customer to spark business!</p>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 md:p-8 bg-zinc-50 dark:bg-zinc-900 transition-colors duration-300 min-h-screen"
      >
        <div className="flex items-center gap-4 mb-10">
          <div className="w-2 h-10 bg-blue-600 rounded-full"></div>
          <h1 className="text-3xl md:text-5xl font-black text-zinc-900 dark:text-zinc-100 italic">
            Global Orders
            <span className="ml-3 px-3 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-lg text-zinc-400 font-bold not-italic tracking-tighter shadow-sm">{allOrders.length}</span>
          </h1>
        </div>

        <div className="space-y-4 max-w-7xl mx-auto">
          <div className="hidden md:flex items-center px-8 py-4 bg-white dark:bg-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border border-zinc-100 dark:border-zinc-700 shadow-sm mb-6 transition-colors">
            <div className="w-[5%] text-center">#</div>
            <div className="w-[30%]">Product</div>
            <div className="w-[15%]">Price</div>
            <div className="w-[35%]">Logistics Status</div>
            <div className="w-[15%] text-right">Customer</div>
          </div>

          <AnimatePresence>
            {allOrders.map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                layout
                className="bg-white dark:bg-zinc-800 w-full rounded-2xl py-4 px-6 flex flex-wrap md:flex-nowrap items-center gap-4 border border-zinc-100 dark:border-zinc-700 transition-all duration-300 group shadow-sm hover:shadow-xl hover:border-blue-500/20"
              >
                <div className="w-[5%] text-center text-zinc-300 dark:text-zinc-600 font-mono text-sm group-hover:text-blue-500 transition-colors">{String(i + 1).padStart(2, '0')}</div>

                <div className="w-full md:w-[30%]">
                  {order.book ? (
                    <Link
                      to={`/view-book-details/${order.book._id}`}
                      className="text-zinc-900 dark:text-zinc-100 font-black hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1 text-sm md:text-base pr-4"
                    >
                      {order.book.title}
                    </Link>
                  ) : (
                    <span className="text-red-500 italic text-xs font-bold uppercase tracking-widest">Deleted Product</span>
                  )}
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter mt-0.5 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    REF: {order._id.slice(-8).toUpperCase()}
                  </p>
                </div>

                <div className="w-1/2 md:w-[15%] text-base font-black text-zinc-900 dark:text-zinc-100">
                  ₹{order.book?.price ?? "—"}
                </div>

                <div className="w-full md:w-[35%]">
                  <div className="flex items-center gap-2">
                    <button
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm transition-all active:scale-95 ${STATUS_COLOR[order.status] || "bg-zinc-100 text-zinc-500"}`}
                      onClick={() => { setOptions(options === i ? -1 : i); setStatusValue(order.status); }}
                    >
                      {order.status}
                    </button>

                    <AnimatePresence>
                      {options === i && (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex items-center gap-2"
                        >
                          <select
                            className="bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-[10px] font-black uppercase tracking-widest rounded-full px-4 py-1.5 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-blue-500 transition-all shadow-inner"
                            onChange={(e) => setStatusValue(e.target.value)}
                            defaultValue={order.status}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option value={s} key={s} className="bg-white dark:bg-zinc-900">{s}</option>
                            ))}
                          </select>
                          <button
                            className="bg-blue-600 text-white p-2 rounded-full shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all active:scale-90"
                            onClick={() => submitStatusChange(i)}
                          >
                            <FaCheck size={10} />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="w-1/2 md:w-[15%] flex justify-end">
                  <button
                    className="group/btn relative h-10 w-10 bg-zinc-50 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-100 dark:border-zinc-700 hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-zinc-400 hover:text-blue-500 transition-all shadow-sm"
                    onClick={() => { setShowUser(true); setUserDivData(order.user); }}
                  >
                    <FaUserLarge size={14} />
                    <div className="absolute -top-10 right-0 scale-0 group-hover/btn:scale-100 transition-all bg-zinc-900 text-white text-[10px] font-black px-2 py-1 rounded-md whitespace-nowrap shadow-xl">
                      CUSTOMER PROFILE
                    </div>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      <SeeUserData userDivData={userDivData} showUser={showUser} setShowUser={setShowUser} />
    </>
  );
};

export default AllOrders;