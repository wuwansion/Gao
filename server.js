const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const fs = require("fs");
const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;
const TOKEN = process.env.TELEGRAM_TOKEN;
const BASE_URL =
  process.env.RENDER_EXTERNAL_URL ||
  "https://salesbot-gd0s.onrender.com";

const config = JSON.parse(
  fs.readFileSync("./openclaw.json", "utf8")
);

console.log("TOKEN:", TOKEN ? "OK" : "MISSING");
console.log(
  "OPENROUTER:",
  process.env.OPENROUTER_KEY ? "OK" : "MISSING"
);

// bot webhook
const bot = new TelegramBot(TOKEN);

// tìm sản phẩm
function findProduct(message) {
  const text = (message || "").toLowerCase();

  return config.products?.find((p) =>
    p.keywords?.some((k) => text.includes(k))
  );
}

// gọi AI có fallback model
async function askAI(userMessage, productInfo = "") {
  const models = [
    "qwen/qwen3.6-plus:free",
    "google/gemma-2-9b-it:free",
    "mistralai/mistral-7b-instruct:free"
  ];

  for (const model of models) {
    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages: [
            {
              role: "system",
              content:
                config.systemPrompt ||
                "Bạn là AI sales bot thân thiện, tư vấn nhiệt tình và chốt đơn."
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

      console.log(`✅ AI OK: ${model}`);

      return (
        response.data?.choices?.[0]?.message?.content ||
        "AI không trả lời"
      );
    } catch (error) {
      const status = error.response?.status;

      console.log(`❌ ${model}:`, status);

      if (status === 429) {
        continue;
      }

      return `⚠️ Lỗi AI:\n${JSON.stringify(
        error.response?.data || error.message
      )}`;
    }
  }

  return "⚠️ AI đang quá tải, vui lòng thử lại sau 1 phút ❤️";
}

// route chính
app.get("/", (req, res) => {
  res.send("🤖 Bot đang online");
});

// telegram webhook
app.post(`/bot${TOKEN}`, async (req, res) => {
  const msg = req.body.message;

  if (!msg) {
    return res.sendStatus(200);
  }

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

  res.sendStatus(200);
});

// start server + set webhook
app.listen(PORT, async () => {
  console.log(`🌐 Server chạy cổng ${PORT}`);

  try {
    await axios.get(
      `https://api.telegram.org/bot${TOKEN}/setWebhook?url=${BASE_URL}/bot${TOKEN}`
    );

    console.log("✅ Webhook đã cài");
  } catch (err) {
    console.log("❌ Webhook lỗi:", err.message);
  }
});
