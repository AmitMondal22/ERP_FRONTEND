const express = require("express");
const router = express.Router();
const purchaseProductController = require("../controller/purchaseProductController");
const authcheck= require('../middleware/auth')
const validate = require("../middleware/validate");
const { purchaseSchema, purchaseQuerySchema } = require("../validations/purchaseProductValadition");

router.post("/api/perchase", authcheck, purchaseProductController.createPurchase);

router.get("/api/getpurchase", authcheck, purchaseProductController.allPurchase);

router.get("/api/perchase-product", authcheck,validate(purchaseQuerySchema), purchaseProductController.allProductPurchase);

router.get("/api/perchase-product/:id", purchaseProductController.getPurchaseById);///


router.post("/api/get-purchased-product-details/:id",purchaseProductController.getPurchaseByProductAndDate)

router.post("/api/update-purchase-product/:id",authcheck,purchaseProductController.updatePurchase);

router.get("/api/getallthepurchasedata",authcheck,purchaseProductController.getAllThePurchaseData);

router.delete("/api/purchase/:id", authcheck, purchaseProductController.deletePurchase); 


router.post("/api/stock/monthwise",authcheck, purchaseProductController.getStockMonthwise);

router.post("/api/purchasedetails/monthwise",authcheck, purchaseProductController.getPurchaseDetailsMonthwise);

// In your purchaseProductRoutes.js

router.post('/api/purchases/by-project-site-product', purchaseProductController.getPurchasesByProjectSiteAndProductwithAlldetails);

router.get("/api/getalltypeofpurchase",authcheck, purchaseProductController.getAllTypeOfPurchaseForAllTypeOfProducts);

//getAllTypeOfPurchaseForAllTypeOfProducts


//getPurchaseDetailsMonthwise
module.exports = router;