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

    // ===== THEM MOI =====
    status: {
      type: String,
      enum: ["success", "pending", "failed"],
      default: "success",
    },

    errorReason: {
      type: String,
      default: "",
    },
    // ====================

    refrence: String,
    currentBalance: Number,
    accountNo: Number,
    key: String,
    customerId: String,
    branch: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("transaction", transactionSchema);
