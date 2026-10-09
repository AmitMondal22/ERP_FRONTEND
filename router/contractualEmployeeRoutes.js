const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const FileUploader = require("../helper/fileUpload");
const controller = require("../controller/contractualEmployeeController");

// Configure file uploader for aadhar & employee photos
const uploadEmployeeDocs = new FileUploader({
  folderName: "uploads/contractual_employees",
  supportedFiles: [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "application/pdf",
  ],
  fieldSize: 1024 * 1024 * 10, // 10MB
})
  .upload()
  .fields([
    { name: "aadhar_photo", maxCount: 1 },
    { name: "employee_photo", maxCount: 1 },
  ]);

router.post(
  "/api/contractual-employees",
  auth,
  uploadEmployeeDocs,
  controller.createEmployee
);

router.post(
  "/api/contractual-employees/verify-aadhaar",
  auth,
  controller.verifyAadhaar
);

router.get("/api/contractual-employees", auth, controller.getAllEmployees);

router.get("/api/contractual-employees/team-leads", auth, controller.getTeamLeads);

router.get("/api/contractual-employees/:id", auth, controller.getEmployeeById);

router.put(
  "/api/contractual-employees/:id",
  auth,
  uploadEmployeeDocs,
  controller.updateEmployee
);

router.post(
  "/api/contractual-employees/update/:id",
  auth,
  uploadEmployeeDocs,
  controller.updateEmployee
);

router.delete("/api/contractual-employees/:id", auth, controller.deleteEmployee);

module.exports = router;
