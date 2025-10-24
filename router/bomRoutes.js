const express = require("express");
const router = express.Router();
const BomController = require("../controller/bomController");
const BomProgressController = require("../controller/bomProgressController");
const authcheck= require('../middleware/auth');
const { bomProgressListSchema } = require("../validations/validateBomProgress");
const validate = require("../middleware/validate");
const bomItemController = require("../controller/bomItemController");




router.post("/api/bom_create_update", authcheck, BomController.createOrUpdateBom);
router.get("/api/get_all_bom",authcheck, BomController.getAllBom);
router.get("/api/get_bom/:id",authcheck, BomController.getBom);
router.delete("/api/delete_bom/:id", authcheck,BomController.deleteBom);
 
router.post("/api/bom_progress_create_update", authcheck,validate(bomProgressListSchema),BomProgressController.bulkCreateOrUpdate);
router.get("/api/get_bom_progress/:id",authcheck, BomProgressController.getBomProgress);
router.get("/api/get_bom_progressbybomid/:bom_id",authcheck, BomProgressController.getAllBomProgress);//all-steps inside bom
router.delete("/api/delete_bom_progress/:id", authcheck,BomProgressController.deleteBomProgress);


     


// CREATE or UPDATE

router.post("/api/createbom_item",authcheck, bomItemController.createBomItem);
router.post("/api/update_bom_item/:id",authcheck, bomItemController.updateBomItem);

// READ
router.get("/api/get_all_bom_item", authcheck,bomItemController.getAllBomItems);
router.get("/api/get_bom_item_by_id/:id",authcheck, bomItemController.getBomItemById);

router.get("/api/get_bom_item_by_progress/:progress_id",authcheck, bomItemController.getBomItemByProgress);

// DELETE
router.delete("/api/delete_bom_item/:id",authcheck, bomItemController.deleteBomItem);





module.exports = router;
 