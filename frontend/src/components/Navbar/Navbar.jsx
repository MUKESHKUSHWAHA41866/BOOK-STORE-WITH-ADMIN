import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiCommand } from "react-icons/fi";
import { FaGripLines } from "react-icons/fa";
import { useDispatch } from "react-redux";
// import { logout } from "../../redux/authSlice";
import CommandPalette from "../CommandPalette/CommandPalette";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const role = useSelector((state) => state.auth.role);
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Close mobile nav on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const navLinks = [
    { title: "Home", link: "/", show: true },
    { title: "All Books", link: "/all-books", show: true },
    { title: "Cart", link: "/cart", show: isLoggedIn && role === "user" },
    { title: "Profile", link: "/profile", show: isLoggedIn && role === "user" },
    { title: "Dashboard", link: "/admin/dashboard", show: isLoggedIn && role === "admin" },
    { title: "Admin", link: "/profile", show: isLoggedIn && role === "admin" },
  ].filter((l) => l.show);

  const isActive = (link) => location.pathname === link;

  return (
    <>
      <nav className="z-50 sticky top-0 flex bg-white/80 dark:bg-zinc-800/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white px-6 py-3 items-center justify-between transition-colors duration-300">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img
            className="h-9 group-hover:scale-105 transition-transform"
            src="https://cdn-icons-png.flaticon.com/128/10433/10433049.png"
            alt="BookHeaven Logo"
          />
          <h1 className="text-xl font-bold tracking-tight">BookHeaven</h1>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => (
            <Link
              key={item.link + item.title}
              to={item.link}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(item.link)
                ? "bg-blue-600 text-white"
                : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700"
                }`}
            >
              {item.title}
            </Link>
          ))}
        </div>

        {/* Right side: Ctrl+K + Toggle + Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Ctrl+K button */}
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 border border-zinc-200 dark:border-zinc-600 rounded-lg px-3 py-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all text-xs"
            aria-label="Open command palette"
          >
            <FiCommand size={12} />
            <span className="hidden lg:inline">Search</span>
            <kbd className="hidden lg:inline text-[10px] bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded px-1 py-0.5">⌘K</kbd>
          </button>

          {!isLoggedIn && (
            <>
              <Link
                to="/LogIn"
                className="px-4 py-1.5 border border-blue-500 rounded-lg text-sm text-blue-600 dark:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all"
              >
                Login
              </Link>
              <Link
                to="/SignUp"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold text-white transition-all"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="text-zinc-900 dark:text-white text-2xl hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle mobile menu"
          >
            <FaGripLines />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-white dark:bg-zinc-900 z-40 flex flex-col items-center justify-center gap-5">
          <button
            className="absolute top-4 right-6 text-zinc-400 text-3xl"
            onClick={() => setMobileOpen(false)}
          >
            ×
          </button>
          {navLinks.map((item) => (
            <Link
              key={item.link}
              to={item.link}
              className="text-zinc-900 dark:text-white text-3xl font-semibold hover:text-blue-500 transition-colors"
            >
              {item.title}
            </Link>
          ))}
          {!isLoggedIn && (
            <>
              <Link to="/LogIn" className="text-zinc-900 dark:text-white text-2xl border border-blue-500 rounded-xl px-8 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">Login</Link>
              <Link to="/SignUp" className="text-white text-2xl bg-blue-600 rounded-xl px-8 py-2 hover:bg-blue-500 transition-all">Sign Up</Link>
            </>
          )}
          {/* Mobile Ctrl+K */}
          <button
            onClick={() => { setMobileOpen(false); setPaletteOpen(true); }}
            className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm border border-zinc-200 dark:border-zinc-700 rounded-xl px-5 py-2"
          >
            <FiCommand /> Search (⌘K)
          </button>
        </div>
      )}

      {/* Command Palette */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
};

export default Navbar;
