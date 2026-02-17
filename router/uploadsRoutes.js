const express = require("express");
const router = express.Router();
const authcheck = require("../middleware/auth");
const SiteImageController = require("../controller/siteImageController");
const validateImageMiddleware = require("../middleware/uploadValidate");


const FileUploader = require("../helper/fileUpload");

const fileUploader = new FileUploader({
  folderName: "uploads/site_image",
  supportedFiles: ["image/png", "image/jpeg", "image/jpg", "application/pdf"],
  fieldSize: 1024 * 1024 * 10, // 10MB max
});

const upload = fileUploader.upload();
 


// helper: validate base64 image
router.post("/api/upload_image", authcheck, validateImageMiddleware, SiteImageController.createSiteImage);


router.post("/api/upload_invoice", authcheck, upload.single("upload_file"), SiteImageController.uploadSiteImage);

module.exports = router;
//