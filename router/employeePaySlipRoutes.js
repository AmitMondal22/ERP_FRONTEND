const express = require("express");
const router = express.Router();
const payslipController = require("../controller/employeePaySlipcontroller");
const authcheck= require('../middleware/auth');

//router.post("/api/createpayslips",authcheck, payslipController.createPayslip);

router.get("/api/getallpayslips",authcheck, payslipController.generateAllMonthlyPayslips);

 router.post("/api/getpayslipdataofusers",authcheck, payslipController.getPayslipsByDateRange);

 router.get("/api/getpayslipbyid/:payslip_id",authcheck, payslipController.getPayslipById);//


router.post("/api/my-payslip", authcheck,  payslipController.getMyPayslipByMonth);


 router.delete("/api/payslips/:payslip_id",authcheck,payslipController.deletePayslipById);

 router.post("/api/updatepayslip/:payslip_id",authcheck,payslipController.updatePayslipById);

// router.delete("/api/deletepayslips/:id",authcheck, payslipController.deletePayslip);

module.exports = router;
