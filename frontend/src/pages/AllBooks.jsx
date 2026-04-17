import React from "react";
import { motion } from "framer-motion";
import BookCard from "../components/BookCard/BookCard";
import { BookListSkeleton } from "../components/Skeleton/BookCardSkeleton";
import useBooks from "../hooks/useBooks";
import {
  FiSearch, FiFilter, FiX, FiChevronLeft, FiChevronRight,
  FiSliders, FiStar
} from "react-icons/fi";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "rating", label: "Best Rated" },
  { value: "popular", label: "Most Popular" },
];

const AllBooks = () => {
  const { books, total, totalPages, loading, filters, filterOptions, updateFilter, resetFilters } = useBooks();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const hasActiveFilters =
    filters.q || filters.genre || filters.language ||
    filters.minPrice || filters.maxPrice || filters.minRating || filters.inStock;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white dark:bg-zinc-900 min-h-screen transition-colors duration-300"
    >
      {/* ── Top Bar ───────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 md:px-8 py-3 flex items-center gap-3 transition-colors duration-300">
        {/* Search */}
        <div className="relative flex-1 max-w-xl">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            id="book-search"
            type="text"
            value={filters.q}
            onChange={(e) => updateFilter("q", e.target.value)}
            placeholder="Search books…"
            className="w-full pl-9 pr-4 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-sm placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {filters.q && (
            <button
              onClick={() => updateFilter("q", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              <FiX size={14} />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={filters.sort}
          onChange={(e) => updateFilter("sort", e.target.value)}
          className="hidden sm:block bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm rounded-xl px-3 py-2 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors lg:hidden"
        >
          <FiSliders size={14} />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-blue-400" />
          )}
        </button>

        {/* Total count */}
        <span className="text-zinc-500 text-sm hidden sm:block whitespace-nowrap">
          {total} book{total !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex px-4 md:px-8 py-6 gap-6">
        {/* ── Sidebar ───────────────────────────────────────────────── */}
        <aside
          className={`
            fixed lg:relative inset-0 lg:inset-auto z-30 lg:z-auto
            w-72 lg:w-64 flex-shrink-0
            bg-white dark:bg-zinc-900 lg:bg-transparent
            border-r border-zinc-200 dark:border-zinc-800 lg:border-none
            overflow-y-auto p-5 lg:p-0
            transition-all duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          {/* Mobile close */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <span className="text-zinc-900 dark:text-zinc-200 font-semibold">Filters</span>
            <button onClick={() => setSidebarOpen(false)}>
              <FiX className="text-zinc-500 dark:text-zinc-400" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Reset */}
            {hasActiveFilters && (
              <button
                onClick={() => { resetFilters(); setSidebarOpen(false); }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 flex items-center gap-1"
              >
                <FiX size={12} /> Clear all filters
              </button>
            )}

            {/* Genre */}
            {filterOptions.genres.length > 0 && (
              <div>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Genre</p>
                <div className="flex flex-wrap gap-1.5">
                  {filterOptions.genres.map((g) => (
                    <button
                      key={g}
                      onClick={() => updateFilter("genre", filters.genre === g ? "" : g)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                        filters.genre === g
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Language */}
            {filterOptions.languages.length > 0 && (
              <div>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Language</p>
                <select
                  value={filters.language}
                  onChange={(e) => updateFilter("language", e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="">All languages</option>
                  {filterOptions.languages.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Price Range */}
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Price Range (₹)</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter("minPrice", e.target.value)}
                  className="w-1/2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter("maxPrice", e.target.value)}
                  className="w-1/2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Minimum Rating */}
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Min Rating</p>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4].map((r) => (
                  <button
                    key={r}
                    onClick={() => updateFilter("minRating", filters.minRating === String(r + 1) ? "" : String(r + 1))}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-all ${
                      filters.minRating === String(r + 1)
                        ? "bg-yellow-100 dark:bg-yellow-500/10 border-yellow-500 text-yellow-700 dark:text-yellow-500 font-bold"
                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-yellow-600 hover:text-yellow-400"
                    }`}
                  >
                    {r + 1}<FiStar size={10} />
                  </button>
                ))}
              </div>
            </div>

            {/* In Stock */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => updateFilter("inStock", filters.inStock === "true" ? "" : "true")}
                className={`w-10 h-5 rounded-full border-2 transition-all duration-300 relative ${
                  filters.inStock === "true"
                    ? "bg-blue-600 border-blue-500"
                    : "bg-zinc-200 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-all duration-300 ${
                    filters.inStock === "true" ? "left-4" : "left-0.5"
                  }`}
                />
              </div>
              <span className="text-zinc-700 dark:text-zinc-300 text-sm group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">In stock only</span>
            </label>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Main Content ──────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.q && <Chip label={`"${filters.q}"`} onRemove={() => updateFilter("q", "")} />}
              {filters.genre && <Chip label={filters.genre} onRemove={() => updateFilter("genre", "")} />}
              {filters.language && <Chip label={filters.language} onRemove={() => updateFilter("language", "")} />}
              {filters.minPrice && <Chip label={`Min ₹${filters.minPrice}`} onRemove={() => updateFilter("minPrice", "")} />}
              {filters.maxPrice && <Chip label={`Max ₹${filters.maxPrice}`} onRemove={() => updateFilter("maxPrice", "")} />}
              {filters.minRating && <Chip label={`${filters.minRating}★+`} onRemove={() => updateFilter("minRating", "")} />}
              {filters.inStock && <Chip label="In Stock" onRemove={() => updateFilter("inStock", "")} />}
            </div>
          )}

          {/* Book grid */}
          {loading ? (
            <BookListSkeleton count={12} />
          ) : books.length === 0 ? (
            <EmptyState onReset={resetFilters} hasFilters={hasActiveFilters} />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {books.map((book) => (
                  <BookCard key={book._id} data={book} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  page={filters.page}
                  totalPages={totalPages}
                  onPageChange={(p) => updateFilter("page", p)}
                />
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const Chip = ({ label, onRemove }) => (
  <span className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700/50 text-blue-600 dark:text-blue-300 text-xs px-2.5 py-1 rounded-full">
    {label}
    <button onClick={onRemove} className="hover:text-blue-800 dark:hover:text-white transition-colors">
      <FiX size={11} />
    </button>
  </span>
);

const Pagination = ({ page, totalPages, onPageChange }) => {
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <PageBtn
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        icon={<FiChevronLeft />}
      />
      {start > 1 && <><PageNum n={1} current={page} onClick={onPageChange} /><span className="text-zinc-400">…</span></>}
      {pages.map((n) => <PageNum key={n} n={n} current={page} onClick={onPageChange} />)}
      {end < totalPages && <><span className="text-zinc-400">…</span><PageNum n={totalPages} current={page} onClick={onPageChange} /></>}
      <PageBtn
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        icon={<FiChevronRight />}
      />
    </div>
  );
};

const PageNum = ({ n, current, onClick }) => (
  <button
    onClick={() => onClick(n)}
    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
      n === current
        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-200"
    }`}
  >
    {n}
  </button>
);

const PageBtn = ({ onClick, disabled, icon }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
  >
    {icon}
  </button>
);

const EmptyState = ({ onReset, hasFilters }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
       <FiSearch size={32} className="text-zinc-400" />
    </div>
    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">No books found</p>
    <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8 max-w-sm mx-auto">
      {hasFilters ? "Try adjusting your search or filters to find what you're looking for." : "We haven't added any books to our collection yet. Check back soon!"}
    </p>
    {hasFilters && (
      <button
        onClick={onReset}
        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/20 transition-all"
      >
        Clear all filters
      </button>
    )}
  </div>
);

export default AllBooks;