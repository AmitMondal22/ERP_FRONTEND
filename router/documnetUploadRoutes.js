const express = require("express");
const router = express.Router();

const authcheck = require("../middleware/auth");
const documentUploadController = require("../controller/documnetUploadController");
const FileUploader = require("../helper/fileUpload");

/* =========================
   FILE UPLOADER CONFIG
   ========================= */
const fileUploader = new FileUploader({
  folderName: "uploads/site_image",
  supportedFiles: [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "application/pdf",
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ],
  fieldSize: 1024 * 1024 * 10 // 10MB
});

const upload = fileUploader.upload();

/* =========================
   ROUTES
   ========================= */

/**
 * 📌 CREATE DOCUMENTS (MULTIPLE FILES)
 * POST /api/documents
 */
router.post(
  "/api/createdocuments",
  authcheck,
  upload.array("files", 20),
  documentUploadController.createDocumentUpload
);
router.delete("/api/deletedocuments", authcheck, documentUploadController.deleteDocumentGroupbyGroupId);

/**
 * 📌 GET DOCUMENTS BY PROJECT ID
 * GET /api/documents/project/:project_id
 */
router.get(
  "/documents/project/:project_id",
  authcheck,
  documentUploadController.getByProjectId
);

/**
 * 📌 GET DOCUMENTS BY GROUP ID
 * GET /api/documents/group/:group_id
 */
router.get(
  "/api/documents/group/:group_id",
  authcheck,
  documentUploadController.getByGroupId
);

router.get(
  "/api/getalldocumentswithalldetails",
  authcheck,
  documentUploadController.getGroupedDocuments
);



/**
 * 📌 UPDATE DOCUMENT META (TITLE / REMARKS)
 * PUT /api/documents/:id
 */
router.put(
  "/documents/:id",
  authcheck,
  documentUploadController.updateDocument
);

/**
 * 📌 DELETE SINGLE DOCUMENT
 * DELETE /api/documents/:id
 */
// router.delete(
//   "/api/deletedocuments/:id",
//   authcheck,
//   documentUploadController.deleteDocumentGroupbyGroupId
// );

/**
 * 📌 DELETE FULL DOCUMENT GROUP
 * DELETE /api/documents/group/:group_id
 */

module.exports = router;
