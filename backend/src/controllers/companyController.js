const { body, validationResult } = require("express-validator");
const { createDeliveryAgentForTenant } = require("../services/userProvisioningService");
const { recordAudit } = require("../services/auditService");
const { asyncHandler } = require("../middleware/errorHandler");

const createAgentValidators = [
  body("name").optional().isString().trim().isLength({ min: 1, max: 120 }),
  body("email").isEmail().normalizeEmail(),
  body("password")
    .isString()
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters"),
];

const createAgent = [
  ...createAgentValidators,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Validation failed", details: errors.array() });
    }
    const user = await createDeliveryAgentForTenant(req.tenantId, {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    void recordAudit({
      userId: req.user.id,
      tenantId: req.tenantId,
      action: "DELIVERY_AGENT_CREATE",
      entity: "User",
      entityId: user.id,
    });
    res.status(201).json({ agentUser: user });
  }),
];

module.exports = {
  createAgent,
};
