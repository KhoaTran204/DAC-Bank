const express = require("express");
const router = express.Router();
const controller = require("../controller/controller");
const transactionSchema = require("../model/transaction.model");

router.get("/", (req, res) => {
  controller.getData(req, res, transactionSchema);
});

router.get("/summary", (req, res) => {
  controller.getTransactionSummary(req, res, transactionSchema);
});

router.get("/pagination", (req, res) => {
  controller.getPaginatedTransactions(req, res, transactionSchema);
});

router.post("/", (req, res) => {
  controller.createData(req, res, transactionSchema);
});

router.put("/:id", (req, res) => {
  controller.updateData(req, res, transactionSchema);
});

router.delete("/:id", (req, res) => {
  controller.deleteData(req, res, transactionSchema);
});

module.exports = router;
