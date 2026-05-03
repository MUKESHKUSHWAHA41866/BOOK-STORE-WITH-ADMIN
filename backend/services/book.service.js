const Book = require("../models/book");

/**
 * Build a Mongoose query object from URL query params.
 * Supports: q (text search), genre, language, minPrice, maxPrice,
 *           minRating, inStock, plus sort + pagination.
 */
const buildBookQuery = (queryParams) => {
  const {
    q,
    genre,
    language,
    minPrice,
    maxPrice,
    minRating,
    inStock,
    sort = "newest",
    page = 1,
    limit = 12,
  } = queryParams;

  const filter = {};

  // Text search: use $or regex so it works alongside all other filters
  // (MongoDB $text index cannot be freely combined with $sort on other fields)
  if (q && q.trim()) {
    const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    filter.$or = [
      { title: regex },
      { author: regex },
      { desc: regex },
      { isbn: regex },
    ];
  }

  // Genre filter (can be comma-separated list)
  if (genre) {
    const genres = genre.split(",").map((g) => g.trim()).filter(Boolean);
    if (genres.length) filter.genres = { $in: genres };
  }

  // Language filter
  if (language) {
    filter.language = new RegExp(`^${language.trim()}$`, "i");
  }

  // Price range
  if ((minPrice !== undefined && minPrice !== "") || (maxPrice !== undefined && maxPrice !== "")) {
    filter.price = {};
    if (minPrice !== undefined && minPrice !== "") filter.price.$gte = Number(minPrice);
    if (maxPrice !== undefined && maxPrice !== "") filter.price.$lte = Number(maxPrice);
  }

  // Minimum rating — filter books with averageRating >= minRating
  if (minRating && minRating !== "") {
    filter.averageRating = { $gte: Number(minRating) };
  }

  // In-stock filter
  if (inStock === "true") {
    filter.stock = { $gt: 0 };
  }

  // Sort mapping
  const sortMap = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    newest: { createdAt: -1 },
    rating: { averageRating: -1 },
    popular: { ratingsCount: -1 },
  };
  const sortObj = sortMap[sort] || { createdAt: -1 };

  const skip = (Number(page) - 1) * Number(limit);

  return { filter, sortObj, skip, limitNum: Number(limit), page: Number(page) };
};

const getPaginatedBooks = async (queryParams) => {
  const { filter, sortObj, skip, limitNum, page } = buildBookQuery(queryParams);

  const [data, total] = await Promise.all([
    Book.find(filter).sort(sortObj).skip(skip).limit(limitNum).lean(),
    Book.countDocuments(filter),
  ]);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limitNum),
    limit: limitNum,
  };
};

const getDistinctGenres = async () => {
  const genres = await Book.distinct("genres");
  return genres.filter(Boolean).sort();
};

const getDistinctLanguages = async () => {
  const languages = await Book.distinct("language");
  return languages.filter(Boolean).sort();
};

module.exports = { getPaginatedBooks, getDistinctGenres, getDistinctLanguages };
