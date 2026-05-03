const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/order");
const Book = require("../models/book");
const User = require("../models/user");
const Coupon = require("../models/coupon");
const { logAudit } = require("../utils/auditLogger");
const { sendEmail } = require("../utils/mailer");

/**
 * Handle Stripe Webhooks
 */
module.exports = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.warn("⚠️ STRIPE_WEBHOOK_SECRET missing. Skipping signature verification (ONLY FOR DEV).");
      event = req.body; // Warning: Insecure
    } else {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    }
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    await handleSuccessfulPayment(session);
  }

  res.json({ received: true });
};

async function handleSuccessfulPayment(session) {
  try {
    const { userId, orderItems, couponCode } = session.metadata;
    const items = JSON.parse(orderItems);
    
    // Calculate total discount if coupon exists
    let discountPercent = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        discountPercent = coupon.discountPercent;
        // Increment usage count
        await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
      }
    }

    const user = await User.findById(userId);
    if (!user) return;

    let orderListHtml = "";

    for (const item of items) {
      const book = await Book.findById(item.book);
      if (!book) continue;

      const qty = item.quantity || 1;
      const itemTotalPrice = book.price * qty;
      const itemDiscount = (itemTotalPrice * discountPercent) / 100;
      const itemFinalPrice = itemTotalPrice - itemDiscount;

      const newOrder = new Order({
        user: userId,
        book: book._id,
        quantity: qty,
        price: itemFinalPrice,
        discountAmount: itemDiscount,
        paymentId: session.id,
        status: "Order Placed",
        statusHistory: [{ status: "Order Placed", timestamp: new Date(), note: "Paid via Stripe" }],
      });
      const savedOrder = await newOrder.save();

      orderListHtml += `<li><b>${book.title}</b> x ${qty} - $${itemFinalPrice.toFixed(2)}</li>`;

      // Update book stock
      await Book.findByIdAndUpdate(book._id, { $inc: { stock: -qty } });
      
      // Update user orders and clear cart
      await User.findByIdAndUpdate(userId, {
        $push: { orders: savedOrder._id },
        $pull: { cart: { book: book._id } },
      });
    }

    // Send confirmation email
    if (user.email) {
      const emailHtml = `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #2563eb;">Payment Received!</h2>
          <p>Hi ${user.username}, thank you for your purchase.</p>
          <p>Your order has been confirmed successfully:</p>
          <ul>${orderListHtml}</ul>
        </div>
      `;
      sendEmail(user.email, "Order Confirmed - BookHeaven", emailHtml);
    }

    await logAudit(userId, "PAYMENT_SUCCESS", "Order", session.id, { total: session.amount_total / 100 });

  } catch (error) {
    console.error("Error handling successful payment:", error);
  }
}
