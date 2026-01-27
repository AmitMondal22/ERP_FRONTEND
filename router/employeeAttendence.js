const express = require("express");
const router = express.Router();
const authcheck= require('../middleware/auth');

const attendanceController = require("../controller/attendenceController");

router.post("/api/createorupdateattendence", authcheck, attendanceController.createOrUpdateAttendance);

router.get("/api/getallattendence",authcheck ,attendanceController.getAllAttendance);

router.get("/api/getattendencebyid/:id", authcheck,attendanceController.getAttendanceById);

router.delete("/api/delete-attendence/:id",authcheck, attendanceController.deleteAttendance);

router.post("/api/getemployeeattendencedaywise",authcheck, attendanceController.getDailyEmployeeAttendance)

module.exports = router; 