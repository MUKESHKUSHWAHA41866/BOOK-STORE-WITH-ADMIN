const router = require("express").Router();
const { authenticateToken } = require("../middlewares/auth.middleware");
const { handleValidationErrors } = require("../middlewares/validate.middleware");
const {
  addReview,
  getReviews,
  updateReview,
  deleteReview,
  likeReview,
  reviewValidation,
} = require("../controllers/review.controller");

// ─── Review Routes ────────────────────────────────────────────────────────────
router.post("/add-review/:bookId", authenticateToken, reviewValidation, handleValidationErrors, addReview);
router.get("/get-reviews/:bookId", getReviews);
router.put("/update-review/:reviewId", authenticateToken, reviewValidation, handleValidationErrors, updateReview);
router.delete("/delete-review/:reviewId", authenticateToken, deleteReview);
router.put("/like-review/:reviewId", authenticateToken, likeReview);

module.exports = router;
