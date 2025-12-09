const express = require("express");
const router = express.Router();
const purchaseOrderController = require("../controller/purchaseOrderController");
const authcheck= require('../middleware/auth')


router.post("/api/create-purchase-order",authcheck, purchaseOrderController.createPurchaseOrder);
router.get("/api/getall-purchase-order",authcheck, purchaseOrderController.getAllPurchaseOrders);
router.get("/api/get-purchase-order-by-id/:id",authcheck, purchaseOrderController.getPurchaseOrderById);
router.post("/api/update-purchase-order-by-id/:id",authcheck, purchaseOrderController.updatePurchaseOrder);
router.delete("/api/delete-purchase-order/:id",authcheck, purchaseOrderController.deletePurchaseOrder);


module.exports = router;
