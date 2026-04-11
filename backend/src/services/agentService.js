const { UserRole } = require("@prisma/client");
const prisma = require("../config/db");
const { HttpError } = require("../middleware/errorHandler");
const { recordAudit } = require("./auditService");

async function listForTenant(tenantId) {
  return prisma.agent.findMany({
    where: { tenantId },
    include: { user: { select: { id: true, email: true, name: true } }, hub: true },
    orderBy: { id: "asc" },
  });
}

async function updateLocationForTenant(
  tenantId,
  agentId,
  { lat, lng },
  role,
  userId
) {
  const agent = await prisma.agent.findFirst({
    where: { id: agentId, tenantId },
  });
  if (!agent) {
    throw new HttpError(404, "Agent not found");
  }
  if (role === UserRole.DELIVERY_AGENT && agent.userId !== userId) {
    throw new HttpError(403, "You can only update your own location");
  }
  if (role !== UserRole.COMPANY_ADMIN && role !== UserRole.DELIVERY_AGENT) {
    throw new HttpError(403, "Forbidden");
  }

  const updated = await prisma.agent.update({
    where: { id: agentId },
    data: {
      currentLat: lat != null ? Number(lat) : null,
      currentLng: lng != null ? Number(lng) : null,
    },
    include: {
      user: { select: { id: true, email: true, name: true } },
      hub: true,
    },
  });

  void recordAudit({
    userId,
    tenantId,
    action: "AGENT_LOCATION_UPDATE",
    entity: "Agent",
    entityId: agentId,
  });

  return updated;
}

module.exports = {
  listForTenant,
  updateLocationForTenant,
};
