const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/order");
const Book = require("../models/book");
const User = require("../models/user");
const Coupon = require("../models/coupon");
const { logAudit } = require("../utils/auditLogger");
const { sendEmail } = require("../utils/mailer");
const escapeHtml = require("escape-html");
const logger = require("../utils/logger");

/**
 * Handle Stripe Webhooks
 */
module.exports = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const isProduction = process.env.NODE_ENV === "production";
  let event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      if (isProduction) {
        // ← Fix: Never skip signature verification in production — reject the request
        logger.error("STRIPE_WEBHOOK_SECRET is not set. Rejecting webhook in production.");
        return res.status(500).send("Webhook secret not configured");
      }
      // Dev-only: allow unsigned events for local testing with Stripe CLI
      logger.warn("⚠️  STRIPE_WEBHOOK_SECRET missing — skipping verification (DEV ONLY).");
      event = req.body;
    } else {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    }
  } catch (err) {
    logger.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Respond immediately — Stripe requires a fast 2xx response
  res.json({ received: true });

  // Handle the event asynchronously after responding
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    await handleSuccessfulPayment(session);
  }
};

async function handleSuccessfulPayment(session) {
  try {
    const { userId, orderItems, couponCode } = session.metadata;
    const items = JSON.parse(orderItems);

    // ─── Idempotency Guard ────────────────────────────────────────────────────
    // If Stripe retries this webhook (e.g. network timeout), we must not create
    // duplicate orders for the same payment session.
    const existingOrder = await Order.findOne({ paymentId: session.id });
    if (existingOrder) {
      logger.warn(`Webhook duplicate detected for paymentId: ${session.id} — skipping.`);
      return;
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Calculate total discount if coupon exists
    let discountPercent = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        const now = new Date();
        // ← Fix: Enforce usageLimit — only apply if not exhausted
        const withinUsageLimit = !coupon.usageLimit || coupon.usedCount < coupon.usageLimit;
        const notExpired = now <= coupon.expiryDate;

        if (withinUsageLimit && notExpired) {
          discountPercent = coupon.discountPercent;
          // Increment usage count atomically
          await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
        } else {
          logger.warn(`Coupon "${couponCode}" rejected in webhook: expired=${!notExpired}, limitReached=${!withinUsageLimit}`);
        }
      }
    }

    const user = await User.findById(userId);
    if (!user) {
      logger.error(`Webhook: User not found for userId: ${userId}`);
      return;
    }

    let orderListHtml = "";
    
    // ✅ Single query for all books
    const bookIds = items.map(i => i.book || i._id);
    const books = await Book.find({ _id: { $in: bookIds } }).lean();
    const bookMap = Object.fromEntries(books.map(b => [b._id.toString(), b]));

    const orderDocs = [];
    const bulkBookOps = [];
    const pulledBookIds = [];

    for (const item of items) {
      const bookIdStr = (item.book || item._id).toString();
      const book = bookMap[bookIdStr];
      if (!book) continue;

      const qty = item.quantity || 1;
      const itemTotalPrice = book.price * qty;
      const itemDiscount = (itemTotalPrice * discountPercent) / 100;
      const itemFinalPrice = itemTotalPrice - itemDiscount;

      orderDocs.push({
        user: userId,
        book: book._id,
        quantity: qty,
        price: itemFinalPrice,
        discountAmount: itemDiscount,
        paymentId: session.id,
        status: "Order Placed",
        statusHistory: [{ status: "Order Placed", timestamp: new Date(), note: "Paid via Stripe" }],
      });

      orderListHtml += `<li><b>${escapeHtml(book.title)}</b> x ${qty} - ₹${itemFinalPrice.toFixed(2)}</li>`;

      bulkBookOps.push({
        updateOne: { filter: { _id: book._id }, update: { $inc: { stock: -qty } } }
      });
      pulledBookIds.push(book._id);
    }

    const savedOrders = await Order.insertMany(orderDocs);
    if (bulkBookOps.length > 0) {
      await Book.bulkWrite(bulkBookOps);
    }

    if (savedOrders.length > 0) {
      const orderIds = savedOrders.map(o => o._id);
      await User.findByIdAndUpdate(userId, {
        $push: { orders: { $each: orderIds } },
        $pull: { cart: { book: { $in: pulledBookIds } } },
      });
    }

    // Send confirmation email
    if (user.email) {
      const emailHtml = `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #2563eb;">Payment Received!</h2>
          <p>Hi ${escapeHtml(user.username)}, thank you for your purchase.</p>
          <p>Your order has been confirmed successfully:</p>
          <ul>${orderListHtml}</ul>
        </div>
      `;
      sendEmail(user.email, "Order Confirmed - BookHeaven", emailHtml);
    }

    await logAudit(userId, "PAYMENT_SUCCESS", "Order", session.id, { total: session.amount_total / 100 });

  } catch (error) {
    logger.error("Error handling successful payment:", error);
  }
}

