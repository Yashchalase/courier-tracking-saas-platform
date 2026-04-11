const { param, validationResult } = require("express-validator");
const trackingService = require("../services/trackingService");
const { asyncHandler } = require("../middleware/errorHandler");

const getByTrackingId = [
  param("trackingId").isString().trim().notEmpty(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const shipment = await trackingService.getPublicByTrackingId(
      req.params.trackingId
    );
    res.json({ shipment });
  }),
];

module.exports = {
  getByTrackingId,
};
