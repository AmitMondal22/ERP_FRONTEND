const express = require("express");
const router = express.Router();
const payslipController = require("../controller/employeePaySlipcontroller");
const authcheck= require('../middleware/auth');

router.post("/api/createpayslips",authcheck, payslipController.createPayslip);

router.get("/api/getallpayslips",authcheck, payslipController.getAllPayslips);

router.get("/api/getpayslipbyid/:id",authcheck, payslipController.getPayslipById);

router.post("/api/updatepayslips/:id",authcheck, payslipController.updatePayslip);

router.delete("/api/deletepayslips/:id",authcheck, payslipController.deletePayslip);

module.exports = router;
