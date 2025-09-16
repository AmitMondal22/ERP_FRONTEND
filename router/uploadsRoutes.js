const express = require("express");
const router = express.Router();
const authcheck = require("../middleware/auth");
const SiteImageController = require("../controller/siteImageController");
const validateImageMiddleware = require("../middleware/uploadValidate");

// helper: validate base64 image
router.post("/upload_image", authcheck, validateImageMiddleware, SiteImageController.createSiteImage);

module.exports = router;
