const express = require("express");
const router = express.Router();
const progressController = require("../controller/progressController");
const authcheck= require('../middleware/auth');


router.post("/api/createprogress", authcheck, progressController.createProgress);
router.get("/api/getallprogress", authcheck, progressController.getAllProgress);
router.get("/api/getprogress/:id",authcheck, progressController.getProgressById);
router.post("/api/updateprogress:id", authcheck, progressController.updateProgress);
router.delete("/api/deleteprogress/:id", authcheck, progressController.deleteProgress);

module.exports = router;
