
const express    = require("express");
const router     = express.Router();
const authcheck  = require("../middleware/auth");
const controller = require("../controller/projectSiteStatusController");
const FileUploader = require("../helper/fileUpload");

/* =========================
   FILE UPLOADER CONFIG
   ========================= */
const fileUploader = new FileUploader({
  folderName     : "uploads/site_status_images",
  supportedFiles : [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
  ],
  fieldSize : 1024 * 1024 * 10, // 10MB
});

const upload = fileUploader.upload();

/* =========================
   ROUTES
   ========================= */

/**
 * CREATE STATUS WITH IMAGES
 * POST /api/project-site-status
 */
router.post(
  "/api/project-site-status",
  authcheck,
  upload.array("images", 10),
  controller.createStatus
);

/**
 * GET ALL STATUSES (filter: ?project_id=&site_id=&status_type=)
 * GET /api/project-site-status
 */
router.get(
  "/api/get-all-project-site-status",
  authcheck,
  controller.getAllStatuses
);

/**
 * GET SINGLE STATUS WITH IMAGES
 * GET /api/project-site-status/:id
 */
router.get(
  "/api/project-site-status/:id",
  authcheck,
  controller.getStatusById
);

/**
 * UPDATE STATUS + ADD / REMOVE IMAGES
 * PUT /api/project-site-status/:id
 */
router.put(
  "/api/project-site-status/:id",
  authcheck,
  upload.array("add_images", 10),
  controller.updateStatus
);

/**
 * DELETE STATUS AND ALL ITS IMAGES
 * DELETE /api/project-site-status/:id
 */
router.delete(
  "/api/project-site-status/:id",
  authcheck,
  controller.deleteStatus
);

/**
 * ADD IMAGES TO EXISTING STATUS
 * POST /api/project-site-status/:id/images
 */
router.post(
  "/api/project-site-status/:id/images",
  authcheck,
  upload.array("images", 10),
  controller.addImages
);

/**
 * DELETE SINGLE IMAGE FROM STATUS
 * DELETE /api/project-site-status/:id/images/:imageId
 */
router.delete(
  "/api/project-site-status/:id/images/:imageId",
  authcheck,
  controller.deleteImage
);



/**
 * GET STATUSES BY FILTER (project_id, site_id, date)
 * GET /api/project-site-status/filter?project_id=1&site_id=2&date=2025-07-10
 */
router.get(
  "/api/project-site-status/status/filter",
  authcheck,
  controller.getStatusByFilter
);


module.exports = router;
