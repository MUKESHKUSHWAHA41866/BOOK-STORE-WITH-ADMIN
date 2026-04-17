const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      index: true,
    },
    author: {
      type: String,
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    desc: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    // ─── Phase 2 additions ────────────────────────────────────────────
    isbn: {
      type: String,
      default: "",
      index: true,
    },
    genres: {
      type: [String],
      default: [],
      index: true,
    },
    stock: {
      type: Number,
      default: 100,
      min: [0, "Stock cannot be negative"],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Full-text search index (disable language override because some books have unsupported languages like Hindi)
bookSchema.index(
  { title: "text", author: "text", desc: "text", isbn: "text" },
  { language_override: "dummy" }
);

module.exports = mongoose.model("books", bookSchema);