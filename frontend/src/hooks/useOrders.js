import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../api";

/**
 * useOrders — fetches user's order history.
 */
const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/get-order-history");
      setOrders(res.data.data || []);
    } catch {
      toast.error("Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return { orders, loading, refetch: fetchOrders };
};

export default useOrders;
