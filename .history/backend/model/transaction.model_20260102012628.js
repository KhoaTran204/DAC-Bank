const momgo = require("mongoose");
const { Schema } = momgo;

const transactionSchema = new Schema(
  {
    transactionType: String,
    transactionAmount: Number,
    refrence: String,
    currentBalance: Number,
    accountNo: Number,
    key: String,
    customerId: String,
    branch: String,
  },
  { timestamps: true }
);

module.exports = momgo.model("transaction", transactionSchema);
