const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const controller = require("../controller/contractorTeamController");

router.post("/api/contractor-teams", auth, controller.createTeam);

router.get("/api/contractor-teams", auth, controller.getAllTeams);

router.get("/api/contractor-teams/:id", auth, controller.getTeamById);

router.put("/api/contractor-teams/:id", auth, controller.updateTeam);

router.post("/api/contractor-teams/update/:id", auth, controller.updateTeam);

router.delete("/api/contractor-teams/:id", auth, controller.deleteTeam);

router.post("/api/contractor-teams/:id/assign-members", auth, controller.assignMembers);

module.exports = router;
