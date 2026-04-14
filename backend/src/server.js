require("./config/env");

// Prefer IPv4 over IPv6 in environments with broken IPv6 egress (e.g. some containers on Railway).
try {
  // Node 18+ supports this; keep optional to avoid runtime breakage.
  const dns = require("node:dns");
  if (typeof dns.setDefaultResultOrder === "function") {
    dns.setDefaultResultOrder("ipv4first");
  }
} catch (_) {
  // No-op: fall back to per-transport DNS lookup.
}

const { port } = require("./config/env");
const app = require("./app");

const server = app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
  console.log(
    "Auth: POST /api/auth/register | POST /api/auth/login | GET /api/auth/me | GET /api/auth"
  );
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${port} is already in use. Another Node process may be running this API; stop it or set a different PORT in .env.`
    );
  } else {
    console.error(err);
  }
  process.exit(1);
});
