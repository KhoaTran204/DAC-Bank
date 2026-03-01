const Customer = require("../model/customer.model");
const Transaction = require("../model/transaction.model");

// ==================
// INTENT DETECTION
// ==================
const detectIntent = (message) => {
  const text = message.toLowerCase();

  if (text.includes("so du")) return "BALANCE";
  if (text.includes("lich su")) return "HISTORY";

  // ---- HUONG DAN ----
  if (text.includes("chuyen tien")) return "GUIDE_TRANSFER";
  if (text.includes("otp")) return "GUIDE_OTP";
  if (text.includes("bao mat")) return "GUIDE_SECURITY";
  if (text.includes("dang nhap")) return "GUIDE_LOGIN";
  if (text.includes("quen mat khau")) return "GUIDE_FORGOT_PASSWORD";
  if (text.includes("tai khoan")) return "GUIDE_ACCOUNT";

  return "AI";
};

// ==================
// BUSINESS LOGIC
// ==================
const getBalance = async (accountNo) => {
  const customer = await Customer.findOne({ accountNo });
  if (!customer) return "Khong tim thay tai khoan.";

  return `So du hien tai cua ban la ${customer.finalBalance} VND`;
};

const getTransactions = async (accountNo) => {
  const txs = await Transaction.find({ accountNo })
    .sort({ createdAt: -1 })
    .limit(5);

  if (txs.length === 0) return "Ban chua co giao dich nao.";

  return txs
    .map(
      (t, i) =>
        `${i + 1}. ${t.transactionType === "cr" ? "Nhan" : "Chuyen"} ${
          t.transactionAmount
        } VND`
    )
    .join("\n");
};

// ==================
// GUIDE RESPONSES
// ==================
const getGuideResponse = (intent) => {
  const guides = {
    GUIDE_TRANSFER: `
Huong dan chuyen tien:
1. Vao muc Transfer
2. Nhap so tai khoan nguoi nhan
3. Nhap so tien
4. Xac nhan bang ma OTP
`,

    GUIDE_OTP: `
Ma OTP la gi?
- La ma bao mat duoc gui ve email hoac dien thoai
- Dung de xac nhan dang nhap va giao dich
`,

    GUIDE_SECURITY: `
Cach bao mat tai khoan:
- Khong chia se mat khau va OTP
- Doi mat khau dinh ky
- Dang xuat khi dung tren may la
`,

    GUIDE_LOGIN: `
Huong dan dang nhap:
1. Nhap email va mat khau
2. Neu co OTP thi nhap them OTP
3. Bam Dang nhap de vao he thong
`,

    GUIDE_FORGOT_PASSWORD: `
Neu quen mat khau:
1. Bam "Quen mat khau"
2. Nhap email dang ky
3. Kiem tra email de dat lai mat khau
`,

    GUIDE_ACCOUNT: `
Quan ly tai khoan:
- Cap nhat thong tin ca nhan
- Doi mat khau
- Kiem tra lich su giao dich
`,
  };

  return guides[intent] || "Toi chua co huong dan cho van de nay.";
};

module.exports = {
  detectIntent,
  getBalance,
  getTransactions,
  getGuideResponse,
};
