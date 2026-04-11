const { body, validationResult } = require("express-validator");
const setupService = require("../services/setupService");
const { asyncHandler, HttpError } = require("../middleware/errorHandler");

const status = asyncHandler(async (req, res) => {
  const needsSetup = await setupService.needsSetup();
  res.json({ needsSetup });
});

const bootstrapValidators = [
  body("name").optional().isString().trim().isLength({ min: 1, max: 120 }),
  body("email").isEmail().normalizeEmail(),
  body("password")
    .isString()
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters"),
];

const bootstrap = [
  ...bootstrapValidators,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Validation failed", details: errors.array() });
    }
    const needs = await setupService.needsSetup();
    if (!needs) {
      throw new HttpError(403, "Setup already completed");
    }
    const result = await setupService.bootstrapSuperAdmin({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    res.status(201).json({
      message: "Super admin created. Sign in with organization slug: platform",
      user: result.user,
      tenantSlug: result.tenantSlug,
    });
  }),
];

module.exports = {
  status,
  bootstrap,
};
