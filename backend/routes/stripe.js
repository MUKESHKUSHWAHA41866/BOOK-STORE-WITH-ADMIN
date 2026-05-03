const router = require("express").Router();
const { authenticateToken } = require("../middlewares/auth.middleware");
const { createCheckoutSession } = require("../controllers/stripe.controller");

// Create checkout session
router.post("/create-checkout-session", authenticateToken, createCheckoutSession);

module.exports = router;
