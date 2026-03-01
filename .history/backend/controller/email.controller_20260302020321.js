require("dotenv").config();
const nodemailer = require("nodemailer");
const path = require("path");

const sendEmail = (req, res) => {
  const { email, password } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.ADMIN_EMAIL_PASSWORD,
    },
  });

  const emailTemplate = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Chi tiết tài khoản</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f4f4f4">
      <table width="100%" height="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <table width="600" style="background:#fff;border-radius:8px;font-family:Arial">
              
              <tr>
                <td align="center" style="padding:20px">
                  <img src="cid:dacbanklogo" width="140" alt="DAC Bank" />
                </td>
              </tr>

              <tr>
                <td align="center" style="background:#007bff;color:#fff;padding:12px;font-size:20px;font-weight:bold">
                  Ngân hàng Doanh nghiệp
                </td>
              </tr>

              <tr>
                <td style="padding:20px;color:#333">
                  <h2>Chào mừng bạn đến với nền tảng của chúng tôi!</h2>
                  <p>Dưới đây là thông tin đăng nhập:</p>

                  <table width="100%" cellpadding="10" cellspacing="0" style="border:1px solid #ddd">
                    <tr>
                      <td style="font-weight:bold">Tên đăng nhập:</td>
                      <td>${email}</td>
                    </tr>
                    <tr>
                      <td style="font-weight:bold">Mật khẩu:</td>
                      <td>${password}</td>
                    </tr>
                  </table>

                  <p style="margin-top:20px;font-size:14px;color:#777">
                    Vui lòng bảo mật thông tin và không chia sẻ cho bất kỳ ai.
                  </p>
                </td>
              </tr>

              <tr>
                <td align="center" style="background:#f1f1f1;padding:15px;font-size:12px;color:#666">
                  © 2025 DAC Bank. Mọi quyền được bảo lưu.
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;

  const mailOption = {
    from: process.env.ADMIN_EMAIL,
    to: email,
    subject: "Thông tin đăng nhập DAC Bank",
    html: emailTemplate,
    attachments: [
      {
        filename: "dacbanklogo.png",
        path: path.join(__dirname, "../public/dacbanklogo.png"),
        cid: "dacbanklogo", // 👈 trùng với src="cid:dacbanklogo"
      },
    ],
  };

  transporter.sendMail(mailOption, (err) => {
    if (err) {
      return res.status(500).json({
        message: "Gửi email thất bại",
        emailSend: false,
      });
    }
    res.status(200).json({
      message: "Gửi email thành công",
      emailSend: true,
    });
  });
};

module.exports = { sendEmail };
