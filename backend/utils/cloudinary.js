const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "demo",
  api_key: process.env.CLOUDINARY_API_KEY || "894132867493631",
  api_secret: process.env.CLOUDINARY_API_SECRET || "C303E_k7o4yG3iU-Kk4jF21nEow",
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
