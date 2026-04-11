const { Router } = require("express");
const analyticsController = require("../controllers/analyticsController");
const { auth } = require("../middleware/auth");
const { tenantScope } = require("../middleware/tenantScope");
const { requireRole } = require("../middleware/rbac");
const { UserRole } = require("@prisma/client");

const router = Router();

router.get(
  "/summary",
  auth,
  tenantScope,
  requireRole(UserRole.COMPANY_ADMIN),
  analyticsController.summary
);

module.exports = router;
