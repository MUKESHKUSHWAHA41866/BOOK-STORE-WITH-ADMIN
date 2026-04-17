const router = require("express").Router();
const { authenticateToken, requireAdmin } = require("../middlewares/auth.middleware");
const { getAnalytics } = require("../controllers/analytics.controller");

// ─── Admin Analytics ──────────────────────────────────────────────────────────
// GET /api/v1/admin/analytics?days=30
router.get("/admin/analytics", authenticateToken, requireAdmin, getAnalytics);

module.exports = router;
