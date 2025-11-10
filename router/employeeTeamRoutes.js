const express = require("express");
const router = express.Router();
const authcheck= require('../middleware/auth');
const employeeTeamController = require("../controller/employeeTeamController");

router.post("/api/addemployeforteam",authcheck, employeeTeamController.addEmployee);
router.get("/api/getallemployeeinteaam",authcheck, employeeTeamController.getAllEmployees);
router.get("/api/employeeinteaam/:id",authcheck ,employeeTeamController.getEmployeeById);
router.get("/api/getallemployeebyteamId/:id",authcheck,employeeTeamController.getAllEmployeeByTeamId);

router.post('/api/getallemployeebyteam',authcheck,employeeTeamController.getAllEmployeeByTeamIdFromBody);

router.post("/api/updateemployeeinteaam/:id", authcheck,employeeTeamController.updateEmployee);
router.delete("/api/deleteemployeeinteaam/:id",authcheck, employeeTeamController.deleteEmployee);

router.post('/api/employee-team/reset',authcheck,employeeTeamController.resetActiveEmployeesAPI);
///////

module.exports = router;
