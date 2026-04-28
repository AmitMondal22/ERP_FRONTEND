const express = require("express");
const router  = express.Router();
const WorkBillingController = require("../controller/Workbillingcontroller");

const authcheck= require('../middleware/auth')


// POST   /work-billing              → create new billing order + details
router.post(   "/api/create-Work-billing-order",        authcheck,       WorkBillingController.create);

// GET    /work-billing              → get all (filter: ?project_id=&project_site_id=&billing_status=)
router.get(    "/api/getAllWorkBillingDetails",               WorkBillingController.getAll);

// GET    /work-billing/:id          → get one by PK (with detail rows)
router.get(    "/:id",            WorkBillingController.getById);

// GET    /work-billing/history/:invoice_no → all versions of an invoice
router.get(    "/history/:invoice_no", WorkBillingController.getHistoryByInvoiceNo);

// PUT    /work-billing/:id          → versioned update (inserts new row, keeps old)
router.put(    "/api/update-Work-billing-order/:id",            WorkBillingController.update);

// PATCH  /work-billing/:id/status   → status-only update (no versioning)
router.patch(  "/:id/status",     WorkBillingController.updateStatus);

// DELETE /work-billing/:id          → hard delete (cascades to details)
router.delete( "/:id",            WorkBillingController.delete);


router.post("/api/work-billing/by-project-id",  authcheck, WorkBillingController.getAllWorkBillingByProjectId);

module.exports = router;