const express = require("express");
const router = express.Router();
const ProjectSiteController = require("../controller/projectSiteController");
const authcheck= require('../middleware/auth')

router.post("/api/createprojectsites", authcheck,ProjectSiteController.createProjectSite);
router.get("/api/getallprojectsites",authcheck, ProjectSiteController.getAllProjectsSite);

router.get("/api/getprojectbyId/:id", ProjectSiteController.getProjectSite);

router.post("/api/updateprojectsites/:id",authcheck, ProjectSiteController.updateProjectsSite);
router.delete("/api/deleteprojectsites/:id", authcheck,ProjectSiteController.deleteProjectSite);

module.exports = router;
