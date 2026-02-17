const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const controller =require("../controller/damagedProductController");

const FileUploader = require("../helper/fileUpload");

const upload = new FileUploader({

  folderName: "uploads/all",

  supportedFiles: [

    // Images
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/svg+xml",
    "image/webp",

    // PDF
    "application/pdf",

    // DOC
    "application/msword",

    // DOCX
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    // CSV
    "text/csv",

    // XLS
    "application/vnd.ms-excel",

    // XLSX
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    // PPT
"application/vnd.ms-powerpoint",

// PPTX
"application/vnd.openxmlformats-officedocument.presentationml.presentation"


  ],

  fieldSize: 1024 * 1024 * 10 // 10MB

}).upload();



router.post("/api/createdamageclaim", auth, controller.createClaim);


router.post(
"/api/createdamageclaim/upload-image",
auth,
//upload.single("image"),
upload.array("image", 10),

controller.addClaimImage
);

router.get("/api/getalldamageclaim", auth, controller.getAllClaims);


router.get("/api/approve/:id",auth,controller.approveClaim);





router.get("/:id", auth, controller.getClaimById);
 
router.put("/:id", auth, controller.updateClaim);

router.delete("/:id", auth, controller.deleteClaim);


module.exports = router;
