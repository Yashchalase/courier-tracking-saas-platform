const cloudinary = require("cloudinary").v2;
const { HttpError } = require("../middleware/errorHandler");

function ensureConfigured() {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!name || !key || !secret) {
    throw new HttpError(
      503,
      "Proof upload is not configured (missing CLOUDINARY_* environment variables)"
    );
  }
  cloudinary.config({
    cloud_name: name,
    api_key: key,
    api_secret: secret,
  });
}

/**
 * Upload a buffer as a shipment proof image. Returns HTTPS URL.
 */
async function uploadShipmentProof(buffer, folder = "shipment-proofs") {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}

module.exports = {
  uploadShipmentProof,
};
