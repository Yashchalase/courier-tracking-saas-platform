const { Router } = require("express");
const authController = require("../controllers/authController");
const { auth } = require("../middleware/auth");

const router = Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    data: {
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
      me: "GET /api/auth/me",
    },
    message: "Auth routes (mounted at /api/auth)",
  });
});

router.post("/register", ...authController.register);
router.post("/login", ...authController.login);
router.get("/me", auth, authController.me);

module.exports = router;
