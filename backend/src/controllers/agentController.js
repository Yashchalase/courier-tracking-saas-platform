const { body, param, validationResult } = require("express-validator");
const agentService = require("../services/agentService");
const { asyncHandler } = require("../middleware/errorHandler");
const { success } = require("../utils/apiResponse");

const list = asyncHandler(async (req, res) => {
  const agents = await agentService.listForTenant(req.tenantId);
  res.json({ agents });
});

const updateLocation = [
  param("id").isString().trim().notEmpty(),
  body("lat").isFloat(),
  body("lng").isFloat(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const agent = await agentService.updateLocationForTenant(
      req.tenantId,
      req.params.id,
      { lat: req.body.lat, lng: req.body.lng },
      req.user.role,
      req.user.id
    );
    success(res, { agent }, "Location updated");
  }),
];

module.exports = {
  list,
  updateLocation,
};
