const express = require("express");
const router = express.Router();
const authcheck= require('../middleware/auth');
const currentStockController = require("../controller/currentStockController");

// CREATE or UPDATE automatically
router.post("/api/createpurchasestock", authcheck,currentStockController.addOrUpdateCurrentStock);

// ALL stock
router.get("/api/getallstockwithdetails",authcheck, currentStockController.getAllStock);

// SINGLE stock
router.get("/api/getpurchaseby/:id",authcheck, currentStockController.getSingleStock);

// UPDATE
router.post("/api/updatepurchase/:id", authcheck,currentStockController.updateStock);

// DELETE
router.delete("/api/deletepurchase/:id",authcheck, currentStockController.deleteStock);

module.exports = router;
