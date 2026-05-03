import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const role = useSelector((state) => state.auth.role);

  useEffect(() => {
    // Only connect if user is logged in
    if (!isLoggedIn) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const userId = localStorage.getItem("id");
    const newSocket = io(import.meta.env.VITE_API_BASE_URL || "http://localhost:1000", {
      query: { userId },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    // Common event listeners
    if (role === "user" && userId) {
      newSocket.on(`orderStatusUpdate:${userId}`, (data) => {
        toast(
          <div className="flex flex-col gap-1">
            <span className="font-bold">Order Update</span>
            <span className="text-sm">Your order for "{data.title}" is now: {data.status}</span>
          </div>,
          { duration: 6000, icon: "📦" }
        );
      });
    }

    return () => {
      newSocket.disconnect();
    };
  }, [isLoggedIn, role]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
