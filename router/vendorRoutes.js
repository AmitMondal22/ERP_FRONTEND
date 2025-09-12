const express = require("express");
const router = express.Router();
const vendorController = require("../controller/vendorController");

const authcheck= require('../middleware/auth')


router.post("/api/createvendor", vendorController.addVendor);
router.get("/api/getallvendor", vendorController.getAllVendors);
router.get("/api/getvendor/:id", vendorController.getVendorById);
router.put("/api/vendor/:id", vendorController.updateVendor);
router.delete("/api/vendor/:id", vendorController.deleteVendor);

module.exports = router;
