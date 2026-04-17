const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    action: { type: String, required: true }, // e.g., "CREATE_BOOK", "UPDATE_ORDER", "DELETE_BOOK"
    entityType: { type: String, required: true }, // e.g., "Book", "Order", "User"
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    details: { type: Object, default: {} }, // Any extra info like what fields exactly changed
  },
  { timestamps: true }
);

module.exports = mongoose.model("audit_log", auditLogSchema);
