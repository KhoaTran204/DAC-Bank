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
  const { branch, accountNo } = req.query;

  try {
    const matchCondition = {
      status: "success",
    };

    /**
     * ⚠️ QUAN TRỌNG
     * - Nếu có accountNo → ưu tiên accountNo (customer)
     * - Nếu không → dùng branch (admin / employee)
     */
    if (accountNo) {
      matchCondition.accountNo = Number(accountNo);
    } else if (branch) {
      matchCondition.branch = branch;
    }

    const summary = await schema.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,

          totalCredit: {
            $sum: {
              $cond: [
                { $eq: ["$transactionType", "cr"] },
                "$transactionAmount",
                0,
              ],
            },
          },

          totalDebit: {
            $sum: {
              $cond: [
                { $eq: ["$transactionType", "dr"] },
                "$transactionAmount",
                0,
              ],
            },
          },

          totalTransactions: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          totalCredit: 1,
          totalDebit: 1,
          totalTransactions: 1,
          balance: { $subtract: ["$totalCredit", "$totalDebit"] },
        },
      },
    ]);

    if (!summary.length) {
      return res.status(200).json({
        totalCredit: 0,
        totalDebit: 0,
        totalTransactions: 0,
        balance: 0,
      });
    }

    res.status(200).json(summary[0]);
  } catch (error) {
    res.status(500).json({
      message: "Internal calculating summary error",
      error,
    });
  }
};

const getPaginatedTransactions = async (req, res, schema) => {
  try {
    const { accountNo, branch, status, page = 1, pageSize = 10 } = req.query;

    const filter = {};

    if (accountNo) filter.accountNo = Number(accountNo);
    if (branch) filter.branch = branch;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);

    const [transactions, total] = await Promise.all([
      schema.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      schema.countDocuments(filter),
    ]);

    res.status(200).json({
      data: transactions,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching transactions",
      error,
    });
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

/* ================= CONFIRM TRANSFER ================= */

const confirmTransferWithOTP = async (req, res) => {
  const { fromAccountNo, toBankCardNo, amount, otp } = req.body;

  try {
    const otpRecord = await OTP.findOne({ accountNo: fromAccountNo, otp });
    if (!otpRecord || otpRecord.expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP invalid or expired" });
    }

    await OTP.deleteMany({ accountNo: fromAccountNo });

    const sender = await Customer.findOne({ accountNo: fromAccountNo });
    const receiver = await Customer.findOne({ bankCardNo: toBankCardNo });

    if (!sender || !receiver) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (sender.finalBalance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    sender.finalBalance -= amount;
    receiver.finalBalance += amount;

    await sender.save();
    await receiver.save();

    await Transaction.create([
      {
        accountNo: sender.accountNo,
        transactionType: "dr",
        transactionAmount: amount,
        branch: sender.branch,
      },
      {
        accountNo: receiver.accountNo,
        transactionType: "cr",
        transactionAmount: amount,
        branch: receiver.branch,
      },
    ]);

    res.status(200).json({ message: "Transfer successful" });
  } catch (err) {
    res.status(500).json({ message: "Transfer failed" });
  }
};

const getDashboardOverview = async (req, res) => {
  const { branch, fromDate, toDate } = req.query;

  try {
    const start = fromDate ? new Date(fromDate) : null;
    const end = toDate ? new Date(toDate) : null;

    if (end) end.setHours(23, 59, 59, 999);

    /* ================= ACCOUNT CREATED PER DAY ================= */
    const accountMatch = {};
    if (branch) accountMatch.branch = branch;
    if (start || end) {
      accountMatch.createdAt = {};
      if (start) accountMatch.createdAt.$gte = start;
      if (end) accountMatch.createdAt.$lte = end;
    }

    const accountPerDay = await Customer.aggregate([
      { $match: accountMatch },
      {
        $group: {
          _id: {
            $dateToString: { format: "%d-%m", date: "$createdAt" },
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    /* ================= TRANSACTION COUNT PER DAY ================= */
    const transactionMatch = { status: "success" };
    if (branch) transactionMatch.branch = branch;
    if (start || end) {
      transactionMatch.createdAt = {};
      if (start) transactionMatch.createdAt.$gte = start;
      if (end) transactionMatch.createdAt.$lte = end;
    }

    const transactionPerDay = await Transaction.aggregate([
      { $match: transactionMatch },
      {
        $group: {
          _id: {
            $dateToString: { format: "%d-%m", date: "$createdAt" },
          },
          total: { $sum: 1 },
          amount: { $sum: "$transactionAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    /* ================= TOTAL AMOUNT (PIE) ================= */
    const totalAmount = transactionPerDay.reduce((sum, i) => sum + i.amount, 0);

    return res.status(200).json({
      accountChart: accountPerDay.map((i) => ({
        date: i._id,
        value: i.total,
      })),
      transactionChart: transactionPerDay.map((i) => ({
        date: i._id,
        value: i.total,
      })),
      pieData: [{ name: "Tong so tien giao dich", value: totalAmount }],
    });
  } catch (err) {
    return res.status(500).json({
      message: "Dashboard overview error",
      error: err,
    });
  }
};
const getDashboardSummary = async (req, res) => {
  const { branch, fromDate, toDate } = req.query;

  try {
    const start = fromDate ? new Date(fromDate) : null;
    const end = toDate ? new Date(toDate) : null;
    if (end) end.setHours(23, 59, 59, 999);

    /* ================= FILTER ================= */
    const dateFilter = {};
    if (start || end) {
      dateFilter.createdAt = {};
      if (start) dateFilter.createdAt.$gte = start;
      if (end) dateFilter.createdAt.$lte = end;
    }

    /* ================= TỔNG SỐ TÀI KHOẢN ================= */
    const totalAccounts = await Customer.countDocuments({
      ...(branch && { branch }),
      ...dateFilter,
    });

    /* ================= GIAO DỊCH ================= */
    const transactionMatch = {
      status: "success",
      ...(branch && { branch }),
      ...dateFilter,
    };

    const transactionSummary = await Transaction.aggregate([
      { $match: transactionMatch },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$transactionType", "cr"] },
                "$transactionAmount",
                0,
              ],
            },
          },
          totalDebit: {
            $sum: {
              $cond: [
                { $eq: ["$transactionType", "dr"] },
                "$transactionAmount",
                0,
              ],
            },
          },
        },
      },
    ]);

    const summary = transactionSummary[0] || {
      totalTransactions: 0,
      totalRevenue: 0,
      totalDebit: 0,
    };

    return res.status(200).json({
      totalAccounts,
      totalTransactions: summary.totalTransactions,
      totalRevenue: summary.totalRevenue,
      balance: summary.totalRevenue - summary.totalDebit,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Dashboard summary error",
      error,
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
  getDashboardSummary,
  // ================= TRANSACTION =================

  getTransactionSummary,
  getPaginatedTransactions,
  getDashboardOverview,
  // transferMoney,
  // ================= OTP =================
  sendTransferOTP,
  confirmTransferWithOTP,
};
