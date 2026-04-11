const { body, validationResult } = require("express-validator");
const authService = require("../services/authService");
const { HttpError } = require("../middleware/errorHandler");

function authAsyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      if (err instanceof HttpError) {
        return res.status(err.statusCode).json({
          success: false,
          data: null,
          message: err.message,
        });
      }
      next(err);
    });
  };
}

const registerValidators = [
  body("email").isEmail().normalizeEmail(),
  body("password")
    .isString()
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters"),
  body("tenantSlug").isString().trim().notEmpty(),
];

const register = [
  ...registerValidators,
  authAsyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        data: { errors: errors.array() },
        message: "Validation failed",
      });
    }
    const result = await authService.register(req.body);
    res.status(201).json({
      success: true,
      data: result,
      message: "Registration successful",
    });
  }),
];

const loginValidators = [
  body("email").isEmail().normalizeEmail(),
  body("password").isString().notEmpty(),
  body("tenantSlug").isString().trim().notEmpty(),
];

const login = [
  ...loginValidators,
  authAsyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        data: { errors: errors.array() },
        message: "Validation failed",
      });
    }
    const result = await authService.login(req.body);
    res.json({
      success: true,
      data: result,
      message: "Login successful",
    });
  }),
];

const me = authAsyncHandler(async (req, res) => {
  const profile = await authService.getProfileById(req.user.id);
  res.json({
    success: true,
    data: { user: profile },
    message: "OK",
  });
});

module.exports = {
  register,
  login,
  me,
};
