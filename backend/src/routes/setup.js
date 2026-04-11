const { Router } = require("express");
const setupController = require("../controllers/setupController");

const router = Router();

router.get("/status", setupController.status);
router.post("/", setupController.bootstrap);

module.exports = router;
