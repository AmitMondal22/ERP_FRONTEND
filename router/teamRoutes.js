const express = require("express");
const router = express.Router();
const teamController = require("../controller/teamController");

const authcheck= require('../middleware/auth')


router.post("/api/add_team",authcheck, teamController.createTeam);

router.get("/api/get_all_team",authcheck, teamController.getAllTeam);

router.get("/api/get_team/:team_id",authcheck, teamController.getTeamById);//

//router.get("/api/get_team_for_add_employee_team",authcheck, teamController.getAllEmployeeByTeamIdOnlyForAddingEmployeeToTeam)
router.post("/api/update_team/:id",authcheck, teamController.updateTeam);
router.delete("/api/delete_team/:id",authcheck, teamController.deleteTeam);

module.exports = router;  //getAllEmployeeByTeamIdOnlyForAddingEmployeeToTeam
