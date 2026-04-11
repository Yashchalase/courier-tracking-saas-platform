require("./config/env");

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
