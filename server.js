const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());

// ===== ENV =====
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8708556891:AAGnpgpnfj2W1sACWpHM78HSHN3xf2sp5hA";

// ===== DEBUG LOG =====
console.log("===== SERVER START =====");
console.log("KEY PREFIX:", GEMINI_KEY?.slice(0, 10));
console.log("KEY LENGTH:", GEMINI_KEY?.length);
console.log("PORT:", process.env.PORT || 3000);

// ===== GEMINI =====
const genAI = new GoogleGenerativeAI(GEMINI_KEY);

// ===== WEB UI =====
app.get("/", (req, res) => {
  res.send(`
    <html>
      <body style="font-family: Arial; max-width: 700px; margin: 40px auto;">
        <h2>🤖 OpenClaw AI Web Test</h2>
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
              JSON.stringify(data, null, 2);
          }
        </script>
      </body>
    </html>
  `);
});

// ===== WEB CHAT API =====
app.post("/chat", async (req, res) => {
  try {
    const text = req.body.message || "Xin chào";

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const result = await model.generateContent(text);
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
    const text = message.text || "Xin chào";

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const result = await model.generateContent(text);
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
  console.log("Server live on port", PORT);
});
