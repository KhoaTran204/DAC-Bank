import { useState, useEffect, useRef } from "react";
import { Input, Tooltip } from "antd";
import { MessageFilled, CloseOutlined, RobotOutlined } from "@ant-design/icons";
import { http } from "../../../modules/modules";

const Chatbot = () => {
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));

  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Xin chào 👋 Tôi là trợ lý Nova. Tôi có thể hỗ trợ bạn ngay bây giờ.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const messagesEndRef = useRef(null);

  const suggestions = [
    "Số dư tài khoản của tôi",
    "Lịch sử giao dịch",
    "Hướng dẫn chuyển tiền",
    "Phí dịch vụ",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (value) => {
    const text = value ?? input;
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { from: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await http().post("/api/chatbot", {
        message: text,
        accountNo: userInfo?.accountNo,
      });

      setMessages((prev) => [...prev, { from: "bot", text: res.data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ================= ICON CHATBOT (PRO) ================= */}
      {/* ================= ICON CHATBOT (STYLE MOMO) ================= */}
      {!open && (
        <Tooltip title="Trợ lý Nova" placement="left">
          <button
            onClick={() => setOpen(true)}
            className="
        fixed bottom-6 right-6 z-[999]
        w-12 h-12 rounded-full
        bg-gradient-to-br from-pink-500 to-rose-500
        text-white flex items-center justify-center
        shadow-lg hover:shadow-xl hover:scale-105
        transition-all duration-200
      "
          >
            {/* Bubble chat giống MoMo */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4C2.9 2 2 2.9 2 4v14l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>

            {/* Online dot nhỏ – tinh tế */}
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
          </button>
        </Tooltip>
      )}

      {/* ================= CHAT WINDOW ================= */}
      {open && (
        <div className="fixed bottom-6 right-6 z-[999] w-[360px] h-[520px] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden">
          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white">
            <div className="flex items-center gap-2 font-semibold">
              <RobotOutlined />
              Trợ lý Nova
            </div>
            <CloseOutlined
              onClick={() => setOpen(false)}
              className="cursor-pointer hover:opacity-80"
            />
          </div>

          {/* BODY */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.from === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-xl text-sm whitespace-pre-line ${
                      msg.from === "user"
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* GỢI Ý */}
            <div className="px-3 py-2 border-t bg-gray-50 flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setInput(s)}
                  className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* INPUT */}
            <div className="border-t p-2">
              <Input.Search
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onSearch={sendMessage}
                enterButton="Gửi"
                loading={loading}
                placeholder="Nhập nội dung cần hỗ trợ..."
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
