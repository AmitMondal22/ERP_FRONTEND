const express = require("express");
const router = express.Router();

const controller = require("../controller/workProgressAsPerProjectSite");

const authcheck= require('../middleware/auth')



// CREATE
router.post("/api/create-work-progress-perprojectsite",authcheck, controller.createWorkProgress);

// READ using project_id + site_id
//router.post("/api/get-by-project-site", controller.getWorkProgressByProjectAndSite);

// READ using project_id + project_site_id (NEW)
router.post("/api/get-by-project-and-project-site",authcheck, controller.getWorkProgressByProjectAndSite);   



// UPDATE
router.post("/api/update", controller.updateWorkProgress);

// DELETE
router.delete("/delete", controller.deleteWorkProgress);

module.exports = router;
