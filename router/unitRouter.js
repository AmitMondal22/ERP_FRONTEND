const express = require("express");
const router = express.Router();
const unitController = require("../controller/unitController");
const authcheck= require('../middleware/auth')



router.post("/api/createunit", unitController.addUnit);

router.get("/api/getallunits", unitController.getUnits);

router.get("/api/getunit/:id", unitController.updateUnit);


router.post("/api/unitupdate/:id", unitController.updateUnit);

router.delete("/api/deleteunit/:id", unitController.deleteUnit);

module.exports = router;
