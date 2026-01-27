const express = require("express");
const router = express.Router();
const EmployeeHolidayController = require("../controller/EmployeAnnualLeaveController");
const authcheck= require('../middleware/auth');
// Create holiday
router.post("/holidays", authcheck,EmployeeHolidayController.createHoliday);

// Get all holidays
router.get("/holidays", EmployeeHolidayController.getAllHolidays);

// Get holidays by year
router.get("/holidays/year/:year", EmployeeHolidayController.getHolidaysByYear);

// Get holidays by type
router.get("/holidays/type/:type", EmployeeHolidayController.getHolidaysByType);

// Get upcoming holidays
router.get("/holidays/upcoming", EmployeeHolidayController.getUpcomingHolidays);

// Get holiday statistics
router.get("/holidays/stats", EmployeeHolidayController.getHolidayStats);

// Check if date is holiday
router.get("/holidays/check/:date", EmployeeHolidayController.checkIfHoliday);

// Get holiday by ID
router.get("/holidays/:holiday_id", EmployeeHolidayController.getHolidayById);

// Update holiday
router.put("/holidays/:holiday_id", EmployeeHolidayController.updateHoliday);

// Delete holiday
router.delete("/holidays/:holiday_id", EmployeeHolidayController.deleteHoliday);

module.exports = router;