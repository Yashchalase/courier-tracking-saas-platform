const prisma = require("../config/db");
const { HttpError } = require("../middleware/errorHandler");

async function listPlans() {
  return prisma.subscriptionPlan.findMany({ orderBy: { name: "asc" } });
}

async function createPlan({ name, maxShipments, price }) {
  return prisma.subscriptionPlan.create({
    data: {
      name,
      maxShipments: Number(maxShipments),
      price: String(price),
    },
  });
}

async function updatePlan(id, { name, maxShipments, price }) {
  const existing = await prisma.subscriptionPlan.findUnique({
    where: { id },
  });
  if (!existing) {
    throw new HttpError(404, "Plan not found");
  }
  return prisma.subscriptionPlan.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(maxShipments !== undefined
        ? { maxShipments: Number(maxShipments) }
        : {}),
      ...(price !== undefined ? { price: String(price) } : {}),
    },
  });
}

async function assignPlanToTenant({ tenantId, subscriptionPlanId }) {
  const [tenant, plan] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tenantId } }),
    prisma.subscriptionPlan.findUnique({ where: { id: subscriptionPlanId } }),
  ]);
  if (!tenant) {
    throw new HttpError(404, "Tenant not found");
  }
  if (!plan) {
    throw new HttpError(404, "Subscription plan not found");
  }
  return prisma.tenant.update({
    where: { id: tenantId },
    data: { subscriptionPlanId },
    include: {
      subscriptionPlan: true,
    },
  });
}

module.exports = {
  listPlans,
  createPlan,
  updatePlan,
  assignPlanToTenant,
};
