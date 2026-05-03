const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Types.ObjectId, ref: "books", required: true },
    quantity: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const user = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    // Single avatar field — using DiceBear for reliable, always-available default avatars
    avatar: {
      type: String,
      default: "https://api.dicebear.com/9.x/initials/svg?seed=user",
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"],
    },
    favourites: [
      {
        type: mongoose.Types.ObjectId,
        ref: "books",
      },
    ],
    // Phase 2: cart now stores book + quantity
    cart: [cartItemSchema],
    orders: [
      {
        type: mongoose.Types.ObjectId,
        ref: "order",
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", user);