const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dai9b5nyl",
  api_key: process.env.CLOUDINARY_API_KEY || "282514218259123",
  api_secret: process.env.CLOUDINARY_API_SECRET || "0HN_YBAlgsUKRxokASovzs7EVLY",
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
