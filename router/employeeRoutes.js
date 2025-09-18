const express = require("express");
const router = express.Router();
const employeeController = require("../controller/employeeController");

const authcheck= require('../middleware/auth')


router.post("/api/add_employee",authcheck, employeeController.addEmployee);


router.get("/api/get_all_employee",authcheck, employeeController.getAllemployee);


router.get("/api/get_employee/:employee_id",authcheck, employeeController.getEmployeeById);

router.post("/api/update_employee/:id",authcheck, employeeController.updateEmployee);

router.delete("/api/delete_employee/:id",authcheck, employeeController.deleteEmployee);

module.exports = router;
