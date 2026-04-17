const router = require("express").Router();
const { authenticateToken, requireAdmin } = require("../middlewares/auth.middleware");
const AuditLog = require("../models/audit");

router.get("/admin/audit-logs", authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate("adminId", "username email")
      .sort({ createdAt: -1 })
      .limit(100);
    return res.json({ status: "Success", data: logs });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
