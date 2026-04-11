const { Router } = require("express");
const trackController = require("../controllers/trackController");

const router = Router();

router.get("/:trackingId", trackController.getByTrackingId);

module.exports = router;
