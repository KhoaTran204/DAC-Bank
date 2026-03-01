const { askGemini } = require("../services/gemini.service");

const {
  detectIntent,
  getBalance,
  getTransactions,
} = require("../services/chatbot.helper");

const chatWithBot = async (req, res) => {
  const { message, accountNo } = req.body;

  try {
    const intent = detectIntent(message);

    if (intent === "BALANCE") {
      const reply = await getBalance(accountNo);
      return res.json({ reply });
    }

    if (intent === "HISTORY") {
      const reply = await getTransactions(accountNo);
      return res.json({ reply });
    }

    // fallback AI
    const reply = await askGemini(message);
    res.json({ reply });
  } catch (err) {
    console.error("❌ CHATBOT ERROR:", err);
    res.status(500).json({ message: "Chatbot error", error: err.message });
  }
};

module.exports = { chatWithBot };
