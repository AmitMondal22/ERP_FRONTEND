// validateBase64Image.js
const validateBase64Image = (base64String) => {
  // Check format: only jpg, jpeg, png
  const matches = base64String.match(/^data:(image\/(jpeg|jpg|png));base64,(.+)$/);
  if (!matches) {
    return { valid: false, error: "Invalid image format. Allowed: jpg, jpeg, png." };
  }

  const mimeType = matches[1];
  const base64Data = matches[3];

  // Decode and check size (max 10MB)
  const buffer = Buffer.from(base64Data, "base64");
  const fileSizeInBytes = buffer.length;
  const maxSize = 10 * 1024 * 1024; // 10 MB

  if (fileSizeInBytes > maxSize) {
    return { valid: false, error: "Image size exceeds 10MB limit." };
  }

  return { valid: true, mimeType, buffer };
};

module.exports = validateBase64Image;
