const express = require("express");
const router = express.Router();
const authcheck= require('../middleware/auth');
const employeeTeamController = require("../controller/employeeTeamController");

router.post("/api/addemployeforteam",authcheck, employeeTeamController.addEmployee);
router.get("/api/getallemployeeinteaam",authcheck, employeeTeamController.getAllEmployees);
router.get("/api/employeeinteaam/:id",authcheck ,employeeTeamController.getEmployeeById);
router.get("/api/getallemployeesbyteamId/:id",authcheck,employeeTeamController.getAllEmployeeByTeamId);

router.get("/api/getemployeesforviewandaddinginteam/:id",authcheck,employeeTeamController.getAllEmployeeByTeamIdOnlyForAddingEmployeeToTeam)


router.post('/api/getallemployeebyteam',authcheck,employeeTeamController.getAllEmployeeByTeamIdFromBody);

router.post("/api/updateemployeeinteaam/:id", authcheck,employeeTeamController.updateEmployee);
router.delete("/api/deleteemployeeinteaam/:id",authcheck, employeeTeamController.deleteEmployee);


//getAllEmployeeByTeamIdOnlyForAddingEmployeeToTeam
router.post('/api/employee-team/reset',authcheck,employeeTeamController.resetActiveEmployeesAPI);
///////

module.exports = router;
