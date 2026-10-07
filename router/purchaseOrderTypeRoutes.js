const express = require("express");
const router = express.Router();
const purchaseOrderTypeController = require("../controller/purchaseOrderTypeController");
const authcheck = require("../middleware/auth");

// CRUD Routes for Purchase Order Types
router.post(
  "/api/create-purchase-order-type",
  authcheck,
  purchaseOrderTypeController.createPurchaseOrderType
);
router.get(
  "/api/getall-purchase-order-type",
  authcheck,
  purchaseOrderTypeController.getAllPurchaseOrderTypes
);
router.get(
  "/api/get-purchase-order-type-by-id/:id",
  authcheck,
  purchaseOrderTypeController.getPurchaseOrderTypeById
);
router.post(
  "/api/update-purchase-order-type-by-id/:id",
  authcheck,
  purchaseOrderTypeController.updatePurchaseOrderType
);
router.delete(
  "/api/delete-purchase-order-type/:id",
  authcheck,
  purchaseOrderTypeController.deletePurchaseOrderType
);

module.exports = router;
