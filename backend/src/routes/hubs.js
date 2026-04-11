const { Router } = require("express");
const hubController = require("../controllers/hubController");
const { auth } = require("../middleware/auth");
const { tenantScope } = require("../middleware/tenantScope");
const { requireRole } = require("../middleware/rbac");
const { UserRole } = require("@prisma/client");

const router = Router();

router.use(auth, tenantScope, requireRole(UserRole.COMPANY_ADMIN));

router.get("/", hubController.list);
router.get("/route-preview", hubController.routePreview);
router.post("/optimize-route", hubController.optimizeRoute);
router.post("/", hubController.create);
router.put("/:id", hubController.update);

module.exports = router;
