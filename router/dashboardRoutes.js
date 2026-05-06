const express = require("express");
const router = express.Router();
const dashboard = require("../controller/dashboardController");
const authcheck= require('../middleware/auth');
//const { verifyToken } = require("../middleware/authMiddleware"); // if you use auth

// Dashboard
router.get("/api/getalldashboard-data", authcheck, dashboard.getDashboardData);

module.exports = router;