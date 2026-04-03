const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());

// Token Telegram của bạn
const TELEGRAM_TOKEN = "8708556891:AAGnpgpnfj2W1sACWpHM78HSHN3xf2sp5hA";

// Gemini API key vẫn lấy từ Render Environment
const GEMINI_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_KEY);

app.get("/", (req, res) => {
  res.send("OpenClaw Telegram bot is live 🚀");
});

app.post(`/webhook/${TELEGRAM_TOKEN}`, async (req, res) => {
  try {
    const message = req.body.message;
    if (!message) return res.sendStatus(200);

    const chatId = message.chat.id;
    const text = message.text || "Xin chào";

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const result = await model.generateContent(text);
    const reply = result.response.text();

    const response = await fetch(
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

    if (!response.ok) {
      console.error("Telegram send failed:", await response.text());
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error);
    res.sendStatus(500);
  }
});

app.listen(3000, () => {
  console.log("Telegram bot running on port 3000");
});
