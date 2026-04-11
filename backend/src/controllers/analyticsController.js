const analyticsService = require("../services/analyticsService");
const { asyncHandler } = require("../middleware/errorHandler");
const { success } = require("../utils/apiResponse");

const summary = asyncHandler(async (req, res) => {
  const data = await analyticsService.getTenantSummary(req.tenantId);
  success(res, data, "Analytics summary retrieved");
});

module.exports = {
  summary,
};
