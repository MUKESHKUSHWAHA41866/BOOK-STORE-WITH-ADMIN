const router = require("express").Router();
const { uploadImage } = require("../utils/cloudinary");
const { authenticateToken } = require("../middlewares/auth.middleware");

/**
 * POST /api/v1/upload
 * Single image upload via Cloudinary.
 * Expects multpart/form-data with a field named "image".
 */
router.post("/upload", authenticateToken, uploadImage.single("image"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    return res.status(200).json({
      status: "Success",
      message: "Image uploaded successfully",
      url: req.file.path,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
