const express = require("express");
const router = express.Router();
const returnPurchaseController = require("../controller/returnPurchaseProductcontroller");
const authcheck= require('../middleware/auth')

// CRUD routes
router.post("/api/return-purchase",authcheck,returnPurchaseController.createReturn);
router.get("/api/return-purchase", authcheck,returnPurchaseController.getAllReturns);
router.get("/api/return-purchase/:id", authcheck,returnPurchaseController.getReturnById);
router.post("/api/return-purchase/:id", authcheck,returnPurchaseController.updateReturn);
router.delete("/api/return-purchase/:id", authcheck,returnPurchaseController.deleteReturn);

module.exports = router;
