import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";
import useDebounce from "./useDebounce";

const DEFAULT_FILTERS = {
  q: "",
  genre: "",
  language: "",
  minPrice: "",
  maxPrice: "",
  minRating: "",
  inStock: "",
  sort: "newest",
  page: 1,
  limit: 12,
};

/**
 * useBooks — manages book listing with search, filter, sort, and pagination.
 * Syncs all params to URL searchParams for shareable/bookmarkable URLs.
 */
const useBooks = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial state from URL params
  const getParamOr = (key, def) => searchParams.get(key) || def;

  const [filters, setFilters] = useState({
    q: getParamOr("q", DEFAULT_FILTERS.q),
    genre: getParamOr("genre", DEFAULT_FILTERS.genre),
    language: getParamOr("language", DEFAULT_FILTERS.language),
    minPrice: getParamOr("minPrice", DEFAULT_FILTERS.minPrice),
    maxPrice: getParamOr("maxPrice", DEFAULT_FILTERS.maxPrice),
    minRating: getParamOr("minRating", DEFAULT_FILTERS.minRating),
    inStock: getParamOr("inStock", DEFAULT_FILTERS.inStock),
    sort: getParamOr("sort", DEFAULT_FILTERS.sort),
    page: Number(getParamOr("page", DEFAULT_FILTERS.page)),
    limit: Number(getParamOr("limit", DEFAULT_FILTERS.limit)),
  });

  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({ genres: [], languages: [] });

  // Debounce text search and price inputs to avoid excessive API calls
  const debouncedQ = useDebounce(filters.q, 400);
  const debouncedMinPrice = useDebounce(filters.minPrice, 600);
  const debouncedMaxPrice = useDebounce(filters.maxPrice, 600);

  // Fetch filter options once
  useEffect(() => {
    api.get("/api/v1/get-filter-options").then((res) => {
      setFilterOptions(res.data.data);
    }).catch(() => {});
  }, []);

  // Build active params (omit empty values) and sync to URL
  const buildParams = useCallback((f) => {
    const params = {};
    Object.entries(f).forEach(([k, v]) => {
      if (v !== "" && v !== null && v !== undefined) params[k] = String(v);
    });
    return params;
  }, []);

  // Fetch books when debounced filters change
  useEffect(() => {
    const activeFilters = {
      ...filters,
      q: debouncedQ,
      minPrice: debouncedMinPrice,
      maxPrice: debouncedMaxPrice,
    };
    const params = buildParams(activeFilters);

    setSearchParams(params, { replace: true });
    setLoading(true);

    api
      .get("/api/v1/get-all-books", { params })
      .then((res) => {
        setBooks(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      })
      .catch(() => toast.error("Failed to load books"))
      .finally(() => setLoading(false));
  }, [
    debouncedQ,
    debouncedMinPrice,
    debouncedMaxPrice,
    filters.genre,
    filters.language,
    filters.minRating,
    filters.inStock,
    filters.sort,
    filters.page,
    filters.limit,
  ]);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: key === "page" ? value : 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return { books, total, totalPages, loading, filters, filterOptions, updateFilter, resetFilters };
};

export default useBooks;
