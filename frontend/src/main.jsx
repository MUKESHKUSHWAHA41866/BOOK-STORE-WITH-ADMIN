import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import store from "./store/index.js";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Provider store={store}>
        <HelmetProvider>
          {/* Global Toast Container — Task 1.5 */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#27272a", // zinc-800
                color: "#f4f4f5",      // zinc-100
                border: "1px solid #3f3f46", // zinc-700
              },
              success: {
                iconTheme: { primary: "#22c55e", secondary: "#27272a" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#27272a" },
              },
            }}
          />
          <ThemeProvider>
            <SocketProvider>
              <App />
            </SocketProvider>
          </ThemeProvider>
        </HelmetProvider>
      </Provider>
    </Router>
  </StrictMode>
);
