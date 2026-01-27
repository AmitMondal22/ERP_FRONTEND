const express = require("express");
const router = express.Router();
const SalaryController = require("../controller/salaryController");

const authcheck= require('../middleware/auth');

router.post("/api/createsalary",authcheck, SalaryController.createSalary);
router.get("/api/getallsalary", authcheck,SalaryController.getAllSalaries);

//router.get("/api/salary/:em_salary_id", authcheck,SalaryController.getSalaryById);


router.post("/api/salary/:employee_id", authcheck,SalaryController.updateSalary);

router.delete("/api/salary/:em_salary_id", authcheck,SalaryController.deleteSalary);

router.get("/api/getsalarydetails/employee/:employee_id", authcheck, SalaryController.getSalaryByEmployeeId)

module.exports = router;
