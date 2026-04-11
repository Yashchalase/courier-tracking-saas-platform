function tenantScope(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  req.tenantId = req.user.tenantId;
  next();
}

module.exports = { tenantScope };
