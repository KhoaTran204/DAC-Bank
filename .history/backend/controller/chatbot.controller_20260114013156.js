const { detectIntent } = require("../utils/intent.util");
const { askGemini } = require("../services/gemini.service");
const Transaction = require("../models/transaction.model");

const chatWithBot = async (req, res) => {
  try {
    const { message, accountNo } = req.body;
    const intent = detectIntent(message);

    // 1️⃣ SO DU
    if (intent === "BALANCE") {
      const result = await Transaction.getBalance(accountNo);

      return res.json({
        reply: `So du hien tai cua ban la ${result.balance.toLocaleString()} VND`,
      });
    }

    // 2️⃣ HUONG DAN CHUYEN TIEN
    if (intent === "GUIDE_TRANSFER") {
      return res.json({
        reply:
          "De chuyen tien, ban vao muc Chuyen tien, nhap so tai khoan nguoi nhan, so tien va xac nhan OTP.",
      });
    }

    // 3️⃣ AI GEMINI
    const bankingPrompt = `
Ban la chatbot ngan hang.
Chi tra loi cac van de lien quan den:
- tai khoan
- giao dich
- phi
- bao mat
Neu khong lien quan, hay tu choi lich su.
`;

    const reply = await askGemini(bankingPrompt + "\nCau hoi: " + message);

    return res.json({ reply });
  } catch (error) {
    console.error("CHATBOT ERROR:", error);
    res.status(500).json({
      reply: "Xin loi, he thong dang ban. Vui long thu lai sau.",
    });
  }
};

module.exports = { chatWithBot };
