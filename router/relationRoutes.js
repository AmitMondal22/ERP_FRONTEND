const express = require("express");
const router = express.Router();
const ProjectSiteEmployeeAssignmentController = require("../controller/projectSiteEmployeeAssignmentController");
const TeamEmployeeAssignmentController = require("../controller/teamEmployeeAssignmentController");
const ProjectEmployeeAssignmentController = require("../controller/projectEmployeeAssignmentController");
const authcheck= require('../middleware/auth')



router.post("/api/create_team_employee",authcheck, TeamEmployeeAssignmentController.createTeamEmployeeAssignment);
router.get("/api/get_all_team_employee",authcheck, TeamEmployeeAssignmentController.getAllTeamEmployeeAssignments);
router.post("/api/update_team_employee/:id",authcheck, TeamEmployeeAssignmentController.updateTeamEmployeeAssignment);
router.get("/api/get_team_employee/:id",authcheck, TeamEmployeeAssignmentController.getTeamEmployeeAssignmentById);
router.delete("/api/delete_team_employee/:id",authcheck, TeamEmployeeAssignmentController.deleteTeamEmployeeAssignment);



router.post("/api/create_project_site_employee",authcheck, ProjectSiteEmployeeAssignmentController.createProjectSiteEmployeeAssignment);
router.get("/api/get_all_project_site_employee",authcheck, ProjectSiteEmployeeAssignmentController.getAllProjectSiteEmployeeAssignments);
router.post("/api/update_project_site_employee/:id",authcheck, ProjectSiteEmployeeAssignmentController.updateProjectSiteEmployeeAssignment);
router.get("/api/get_project_site_employee/:id",authcheck, ProjectSiteEmployeeAssignmentController.getProjectSiteEmployeeAssignmentById);
router.delete("/api/delete_project_site_employee/:id",authcheck, ProjectSiteEmployeeAssignmentController.deleteProjectSiteEmployeeAssignment);



router.post("/api/create_project_employee",authcheck, ProjectEmployeeAssignmentController.createProjectEmployeeAssignment);
router.get("/api/get_all_project_employee",authcheck, ProjectEmployeeAssignmentController.getAllProjectEmployeeAssignments);
router.post("/api/update_project_employee/:id",authcheck, ProjectEmployeeAssignmentController.updateProjectEmployeeAssignment);
router.get("/api/get_project_employee/:id",authcheck, ProjectEmployeeAssignmentController.getProjectEmployeeAssignmentById);
router.delete("/api/delete_project_employee/:id",authcheck, ProjectEmployeeAssignmentController.deleteProjectEmployeeAssignment);



module.exports = router;
