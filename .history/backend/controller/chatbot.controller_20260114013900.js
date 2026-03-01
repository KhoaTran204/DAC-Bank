const { askGemini } = require("../services/gemini.service");

// IMPORT TU utils (DUNG VOI BUOC 3)
const { detectIntent } = require("../utils/intent.util");

// cac ham xu ly nghiep vu
const { getBalance, getTransactions } = require("../services/chatbot.helper");

const chatWithBot = async (req, res) => {
  const { message, accountNo } = req.body;

  try {
    // check message
    if (!message || typeof message !== "string") {
      return res.json({
        reply: "Vui long nhap noi dung can hoi",
      });
    }

    const intent = detectIntent(message);
    console.log("🤖 INTENT:", intent);

    // ===== SO DU =====
    if (intent === "BALANCE") {
      if (!accountNo) {
        return res.json({
          reply: "Khong tim thay thong tin tai khoan",
        });
      }

      const reply = await getBalance(accountNo);
      return res.json({ reply });
    }

    // ===== LICH SU GIAO DICH =====
    if (intent === "TRANSACTION") {
      if (!accountNo) {
        return res.json({
          reply: "Khong tim thay thong tin tai khoan",
        });
      }

      const reply = await getTransactions(accountNo);
      return res.json({ reply });
    }

    // ===== HUONG DAN CHUYEN TIEN (RULE-BASED) =====
    if (intent === "GUIDE_TRANSFER") {
      return res.json({
        reply:
          "De chuyen tien, ban vao muc Chuyen tien, nhap so tai khoan nguoi nhan, so tien va xac nhan OTP.",
      });
    }

    // ===== HUONG DAN BAO MAT =====
    if (intent === "GUIDE_SECURITY") {
      return res.json({
        reply:
          "Khong chia se OTP, mat khau. Khong bam vao link la. Lien he ngan hang neu nghi ngo bat thuong.",
      });
    }

    // ===== FALLBACK GEMINI =====
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
