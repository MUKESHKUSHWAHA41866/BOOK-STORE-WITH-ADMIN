const Stripe = require("stripe");
const Order = require("../models/order");
const Book = require("../models/book");
const User = require("../models/user");
const Coupon = require("../models/coupon");

/**
 * Create a Stripe Checkout Session
 */
const createCheckoutSession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { order, couponCode } = req.body;

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(400).json({ 
        message: "Stripe is not configured. Please add STRIPE_SECRET_KEY to your .env file or use 'Cash on Delivery'." 
      });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    if (!order || order.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }
// ... [rest of the function remains similar but uses the local 'stripe' instance]
    const lineItems = [];
    const user = await User.findById(userId);

    // Calculate dynamic discount if coupon exists
    let discountPercent = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && new Date() <= coupon.expiryDate) {
        discountPercent = coupon.discountPercent;
      }
    }

    for (const item of order) {
      const book = await Book.findById(item.book || item._id);
      if (!book) continue;

      const unitAmount = Math.round(book.price * 100); // Stripe expects cents
      const quantity = item.quantity || 1;

      lineItems.push({
        price_data: {
          currency: "inr",
          product_data: {
            name: book.title,
            images: [book.url],
            description: `by ${book.author}`,
          },
          unit_amount: unitAmount,
        },
        quantity: quantity,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
      customer_email: user.email,
      metadata: {
        userId: userId.toString(),
        couponCode: couponCode || "",
        orderItems: JSON.stringify(order.map(o => ({ book: o.book || o._id, quantity: o.quantity || 1 }))),
      },
      // Apply discount if applicable
      ...(discountPercent > 0 && {
        discounts: [{
          coupon: await createStripeCoupon(stripe, discountPercent),
        }],
      }),
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper: Create a temporary Stripe coupon to match our internal one
 */
async function createStripeCoupon(stripe, percent) {
  const coupon = await stripe.coupons.create({
    percent_off: percent,
    duration: "once",
  });
  return coupon.id;
}

module.exports = { createCheckoutSession };
