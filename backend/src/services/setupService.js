const bcrypt = require("bcrypt");
const { UserRole } = require("@prisma/client");
const prisma = require("../config/db");
const { HttpError } = require("../middleware/errorHandler");
const { PLATFORM_TENANT_SLUG, BCRYPT_ROUNDS } = require("./userProvisioningService");

async function needsSetup() {
  const count = await prisma.user.count({ where: { role: UserRole.SUPER_ADMIN } });
  return count === 0;
}

async function bootstrapSuperAdmin({ name, email, password }) {
  return prisma.$transaction(async (tx) => {
    const superCount = await tx.user.count({ where: { role: UserRole.SUPER_ADMIN } });
    if (superCount > 0) {
      throw new HttpError(403, "Setup already completed");
    }

    let plan = await tx.subscriptionPlan.findFirst();
    if (!plan) {
      plan = await tx.subscriptionPlan.create({
        data: {
          name: "Default",
          maxShipments: 999999,
          price: 0,
        },
      });
    }

    let tenant = await tx.tenant.findUnique({ where: { slug: PLATFORM_TENANT_SLUG } });
    if (!tenant) {
      tenant = await tx.tenant.create({
        data: {
          name: "Platform",
          slug: PLATFORM_TENANT_SLUG,
          subscriptionPlanId: plan.id,
        },
      });
    }

    const existing = await tx.user.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email } },
    });
    if (existing) {
      throw new HttpError(409, "An account with this email already exists for this organization");
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await tx.user.create({
      data: {
        tenantId: tenant.id,
        email,
        name: name?.trim() || null,
        passwordHash,
        role: UserRole.SUPER_ADMIN,
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

    return { user, tenantSlug: PLATFORM_TENANT_SLUG };
  });
}

module.exports = {
  needsSetup,
  bootstrapSuperAdmin,
};
