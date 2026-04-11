const { Router } = require("express");
const adminController = require("../controllers/adminController");
const { auth } = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");
const { UserRole } = require("@prisma/client");

const router = Router();

router.use(auth, requireRole(UserRole.SUPER_ADMIN));

router.get("/tenants", adminController.listTenants);
router.post("/tenants", adminController.createTenant);
router.get("/users", adminController.listUsers);
router.post("/users", adminController.createUser);

module.exports = router;
