const router = require("express").Router();
const { authenticateToken, requireAdmin } = require("../middlewares/auth.middleware");
const { handleValidationErrors } = require("../middlewares/validate.middleware");
const {
  addBook,
  updateBook,
  deleteBook,
  getAllBooks,
  getRecentBooks,
  getBookById,
  getFilterOptions,
  addBookValidation,
  getRecommendations,
} = require("../controllers/book.controller");

// ─── Admin Routes ─────────────────────────────────────────────────────────────
router.post("/add-book", authenticateToken, requireAdmin, addBookValidation, handleValidationErrors, addBook);
router.put("/update-book", authenticateToken, requireAdmin, updateBook);
router.delete("/delete-book", authenticateToken, requireAdmin, deleteBook);

// ─── Public Routes ────────────────────────────────────────────────────────────
// Supports: ?q= ?genre= ?language= ?minPrice= ?maxPrice= ?minRating= ?inStock= ?sort= ?page= ?limit=
router.get("/get-all-books", getAllBooks);
router.get("/get-recent-books", getRecentBooks);
router.get("/get-book-by-id/:id", getBookById);
// Returns distinct genres + languages for filter dropdowns
router.get("/get-filter-options", getFilterOptions);
router.get("/recommendations/:id", getRecommendations);

module.exports = router;