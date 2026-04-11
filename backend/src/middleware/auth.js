const { verifyAccessToken } = require("../utils/jwt");

function auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        data: null,
        message: "Missing or invalid Authorization header",
      });
    }

    const token = header.slice("Bearer ".length).trim();
    if (!token) {
      return res.status(401).json({
        success: false,
        data: null,
        message: "Missing bearer token",
      });
    }

    const decoded = verifyAccessToken(token);
    const userId = decoded.userId;
    const tenantId = decoded.tenantId;
    const role = decoded.role;

    if (!userId || !tenantId || role == null) {
      return res.status(401).json({
        success: false,
        data: null,
        message: "Invalid token payload",
      });
    }

    req.user = {
      id: userId,
      userId,
      tenantId,
      role,
    };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      data: null,
      message: "Invalid or expired token",
    });
  }
}

module.exports = { auth };
