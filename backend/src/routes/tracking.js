const { Router } = require("express");
const trackingController = require("../controllers/trackingController");

const router = Router();

router.get("/:trackingId", trackingController.getByTrackingId);

module.exports = router;
