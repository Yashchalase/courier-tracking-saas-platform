const bcrypt = require("bcrypt");
const { UserRole } = require("@prisma/client");
const prisma = require("../config/db");
const { signAccessToken } = require("../utils/jwt");
const { HttpError } = require("../middleware/errorHandler");

const BCRYPT_ROUNDS = 10;

function buildTokenPayload(user) {
  return {
    userId: user.id,
    tenantId: user.tenantId,
    role: user.role,
  };
}

async function register({ email, password, tenantSlug }) {
  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) {
    throw new HttpError(404, "Tenant not found");
  }

  const existing = await prisma.user.findUnique({
    where: {
      tenantId_email: { tenantId: tenant.id, email },
    },
  });
  if (existing) {
    throw new HttpError(409, "An account with this email already exists for this organization");
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      tenantId: tenant.id,
      role: UserRole.CUSTOMER,
    },
  });

  const token = signAccessToken(buildTokenPayload(user));

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
    },
  };
}

async function login({ email, password, tenantSlug }) {
  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) {
    throw new HttpError(401, "Invalid credentials");
  }

  const user = await prisma.user.findUnique({
    where: {
      tenantId_email: { tenantId: tenant.id, email },
    },
  });

  if (!user) {
    throw new HttpError(401, "Invalid credentials");
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new HttpError(401, "Invalid credentials");
  }

  const token = signAccessToken(buildTokenPayload(user));

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
    },
  };
}

async function getProfileById(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      tenantId: true,
      createdAt: true,
    },
  });
  if (!user) {
    throw new HttpError(404, "User not found");
  }
  return user;
}

module.exports = {
  register,
  login,
  getProfileById,
};
