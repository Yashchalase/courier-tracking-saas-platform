const { body, param, validationResult } = require("express-validator");
const subscriptionService = require("../services/subscriptionService");
const { recordAudit } = require("../services/auditService");
const { asyncHandler } = require("../middleware/errorHandler");
const { success } = require("../utils/apiResponse");

const listPlans = asyncHandler(async (req, res) => {
  const plans = await subscriptionService.listPlans();
  res.json({ plans });
});

const listPlansSuperAdmin = asyncHandler(async (req, res) => {
  const plans = await subscriptionService.listPlans();
  success(res, { plans }, "Plans retrieved");
});

const createPlan = [
  body("name").trim().notEmpty(),
  body("maxShipments").isInt({ min: 0 }),
  body("price").isFloat({ min: 0 }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const plan = await subscriptionService.createPlan(req.body);
    void recordAudit({
      userId: req.user.id,
      tenantId: req.user.tenantId,
      action: "SUBSCRIPTION_PLAN_CREATE",
      entity: "SubscriptionPlan",
      entityId: plan.id,
    });
    success(res, { plan }, "Plan created", 201);
  }),
];

const updatePlan = [
  param("id").isString().trim().notEmpty(),
  body("name").optional().isString().trim().notEmpty(),
  body("maxShipments").optional().isInt({ min: 0 }),
  body("price").optional({ nullable: true }).isFloat({ min: 0 }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const plan = await subscriptionService.updatePlan(req.params.id, req.body);
    void recordAudit({
      userId: req.user.id,
      tenantId: req.user.tenantId,
      action: "SUBSCRIPTION_PLAN_UPDATE",
      entity: "SubscriptionPlan",
      entityId: plan.id,
    });
    success(res, { plan }, "Plan updated");
  }),
];

const assignPlan = [
  body("tenantId").isString().trim().notEmpty(),
  body("subscriptionPlanId").isString().trim().notEmpty(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const tenant = await subscriptionService.assignPlanToTenant({
      tenantId: req.body.tenantId,
      subscriptionPlanId: req.body.subscriptionPlanId,
    });
    void recordAudit({
      userId: req.user.id,
      tenantId: req.user.tenantId,
      action: "SUBSCRIPTION_ASSIGN",
      entity: "Tenant",
      entityId: tenant.id,
    });
    success(res, { tenant }, "Plan assigned to tenant");
  }),
];

module.exports = {
  listPlans,
  listPlansSuperAdmin,
  createPlan,
  updatePlan,
  assignPlan,
};
