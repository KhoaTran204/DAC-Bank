function detectIntent(message) {
  if (!message) return "OTHER";

  const text = message.toLowerCase().trim();

  if (text === "số dư" || text.includes("số dư hiện tại")) {
    return "BALANCE";
  }

  if (text.includes("giao dịch") || text.includes("lịch sử")) {
    return "TRANSACTION";
  }

  if (text.includes("hướng dẫn chuyển tiền")) {
    return "GUIDE_TRANSFER";
  }

  if (text.includes("bảo mật")) {
    return "GUIDE_SECURITY";
  }

  return "OTHER";
}

module.exports = { detectIntent };
