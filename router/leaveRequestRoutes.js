const express = require("express");
const router = express.Router();
const controller = require("../controller/employeeLeaverequestController");
const authcheck= require('../middleware/auth');

router.post("/api/createleaverequest",authcheck, controller.createLeaveRequest);
router.get("/api/getall-leave-request",authcheck, controller.getAllLeaveRequests);
router.get("/api/getall-leave-with-all-detais",authcheck,controller.getAllLeaveRequestsWithDetails)
router.get("/api/getleaveby/:id",authcheck, controller.getLeaveRequestById);
router.post("/api/updateleave/:id",authcheck, controller.updateLeaveRequest);
router.delete("/api/deleteleave/:id",authcheck, controller.deleteLeaveRequest);
router.post("/api/update-status/:id",authcheck,controller.updateLeaveStatus);

module.exports = router;
