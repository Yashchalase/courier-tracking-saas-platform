const { Router } = require("express");
const companyController = require("../controllers/companyController");
const { auth } = require("../middleware/auth");
const { tenantScope } = require("../middleware/tenantScope");
const { requireRole } = require("../middleware/rbac");
const { UserRole } = require("@prisma/client");

const router = Router();

router.use(auth, tenantScope, requireRole(UserRole.COMPANY_ADMIN));

router.post("/agents", companyController.createAgent);

module.exports = router;
