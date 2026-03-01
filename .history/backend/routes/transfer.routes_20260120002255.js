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

/**
 * Lay thong tin nguoi nhan theo bankCardNo (MOI THEM)
 * GET /api/transfer/receiver?bankCardNo=xxxx
 */
router.get("/receiver", controller.getReceiverByBankCard);
module.exports = router;
