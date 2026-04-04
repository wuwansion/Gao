const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const fs = require("fs");
const express = require("express");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;

// đọc config
const config = JSON.parse(
  fs.readFileSync("./openclaw.json", "utf8")
);

// log env
console.log("TOKEN:", process.env.TELEGRAM_TOKEN ? "OK" : "MISSING");
console.log("OPENROUTER:", process.env.OPENROUTER_KEY ? "OK" : "MISSING");

// web server cho Render
app.get("/", (req, res) => {
  res.send("🤖 Sales Bot đang online");
});

app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

// xóa webhook cũ
async function clearWebhook() {
  try {
    await axios.get(
      `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/deleteWebhook?drop_pending_updates=true`
    );
    console.log("✅ Webhook cũ đã xóa");
  } catch (err) {
    console.log("⚠️ Lỗi xóa webhook:", err.message);
  }
}

// tạo bot
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
  polling: false
});

// tìm sản phẩm
function findProduct(message) {
  const text = (message || "").toLowerCase();

  return config.products?.find((p) =>
    p.keywords?.some((k) => text.includes(k))
  );
}

// gọi AI
async function askAI(userMessage, productInfo = "") {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "qwen/qwen3.6-plus:free",
        messages: [
          {
            role: "system",
            content:
              config.systemPrompt ||
              "Bạn là AI sales bot thân thiện, tư vấn và chốt đơn."
          },
          {
            role: "user",
            content: `${userMessage}\n${productInfo}`
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_KEY.trim()}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://render.com",
          "X-Title": "salesbot"
        },
        timeout: 30000
      }
    );

    console.log("✅ AI OK");

    return (
      response.data?.choices?.[0]?.message?.content ||
      "AI không trả lời"
    );
  } catch (error) {
    const errMsg = JSON.stringify(
      error.response?.data || error.message,
      null,
      2
    );

    console.log("========== AI ERROR ==========");
    console.log(errMsg);
    console.log("==============================");

    return `⚠️ Lỗi AI:\n${errMsg}`;
  }
}

// xử lý tin nhắn
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || "";

  console.log("📩", text);

  const product = findProduct(text);

  let productInfo = "";

  if (product) {
    productInfo = `
Sản phẩm phù hợp:
Tên: ${product.name}
Giá: ${product.price}
Link mua: ${product.link}
`;
  }

  const reply = await askAI(text, productInfo);

  await bot.sendMessage(chatId, reply);
});

// khởi động bot
(async () => {
  await clearWebhook();

  try {
    await bot.startPolling({
      restart: true,
      interval: 1000
    });

    console.log("🤖 Bot Telegram đang chạy...");
  } catch (err) {
    console.log("❌ Polling error:", err.message);
  }
})();
