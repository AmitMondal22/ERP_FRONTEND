const express = require("express");
const router = express.Router();
const BomController = require("../controller/bomController");
const BomProgressController = require("../controller/bomProgressController");
const authcheck= require('../middleware/auth');
const { bomProgressListSchema } = require("../validations/validateBomProgress");
const validate = require("../middleware/validate");



router.post("/api/bom_create_update", authcheck, BomController.createOrUpdateBom);
router.get("/api/get_all_bom",authcheck, BomController.getAllBom);
router.get("/api/get_bom/:id",authcheck, BomController.getBom);
router.delete("/api/delete_bom/:id", authcheck,BomController.deleteBom);



 

router.post("/api/bom_progress_create_update", authcheck,validate(bomProgressListSchema),BomProgressController.bulkCreateOrUpdate);
router.get("/api/get_bom_progress/:id",authcheck, BomProgressController.getBomProgress);
router.get("/api/get_bom_progressbybomid/:bom_id",authcheck, BomProgressController.getAllBomProgress);//all-steps inside bom
router.delete("/api/delete_bom_progress/:id", authcheck,BomController.deleteBom);

module.exports = router;
 