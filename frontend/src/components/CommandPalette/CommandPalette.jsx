import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiBook, FiUser, FiShoppingCart, FiHome, FiList, FiX } from "react-icons/fi";
import api from "../../api";
import useDebounce from "../../hooks/useDebounce";

const STATIC_ROUTES = [
  { type: "route", label: "Home", path: "/", Icon: FiHome },
  { type: "route", label: "All Books", path: "/all-books", Icon: FiList },
  { type: "route", label: "My Cart", path: "/cart", Icon: FiShoppingCart },
  { type: "route", label: "Profile", path: "/profile", Icon: FiUser },
  { type: "route", label: "Order History", path: "/profile/orderHistory", Icon: FiList },
];

/**
 * GlobalCommandPalette — Ctrl+K / Cmd+K triggered search overlay.
 * Searches books + provides quick navigation shortcuts.
 */
const CommandPalette = ({ open, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [bookResults, setBookResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Fetch book results
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setBookResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    api
      .get("/api/v1/get-all-books", { params: { q: debouncedQuery, limit: 5 } })
      .then((res) => setBookResults(res.data.data || []))
      .catch(() => setBookResults([]))
      .finally(() => setSearching(false));
  }, [debouncedQuery]);

  // Build merged results list
  useEffect(() => {
    const q = query.toLowerCase();
    const filteredRoutes = STATIC_ROUTES.filter((r) =>
      r.label.toLowerCase().includes(q)
    );
    const bookItems = bookResults.map((b) => ({
      type: "book",
      label: b.title,
      sub: `by ${b.author} · ₹${b.price}`,
      path: `/view-book-details/${b._id}`,
      Icon: FiBook,
    }));
    setResults([...filteredRoutes, ...bookItems]);
    setActiveIndex(0);
  }, [query, bookResults]);

  const handleSelect = useCallback(
    (item) => {
      navigate(item.path);
      onClose();
    },
    [navigate, onClose]
  );

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      handleSelect(results[activeIndex]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Palette */}
      <div
        className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-700">
          <FiSearch className="text-zinc-400 text-lg flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-zinc-100 text-base outline-none placeholder-zinc-500"
            placeholder="Search books, pages… (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {searching && (
            <div className="w-4 h-4 border-2 border-zinc-500 border-t-blue-400 rounded-full animate-spin" />
          )}
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <FiX />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto py-2">
          {results.length === 0 && query.length > 0 && !searching && (
            <p className="text-zinc-500 text-sm text-center py-8">No results for "{query}"</p>
          )}
          {results.length === 0 && query.length === 0 && (
            <p className="text-zinc-600 text-xs text-center py-6">
              Start typing to search books or navigate…
            </p>
          )}
          {results.map((item, idx) => (
            <button
              key={`${item.type}-${idx}`}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setActiveIndex(idx)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                idx === activeIndex ? "bg-zinc-800" : "hover:bg-zinc-800/50"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg ${
                  item.type === "book" ? "bg-blue-900/50 text-blue-400" : "bg-zinc-700 text-zinc-300"
                }`}
              >
                <item.Icon size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-zinc-100 text-sm font-medium truncate">{item.label}</p>
                {item.sub && (
                  <p className="text-zinc-500 text-xs truncate">{item.sub}</p>
                )}
              </div>
              {idx === activeIndex && (
                <span className="text-xs text-zinc-500 flex-shrink-0">↵ open</span>
              )}
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div className="border-t border-zinc-800 px-4 py-2 flex gap-4 text-xs text-zinc-600">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>Esc close</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
