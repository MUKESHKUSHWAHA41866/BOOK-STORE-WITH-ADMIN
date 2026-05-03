const mongoose = require("mongoose");
const Coupon = require("../models/coupon");
require("dotenv").config({ path: "../.env" });

const createSampleCoupon = async () => {
  try {
    await mongoose.connect(process.env.URI_MON);
    console.log("Connected to MongoDB...");

    const code = "WELCOME50";
    const existing = await Coupon.findOne({ code });
    
    if (existing) {
      console.log(`Coupon ${code} already exists.`);
      process.exit(0);
    }

    const coupon = new Coupon({
      code: code,
      discountPercent: 50,
      expiryDate: new Date("2026-12-31"),
      minOrderAmount: 100,
      usageLimit: 100,
    });

    await coupon.save();
    console.log(`✅ Coupon ${code} created successfully!`);
    console.log("Usage: 50% off, Min Spend: ₹100, Limit: 100 users.");
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

createSampleCoupon();
