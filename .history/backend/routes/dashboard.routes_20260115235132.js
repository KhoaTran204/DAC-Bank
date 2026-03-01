const express = require("express");
const router = express.Router();

const dashboardController = require("../controller/dashboard.controller");

/**
 * GET /api/dashboard/admin
 * Query: fromDate, toDate
 */
router.get("/admin", dashboardController.getAdminDashboardStats);

module.exports = router;
