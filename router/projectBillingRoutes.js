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

// GET BY PROJECT ID AND SITE ID (WITH BOM NAME)
router.get("/api/getprojectbillingwithbom/:projectId", authcheck, projectBillingController.getBillingItemsWithBomByProjectAndSite);
router.get("/api/getprojectbillingwithbom/:projectId/:siteId", authcheck, projectBillingController.getBillingItemsWithBomByProjectAndSite);
router.get("/api/getprojectbillingwithbom/:projectId/:siteId/:project_work_description_id", authcheck, projectBillingController.getBillingItemsWithBomByProjectAndSite);

router.get("/api/getprojectbillingbyprojectsite/:projectId", authcheck, projectBillingController.getBillingItemsWithBomByProjectAndSite);
router.get("/api/getprojectbillingbyprojectsite/:projectId/:siteId", authcheck, projectBillingController.getBillingItemsWithBomByProjectAndSite);
router.get("/api/getprojectbillingbyprojectsite/:projectId/:siteId/:project_work_description_id", authcheck, projectBillingController.getBillingItemsWithBomByProjectAndSite);

// UPDATE
router.post("/api/updateprojectbillingbyprojectid/:id",authcheck,projectBillingController.updateBillingItem);

// DELETE
router.delete("/api/deleteprojectbilling/:id",authcheck,projectBillingController.deleteBillingItem);

module.exports = router;
