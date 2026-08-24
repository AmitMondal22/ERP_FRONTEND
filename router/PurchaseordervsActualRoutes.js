const express = require("express");
const router = express.Router();

const purchaseOrderVsActualController = require("../controller/Purchaseordervsactualcontroller");
const authcheck = require('../middleware/auth')

// adjust the path above to wherever you place the controller file
// (e.g. "../controllers/purchaseOrderVsActualController")

// If your other PO/purchase routes go through an auth middleware
// (e.g. to populate req.user), keep the same pattern here:
// const { authenticate } = require("../middleware/auth");

// --------------------------------------------------
// PO vs Actual Purchase Report
// Body: { project_id, site_id (optional), fromDate, toDate }
// --------------------------------------------------
router.post(
    "/api/purchase-order-vs-actual-report", authcheck,
    // authenticate,   // uncomment if this report needs a logged-in user
    purchaseOrderVsActualController.getPurchaseOrderVsActualPurchaseReport
);

module.exports = router;