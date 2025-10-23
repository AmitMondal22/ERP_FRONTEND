const express = require("express");
const router = express.Router();
const purchaseProductController = require("../controller/purchaseProductController");
const authcheck= require('../middleware/auth')
const validate = require("../middleware/validate");
const { purchaseSchema, purchaseQuerySchema } = require("../validations/purchaseProductValadition");

router.post("/api/perchase", authcheck, purchaseProductController.createPurchase);
router.get('/hello',(req,res)=>{res.send("heelo from sourish")});
router.get("/api/getpurchase", authcheck, purchaseProductController.allPurchase);
router.get("/api/perchase-product", authcheck,validate(purchaseQuerySchema), purchaseProductController.allProductPurchase);
router.get("/api/perchase-product/:id", authcheck,validate(purchaseQuerySchema), purchaseProductController.getPurchaseById);


module.exports = router;
// 