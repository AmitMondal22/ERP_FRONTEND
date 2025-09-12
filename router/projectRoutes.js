const express = require("express");
const router = express.Router();
const ProjectController = require("../controllers/ProjectController");

router.post("/api/createproject", ProjectController.createProject);
router.get("/api/getallproject", ProjectController.getAllProjects);
router.get("/api/getallprojectbyId/:id", ProjectController.getProject);
router.put("/api/updateproject/:id", ProjectController.updateProject);
router.delete("/api/deleteproject/:id", ProjectController.deleteProject);

module.exports = router;
