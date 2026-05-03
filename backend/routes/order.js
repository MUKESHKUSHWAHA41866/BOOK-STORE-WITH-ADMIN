const router = require("express").Router();
const { authenticateToken, requireAdmin } = require("../middlewares/auth.middleware");
const { placeOrder, getOrderHistory, getAllOrders, updateOrderStatus, exportOrders } = require("../controllers/order.controller");

// ─── User Routes ──────────────────────────────────────────────────────────────
router.post("/place-order", authenticateToken, placeOrder);
router.get("/get-order-history", authenticateToken, getOrderHistory);

// ─── Admin Routes ─────────────────────────────────────────────────────────────
router.get("/get-all-orders", authenticateToken, requireAdmin, getAllOrders);
router.get("/export-orders", authenticateToken, requireAdmin, exportOrders);
router.put("/update-status/:id", authenticateToken, requireAdmin, updateOrderStatus);

module.exports = router;