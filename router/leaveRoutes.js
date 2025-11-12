const express = require("express");
const router = express.Router();
const leaveController= require('../controller/leaveTypeController')
const authcheck= require('../middleware/auth');


router.post("/api/createleave",authcheck,leaveController.createLeaveType);

router.get("/api/getallleave", authcheck,leaveController.getAllLeaveTypes);

router.get("/api/getleavetype/:id",authcheck,leaveController.getLeaveTypeById);

router.post("/api/updateleave/:id",authcheck,leaveController.updateLeaveType);

router.delete("/api/deleteleave/:id",authcheck, leaveController.deleteLeaveType);

module.exports = router;
