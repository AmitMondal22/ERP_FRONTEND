const express = require("express");
const router = express.Router();
const projectBillingController = require("../controller/projectBillingController");
const authcheck= require('../middleware/auth');

// CREATE
router.post("/api/createprojectbilling", authcheck,projectBillingController.createBillingItem);

// GET ALL
router.get("/api/getprojectbillingdetailsbyId/:id",authcheck,projectBillingController.getBillingItemById);

// GET BY PROJECT ID 
router.get("/api/getprojectbillingbyprojectid/:id",authcheck,projectBillingController.getBillingItemsByProjectId);

// UPDATE
router.post("/api/updateprojectbillingbyprojectid/:id",authcheck,projectBillingController.updateBillingItem);

// DELETE
router.delete("/api/deleteprojectbilling/:id",authcheck,projectBillingController.deleteBillingItem);

module.exports = router;
