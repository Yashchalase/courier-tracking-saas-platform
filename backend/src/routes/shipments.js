const { Router } = require("express");
const shipmentController = require("../controllers/shipmentController");
const { auth } = require("../middleware/auth");
const { tenantScope } = require("../middleware/tenantScope");
const { requireRole } = require("../middleware/rbac");
const { UserRole } = require("@prisma/client");
const { uploadProofOptional } = require("../middleware/uploadShipmentProof");

const router = Router();

router.use(auth, tenantScope);

router.post(
  "/",
  requireRole(UserRole.COMPANY_ADMIN, UserRole.CUSTOMER),
  shipmentController.create
);
router.get(
  "/",
  requireRole(
    UserRole.COMPANY_ADMIN,
    UserRole.DELIVERY_AGENT,
    UserRole.CUSTOMER
  ),
  shipmentController.list
);
router.get(
  "/predicted-eta",
  requireRole(UserRole.COMPANY_ADMIN, UserRole.CUSTOMER),
  shipmentController.predictedEta
);
router.get(
  "/agent-lookup",
  requireRole(UserRole.DELIVERY_AGENT),
  shipmentController.agentLookup
);
router.patch(
  "/:id/status",
  requireRole(UserRole.COMPANY_ADMIN, UserRole.DELIVERY_AGENT),
  shipmentController.updateStatus
);
router.post(
  "/:id/status",
  requireRole(UserRole.COMPANY_ADMIN, UserRole.DELIVERY_AGENT),
  shipmentController.updateStatus
);
router.patch(
  "/:id/hubs",
  requireRole(UserRole.COMPANY_ADMIN),
  shipmentController.updateHubs
);
router.patch(
  "/:id/assign-agent",
  requireRole(UserRole.COMPANY_ADMIN),
  shipmentController.assignAgent
);
router.post(
  "/:id/assign-agent",
  requireRole(UserRole.COMPANY_ADMIN),
  shipmentController.assignAgent
);
router.post(
  "/:id/events",
  uploadProofOptional,
  requireRole(UserRole.COMPANY_ADMIN, UserRole.DELIVERY_AGENT),
  shipmentController.createEvent
);
router.get(
  "/:id/qr",
  requireRole(
    UserRole.COMPANY_ADMIN,
    UserRole.DELIVERY_AGENT,
    UserRole.CUSTOMER
  ),
  shipmentController.qr
);
router.get(
  "/:id",
  requireRole(
    UserRole.COMPANY_ADMIN,
    UserRole.DELIVERY_AGENT,
    UserRole.CUSTOMER
  ),
  shipmentController.getById
);

module.exports = router;
