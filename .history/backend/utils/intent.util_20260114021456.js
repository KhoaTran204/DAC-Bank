function detectIntent(message) {
  if (!message) return "OTHER";

  const text = message.toLowerCase().trim();

  // ===== SỐ DƯ =====
  if (
    text.includes("số dư") ||
    text.includes("bao nhiêu tiền") ||
    text.includes("còn bao nhiêu") ||
    text.includes("tài khoản còn")
  ) {
    return "BALANCE";
  }

  // ===== LỊCH SỬ GIAO DỊCH =====
  if (
    text.includes("giao dịch") ||
    text.includes("lịch sử") ||
    text.includes("lịch sử giao dịch")
  ) {
    return "TRANSACTION";
  }

  // ===== HƯỚNG DẪN CHUYỂN TIỀN =====
  if (
    text.includes("chuyển tiền") ||
    text.includes("hướng dẫn chuyển tiền") ||
    text.includes("cách chuyển tiền")
  ) {
    return "GUIDE_TRANSFER";
  }

  // ===== BẢO MẬT =====
  if (
    text.includes("bảo mật") ||
    text.includes("an toàn") ||
    text.includes("bị hack")
  ) {
    return "GUIDE_SECURITY";
  }

  // ===== OTP =====
  if (text.includes("otp") || text.includes("mã otp")) {
    return "GUIDE_OTP";
  }

  // ===== ĐĂNG NHẬP =====
  if (text.includes("đăng nhập") || text.includes("login")) {
    return "GUIDE_LOGIN";
  }

  // ===== QUÊN MẬT KHẨU =====
  if (
    text.includes("quên mật khẩu") ||
    text.includes("mất mật khẩu") ||
    text.includes("lấy lại mật khẩu")
  ) {
    return "GUIDE_FORGOT_PASSWORD";
  }

  // ===== TÀI KHOẢN =====
  if (text.includes("tài khoản") || text.includes("quản lý tài khoản")) {
    return "GUIDE_ACCOUNT";
  }

  return "OTHER";
}

module.exports = { detectIntent };
