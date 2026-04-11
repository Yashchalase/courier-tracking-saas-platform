const { param, validationResult } = require("express-validator");
const trackingService = require("../services/trackingService");
const { asyncHandler } = require("../middleware/errorHandler");
const { success } = require("../utils/apiResponse");

const getByTrackingId = [
  param("trackingId").isString().trim().notEmpty(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    const data = await trackingService.getPublicTrackByTrackingId(
      req.params.trackingId
    );
    success(res, data, "Tracking retrieved");
  }),
];

module.exports = {
  getByTrackingId,
};
