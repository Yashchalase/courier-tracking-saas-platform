const { body, param, query, validationResult } = require("express-validator");
const hubService = require("../services/hubService");
const routeOptimizationService = require("../services/routeOptimizationService");
const { recordAudit } = require("../services/auditService");
const { asyncHandler, HttpError } = require("../middleware/errorHandler");
const { success } = require("../utils/apiResponse");

const list = asyncHandler(async (req, res) => {
  const hubs = await hubService.listForTenant(req.tenantId);
  res.json({ hubs });
});

const create = [
  body("name").trim().notEmpty(),
  body("address").trim().notEmpty(),
  body("city").trim().notEmpty(),
  body("lat").isFloat(),
  body("lng").isFloat(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const hub = await hubService.createForTenant(req.tenantId, req.body);
    void recordAudit({
      userId: req.user.id,
      tenantId: req.tenantId,
      action: "HUB_CREATE",
      entity: "Hub",
      entityId: hub.id,
    });
    success(res, { hub }, "Hub created", 201);
  }),
];

const update = [
  param("id").isString().trim().notEmpty(),
  body("name").optional().isString().trim().notEmpty(),
  body("address").optional().isString().trim().notEmpty(),
  body("city").optional().isString().trim().notEmpty(),
  body("lat").optional().isFloat(),
  body("lng").optional().isFloat(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const keys = ["name", "address", "city", "lat", "lng"];
    if (!keys.some((k) => req.body[k] !== undefined)) {
      throw new HttpError(400, "At least one field is required");
    }
    const hub = await hubService.updateForTenant(
      req.tenantId,
      req.params.id,
      req.body
    );
    void recordAudit({
      userId: req.user.id,
      tenantId: req.tenantId,
      action: "HUB_UPDATE",
      entity: "Hub",
      entityId: hub.id,
    });
    success(res, { hub }, "Hub updated");
  }),
];

const optimizeRoute = [
  body("hubIds").isArray({ min: 2 }),
  body("hubIds.*").isString().trim().notEmpty(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const result = await routeOptimizationService.optimizeHubOrder(
      req.tenantId,
      req.body.hubIds
    );
    res.json(result);
  }),
];

const routePreview = [
  query("fromHubId").isString().trim().notEmpty(),
  query("toHubId").isString().trim().notEmpty(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const leg = await routeOptimizationService.routeLegKm(
      req.tenantId,
      req.query.fromHubId,
      req.query.toHubId
    );
    res.json(leg);
  }),
];

module.exports = {
  list,
  create,
  update,
  optimizeRoute,
  routePreview,
};
