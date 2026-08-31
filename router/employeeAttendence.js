const express = require("express");
const router = express.Router();
const authcheck = require("../middleware/auth");
const attendanceController = require("../controller/attendenceController");
const FileUploader = require("../helper/fileUpload");

// File Uploader configuration for Mobile Attendance Images
const fileUploader = new FileUploader({
  folderName: "uploads/attendance_images",
  supportedFiles: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
  fieldSize: 1024 * 1024 * 10, // 10MB
});

const upload = fileUploader.upload();

/* =========================================================
   WEB ATTENDANCE ROUTES
   ========================================================= */
router.post(
  "/api/createorupdateattendence",
  authcheck,
  upload.array("images", 5),
  attendanceController.createOrUpdateAttendance
);

router.get(
  "/api/getallattendence",
  authcheck,
  attendanceController.getAllAttendance
);

router.get(
  "/api/getattendencebyid/:id",
  authcheck,
  attendanceController.getAttendanceById
);

router.delete(
  "/api/delete-attendence/:id",
  authcheck,
  attendanceController.deleteAttendance
);

router.post(
  "/api/getemployeeattendencedaywise",
  authcheck,
  attendanceController.getDailyEmployeeAttendance
);

/* =========================================================
   MOBILE ATTENDANCE SYSTEM ROUTES (WITH IMAGES & GEOLOCATION)
   ========================================================= */
router.post(
  "/api/mobile/attendance",
  authcheck,
  upload.array("images", 5),
  attendanceController.recordMobileAttendance
);

router.get(
  "/api/mobile/attendance/history",
  authcheck,
  attendanceController.getMobileAttendanceHistory
);

router.get(
  "/api/attendance/images/:attendance_id",
  authcheck,
  attendanceController.getAttendanceImages
);

module.exports = router;