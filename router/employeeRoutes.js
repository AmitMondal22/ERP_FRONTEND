const express = require("express");
const router = express.Router();
const employeeController = require("../controller/employeeController");

const authcheck= require('../middleware/auth')


router.post("/api/add_employee",authcheck, employeeController.addEmployee);

router.get("/api/get_all_employee",authcheck, employeeController.getAllemployee);
router.get("/api/get_employee/:employee_id",authcheck, employeeController.getEmployeeById);
// router.post("/api/vendor/:id",authcheck, vendorController.updateVendor);
// router.post("/api/contact_person/:id",authcheck, vendorController.updateContactPerson);
// router.delete("/api/vendor/:id",authcheck, vendorController.deleteVendor);
// router.delete("/api/contact_person/:id",authcheck, vendorController.deleteContactPerson);

module.exports = router;
