const QRCode = require("qrcode");

async function toDataURL(text, options) {
  return QRCode.toDataURL(text, options);
}

async function toBuffer(text, options) {
  return QRCode.toBuffer(text, options);
}

module.exports = {
  toDataURL,
  toBuffer,
};
