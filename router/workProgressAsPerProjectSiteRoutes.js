const express = require("express");
const router = express.Router();

const controller = require("../controller/workProgressAsPerProjectSite");

const authcheck= require('../middleware/auth')



// CREATE
router.post("/api/create-work-progress-perprojectsite",authcheck, controller.createWorkProgress);

// READ using project_id + site_id
//router.post("/api/get-by-project-site", controller.getWorkProgressByProjectAndSite);

// READ using project_id + project_site_id (NEW)
router.post("/api/get-by-project-and-project-site",authcheck, controller.getWorkProgressByProjectAndSite);   

/////////////////////////////////////***/ */

router.post("/api/get-data-comparison-with",controller.getBomItemsByProjectComparisonData)

router.post("/api/get-work-progress-details-for-comparison", controller.getBomItemsByProjectAndSiteForComparison)

/******** */

router.post("/api/getallworkprogressbyprojectandsiteid",authcheck,controller.getWorkProgressfulldatafromprojectandsiteId)

////////

// UPDATE
router.post("/api/update", controller.updateWorkProgress);

// DELETE
router.delete("/delete", controller.deleteWorkProgress);

//workProgressmonthwise
router.post("/api/work/progressmonthwise", authcheck,controller.getMonthlyWorkReport);

router.get("/api/getallworkprogressbyprojectwise",controller.getWorkProgressByProjectalltheworkdetails)

router.post("/api/getallworkprogressdetailswithpercent",authcheck,controller.getBomFullDetailsWithProgressByProject_Id)

module.exports = router;
