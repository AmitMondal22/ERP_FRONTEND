const express = require("express");
const router = express.Router();

const ClaimAndReimbursementController = require("../controller/ClaimTypeReimbursementController");
const authcheck = require("../middleware/auth");

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
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],

  fieldSize: 1024 * 1024 * 10, // 10MB
}).upload();

router.post(
  "/api/create-claim",
  authcheck,
  upload.array("image", 10),
  ClaimAndReimbursementController.create,
);

router.get(
  "/api/getall/claims",
  authcheck,
  ClaimAndReimbursementController.getAll,
);

router.get(
  "/claims/paginate",
  authcheck,
  ClaimAndReimbursementController.getPaginated,
);
router.get(
  "/claims/status/:status",
  authcheck,
  ClaimAndReimbursementController.getByStatus,
);

router.get(
  "/api/claims/employee/:employeeId",
  authcheck,
  ClaimAndReimbursementController.getByEmployee,
);

router.get(
  "/claims/summary/:employeeId",
  authcheck,
  ClaimAndReimbursementController.getSummary,
);
router.get("/claims/:id", authcheck, ClaimAndReimbursementController.getById);

router.put("/claims/:id", authcheck, ClaimAndReimbursementController.update);
router.patch(
  "/claims/:id/status",
  authcheck,
  ClaimAndReimbursementController.updateStatus,
);
router.delete("/claims/:id", authcheck, ClaimAndReimbursementController.delete);

module.exports = router;
