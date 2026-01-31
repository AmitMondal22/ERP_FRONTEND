const express = require("express");
const router = express.Router();
const authcheck = require("../middleware/auth");
const SiteImageController = require("../controller/siteImageController");
const validateImageMiddleware = require("../middleware/uploadValidate");

// router.use(express.json({ limit: "15mb" }));
// router.use(express.urlencoded({ extended: true, limit: "15mb" }));



// const fileUploader = require("../helper/fileUpload");

// const fileUpload = new fileUploader({
//   folderName: "uploads",
//   supportedFiles: ["image/png", "image/jpg", "image/jpeg", "image/pdf"],
//   fieldSize: 1024 * 1024 * 5,
// });

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