const express = require("express");
const router = express.Router();
const ProjectSiteController = require("../controller/projectSiteController");
const authcheck= require('../middleware/auth')

router.post("/api/createprojectsites", authcheck,ProjectSiteController.createProjectSite);
router.get("/api/getallprojectsites",authcheck, ProjectSiteController.getAllProjectsSite);


router.get("/api/getprojecsitetbyId/:id",authcheck, ProjectSiteController.getProjectSiteById);

router.post("/api/updateprojectsites/:id",authcheck, ProjectSiteController.updateProjectsSite);
router.delete("/api/deleteprojectsites/:id", authcheck,ProjectSiteController.deleteProjectSite);

router.get("/api/getprojecsitetbyprojectid/:id",authcheck,ProjectSiteController.getProjectSiteByProjectId)

//getProjectSiteByProjectId
module.exports = router;
