const express = require("express");
const router = express.Router();
const ProductTypeController = require("../controller/productTypeController");
const authcheck = require("../middleware/auth");

// ➕ Create Product Type
router.post("/api/createproducttype", authcheck, ProductTypeController.addProductType);

// 📋 Get All Product Types (both alias endpoints)
router.get("/api/getProductType", authcheck, ProductTypeController.getAllProductType);
router.get("/api/getallproducttypes", authcheck, ProductTypeController.getAllProductType);
router.get("/api/product_type", authcheck, ProductTypeController.getAllProductType);

// 🔍 Get Product Type By ID
router.get("/api/getproducttype/:id", authcheck, ProductTypeController.getProductTypeById);

// ✏️ Update Product Type By ID
router.post("/api/updateproducttype/:id", authcheck, ProductTypeController.updateProductType);
router.put("/api/updateproducttype/:id", authcheck, ProductTypeController.updateProductType);

// 🗑️ Delete Product Type By ID
router.delete("/api/deleteproducttype/:id", authcheck, ProductTypeController.deleteProductType);

module.exports = router;
