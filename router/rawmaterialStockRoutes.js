const express = require("express");
const router = express.Router();
const stockController = require("../controller/stockController");
const authcheck= require('../middleware/auth')

// CRUD
router.post("/",authcheck, stockController.createStock);
router.get("/", stockController.getAllStock);
router.get("/:id", stockController.getStockById);
router.post("/:id", stockController.updateStock);
router.delete("/:id", stockController.deleteStock);

module.exports = router;


/*this wont be used any more probably*/ 