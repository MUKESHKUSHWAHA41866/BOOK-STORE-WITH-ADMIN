const mongoose = require("mongoose");
const Review = require("../models/review");
const Book = require("../models/book");

/**
 * Recalculate and persist the averageRating + ratingsCount on a Book
 * after any review create/update/delete.
 */
const recalculateBookRating = async (bookId) => {
  try {
    const stats = await Review.aggregate([
      { $match: { book: new mongoose.Types.ObjectId(bookId) } },
      {
        $group: {
          _id: "$book",
          numReviews: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    if (stats.length > 0) {
      await Book.findByIdAndUpdate(bookId, {
        averageRating: stats[0].avgRating.toFixed(1),
        numberOfReviews: stats[0].numReviews,
      });
    } else {
      await Book.findByIdAndUpdate(bookId, {
        averageRating: 0,
        numberOfReviews: 0,
      });
    }
  } catch (error) {
    console.error("Error in recalculateBookRating service:", error);
    // Error is caught here, preventing a global process crash
  }
};

module.exports = { recalculateBookRating };
