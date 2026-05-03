const Order = require("../models/order");
const User = require("../models/user");
const Book = require("../models/book");
const { logAudit } = require("../utils/auditLogger");
const { sendEmail } = require("../utils/mailer");
const Coupon = require("../models/coupon");
const { Parser } = require("json2csv");

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
    const { order, couponCode } = req.body;

    if (!order || !Array.isArray(order) || order.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Handle Coupon
    let discountPercent = 0;
    let totalOriginalAmount = 0;
    
    // First pass: calculate total original amount
    for (const item of order) {
      const book = await Book.findById(item.book || item._id);
      if (book) {
        totalOriginalAmount += book.price * (item.quantity || 1);
      }
    }

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && new Date() <= coupon.expiryDate && totalOriginalAmount >= coupon.minOrderAmount) {
        discountPercent = coupon.discountPercent;
      }
    }

    let orderListHtml = "";
    let finalTotalAmount = 0;

    for (const orderData of order) {
      const book = await Book.findById(orderData.book || orderData._id);
      if (!book) continue;

      const qty = orderData.quantity || 1;
      if (book.stock < qty) {
        return res.status(400).json({
          message: `Insufficient stock for "${book.title}" (only ${book.stock} left)`,
        });
      }

      const itemTotalPrice = book.price * qty;
      const itemDiscount = (itemTotalPrice * discountPercent) / 100;
      const itemFinalPrice = itemTotalPrice - itemDiscount;
      
      finalTotalAmount += itemFinalPrice;

      const newOrder = new Order({
        user: userId,
        book: book._id,
        quantity: qty,
        price: itemFinalPrice,
        discountAmount: itemDiscount,
        status: "Order Placed",
        statusHistory: [{ status: "Order Placed", timestamp: new Date() }],
      });
      const savedOrder = await newOrder.save();

      orderListHtml += `<li><b>${book.title}</b> x ${qty} - $${itemFinalPrice.toFixed(2)} ${discountPercent > 0 ? `(Discounted from $${itemTotalPrice})` : ""}</li>`;

      await Book.findByIdAndUpdate(book._id, { $inc: { stock: -qty } });
      await User.findByIdAndUpdate(userId, {
        $push: { orders: savedOrder._id },
        $pull: { cart: { book: book._id } },
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

    const io = req.app.get("socketio");
    if (io) {
      io.emit(`orderStatusUpdate:${order.user._id}`, {
        orderId: order._id,
        title: order.book.title,
        status: status,
      });
    }

    return res.json({ status: "Success", message: "Status updated successfully", data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /admin/export-orders
 */
const exportOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("book", "title price")
      .populate("user", "username email")
      .sort({ createdAt: -1 })
      .lean();

    const fields = [
      { label: "Order ID", value: "_id" },
      { label: "Book", value: "book.title" },
      { label: "Quantity", value: "quantity" },
      { label: "Price Paid", value: "price" },
      { label: "Customer", value: "user.username" },
      { label: "Email", value: "user.email" },
      { label: "Status", value: "status" },
      { label: "Date", value: "createdAt" },
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(orders);

    res.header("Content-Type", "text/csv");
    res.attachment("orders.csv");
    return res.send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = { placeOrder, getOrderHistory, getAllOrders, updateOrderStatus, exportOrders };
