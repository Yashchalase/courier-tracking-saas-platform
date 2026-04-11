const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

require("./config/env");

const { errorHandler } = require("./middleware/errorHandler");
const { globalLimiter } = require("./middleware/rateLimiter");

const authRoutes = require("./routes/auth");
const shipmentsRoutes = require("./routes/shipments");
const trackingRoutes = require("./routes/tracking");
const trackRoutes = require("./routes/track");
const agentsRoutes = require("./routes/agents");
const hubsRoutes = require("./routes/hubs");
const subscriptionsRoutes = require("./routes/subscriptions");
const analyticsRoutes = require("./routes/analytics");
const adminRoutes = require("./routes/admin");
const setupRoutes = require("./routes/setup");
const companyRoutes = require("./routes/company");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(globalLimiter);

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/setup", setupRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/shipments", shipmentsRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/track", trackRoutes);
app.use("/api/agents", agentsRoutes);
app.use("/api/hubs", hubsRoutes);
app.use("/api/subscriptions", subscriptionsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/company", companyRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    method: req.method,
    path: req.originalUrl,
  });
});

app.use(errorHandler);

module.exports = app;
