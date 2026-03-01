const express = require("express");
const router = express.Router();
const controller = require("../controller/controller");

// Dashboard chung admin / employee
router.get("/overview", controller.getDashboardOverview);

module.exports = router;
