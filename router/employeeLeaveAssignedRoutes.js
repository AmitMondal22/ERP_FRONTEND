const express = require("express");
const router = express.Router();
const authcheck= require('../middleware/auth');


const employeeleaveassignedController = require("../controller/employeeLeaveAssignedController")

router.post("/api/create-employee-leave", authcheck,employeeleaveassignedController.createEmployeeLeave);
router.get("/api/get-all-employee-leave-assigned", authcheck,employeeleaveassignedController.getAllEmployeeleaveAssigned);

router.get("/api/get-employee-leave/:employee_id", authcheck,employeeleaveassignedController.getEmployeeleaveByEmployeeId);
router.post("/api/updateemployeeleaveassigned/:employee_id", authcheck,employeeleaveassignedController.updateEmployeeLeavebyEmployeeId);

router.delete("/api/leave-assigned/:employee_id", authcheck,employeeleaveassignedController.deleteByEmployeeId);


module.exports = router;
