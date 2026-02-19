const express = require("express");
const router = express.Router();
const authcheck = require("../middleware/auth");


const ClaimTypeController = require("../controller/ClaimTypeController");

// ================================================================
//  CLAIM TYPES ROUTES    →  /api/claim-types
// ================================================================

router.get("/api/gellall/claim-types", authcheck,ClaimTypeController.getAll);

router.get("/api/gellall/claim-types/active",authcheck, ClaimTypeController.getActive);

router.get("/api/claim-typesbyid/:id", authcheck,ClaimTypeController.getById);

router.post("/api/create/claim-types",authcheck, ClaimTypeController.create);

router.post("/api/claim-types/:id",authcheck, ClaimTypeController.update);

router.post("/api/claim-types/:id/toggle",authcheck, ClaimTypeController.toggleActive);

router.delete("/api/claim-types/:id",authcheck, ClaimTypeController.delete);

module.exports = router;
