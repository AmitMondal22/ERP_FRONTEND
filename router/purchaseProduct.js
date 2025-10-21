const express = require("express");
const router = express.Router();
const purchaseProductController = require("../controller/purchaseProductController");
const authcheck= require('../middleware/auth')
const validate = require("../middleware/validate");
const { purchaseSchema } = require("../validations/purchaseProductValadition");

router.post("/api/perchase", authcheck, purchaseProductController.createPurchase);


module.exports = router;
//