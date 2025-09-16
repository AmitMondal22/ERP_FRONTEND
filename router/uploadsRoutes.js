const express = require("express");
const router = express.Router();
const authcheck = require("../middleware/auth");
const SiteImageController = require("../controller/siteImageController");
const validateImageMiddleware = require("../middleware/uploadValidate");

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// helper: validate base64 image
router.post("/api/upload_image", authcheck, validateImageMiddleware, SiteImageController.createSiteImage);

module.exports = router;
