import React, { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiTag, FiCalendar, FiUsers, FiDollarSign, FiPercent } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../../api";

const ManageCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountPercent: 10,
    minOrderAmount: 0,
    expiryDate: "",
    usageLimit: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await api.get("/api/v1/coupon/all");
      setCoupons(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/v1/coupon/create", newCoupon);
      toast.success("Coupon created successfully! 🎉");
      setShowAddModal(false);
      setNewCoupon({ code: "", discountPercent: 10, minOrderAmount: 0, expiryDate: "", usageLimit: "" });
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create coupon");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-0 md:p-6"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-100 italic tracking-tighter">DISCOUNTS & OFFERS</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium font-mono text-sm uppercase tracking-widest mt-1">Promotion Control Center</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black rounded-2xl shadow-xl hover:scale-105 transition-all active:scale-95"
        >
          <FiPlus size={20} /> Create Coupon
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
           {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-zinc-100 dark:bg-zinc-800 rounded-3xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {coupons.map((coupon) => (
              <motion.div
                key={coupon._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-zinc-800 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-700 shadow-lg relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <FiTag size={100} />
                </div>
                
                <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mb-2 font-mono">{coupon.code}</h3>
                <div className="space-y-3 relative z-10">
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                    <FiPercent size={14} className="text-zinc-400" />
                    <span className="font-bold">{coupon.discountPercent}% Off</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                    <FiDollarSign size={14} className="text-zinc-400" />
                    <span className="text-sm">Min Spend: <span className="font-bold">₹{coupon.minOrderAmount}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                    <FiCalendar size={14} className="text-zinc-400" />
                    <span className="text-sm">Expires: <span className="font-bold">{new Date(coupon.expiryDate).toLocaleDateString()}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                    <FiUsers size={14} className="text-zinc-400" />
                    <span className="text-sm">Usage: <span className="font-bold text-blue-600 dark:text-blue-400">{coupon.usedCount}</span> / {coupon.usageLimit || "∞"}</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                     new Date() > new Date(coupon.expiryDate) 
                     ? "bg-red-100 text-red-600" 
                     : "bg-green-100 text-green-600"
                   }`}>
                     {new Date() > new Date(coupon.expiryDate) ? "Expired" : "Active"}
                   </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Coupon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] max-w-md w-full shadow-2xl border border-zinc-200 dark:border-zinc-800"
          >
            <h2 className="text-3xl font-black mb-6 italic tracking-tighter">NEW PROMO</h2>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Coupon Code</label>
                <input
                  type="text"
                  placeholder="e.g. SUMMER50"
                  required
                  className="w-full px-5 py-3 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold uppercase"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Discount %</label>
                  <input
                    type="number"
                    required
                    className="w-full px-5 py-3 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold"
                    value={newCoupon.discountPercent}
                    onChange={(e) => setNewCoupon({...newCoupon, discountPercent: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Min Spend</label>
                  <input
                    type="number"
                    className="w-full px-5 py-3 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold"
                    value={newCoupon.minOrderAmount}
                    onChange={(e) => setNewCoupon({...newCoupon, minOrderAmount: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Expiry Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-5 py-3 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold"
                  value={newCoupon.expiryDate}
                  onChange={(e) => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Usage Limit (Optional)</label>
                <input
                  type="number"
                  placeholder="Unlimited"
                  className="w-full px-5 py-3 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold"
                  value={newCoupon.usageLimit}
                  onChange={(e) => setNewCoupon({...newCoupon, usageLimit: e.target.value})}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-600/30 hover:bg-blue-500 active:scale-95 transition-all text-sm uppercase tracking-widest"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold rounded-2xl hover:bg-zinc-200 active:scale-95 transition-all text-sm uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default ManageCoupons;
