const express = require("express");
const router = express.Router();
const controller = require("../controller/controller");

/**
 * Gui OTP
 * POST /api/transfer/send-otp
 */
router.post("/send-otp", controller.sendTransferOTP);

/**
 * Xac nhan OTP + chuyen tien
 * POST /api/transfer/confirm
 */
router.post("/confirm", controller.confirmTransferWithOTP);

module.exports = router;
