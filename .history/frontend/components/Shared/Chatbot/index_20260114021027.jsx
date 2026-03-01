import { useState, useEffect, useRef } from "react";
import { Input } from "antd";
import { MessageOutlined, CloseOutlined } from "@ant-design/icons";
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

  // 🔑 ref để auto scroll
  const messagesEndRef = useRef(null);

  // 🎯 GỢI Ý CHAT
  const suggestions = [
    "Số dư tài khoản của tôi là bao nhiêu?",
    "Lịch sử giao dịch gần đây",
    "Tôi muốn chuyển tiền",
    "Phí dịch vụ ngân hàng",
  ];

  // ✅ AUTO SCROLL KHI CÓ TIN NHẮN MỚI
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (value) => {
    const text = value ?? input;
    if (!text.trim()) return;

    const userMsg = { from: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await http().post("/api/chatbot", {
        message: text,
        accountNo: userInfo?.accountNo,
      });

      setMessages((prev) => [...prev, { from: "bot", text: res.data.reply }]);
    } catch (err) {
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
      {/* 🔵 ICON */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-[999] w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition"
        >
          <MessageOutlined className="text-xl" />
        </button>
      )}

      {/* 💬 CHAT WINDOW */}
      {open && (
        <div className="fixed bottom-5 right-5 z-[999] w-[360px] h-[520px] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden">
          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <div className="font-semibold flex items-center gap-2">
              🤖 Trợ lý AI Ngân hàng
            </div>
            <CloseOutlined
              onClick={() => setOpen(false)}
              className="cursor-pointer text-gray-500 hover:text-black"
            />
          </div>

          {/* BODY */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.from === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm break-words whitespace-pre-line ${
                      msg.from === "user"
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-900 rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* 🔽 mốc auto scroll */}
              <div ref={messagesEndRef} />
            </div>

            {/* 💡 GỢI Ý CHAT */}
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
