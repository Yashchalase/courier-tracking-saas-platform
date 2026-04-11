const prisma = require("../config/db");
const { HttpError } = require("../middleware/errorHandler");

async function listForTenant(tenantId) {
  return prisma.hub.findMany({
    where: { tenantId },
    orderBy: { name: "asc" },
  });
}

async function createForTenant(tenantId, { name, address, city, lat, lng }) {
  return prisma.hub.create({
    data: {
      tenantId,
      name,
      address,
      city,
      lat: Number(lat),
      lng: Number(lng),
    },
  });
}

async function updateForTenant(tenantId, id, { name, address, city, lat, lng }) {
  const existing = await prisma.hub.findFirst({
    where: { id, tenantId },
  });
  if (!existing) {
    throw new HttpError(404, "Hub not found");
  }
  return prisma.hub.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(address !== undefined ? { address } : {}),
      ...(city !== undefined ? { city } : {}),
      ...(lat !== undefined ? { lat: Number(lat) } : {}),
      ...(lng !== undefined ? { lng: Number(lng) } : {}),
    },
  });
}

module.exports = {
  listForTenant,
  createForTenant,
  updateForTenant,
};
