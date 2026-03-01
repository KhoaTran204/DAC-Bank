function detectIntent(message) {
  if (!message) return "OTHER";

  const text = message.toLowerCase().trim();

  if (text === "so du" || text.includes("so du hien tai")) {
    return "BALANCE";
  }

  if (text.includes("giao dich") || text.includes("lich su")) {
    return "TRANSACTION";
  }

  if (text.includes("huong dan chuyen tien")) {
    return "GUIDE_TRANSFER";
  }

  if (text.includes("bao mat")) {
    return "GUIDE_SECURITY";
  }

  return "OTHER";
}

module.exports = { detectIntent };
