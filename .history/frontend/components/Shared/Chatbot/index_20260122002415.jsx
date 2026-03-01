import { useState, useEffect, useRef } from "react";
import { Input } from "antd";
import {
  MessageOutlined,
  CloseOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import { http } from "../../../modules/modules";

const Chatbot = () => {
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));

  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Xin chào 👋 Tôi là Trợ lý AI Ngân hàng. Tôi có thể giúp gì cho bạn?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const messagesEndRef = useRef(null);

  const suggestions = [
    "Số dư tài khoản của tôi là bao nhiêu?",
    "Lịch sử giao dịch gần đây",
    "Tôi muốn chuyển tiền",
    "Phí dịch vụ ngân hàng",
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
      {/* ================= ICON CHATBOT ================= */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[999]
          w-16 h-16 rounded-full
          bg-gradient-to-br from-blue-500 to-blue-700
          text-white flex items-center justify-center
          shadow-xl hover:scale-105 transition
          ring-4 ring-blue-200"
        >
          {/* Ping effect */}
          <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-20 animate-ping" />

          <RobotOutlined className="relative text-2xl" />
        </button>
      )}

      {/* ================= CHAT WINDOW ================= */}
      {open && (
        <div className="fixed bottom-6 right-6 z-[999] w-[360px] h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-blue-600 to-blue-500 text-white">
            <div className="font-semibold flex items-center gap-2">
              <RobotOutlined />
              Trợ lý AI Ngân hàng
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
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-line ${
                      msg.from === "user"
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-900 shadow-sm"
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
                placeholder="Nhập tin nhắn..."
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
