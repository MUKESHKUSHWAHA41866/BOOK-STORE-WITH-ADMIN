const Coupon = require("../models/coupon");

/**
 * Validate a coupon code
 */
const validateCoupon = async (req, res, next) => {
  try {
    const { code, amount } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid or inactive coupon code" });
    }

    if (new Date() > coupon.expiryDate) {
      return res.status(410).json({ message: "Coupon has expired" });
    }

    if (amount < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Min order amount for this coupon is $${coupon.minOrderAmount}`,
      });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    const discountAmount = (amount * coupon.discountPercent) / 100;
    const finalAmount = amount - discountAmount;

    return res.json({
      status: "Success",
      data: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        discountAmount,
        finalAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Create a new coupon
 */
const createCoupon = async (req, res, next) => {
  try {
    const { code, discountPercent, expiryDate, minOrderAmount } = req.body;

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    const newCoupon = new Coupon({
      code,
      discountPercent,
      expiryDate,
      minOrderAmount,
    });

    await newCoupon.save();
    return res.status(201).json({ status: "Success", message: "Coupon created", data: newCoupon });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get all coupons
 */
const getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.json({ status: "Success", data: coupons });
  } catch (error) {
    next(error);
  }
};

module.exports = { validateCoupon, createCoupon, getAllCoupons };
