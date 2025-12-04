const express = require("express");
const router = express.Router();
const returnPurchaseController = require("../controller/returnPurchaseProductcontroller");

// CRUD routes
router.post("/api/return-purchase", returnPurchaseController.createReturn);
router.get("/api/return-purchase", returnPurchaseController.getAllReturns);
router.get("/api/return-purchase/:id", returnPurchaseController.getReturnById);
router.post("/api/return-purchase/:id", returnPurchaseController.updateReturn);
router.delete("/api/return-purchase/:id", returnPurchaseController.deleteReturn);

module.exports = router;
