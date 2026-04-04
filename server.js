const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const fs = require("fs");
const express = require("express");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const config = JSON.parse(fs.readFileSync("./openclaw.json", "utf8"));

console.log("TOKEN:", process.env.TELEGRAM_TOKEN ? "OK" : "MISSING");
console.log("OPENROUTER:", process.env.OPENROUTER_KEY ? "OK" : "MISSING");

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
  polling: true
});

console.log("🤖 Bot Telegram đang chạy...");

// mở port cho Render
app.get("/", (req, res) => {
  res.send("🤖 Sales bot is running");
});

app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

function findProduct(message) {
  const text = message.toLowerCase();

  return config.products.find((p) =>
    p.keywords.some((k) => text.includes(k))
  );
}

async function askAI(userMessage, productInfo = "") {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: config.model,
        messages: [
          {
            role: "system",
            content: config.systemPrompt
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
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("❌", error.response?.data || error.message);
    return "Xin lỗi shop đang bận ❤️";
  }
}

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || "";

  const product = findProduct(text);

  let productInfo = "";

  if (product) {
    productInfo = `
Tên: ${product.name}
Giá: ${product.price}
Link: ${product.link}
`;
  }

  const reply = await askAI(text, productInfo);

  bot.sendMessage(chatId, reply);
});
