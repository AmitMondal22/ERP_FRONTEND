const express = require("express");
const router = express.Router();
const vendorController = require("../controller/vendorController");

const authcheck= require('../middleware/auth')


router.post("/api/createvendor",authcheck, vendorController.addVendor);//

router.post("/api/create_contact_person",authcheck, vendorController.addContactPerson);

router.get("/api/getallvendor",authcheck, vendorController.getAllVendors);//

router.get("/api/getvendor/:vendor_id",authcheck, vendorController.getVendorById);//

router.post("/api/updatevendor/:id",authcheck, vendorController.updateVendor);

router.post("/api/upadte_contact_person/:id",authcheck, vendorController.updateContactPerson);


router.delete("/api/delete_vendor/:id",authcheck, vendorController.deleteVendor);

router.delete("/api/delete_contact_person/:id",authcheck, vendorController.deleteContactPerson);

module.exports = router;
