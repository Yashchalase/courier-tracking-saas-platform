const { body, param, query, validationResult } = require("express-validator");
const QRCode = require("qrcode");
const { ShipmentStatus } = require("@prisma/client");
const shipmentService = require("../services/shipmentService");
const deliveryPredictionService = require("../services/deliveryPredictionService");
const { uploadShipmentProof } = require("../services/cloudinaryService");
const { asyncHandler, HttpError } = require("../middleware/errorHandler");

const list = [
  query("status").optional().isIn(Object.values(ShipmentStatus)),
  query("assignedAgentId").optional().isString().trim(),
  query("senderId").optional().isString().trim(),
  query("originHubId").optional().isString().trim(),
  query("destinationHubId").optional().isString().trim(),
  query("trackingId").optional().isString().trim(),
  query("page").optional({ values: "falsy" }).isInt({ min: 1 }),
  query("limit").optional({ values: "falsy" }).isInt({ min: 1, max: 100 }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const result = await shipmentService.listForTenant(
      req.tenantId,
      req.user.role,
      req.user.id,
      req.query
    );
    res.json(result);
  }),
];

const predictedEta = [
  query("originHubId").isString().trim().notEmpty(),
  query("destinationHubId").isString().trim().notEmpty(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const prediction = await deliveryPredictionService.predictedEtaForHubPair(
      req.tenantId,
      req.query.originHubId,
      req.query.destinationHubId
    );
    res.json({ prediction });
  }),
];

const agentLookup = [
  query("trackingId").isString().trim().notEmpty(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const shipment = await shipmentService.lookupByTrackingForAssignedAgent(
      req.tenantId,
      req.user.id,
      req.query.trackingId
    );
    res.json({ shipment });
  }),
];

const getById = [
  param("id").isString().trim().notEmpty(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const shipment = await shipmentService.getByIdForTenant(
      req.tenantId,
      req.user.role,
      req.user.id,
      req.params.id
    );
    res.json({ shipment });
  }),
];

const create = [
  body("trackingId").trim().notEmpty(),
  body("recipientName").trim().notEmpty(),
  body("recipientEmail")
    .optional({ values: "falsy" })
    .trim()
    .isEmail()
    .withMessage("Invalid recipient email"),
  body("recipientPhone").trim().notEmpty(),
  body("recipientAddress").trim().notEmpty(),
  body("originHubId").trim().notEmpty(),
  body("destinationHubId").trim().notEmpty(),
  body("estimatedDelivery").optional({ nullable: true }).isISO8601(),
  body("senderId").optional({ nullable: true }).isString().trim(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const shipment = await shipmentService.createShipment({
      tenantId: req.tenantId,
      role: req.user.role,
      actorUserId: req.user.id,
      trackingId: req.body.trackingId,
      recipientName: req.body.recipientName,
      recipientEmail: req.body.recipientEmail,
      recipientPhone: req.body.recipientPhone,
      recipientAddress: req.body.recipientAddress,
      originHubId: req.body.originHubId,
      destinationHubId: req.body.destinationHubId,
      estimatedDelivery: req.body.estimatedDelivery,
      senderId: req.body.senderId,
    });
    res.status(201).json({ shipment });
  }),
];

const updateStatus = [
  param("id").isString().trim().notEmpty(),
  body("status").isIn(Object.values(ShipmentStatus)),
  body("note").optional({ nullable: true }).isString(),
  body("lat").optional({ nullable: true }).isFloat(),
  body("lng").optional({ nullable: true }).isFloat(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const shipment = await shipmentService.updateStatus({
      tenantId: req.tenantId,
      role: req.user.role,
      userId: req.user.id,
      shipmentId: req.params.id,
      status: req.body.status,
      note: req.body.note,
      lat: req.body.lat,
      lng: req.body.lng,
    });
    res.json({ shipment });
  }),
];

const updateHubs = [
  param("id").isString().trim().notEmpty(),
  body("originHubId").optional().isString().trim().notEmpty(),
  body("destinationHubId").optional().isString().trim().notEmpty(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { originHubId, destinationHubId } = req.body;
    if (originHubId === undefined && destinationHubId === undefined) {
      throw new HttpError(
        400,
        "Provide at least one of originHubId, destinationHubId"
      );
    }
    const shipment = await shipmentService.updateShipmentHubs({
      tenantId: req.tenantId,
      role: req.user.role,
      userId: req.user.id,
      shipmentId: req.params.id,
      originHubId,
      destinationHubId,
    });
    res.json({ shipment });
  }),
];

const assignAgent = [
  param("id").isString().trim().notEmpty(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if (!req.body || !Object.prototype.hasOwnProperty.call(req.body, "agentId")) {
      throw new HttpError(
        400,
        "agentId is required in the body (use null to unassign)"
      );
    }
    const raw = req.body.agentId;
    const agentId =
      raw === null || raw === undefined || raw === ""
        ? null
        : String(raw).trim();
    const shipment = await shipmentService.assignAgent({
      tenantId: req.tenantId,
      role: req.user.role,
      userId: req.user.id,
      shipmentId: req.params.id,
      agentId,
    });
    res.json({ shipment });
  }),
];

const createEvent = [
  param("id").isString().trim().notEmpty(),
  body("status")
    .optional({ values: "falsy" })
    .isIn(Object.values(ShipmentStatus)),
  body("note").optional({ nullable: true }).isString(),
  body("lat").optional({ nullable: true }).isFloat(),
  body("lng").optional({ nullable: true }).isFloat(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let proofImageUrl = null;
    if (req.file && req.file.buffer) {
      proofImageUrl = await uploadShipmentProof(req.file.buffer);
    }

    const shipment = await shipmentService.createEventWithOptionalProof({
      tenantId: req.tenantId,
      role: req.user.role,
      userId: req.user.id,
      shipmentId: req.params.id,
      status: req.body.status,
      note: req.body.note,
      lat: req.body.lat,
      lng: req.body.lng,
      proofImageUrl,
    });
    res.status(201).json({ shipment });
  }),
];

const qr = [
  param("id").isString().trim().notEmpty(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const trackingId = await shipmentService.getTrackingIdForQr(
      req.tenantId,
      req.user.role,
      req.user.id,
      req.params.id
    );
    const base = (process.env.PUBLIC_TRACKING_BASE_URL || "").replace(/\/$/, "");
    const payload = base
      ? `${base}/${encodeURIComponent(trackingId)}`
      : `${req.protocol}://${req.get("host")}/api/track/${encodeURIComponent(trackingId)}`;
    const buffer = await QRCode.toBuffer(payload, { type: "png", width: 320 });
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(buffer);
  }),
];

module.exports = {
  list,
  predictedEta,
  agentLookup,
  getById,
  create,
  updateStatus,
  updateHubs,
  assignAgent,
  createEvent,
  qr,
};
