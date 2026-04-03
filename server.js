const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());

// ===== ENV =====
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

console.log("===== SERVER START =====");
console.log("KEY PREFIX:", GEMINI_KEY?.slice(0, 8));
console.log("PORT:", process.env.PORT || 3000);

const genAI = new GoogleGenerativeAI(GEMINI_KEY);

// ===== PROMPT =====
function buildSalesPrompt(userMessage) {
  return `
Bạn là trợ lý AI bán hàng cho shop online.
Trả lời bằng tiếng Việt tự nhiên, ngắn gọn, thân thiện.
Ưu tiên tư vấn và chốt đơn lịch sự.

Khách hỏi: ${userMessage}
`;
}

// ===== DELAY =====
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== GEMINI CALL WITH RETRY + FALLBACK =====
async function askAI(prompt) {
  const models = [
    "gemini-2.5-flash",
    "gemini-2.0-flash-lite"
  ];

  let lastError = null;

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName
      });

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      lastError = error;

      const msg = String(error);

      if (msg.includes("429")) {
        console.log("429 detected, waiting 3 seconds...");
        await sleep(3000);
        continue;
      }

      if (msg.includes("404")) {
        console.log("Model not found, trying fallback...");
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

// ===== WEB UI =====
app.get("/", (req, res) => {
  res.send(`
    <html>
      <body style="font-family: Arial; max-width: 700px; margin: 40px auto;">
        <h2>🤖 OpenClaw AI Sales Bot</h2>
        <input id="msg" style="width:80%;padding:10px" placeholder="Nhập tin nhắn..." />
        <button onclick="sendMsg()">Gửi</button>
        <pre id="reply" style="margin-top:20px; white-space:pre-wrap;"></pre>

        <script>
          async function sendMsg() {
            const message = document.getElementById("msg").value;
            const res = await fetch("/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message })
            });
            const data = await res.json();
            document.getElementById("reply").innerText =
              data.reply || data.error;
          }
        </script>
      </body>
    </html>
  `);
});

// ===== WEB CHAT =====
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message || "Xin chào";
    const prompt = buildSalesPrompt(userMessage);

    const reply = await askAI(prompt);

    res.json({
      ok: true,
      reply
    });
  } catch (error) {
    console.error("CHAT ERROR:", error);

    res.json({
      ok: false,
      error: "AI đang bận, vui lòng thử lại sau 1 phút."
    });
  }
});

// ===== TELEGRAM WEBHOOK =====
app.post(`/webhook/${TELEGRAM_TOKEN}`, async (req, res) => {
  try {
    const message = req.body.message;
    if (!message) return res.sendStatus(200);

    const chatId = message.chat.id;
    const userMessage = message.text || "Xin chào";

    const prompt = buildSalesPrompt(userMessage);
    const reply = await askAI(prompt);

    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: reply
        })
      }
    );

    res.sendStatus(200);
  } catch (error) {
    console.error("WEBHOOK ERROR:", error);
    res.sendStatus(500);
  }
});

// ===== START =====
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Bot live on port", PORT);
});
