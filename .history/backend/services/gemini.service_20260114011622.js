const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function askGemini(message) {
  const url =
    "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" +
    GEMINI_API_KEY;

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: message }],
      },
    ],
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("❌ GEMINI API ERROR:", data);
    throw new Error("Gemini API error");
  }

  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Xin lỗi, tôi chưa thể trả lời lúc này."
  );
}

module.exports = { askGemini };
