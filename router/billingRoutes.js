const express = require("express");
const router = express.Router();
const authcheck= require('../middleware/auth');
const billingController = require("../controller/billingController");

// CREATE or UPDATE automatically
//router.post("/api/createpurchasestock", authcheck,billingController.createInvoice);

router.post("/api/createbillinginvoice",authcheck, billingController.createInvoice);
router.get("/api/getallbillinginvoice",authcheck, billingController.getAllInvoices);
   
router.post("/api/billingdatafullindetails",billingController.getBillingDataFullinDetails);
 
router.post("/api/billing/get-billable-boms", billingController.getBillableBoms)

// router.get("/invoice/:invoice_item_id", billingController.getInvoiceById);
// router.put("/invoice/:invoice_item_id", billingController.updateInvoice);
// router.delete("/invoice/:invoice_item_id", billingController.deleteInvoice);





module.exports = router;
