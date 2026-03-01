const { schema } = require("../model/users.model");
const dbService = require("../services/db.service");
const Customer = require("../model/customer.model");
const Transaction = require("../model/transaction.model");
const OTP = require("../model/otp.model");
const transporter = require("../services/mail.service");

const getData = async (req, res, schema) => {
  try {
    const dbRes = await dbService.findAllRecord(schema);
    return res.status(200).json({
      message: "Record found !",
      data: dbRes,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
};

const createData = async (req, res, schema) => {
  try {
    const data = req.body;
    const dbRes = await dbService.createNewRecord(data, schema);
    res.status(200).json({
      message: "Data inserted successfully",
      success: true,
      data: dbRes,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(422).json({
        message: "Already exists !",
        success: false,
        error,
      });
    } else {
      res.status(500).json({
        message: "Internal server error",
        success: false,
        error,
      });
    }
  }
};

const updateData = async (req, res, schema) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const dbRes = await dbService.updateRecord(id, data, schema);
    return res.status(200).json({
      message: "Record update !",
      data: dbRes,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const deleteData = async (req, res, schema) => {
  try {
    const { id } = req.params;
    const dbRes = await dbService.deleteRecord(id, schema);
    return res.status(200).json({
      message: "Record deleted !",
      data: dbRes,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
//find by account no
const findByAccountNo = async (req, res, schema) => {
  try {
    const query = req.body;
    const dbRes = await dbService.findOneRecord(query, schema);
    return res.status(200).json({
      message: "Record deleted !",
      data: dbRes,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getTransactionSummary = async (req, res, schema) => {
  try {
    const { accountNo } = req.query;

    const transactions = await schema.find({ accountNo });

    let totalSuccess = 0;
    let totalFailed = 0;
    let totalPending = 0;
    let balance = 0;

    transactions.forEach((t) => {
      if (t.status === "success") {
        if (t.transactionType === "cr") {
          totalSuccess += t.transactionAmount;
          balance += t.transactionAmount;
        } else {
          balance -= t.transactionAmount;
        }
      }

      if (t.status === "failed") {
        totalFailed += t.transactionAmount;
      }

      if (t.status === "pending") {
        totalPending += t.transactionAmount;
      }
    });

    return res.status(200).json({
      totalSuccess,
      totalFailed,
      totalPending,
      balance,
    });
  } catch (error) {
    res.status(500).json({ message: "Summary error", error });
  }
};

const getPaginatedTransactions = async (req, res, schema) => {
  try {
    const { accountNo, page = 1, pageSize = 10 } = req.query;

    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      schema
        .find({ accountNo })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(pageSize)),
      schema.countDocuments({ accountNo }),
    ]);

    res.status(200).json({
      data,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    res.status(500).json({ message: "Pagination error", error });
  }
};

// ================= OTP =================
const sendTransferOTP = async (req, res) => {
  const { accountNo } = req.body;

  try {
    console.log("SEND OTP ACCOUNT NO:", accountNo);

    const customer = await Customer.findOne({ accountNo });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (!customer.email) {
      return res.status(400).json({ message: "Customer has no email" });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteMany({ accountNo });

    await OTP.create({
      accountNo,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await transporter.sendMail({
      from: `"Bank System" <${process.env.MAIL_USER}>`,
      to: customer.email,
      subject: "Your Transfer OTP",
      html: `
        <h3>OTP Verification</h3>
        <p>Your OTP code is:</p>
        <h2>${otpCode}</h2>
        <p>This code will expire in 5 minutes.</p>
      `,
    });

    return res.status(200).json({
      message: "OTP sent to email",
    });
  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    return res.status(500).json({
      message: "Send OTP failed",
    });
  }
};

/* ================= CONFIRM TRANSFER ================= */

const confirmTransferWithOTP = async (req, res) => {
  const { fromAccountNo, toBankCardNo, amount, otp } = req.body;

  try {
    // ===== 1. TAO GIAO DICH PENDING =====
    const pendingTx = await Transaction.create({
      accountNo: fromAccountNo,
      transactionType: "dr",
      transactionAmount: amount,
      status: "pending",
    });

    // ===== 2. KIEM TRA OTP TRONG DB =====
    const otpRecord = await OTP.findOne({
      accountNo: fromAccountNo,
      otp,
    });

    if (!otpRecord) {
      pendingTx.status = "failed";
      pendingTx.errorReason = "OTP khong dung";
      await pendingTx.save();

      return res.status(400).json({ message: "OTP khong dung" });
    }

    if (otpRecord.expiresAt < new Date()) {
      pendingTx.status = "failed";
      pendingTx.errorReason = "OTP het han";
      await pendingTx.save();

      await OTP.deleteMany({ accountNo: fromAccountNo });

      return res.status(400).json({ message: "OTP het han" });
    }

    // ===== 3. XOA OTP SAU KHI DUNG =====
    await OTP.deleteMany({ accountNo: fromAccountNo });

    // ===== 4. KIEM TRA TAI KHOAN =====
    const sender = await Customer.findOne({ accountNo: fromAccountNo });
    const receiver = await Customer.findOne({ bankCardNo: toBankCardNo });

    if (!sender || !receiver) {
      pendingTx.status = "failed";
      pendingTx.errorReason = "Tai khoan khong ton tai";
      await pendingTx.save();

      return res.status(404).json({ message: "Tai khoan khong ton tai" });
    }

    if (sender.finalBalance < amount) {
      pendingTx.status = "failed";
      pendingTx.errorReason = "So du khong du";
      await pendingTx.save();

      return res.status(400).json({ message: "So du khong du" });
    }

    // ===== 5. CAP NHAT SO DU =====
    sender.finalBalance -= amount;
    receiver.finalBalance += amount;

    await sender.save();
    await receiver.save();

    // ===== 6. THANH CONG =====
    pendingTx.status = "success";
    await pendingTx.save();

    await Transaction.create({
      accountNo: receiver.accountNo,
      transactionType: "cr",
      transactionAmount: amount,
      status: "success",
    });

    return res.status(200).json({ message: "Transfer successful" });
  } catch (err) {
    return res.status(500).json({
      message: "Transfer failed",
      error: err,
    });
  }
};

module.exports = {
  // ================= CRUD COMMON =================
  createData,
  getData,
  updateData,
  deleteData,
  findByAccountNo,
  // ================= TRANSACTION =================

  getTransactionSummary,
  getPaginatedTransactions,
  // transferMoney,
  // ================= OTP =================
  sendTransferOTP,
  confirmTransferWithOTP,
};
