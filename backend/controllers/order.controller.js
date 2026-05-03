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

    // ✅ Single query for all books
    const bookIds = order.map(i => i.book || i._id);
    const books = await Book.find({ _id: { $in: bookIds } }).lean();
    const bookMap = Object.fromEntries(books.map(b => [b._id.toString(), b]));

    // Handle Coupon
    let discountPercent = 0;
    let totalOriginalAmount = 0;
    
    // First pass: calculate total original amount & validate stock
    for (const item of order) {
      const bookIdStr = (item.book || item._id).toString();
      const book = bookMap[bookIdStr];
      if (!book) continue;
      
      const qty = item.quantity || 1;
      if (book.stock < qty) {
        return res.status(400).json({
          message: `Insufficient stock for "${book.title}" (only ${book.stock} left)`,
        });
      }
      totalOriginalAmount += book.price * qty;
    }

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && new Date() <= coupon.expiryDate && totalOriginalAmount >= coupon.minOrderAmount) {
        if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
          discountPercent = coupon.discountPercent;
          await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
        }
      }
    }

    let orderListHtml = "";
    const orderDocs = [];
    const bulkBookOps = [];
    const pulledBookIds = [];

    for (const orderData of order) {
      const bookIdStr = (orderData.book || orderData._id).toString();
      const book = bookMap[bookIdStr];
      if (!book) continue;

      const qty = orderData.quantity || 1;
      const itemTotalPrice = book.price * qty;
      const itemDiscount = (itemTotalPrice * discountPercent) / 100;
      const itemFinalPrice = itemTotalPrice - itemDiscount;

      orderDocs.push({
        user: userId,
        book: book._id,
        quantity: qty,
        price: itemFinalPrice,
        discountAmount: itemDiscount,
        status: "Order Placed",
        statusHistory: [{ status: "Order Placed", timestamp: new Date() }],
      });

      orderListHtml += `<li><b>${book.title}</b> x ${qty} - $${itemFinalPrice.toFixed(2)} ${discountPercent > 0 ? `(Discounted from $${itemTotalPrice})` : ""}</li>`;

      bulkBookOps.push({
        updateOne: { filter: { _id: book._id }, update: { $inc: { stock: -qty } } }
      });
      pulledBookIds.push(book._id);
    }

    const savedOrders = await Order.insertMany(orderDocs);
    await Book.bulkWrite(bulkBookOps);

    const orderIds = savedOrders.map(o => o._id);
    await User.findByIdAndUpdate(userId, {
      $push: { orders: { $each: orderIds } },
      $pull: { cart: { book: { $in: pulledBookIds } } },
    });

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
