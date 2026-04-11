const bcrypt = require("bcrypt");
const { UserRole } = require("@prisma/client");
const prisma = require("../config/db");
const { HttpError } = require("../middleware/errorHandler");
const { PLATFORM_TENANT_SLUG } = require("../constants/platform");

const BCRYPT_ROUNDS = 10;

async function getFirstHubIdForTenant(tenantId, tx = prisma) {
  const hub = await tx.hub.findFirst({
    where: { tenantId },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return hub?.id ?? null;
}

/**
 * Creates a DELIVERY_AGENT user and linked Agent row (first hub of tenant).
 */
async function createDeliveryAgentForTenant(tenantId, { name, email, password }) {
  const hubId = await getFirstHubIdForTenant(tenantId);
  if (!hubId) {
    throw new HttpError(
      400,
      "No hub exists for this tenant. Create a hub before adding delivery agents."
    );
  }

  const existing = await prisma.user.findUnique({
    where: { tenantId_email: { tenantId, email } },
  });
  if (existing) {
    throw new HttpError(409, "An account with this email already exists for this organization");
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        tenantId,
        email,
        name: name || null,
        passwordHash,
        role: UserRole.DELIVERY_AGENT,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        createdAt: true,
      },
    });
    await tx.agent.create({
      data: { userId: user.id, tenantId, hubId },
    });
    return user;
  });
}

async function getPlatformTenantId() {
  const t = await prisma.tenant.findUnique({
    where: { slug: PLATFORM_TENANT_SLUG },
    select: { id: true },
  });
  return t?.id ?? null;
}

module.exports = {
  createDeliveryAgentForTenant,
  getFirstHubIdForTenant,
  getPlatformTenantId,
  PLATFORM_TENANT_SLUG,
  BCRYPT_ROUNDS,
};
