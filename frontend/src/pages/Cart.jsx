import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiTrash2, FiShoppingBag, FiMinus, FiPlus, FiX, FiCheckCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import { OrderTableSkeleton } from "../components/Skeleton/OrderRowSkeleton";
import useCart from "../hooks/useCart";
import api from "../api";
import { motion, AnimatePresence } from "framer-motion";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, loading, total, itemCount, removeItem, updateQuantity, clearCart } = useCart();
  const [orderLoading, setOrderLoading] = useState(false);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setOrderLoading(true);
    try {
      const orderItems = cart.map((item) => ({
        book: item.book._id,
        quantity: item.quantity,
        _id: item.book._id,
      }));
      await api.post("/api/v1/place-order", { order: orderItems });
      toast.success("Order placed successfully! 🎉");
      navigate("/profile/orderHistory");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place order.");
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 px-4 md:px-12 min-h-screen py-12 transition-colors">
        <div className="h-10 w-48 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse mb-10" />
        <OrderTableSkeleton rows={4} />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-zinc-900 min-h-[80vh] flex items-center justify-center flex-col gap-8 px-6 transition-colors duration-300"
      >
        <div className="w-40 h-40 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-300 dark:text-zinc-700 shadow-inner">
          <FiShoppingBag size={80} />
        </div>
        <div className="text-center">
          <h1 className="text-4xl lg:text-5xl font-black text-zinc-900 dark:text-zinc-100 mb-4 tracking-tighter">
            Your Bag is Empty
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto font-medium">
            Looks like you haven't added any masterpieces to your collection yet.
          </p>
        </div>
        <Link
          to="/all-books"
          className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-600/30 transition-all active:scale-95"
        >
          Explore Collection
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-zinc-50 dark:bg-zinc-900 px-4 md:px-12 min-h-screen py-12 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-4">
              Your Bag
              <span className="px-3 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-lg text-zinc-500 font-bold">
                {itemCount}
              </span>
            </h1>
          </div>
          <button
            onClick={clearCart}
            className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-red-500 transition-colors bg-white dark:bg-zinc-800 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm"
          >
            <FiX size={16} />
            Empty Bag
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Cart Items */}
          <div className="flex-1 w-full space-y-4">
            <AnimatePresence mode="popLayout">
              {cart.map((item, index) => (
                <CartItem
                  key={item.book._id}
                  item={item}
                  onRemove={removeItem}
                  onUpdateQty={updateQuantity}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-96 lg:sticky lg:top-24"
          >
            <div className="bg-white dark:bg-zinc-800 rounded-3xl p-8 border border-zinc-100 dark:border-zinc-700 shadow-xl transition-colors">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mb-6">Summary</h2>

              <div className="space-y-4 mb-8">
                {cart.map((item) => (
                  <div key={item.book._id} className="flex justify-between items-center text-sm">
                    <span className="truncate text-zinc-500 dark:text-zinc-400 font-medium pr-4">{item.book.title}</span>
                    <span className="flex-shrink-0 font-bold text-zinc-900 dark:text-zinc-100">
                      ₹{(item.book.price * item.quantity).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-700 pt-6 mb-8">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-zinc-500 dark:text-zinc-400 font-bold">Grand Total</span>
                  <span className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">₹ {total.toFixed(0)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-green-600 dark:text-green-500 text-[10px] font-bold uppercase tracking-widest justify-end">
                   <FiCheckCircle size={10} /> Secure COD Checkout
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={orderLoading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-2xl shadow-xl shadow-blue-600/30 transition-all active:scale-95 text-xl"
              >
                {orderLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  "Confirm Order"
                )}
              </button>

              <Link
                to="/all-books"
                className="mt-6 block text-center text-sm font-bold text-zinc-400 hover:text-blue-500 transition-colors"
              >
                ← Back to Shop
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const CartItem = ({ item, onRemove, onUpdateQty, index }) => {
  const { book, quantity } = item;
  const subtotal = (Number(book.price) * quantity).toFixed(0);
  const maxStock = book.stock ?? 99;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      layout
      className="bg-white dark:bg-zinc-800 rounded-3xl p-5 flex flex-col sm:flex-row gap-6 hover:shadow-2xl hover:border-blue-500/30 transition-all group border border-zinc-100 dark:border-zinc-700"
    >
      <Link to={`/view-book-details/${book._id}`} className="flex-shrink-0 relative">
        <div className="absolute inset-0 bg-blue-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
        <img
          src={book.url}
          alt={book.title}
          className="h-32 w-24 object-cover rounded-xl shadow-lg relative z-10"
        />
      </Link>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <Link to={`/view-book-details/${book._id}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <h2 className="text-xl text-zinc-900 dark:text-zinc-100 font-black line-clamp-1">{book.title}</h2>
        </Link>
        <p className="text-zinc-400 dark:text-zinc-500 mt-1 text-sm font-bold uppercase tracking-tighter">by {book.author}</p>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-zinc-900 dark:text-zinc-100 font-bold">₹{book.price}</span>
          <span className="h-4 w-px bg-zinc-200 dark:bg-zinc-700"></span>
          {maxStock <= 5 && maxStock > 0 && (
            <span className="text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
              Low Stock: {maxStock} left
            </span>
          )}
          {maxStock === 0 && (
            <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">
              Out of stock
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-4 flex-shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-700">
        <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">₹{subtotal}</div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 border border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => onUpdateQty(book._id, quantity - 1)}
              disabled={quantity <= 1}
              className="w-8 h-8 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 rounded-lg disabled:opacity-30 transition-all font-bold"
              aria-label="Decrease quantity"
            >
              <FiMinus size={14} />
            </button>
            <span className="text-zinc-900 dark:text-zinc-100 text-sm font-black w-6 text-center">{quantity}</span>
            <button
              onClick={() => onUpdateQty(book._id, quantity + 1)}
              disabled={quantity >= maxStock}
              className="w-8 h-8 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 rounded-lg disabled:opacity-30 transition-all font-bold"
              aria-label="Increase quantity"
            >
              <FiPlus size={14} />
            </button>
          </div>

          <button
            onClick={() => onRemove(book._id)}
            className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
            aria-label={`Remove ${book.title} from cart`}
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Cart;
