const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const fs = require("fs");
require("dotenv").config();

const config = JSON.parse(fs.readFileSync("./openclaw.json", "utf8"));

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
  polling: true
});

console.log("🤖 Bot Telegram đang chạy...");

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
          Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Lỗi AI:", error.response?.data || error.message);
    return "Xin lỗi shop đang bận, vui lòng thử lại sau ❤️";
  }
}

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

  bot.sendMessage(chatId, reply);
});
