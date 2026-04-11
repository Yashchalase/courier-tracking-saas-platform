const prisma = require("../config/db");

/**
 * Best-effort audit write; never throws — avoids breaking primary flows.
 */
async function recordAudit({ userId, tenantId, action, entity, entityId }) {
  if (!userId || !tenantId || !action || !entity) {
    return;
  }
  const id = entityId != null ? String(entityId) : "";
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        tenantId,
        action,
        entity,
        entityId: id || "n/a",
      },
    });
  } catch (err) {
    console.error("[audit] record failed:", err.message);
  }
}

module.exports = {
  recordAudit,
};
