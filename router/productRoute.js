const express = require("express");
const router = express.Router();

const authcheck = require("../middleware/auth");

const productController = require("../controller/ProductController");

router.post("/api/product", authcheck, productController.createProduct);

router.get("/api/getallproducts", authcheck, productController.getAllProducts);

router.get("/api/productbyid/:id", authcheck, productController.getProductById);

router.post(
  "/api/updateproduct/:id",
  authcheck,
  productController.updateProductById
);

router.delete(
  "/api/deleteproduct/:id",
  authcheck,
  productController.deleteProduct
);

module.exports = router;
