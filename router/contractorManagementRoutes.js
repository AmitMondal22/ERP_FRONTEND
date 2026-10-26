const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const controller = require("../controller/contractorManagementController");

// =========================================================================
// 1. CONTRACTOR COMPANY ROUTES
// =========================================================================
router.get("/api/contractor-companies", auth, controller.getAllCompanies);
router.get("/api/contractor-companies/:id", auth, controller.getCompanyById);
router.post("/api/contractor-companies", auth, controller.createCompany);
router.put("/api/contractor-companies/:id", auth, controller.updateCompany);
router.delete("/api/contractor-companies/:id", auth, controller.deleteCompany);

// =========================================================================
// 2. TEAM BOM ASSIGNMENT ROUTES (Quantity, Rate & Grand Total Cost)
// =========================================================================
router.get("/api/contractor-team-boms", auth, controller.getAllBomAssignments);
router.get("/api/contractor-team-boms/:id", auth, controller.getBomAssignmentById);
router.post("/api/contractor-team-boms", auth, controller.createBomAssignment);
router.put("/api/contractor-team-boms/:id", auth, controller.updateBomAssignment);
router.delete("/api/contractor-team-boms/:id", auth, controller.deleteBomAssignment);
router.delete("/api/contractor-team-boms/:assignmentId/items/:itemId", auth, controller.deleteBomAssignmentItem);

// =========================================================================
// 3. ADVANCE PAYMENT & TDS TAX CUT ROUTES
// =========================================================================
router.get("/api/contractor-advances", auth, controller.getAllAdvances);
router.post("/api/contractor-advances", auth, controller.createAdvancePayment);
router.put("/api/contractor-advances/:id", auth, controller.updateAdvancePayment);
router.delete("/api/contractor-advances/:id", auth, controller.deleteAdvancePayment);

// =========================================================================
// 4. MACHINERY & EQUIPMENT DAMAGE PENALTY ROUTES
// =========================================================================
router.get("/api/contractor-damages", auth, controller.getAllDamages);
router.post("/api/contractor-damages", auth, controller.createDamage);
router.put("/api/contractor-damages/:id", auth, controller.updateDamage);
router.delete("/api/contractor-damages/:id", auth, controller.deleteDamage);

// =========================================================================
// 5. FINANCIAL RECONCILIATION & LEDGER SUMMARY
// =========================================================================
router.get("/api/contractor-financial-summary", auth, controller.getFinancialSummary);

module.exports = router;
