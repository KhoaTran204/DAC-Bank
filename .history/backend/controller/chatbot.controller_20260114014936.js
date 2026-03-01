const { askGemini } = require("../services/gemini.service");

// detect intent (rule-based)
const { detectIntent } = require("../utils/intent.util");

// nghiep vu
const {
  getBalance,
  getTransactions,
  getGuideResponse,
} = require("../services/chatbot.helper");

const chatWithBot = async (req, res) => {
  const { message, accountNo } = req.body;

  try {
    // ===== VALIDATE INPUT =====
    if (!message || typeof message !== "string") {
      return res.json({
        reply: "Vui long nhap noi dung can hoi.",
      });
    }

    const intent = detectIntent(message);
    console.log("🤖 INTENT:", intent);

    // ===== SO DU =====
    if (intent === "BALANCE") {
      if (!accountNo) {
        return res.json({
          reply: "Khong tim thay thong tin tai khoan.",
        });
      }

      const reply = await getBalance(accountNo);
      return res.json({ reply });
    }

    // ===== LICH SU GIAO DICH =====
    if (intent === "TRANSACTION") {
      if (!accountNo) {
        return res.json({
          reply: "Khong tim thay thong tin tai khoan.",
        });
      }

      const reply = await getTransactions(accountNo);
      return res.json({ reply });
    }

    // ===== CAC HUONG DAN (RULE-BASED) =====
    if (
      intent === "GUIDE_TRANSFER" ||
      intent === "GUIDE_SECURITY" ||
      intent === "GUIDE_OTP" ||
      intent === "GUIDE_LOGIN" ||
      intent === "GUIDE_FORGOT_PASSWORD" ||
      intent === "GUIDE_ACCOUNT"
    ) {
      const reply = getGuideResponse(intent);

      if (reply) {
        return res.json({ reply });
      }
    }

    // ===== FALLBACK AI (GEMINI) =====
    const reply = await askGemini(message);
    return res.json({ reply });
  } catch (err) {
    console.error("❌ CHATBOT ERROR:", err);

    return res.status(500).json({
      reply: "Xin loi, he thong dang ban. Vui long thu lai sau.",
    });
  }
};

module.exports = { chatWithBot };
