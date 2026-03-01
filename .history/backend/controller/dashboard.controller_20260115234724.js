const Account = require("../model/users.model");
const Transaction = require("../model/transaction.model");
const dayjs = require("dayjs");

exports.getAdminDashboardStats = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    const start = fromDate ? dayjs(fromDate).startOf("day").toDate() : null;
    const end = toDate ? dayjs(toDate).endOf("day").toDate() : null;

    const dateFilter = {};
    if (start) dateFilter.$gte = start;
    if (end) dateFilter.$lte = end;

    /* ===== ACCOUNTS CREATED PER DAY ===== */
    const accounts = await Account.find(
      start || end ? { createdAt: dateFilter } : {}
    );

    const accountMap = {};
    accounts.forEach((a) => {
      const d = dayjs(a.createdAt).format("DD-MM");
      accountMap[d] = (accountMap[d] || 0) + 1;
    });

    const accountChart = Object.keys(accountMap).map((d) => ({
      date: d,
      total: accountMap[d],
    }));

    /* ===== TRANSACTIONS PER DAY ===== */
    const transactions = await Transaction.find(
      start || end ? { createdAt: dateFilter } : {}
    );

    const txMap = {};
    let totalCredit = 0;
    let totalDebit = 0;

    transactions.forEach((t) => {
      const d = dayjs(t.createdAt).format("DD-MM");
      txMap[d] = (txMap[d] || 0) + 1;

      if (t.transactionType === "cr") totalCredit += t.transactionAmount;
      if (t.transactionType === "dr") totalDebit += t.transactionAmount;
    });

    const transactionChart = Object.keys(txMap).map((d) => ({
      date: d,
      total: txMap[d],
    }));

    /* ===== RESPONSE ===== */
    res.json({
      accountChart,
      transactionChart,
      pieData: [
        { name: "Credit", value: totalCredit },
        { name: "Debit", value: totalDebit },
      ],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
