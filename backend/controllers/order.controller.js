const Order = require("../models/order");
const User = require("../models/user");
const Book = require("../models/book");
const { logAudit } = require("../utils/auditLogger");
const { sendEmail } = require("../utils/mailer");

const STATUS_SEQUENCE = [
  "Order Placed",
  "Confirmed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

/**
 * POST /place-order
 */
const placeOrder = async (req, res, next) => {
  try {
    const userId = req.user.id; // Corrected: Using token identity
    const { order } = req.body;

    if (!order || !Array.isArray(order) || order.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let orderListHtml = "";

    for (const orderData of order) {
      const book = await Book.findById(orderData.book || orderData._id);
      if (!book) continue;

      const qty = orderData.quantity || 1;
      if (book.stock < qty) {
        return res.status(400).json({
          message: `Insufficient stock for "${book.title}" (only ${book.stock} left)`,
        });
      }

      const bookId = book._id;
      const newOrder = new Order({
        user: userId,
        book: bookId,
        quantity: qty,
        status: "Order Placed",
        statusHistory: [{ status: "Order Placed", timestamp: new Date() }],
      });
      const savedOrder = await newOrder.save();

      orderListHtml += `<li><b>${book.title}</b> x ${qty} - $${book.price * qty}</li>`;

      await Book.findByIdAndUpdate(bookId, { $inc: { stock: -qty } });
      await User.findByIdAndUpdate(userId, {
        $push: { orders: savedOrder._id },
        $pull: { cart: { book: bookId } },
      });
    }

    // Send Confirmation Email
    const emailHtml = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #2563eb;">Order Confirmed!</h2>
        <p>Hi ${user.username}, thank you for shopping with BookHeaven.</p>
        <p>Your order has been placed successfully:</p>
        <ul>${orderListHtml}</ul>
        <p>We'll notify you when it's on the way!</p>
      </div>
    `;
    sendEmail(user.email, "Order Confirmation - BookHeaven", emailHtml);

    return res.status(201).json({ message: "Order placed successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /get-order-history
 */
const getOrderHistory = async (req, res, next) => {
  try {
    const userId = req.user.id; // Using token identity
    const userData = await User.findById(userId).populate({
      path: "orders",
      populate: { path: "book" },
      options: { sort: { createdAt: -1 } },
    });

    if (!userData) return res.status(404).json({ message: "User not found" });

    const ordersData = userData.orders.slice().reverse();
    return res.json({ status: "Success", data: ordersData });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /get-all-orders
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const filter = status ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("book")
        .populate("user", "-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Order.countDocuments(filter),
    ]);

    return res.json({ status: "Success", data: orders, total, page: Number(page) });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /update-status/:id
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const adminId = req.user.id; // Using token identity (admin)
    const { id } = req.params;
    const { status, note = "" } = req.body;

    if (!status) return res.status(400).json({ message: "Status is required" });

    const order = await Order.findById(id).populate("user").populate("book");
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    order.statusHistory.push({ status, timestamp: new Date(), note });
    await order.save();

    await logAudit(adminId, "UPDATE_ORDER", "Order", order._id, { newStatus: status });

    // Send Status Update Email
    if (order.user && order.user.email) {
      const statusHtml = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #2563eb;">Order Status Updated</h2>
          <p>Your order for <b>${order.book.title}</b> is now: <span style="font-weight: bold; color: #1e40af;">${status}</span></p>
          ${note ? `<p><b>Note:</b> ${note}</p>` : ""}
          <p>Check your profile for more details.</p>
        </div>
      `;
      sendEmail(order.user.email, `BookHeaven: Order ${status}`, statusHtml);
    }

    return res.json({ status: "Success", message: "Status updated successfully", data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = { placeOrder, getOrderHistory, getAllOrders, updateOrderStatus };
