const express = require("express");
const router = express.Router();
const ProjectEstimationController = require("../controller/ProjectEstimationController");
const authcheck= require('../middleware/auth');

// CREATE or UPDATE (same function)
router.post("/api/create-or-update-projectestimation",authcheck,ProjectEstimationController.createOrUpdateProjectEstimation);

// GET ALL
router.get("/api/getallestimation",authcheck,ProjectEstimationController.getAllProjectEstimations);

router.delete("/api/delete-projectestimation/:id",authcheck,ProjectEstimationController.deleteProjectEstimation);

router.post("/api/decrease-rep-task",authcheck, ProjectEstimationController.decreaseRepTask);


// // GET ONE using composite key
// router.get("/:project_id/:site_id/:bom_id",authcheck, ProjectEstimationController.getProjectEstimation);

// // DELETE using composite key
// router.delete("/:project_id/:site_id/:bom_id",authcheck,ProjectEstimationController.deleteProjectEstimation);


// FULL BOM DETAILS (aggregated)
router.get("/api/getallbomdetails",authcheck,ProjectEstimationController.getAllBomFullDetails);




////
//fetchAll datas from bomdetailsbyprojectsiteid
router.post("/api/getallbomdetailsbyprojectsiteid",authcheck,ProjectEstimationController.getBomFullDetailsByProjectAndSite);



router.post('/estimation/get-billing-id',authcheck, ProjectEstimationController.getBillingIdByProjectAndBom);

router.get("/api/getbomdetailsallwithproject/:project_id",ProjectEstimationController.getBomFullDetailsOfAllBomByProject)


module.exports = router;
