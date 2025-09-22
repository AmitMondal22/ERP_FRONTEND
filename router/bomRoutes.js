const express = require("express");
const router = express.Router();
const BomController = require("../controller/bomController");
const authcheck= require('../middleware/auth')



router.post("/api/bom_create_update", authcheck,BomController.createProject);
router.get("/api/get_all_bom",authcheck, BomController.getAllBom);
router.get("/api/get_bom/:id",authcheck, BomController.getBom);
router.delete("/api/delete_bom/:id", authcheck,BomController.deleteBom);



module.exports = router;
 