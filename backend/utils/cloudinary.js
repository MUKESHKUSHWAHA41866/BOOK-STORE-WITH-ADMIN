const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// ─── Credentials must come from environment variables only ─────────────────────
// Remove || fallback defaults — hardcoded secrets in source code are a security risk.
// If any variable is missing, the app startup will fail clearly (see app.js requiredEnvVars).
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = multer({
  storage: new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "bookheaven",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 800, crop: "limit" }],
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

module.exports = { cloudinary, uploadImage };
