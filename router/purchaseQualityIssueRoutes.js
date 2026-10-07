const express = require("express");
const router = express.Router();
const purchaseQualityIssueController = require("../controller/purchaseQualityIssueController");
const authcheck = require("../middleware/auth");

// Get all quality issues with filtering
router.get(
  "/api/getall-purchase-quality-issues",
  authcheck,
  purchaseQualityIssueController.getAllQualityIssues
);

// Resolve a quality issue
router.put(
  "/api/resolve-purchase-quality-issue/:id",
  authcheck,
  purchaseQualityIssueController.resolveQualityIssue
);

// Resend email to vendor
router.post(
  "/api/resend-vendor-quality-email/:id",
  authcheck,
  purchaseQualityIssueController.resendVendorEmail
);

module.exports = router;
