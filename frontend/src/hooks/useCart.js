import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../api";

/**
 * useCart — manages cart state with quantity operations.
 * Provides loading, cart items, totals, and async operations.
 */
const useCart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/get-user-cart");
      setCart(res.data.data || []);
    } catch {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const removeItem = useCallback(async (bookId) => {
    try {
      await api.put(`/api/v1/remove-from-cart/${bookId}`);
      setCart((prev) => prev.filter((item) => item.book._id !== bookId));
      toast.success("Removed from cart");
    } catch {
      toast.error("Failed to remove item");
    }
  }, []);

  const updateQuantity = useCallback(async (bookId, quantity) => {
    try {
      await api.put("/api/v1/update-cart-quantity", { bookId, quantity });
      if (quantity < 1) {
        setCart((prev) => prev.filter((item) => item.book._id !== bookId));
      } else {
        setCart((prev) =>
          prev.map((item) =>
            item.book._id === bookId ? { ...item, quantity } : item
          )
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update quantity");
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      await api.delete("/api/v1/clear-cart");
      setCart([]);
      toast.success("Cart cleared");
    } catch {
      toast.error("Failed to clear cart");
    }
  }, []);

  const total = cart.reduce((acc, item) => {
    const price = Number(item.book?.price) || 0;
    return acc + price * (item.quantity || 1);
  }, 0);

  const itemCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return { cart, loading, total, itemCount, removeItem, updateQuantity, clearCart, refetch: fetchCart };
};

export default useCart;
