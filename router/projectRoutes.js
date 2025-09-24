const express = require("express");
const router = express.Router();
const ProjectController = require("../controller/projectController");
const authcheck= require('../middleware/auth')

router.post("/api/createproject", authcheck,ProjectController.createProject);
router.get("/api/getallproject",authcheck, ProjectController.getAllProjects);

//router.post("/api/getallprojectbyId/:id", ProjectController.getProject);

router.post("/api/updateproject/:id",authcheck, ProjectController.updateProject);
router.delete("/api/deleteproject/:id", authcheck,ProjectController.deleteProject);

module.exports = router;
  