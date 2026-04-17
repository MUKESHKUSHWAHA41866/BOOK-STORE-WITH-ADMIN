const AuditLog = require("../models/audit");

const logAudit = async (adminId, action, entityType, entityId, details = {}) => {
  try {
    await AuditLog.create({
      adminId,
      action,
      entityType,
      entityId,
      details,
    });
  } catch (error) {
    console.error("Audit Log Failed:", error.message);
  }
};

module.exports = { logAudit };
