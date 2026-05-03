const mongoose = require("mongoose");

const favouriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },
    book: {
      type: mongoose.Types.ObjectId,
      ref: "books",
      required: true,
    },
  },
  { timestamps: true }
);

// Compound index to ensure a user can only favorite a book once
favouriteSchema.index({ user: 1, book: 1 }, { unique: true });

module.exports = mongoose.model("favourite", favouriteSchema);
