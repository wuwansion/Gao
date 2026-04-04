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

// debug env
console.log("TOKEN:", process.env.TELEGRAM_TOKEN ? "OK" : "MISSING");
console.log("OPENROUTER:", process.env.OPENROUTER_KEY ? "OK" : "MISSING");

// web server cho Render
app.get("/", (req, res) => {
  res.send("🤖 Sales Bot đang online");
});

app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

// xóa webhook cũ khi khởi động
async function clearWebhook() {
  try {
    await axios.get(
      `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/deleteWebhook`
    );
    console.log("✅ Webhook cũ đã xóa");
  } catch (err) {
    console.log("⚠️ Không xóa được webhook:", err.message);
  }
}

// tạo bot
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
  polling: {
    interval: 1000,
    autoStart: false,
    params: {
      timeout: 10
    }
  }
});

// tìm sản phẩm
function findProduct(message) {
  const text = message.toLowerCase();

  return config.products.find((p) =>
    p.keywords.some((k) => text.includes(k))
  );
}

// hỏi AI
async function askAI(userMessage, productInfo = "") {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemma-2-9b-it:free",
        messages: [
          {
            role: "system",
            content:
              config.systemPrompt ||
              "Bạn là AI sales bot thân thiện, trả lời ngắn gọn và tư vấn sản phẩm."
          },
          {
            role: "user",
            content: `${userMessage}\n${productInfo}`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_KEY.trim()}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://render.com",
          "X-Title": "salesbot"
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.log("========== AI ERROR ==========");
    console.log("STATUS:", error.response?.status);
    console.log(
      "DATA:",
      JSON.stringify(error.response?.data, null, 2)
    );
    console.log("MESSAGE:", error.message);
    console.log("==============================");

    return "Xin lỗi shop đang bận ❤️";
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

// khởi động an toàn
(async () => {
  await clearWebhook();
  await bot.startPolling();
  console.log("🤖 Bot Telegram đang chạy...");
})();
