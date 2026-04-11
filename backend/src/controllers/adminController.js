const { body, query, validationResult } = require("express-validator");
const { UserRole } = require("@prisma/client");
const adminService = require("../services/adminService");
const { recordAudit } = require("../services/auditService");
const { asyncHandler } = require("../middleware/errorHandler");

const listTenants = asyncHandler(async (req, res) => {
  const tenants = await adminService.listTenants();
  res.json({ tenants });
});

const listUsers = [
  query("role")
    .optional()
    .isIn(Object.values(UserRole))
    .withMessage("Invalid role filter"),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Validation failed", details: errors.array() });
    }
    const users = await adminService.listUsers({ role: req.query.role });
    res.json({ users });
  }),
];

const createTenantValidators = [
  body("name").isString().trim().isLength({ min: 1, max: 120 }),
  body("slug").isString().trim().isLength({ min: 1, max: 64 }),
];

const createTenant = [
  ...createTenantValidators,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Validation failed", details: errors.array() });
    }
    const tenant = await adminService.createTenant({
      name: req.body.name,
      slug: req.body.slug,
    });
    void recordAudit({
      userId: req.user.id,
      tenantId: req.user.tenantId,
      action: "TENANT_CREATE",
      entity: "Tenant",
      entityId: tenant.id,
    });
    res.status(201).json({ tenant });
  }),
];

const createUserValidators = [
  body("name").optional().isString().trim().isLength({ min: 1, max: 120 }),
  body("email").isEmail().normalizeEmail(),
  body("password")
    .isString()
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters"),
  body("role").isIn(Object.values(UserRole)),
  body("tenantId").isString().trim().notEmpty(),
];

const createUser = [
  ...createUserValidators,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Validation failed", details: errors.array() });
    }
    const user = await adminService.createUserBySuperAdmin({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role,
      tenantId: req.body.tenantId,
    });
    void recordAudit({
      userId: req.user.id,
      tenantId: req.user.tenantId,
      action: "USER_CREATE",
      entity: "User",
      entityId: user.id,
    });
    res.status(201).json({ user });
  }),
];

module.exports = {
  listTenants,
  createTenant,
  listUsers,
  createUser,
};
