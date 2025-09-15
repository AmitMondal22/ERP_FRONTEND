const express = require("express");
const router = express.Router();
const vendorController = require("../controller/vendorController");

const authcheck= require('../middleware/auth')


router.post("/api/createvendor",authcheck, vendorController.addVendor);
router.post("/api/create_contact_person", vendorController.addContactPerson);
router.get("/api/getallvendor",authcheck, vendorController.getAllVendors);
router.get("/api/getvendor/:id",authcheck, vendorController.getVendorById);
router.post("/api/vendor/:id",authcheck, vendorController.updateVendor);
router.post("/api/contact_person/:id",authcheck, vendorController.updateContactPerson);
router.delete("/api/vendor/:id",authcheck, vendorController.deleteVendor);
router.delete("/api/contact_person/:id",authcheck, vendorController.deleteContactPerson);

module.exports = router;
