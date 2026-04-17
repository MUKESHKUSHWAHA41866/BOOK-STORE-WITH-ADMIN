const router = require("express").Router();
const { authenticateToken } = require("../middlewares/auth.middleware");
const { addToCart, updateCartQuantity, removeFromCart, getCart, clearCart } = require("../controllers/cart.controller");

// ─── Cart Routes ──────────────────────────────────────────────────────────────
router.put("/add-to-cart", authenticateToken, addToCart);
router.put("/update-cart-quantity", authenticateToken, updateCartQuantity);
router.put("/remove-from-cart/:bookid", authenticateToken, removeFromCart);
router.get("/get-user-cart", authenticateToken, getCart);
router.delete("/clear-cart", authenticateToken, clearCart);

module.exports = router;