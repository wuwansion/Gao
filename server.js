const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());

// ===== ENV =====
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const TELEGRAM_TOKEN =
  process.env.8708556891:AAGnpgpnfj2W1sACWpHM78HSHN3xf2sp5hA ||
  "8708556891:AAGnpgpnfj2W1sACWpHM78HSHN3xf2sp5hA";

console.log("===== SERVER START =====");
console.log("KEY PREFIX:", GEMINI_KEY?.slice(0, 10));
console.log("KEY LENGTH:", GEMINI_KEY?.length);

// ===== GEMINI =====
const genAI = new GoogleGenerativeAI(GEMINI_KEY);

// ===== PROMPT FUNCTION =====
function buildSalesPrompt(userMessage) {
  return `
Bạn là trợ lý AI bán hàng cho shop online.
Phong cách trả lời:
- tiếng Việt tự nhiên
- thân thiện, lịch sự
- ngắn gọn, dễ hiểu
- ưu tiên chốt đơn

Shop hiện đang bán:
- máy xay mini
- quạt mini cầm tay
- đèn ngủ cảm ứng
- phụ kiện gia dụng nhỏ

Luôn trả lời theo hướng:
1. giải đáp thắc mắc
2. nêu lợi ích sản phẩm
3. gợi ý mua hàng

Tin nhắn khách: ${userMessage}
`;
}

// ===== WEB UI =====
app.get("/", (req, res) => {
  res.send(`
    <html>
      <body style="font-family: Arial; max-width: 700px; margin: 40px auto;">
        <h2>🤖 OpenClaw AI Bán Hàng</h2>
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

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    res.json({
      ok: true,
      reply
    });
  } catch (error) {
    console.error("CHAT ERROR:", error);
    res.json({
      ok: false,
      error: error.message
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

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

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

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("AI sales bot live on port", PORT);
});
