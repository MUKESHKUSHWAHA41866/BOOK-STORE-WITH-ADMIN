const mongoose = require("mongoose");

const STATUS_ENUM = [
  "Order Placed",
  "Confirmed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Canceled",
];

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: STATUS_ENUM, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
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
    quantity: {
      type: Number,
      default: 1,
      min: [1, "Quantity must be at least 1"],
    },
    status: {
      type: String,
      default: "Order Placed",
      enum: STATUS_ENUM,
    },
    price: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    paymentId: {
      type: String,
      default: "",
    },
    // Timeline history — each status change is recorded here
    statusHistory: {
      type: [statusHistorySchema],
      default: function () {
        return [{ status: "Order Placed", timestamp: new Date() }];
      },
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentId: 1 }, { sparse: true });

module.exports = mongoose.model("order", orderSchema);