const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");

function signAccessToken(payload) {
  return jwt.sign(payload, jwtSecret, { expiresIn: "7d" });
}

function verifyAccessToken(token) {
  return jwt.verify(token, jwtSecret);
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
};
