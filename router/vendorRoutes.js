const express = require("express");
const router = express.Router();
const vendorController = require("../controller/vendorController");

const authcheck= require('../middleware/auth')


router.post("/api/createvendor", vendorController.addVendor);
router.post("/api/create_contact_person", vendorController.addContactPerson);
router.get("/api/getallvendor", vendorController.getAllVendors);
router.get("/api/getvendor/:id", vendorController.getVendorById);
router.put("/api/vendor/:id", vendorController.updateVendor);
router.put("/api/contact_person/:id", vendorController.updateContactPerson);
router.delete("/api/vendor/:id", vendorController.deleteVendor);
router.delete("/api/contact_person/:id", vendorController.deleteContactPerson);

module.exports = router;
