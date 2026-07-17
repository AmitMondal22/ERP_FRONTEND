const express = require("express");
const router = express.Router();

const authcheck = require("../middleware/auth");
const projectWorkDescriptionController = require("../controller/projectWorkDescriptionController");

// ================= CREATE =================
router.post(
  "/api/createprojectworkdescription",
  authcheck,
  projectWorkDescriptionController.addProjectWorkDescription
); 

// ================= GET ALL =================
router.get(
  "/api/getprojectworkdescriptions",
  authcheck,
  projectWorkDescriptionController.getProjectWorkDescriptions
);

// ================= GET SINGLE =================
router.get(
  "/api/getprojectworkdescription/:id",
  authcheck,
  projectWorkDescriptionController.getProjectWorkDescription
);

// ================= UPDATE =================
router.post(
  "/api/updateprojectworkdescription/:id",
  authcheck,
  projectWorkDescriptionController.updateProjectWorkDescription
);

// ================= DELETE =================
router.delete(
  "/api/deleteprojectworkdescription/:id",
  authcheck,
  projectWorkDescriptionController.deleteProjectWorkDescription
);

module.exports = router; 