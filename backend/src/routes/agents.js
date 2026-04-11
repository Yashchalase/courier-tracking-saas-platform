const { Router } = require("express");
const agentController = require("../controllers/agentController");
const { auth } = require("../middleware/auth");
const { tenantScope } = require("../middleware/tenantScope");
const { requireRole } = require("../middleware/rbac");
const { UserRole } = require("@prisma/client");

const router = Router();

router.use(auth, tenantScope);

router.get(
  "/",
  requireRole(UserRole.COMPANY_ADMIN, UserRole.DELIVERY_AGENT),
  agentController.list
);
router.patch(
  "/:id/location",
  requireRole(UserRole.COMPANY_ADMIN, UserRole.DELIVERY_AGENT),
  agentController.updateLocation
);

module.exports = router;
