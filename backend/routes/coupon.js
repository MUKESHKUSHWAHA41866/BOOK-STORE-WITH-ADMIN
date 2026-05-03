const router = require("express").Router();
const { authenticateToken, requireAdmin } = require("../middlewares/auth.middleware");
const { validateCoupon, createCoupon, getAllCoupons } = require("../controllers/coupon.controller");

// Public/User route: Validate coupon before order
router.post("/validate", authenticateToken, validateCoupon);

// Admin routes: Manage coupons
router.post("/create", authenticateToken, requireAdmin, createCoupon);
router.get("/all", authenticateToken, requireAdmin, getAllCoupons);

module.exports = router;
