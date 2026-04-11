const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      cb(new Error("Only image uploads are allowed for proof"));
      return;
    }
    cb(null, true);
  },
});

function uploadProofOptional(req, res, next) {
  const ct = req.headers["content-type"] || "";
  if (!ct.includes("multipart/form-data")) {
    return next();
  }
  return upload.single("proof")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}

module.exports = {
  uploadProof: upload.single("proof"),
  uploadProofOptional,
};
