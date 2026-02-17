const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const FileUploader = require("../helper/fileUpload");

const controller = require("../controller/uploadFilesController");

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

  fieldSize: 1024 * 1024 * 10, // 10MB
}).upload();

router.post("/api/alltypeoffile/upload", auth, upload.array("image", 10), controller.uploadFile);

///api/alltypeoffile/upload

router.get("/:group_id", auth, controller.getFiles);

router.delete("/:id", auth, controller.deleteFile);

module.exports = router;
