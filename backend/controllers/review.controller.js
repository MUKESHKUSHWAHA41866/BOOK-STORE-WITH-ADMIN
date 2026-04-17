const Review = require("../models/review");
const Order = require("../models/order");
const { recalculateBookRating } = require("../services/review.service");
const { body } = require("express-validator");

// ─── Validation Rules ─────────────────────────────────────────────────────────
const reviewValidation = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Comment cannot exceed 1000 characters"),
];

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /add-review/:bookId
 * Users can only review books they have purchased.
 * One review per user per book.
 */
const addReview = async (req, res) => {
  try {
    const { id: bookId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id; // Corrected: Using identity from authenticated token

    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required." });
    }

    // Checking if the user has purchased the book
    const order = await Order.findOne({
      user: userId,
      "book._id": bookId, // Ensure we check the book ID inside the nested object
      status: { $in: ["Delivered", "Out for Delivery"] },
    });

    if (!order) {
      return res.status(403).json({
        message: "You must purchase this book and have it delivered to leave a review.",
      });
    }

    // Checking for existing review
    const existingReview = await Review.findOne({ user: userId, book: bookId });
    if (existingReview) {
      return res.status(409).json({ message: "You have already reviewed this book." });
    }

    const review = new Review({
      user: userId,
      book: bookId,
      rating,
      comment,
    });

    await review.save();

    // Recalculating book rating in the background
    recalculateBookRating(bookId);

    res.status(201).json({ message: "Review added successfully.", review });
  } catch (error) {
    logger.error("Error in addReview controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * GET /get-reviews/:bookId
 * Public: sorted by newest or most liked.
 */
const getReviews = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const { sort = "newest" } = req.query;
    const sortMap = {
      newest: { createdAt: -1 },
      helpful: { likesCount: -1 },
      rating_high: { rating: -1 },
      rating_low: { rating: 1 },
    };

    const reviews = await Review.find({ book: bookId })
      .populate("user", "username avatar")
      .sort(sortMap[sort] || { createdAt: -1 })
      .lean();

    // Add likes count for client
    const withMeta = reviews.map((r) => ({
      ...r,
      likesCount: r.likes?.length || 0,
    }));

    return res.json({ status: "Success", data: withMeta });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /update-review/:reviewId
 * Only the review owner can edit.
 */
const updateReview = async (req, res, next) => {
  try {
    const userId = req.user.id; // Corrected: Using token identity
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;
    await review.save();
    await recalculateBookRating(review.book);

    return res.json({ message: "Review updated", data: review });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /delete-review/:reviewId
 * Owner or admin can delete.
 */
const deleteReview = async (req, res, next) => {
  try {
    const userId = req.user.id; // Corrected: Using token identity
    const { reviewId } = req.params;
    const claims = req.user?.authClaims || [];
    const isAdmin = claims.find((c) => c.role === "admin");

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (!isAdmin && review.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const bookId = review.book;
    await review.deleteOne();
    await recalculateBookRating(bookId);

    return res.json({ message: "Review deleted" });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /like-review/:reviewId
 * Toggle like on a review.
 */
const likeReview = async (req, res, next) => {
  try {
    const userId = req.user.id; // Corrected: Using token identity
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const alreadyLiked = review.likes.map(String).includes(userId);
    if (alreadyLiked) {
      review.likes = review.likes.filter((id) => id.toString() !== userId);
    } else {
      review.likes.push(userId);
    }
    await review.save();

    return res.json({
      message: alreadyLiked ? "Like removed" : "Review liked",
      likesCount: review.likes.length,
      liked: !alreadyLiked,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { addReview, getReviews, updateReview, deleteReview, likeReview, reviewValidation };
