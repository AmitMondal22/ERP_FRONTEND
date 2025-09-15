const express = require("express");
const router = express.Router();
const unitController = require("../controller/unitController");
const authcheck= require('../middleware/auth')



router.post("/api/createunit",authcheck, unitController.addUnit);

router.get("/api/getallunits",authcheck, unitController.getUnits);

router.post("/api/Updateunit/:id",authcheck, unitController.updateUnit);

router.get("/api/getunit/:id",authcheck, unitController.getUnitById);

router.delete("/api/deleteunit/:id",authcheck, unitController.deleteUnit);

module.exports = router;
