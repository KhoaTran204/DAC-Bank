const { askGemini } = require("../services/gemini.service");

// detect intent (rule-based)
const { detectIntent } = require("../utils/intent.util");

// nghiệp vụ
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
        reply: "Vui lòng nhập nội dung cần hỏi.",
      });
    }

    const intent = detectIntent(message);
    console.log("🤖 INTENT:", intent);

    // ===== SỐ DƯ =====
    if (intent === "BALANCE") {
      if (!accountNo) {
        return res.json({
          reply: "Không tìm thấy thông tin tài khoản.",
        });
      }

      const reply = await getBalance(accountNo);
      return res.json({ reply });
    }

    // ===== LỊCH SỬ GIAO DỊCH =====
    if (intent === "TRANSACTION") {
      if (!accountNo) {
        return res.json({
          reply: "Không tìm thấy thông tin tài khoản.",
        });
      }

      const reply = await getTransactions(accountNo);
      return res.json({ reply });
    }

    // ===== CÁC HƯỚNG DẪN (RULE-BASED) =====
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
      reply: "Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau.",
    });
  }
};

module.exports = { chatWithBot };
