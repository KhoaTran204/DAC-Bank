const mongoose = require("mongoose");
const { Schema } = mongoose;

const transactionSchema = new Schema(
  {
    transactionType: {
      type: String,
      enum: ["cr", "dr"],
      required: true,
    },
    transactionAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "failed", "pending"],
      default: "success",
    },
    errorReason: {
      type: String,
      default: "",
    },
    accountNo: {
      type: Number,
      required: true,
    },
    branch: {
      type: String,
      required: true, // 🔥 QUAN TRỌNG
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("transaction", transactionSchema);
