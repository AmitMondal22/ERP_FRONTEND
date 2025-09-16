// const validateBase64Image = require("../utils/validateBase64Image");

const validateImageMiddleware = (req, res, next) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: "Image is required." });
  }

  const validation = ''//validateBase64Image(image);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  req.image = {
    mimeType: validation.mimeType,
    buffer: validation.buffer,
  };

  next();
};

module.exports = validateImageMiddleware;
