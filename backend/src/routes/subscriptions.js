const { Router } = require("express");
const subscriptionController = require("../controllers/subscriptionController");
const { auth } = require("../middleware/auth");
const { tenantScope } = require("../middleware/tenantScope");
const { requireRole } = require("../middleware/rbac");
const { UserRole } = require("@prisma/client");

const router = Router();

router.get("/plans", auth, tenantScope, subscriptionController.listPlans);

router.use(auth, requireRole(UserRole.SUPER_ADMIN));
router.get("/", subscriptionController.listPlansSuperAdmin);
router.post("/", subscriptionController.createPlan);
router.post("/assign", subscriptionController.assignPlan);
router.put("/:id", subscriptionController.updatePlan);

module.exports = router;
