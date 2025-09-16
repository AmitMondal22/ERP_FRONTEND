const express = require("express");
const router = express.Router();
const authcheck = require("../middleware/auth");

// helper: validate base64 image
function validateBase64Image(base64String) {
  // Check format
  const matches = base64String.match(/^data:(image\/(jpeg|jpg|png));base64,(.+)$/);
  if (!matches) {
    return { valid: false, error: "Invalid image format. Allowed: jpg, jpeg, png." };
  }

  const mimeType = matches[1];
  const base64Data = matches[3];

  // Decode and check size
  const buffer = Buffer.from(base64Data, "base64");
  const fileSizeInBytes = buffer.length;
  const maxSize = 10 * 1024 * 1024; // 10 MB

  if (fileSizeInBytes > maxSize) {
    return { valid: false, error: "Image size exceeds 10MB limit." };
  }

  return { valid: true, mimeType, buffer };
}

// POST /upload_image
router.post("/upload_image", authcheck, async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Image is required." });
    }

    const validation = validateBase64Image(image);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Save file (example: local storage - you can adapt to cloud storage)
    const extension = validation.mimeType.split("/")[1];
    const fileName = `upload_${Date.now()}.${extension}`;
    const fs = require("fs");
    const path = require("path");
    const filePath = path.join(__dirname, "../uploads", fileName);

    fs.writeFileSync(filePath, validation.buffer);

    return res.json({
      message: "Image uploaded successfully",
      fileName,
      path: `/uploads/${fileName}`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
