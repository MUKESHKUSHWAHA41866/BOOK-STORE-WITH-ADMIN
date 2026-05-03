import { useState, useCallback } from "react";
import toast from "react-hot-toast";

const useRetry = (apiFunction, maxRetries = 3) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunction(...args);
      setData(result);
      setRetryCount(0); // Reset on success
      return result;
    } catch (err) {
      if (retryCount < maxRetries) {
        setRetryCount((prev) => prev + 1);
        toast.error(`Request failed. Retrying... (${retryCount + 1}/${maxRetries})`, { id: "retry-toast" });
        // Exponential backoff
        setTimeout(() => execute(...args), 1000 * Math.pow(2, retryCount));
      } else {
        setError(err);
        toast.error("Failed after multiple attempts.", { id: "retry-toast" });
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, retryCount, maxRetries]);

  const retry = useCallback((...args) => {
    setRetryCount(0);
    return execute(...args);
  }, [execute]);

  return { data, loading, error, execute, retry };
};

export default useRetry;
