const bcrypt = require("bcrypt");
const { UserRole } = require("@prisma/client");
const prisma = require("../config/db");
const { HttpError } = require("../middleware/errorHandler");
const {
  createDeliveryAgentForTenant,
  getPlatformTenantId,
  PLATFORM_TENANT_SLUG,
  BCRYPT_ROUNDS,
} = require("./userProvisioningService");

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const ALL_ROLES = Object.values(UserRole);

async function listTenants() {
  return prisma.tenant.findMany({
    include: { subscriptionPlan: true },
    orderBy: { createdAt: "desc" },
  });
}

async function createTenant({ name, slug }) {
  const trimmedName = name?.trim() ?? "";
  if (!trimmedName) {
    throw new HttpError(400, "Name is required");
  }
  if (trimmedName.length > 120) {
    throw new HttpError(400, "Name must be at most 120 characters");
  }

  const rawSlug = typeof slug === "string" ? slug.trim() : "";
  if (!rawSlug) {
    throw new HttpError(400, "Slug is required");
  }
  if (rawSlug !== rawSlug.toLowerCase()) {
    throw new HttpError(400, "Slug must be lowercase");
  }
  if (/\s/.test(rawSlug)) {
    throw new HttpError(400, "Slug must not contain spaces");
  }
  if (!SLUG_PATTERN.test(rawSlug) || rawSlug.length > 64) {
    throw new HttpError(
      400,
      "Slug must be lowercase letters, numbers, and hyphens only (e.g. acme-courier)"
    );
  }
  if (rawSlug === PLATFORM_TENANT_SLUG) {
    throw new HttpError(400, "This slug is reserved");
  }

  const existing = await prisma.tenant.findUnique({ where: { slug: rawSlug } });
  if (existing) {
    throw new HttpError(409, "A tenant with this slug already exists");
  }

  const plan = await prisma.subscriptionPlan.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (!plan) {
    throw new HttpError(400, "No subscription plan exists. Create a plan first.");
  }

  return prisma.tenant.create({
    data: {
      name: trimmedName,
      slug: rawSlug,
      subscriptionPlanId: plan.id,
    },
    include: { subscriptionPlan: true },
  });
}

async function listUsers({ role }) {
  const where = {};
  if (role && ALL_ROLES.includes(role)) {
    where.role = role;
  }
  return prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      tenantId: true,
      createdAt: true,
      tenant: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function createUserBySuperAdmin({ name, email, password, role, tenantId }) {
  if (!ALL_ROLES.includes(role)) {
    throw new HttpError(400, "Invalid role");
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    throw new HttpError(404, "Tenant not found");
  }

  const platformTenantId = await getPlatformTenantId();

  if (role === UserRole.SUPER_ADMIN) {
    if (!platformTenantId || tenantId !== platformTenantId || tenant.slug !== PLATFORM_TENANT_SLUG) {
      throw new HttpError(400, "Super admin users must belong to the platform tenant");
    }
  } else if (tenant.slug === PLATFORM_TENANT_SLUG) {
    throw new HttpError(400, "Only super admins may belong to the platform tenant");
  }

  const existing = await prisma.user.findUnique({
    where: { tenantId_email: { tenantId, email } },
  });
  if (existing) {
    throw new HttpError(409, "An account with this email already exists for this organization");
  }

  if (role === UserRole.DELIVERY_AGENT) {
    const created = await createDeliveryAgentForTenant(tenantId, { name, email, password });
    return prisma.user.findUnique({
      where: { id: created.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        createdAt: true,
        tenant: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  return prisma.user.create({
    data: {
      tenantId,
      email,
      name: name?.trim() || null,
      passwordHash,
      role,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      tenantId: true,
      createdAt: true,
      tenant: { select: { id: true, name: true, slug: true } },
    },
  });
}

module.exports = {
  listTenants,
  createTenant,
  listUsers,
  createUserBySuperAdmin,
};
