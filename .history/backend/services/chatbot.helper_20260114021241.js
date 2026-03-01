const Customer = require("../model/customer.model");
const Transaction = require("../model/transaction.model");

// ==================
// INTENT DETECTION
// ==================
// const detectIntent = (message) => {
//   const text = message.toLowerCase();

//   if (text.includes("số dư")) return "BALANCE";
//   if (text.includes("lịch sử")) return "HISTORY";

//   // ---- HƯỚNG DẪN ----
//   if (text.includes("chuyển tiền")) return "GUIDE_TRANSFER";
//   if (text.includes("otp")) return "GUIDE_OTP";
//   if (text.includes("bảo mật")) return "GUIDE_SECURITY";
//   if (text.includes("đăng nhập")) return "GUIDE_LOGIN";
//   if (text.includes("quên mật khẩu")) return "GUIDE_FORGOT_PASSWORD";
//   if (text.includes("tài khoản")) return "GUIDE_ACCOUNT";

//   return "AI";
// };

// ==================
// BUSINESS LOGIC
// ==================
const getBalance = async (accountNo) => {
  const customer = await Customer.findOne({ accountNo });
  if (!customer) return "Không tìm thấy tài khoản.";

  return `Số dư hiện tại của bạn là ${customer.finalBalance} VND`;
};

const getTransactions = async (accountNo) => {
  const txs = await Transaction.find({ accountNo })
    .sort({ createdAt: -1 })
    .limit(5);

  if (txs.length === 0) return "Bạn chưa có giao dịch nào.";

  return txs
    .map(
      (t, i) =>
        `${i + 1}. ${t.transactionType === "cr" ? "Nhận" : "Chuyển"} ${
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
Hướng dẫn chuyển tiền:
① Vào mục Transfer  
② Nhập số tài khoản người nhận  
③ Nhập số tiền  
④ Xác nhận bằng mã OTP 
`,

    GUIDE_OTP: `
Mã OTP là gì?
- Là mã bảo mật được gửi về email hoặc điện thoại
- Dùng để xác nhận đăng nhập và giao dịch
`,

    GUIDE_SECURITY: `
Cách bảo mật tài khoản:
- Không chia sẻ mật khẩu và OTP
- Đổi mật khẩu định kỳ
- Đăng xuất khi dùng trên máy lạ
`,

    GUIDE_LOGIN: `
Hướng dẫn đăng nhập:
1. Nhập email và mật khẩu
2. Nếu có OTP thì nhập thêm OTP
3. Bấm Đăng nhập để vào hệ thống
`,

    GUIDE_FORGOT_PASSWORD: `
Nếu quên mật khẩu:
1. Bấm "Quên mật khẩu"
2. Nhập email đăng ký
3. Kiểm tra email để đặt lại mật khẩu
`,

    GUIDE_ACCOUNT: `
Quản lý tài khoản:
- Cập nhật thông tin cá nhân
- Đổi mật khẩu
- Kiểm tra lịch sử giao dịch
`,
  };

  return guides[intent] || "Tôi chưa có hướng dẫn cho vấn đề này.";
};

module.exports = {
  // detectIntent,
  getBalance,
  getTransactions,
  getGuideResponse,
};
