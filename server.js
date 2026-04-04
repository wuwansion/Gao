const OpenClaw = require('openclaw');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

// Load config
const config = JSON.parse(fs.readFileSync('openclaw.json'));

// Init OpenClaw
const openclaw = new OpenClaw({
  provider: config.provider,
  apiKey: config.apiKey,
  model: config.model,
  options: config.options
});

// Init Telegram polling
const bot = new TelegramBot(config.channels.telegram.token, { polling: true });

console.log('🤖 Telegram AI Sales Bot Siêu Sales đang chạy...');

// Hàm phân loại câu hỏi
function detectCategory(text) {
  text = text.toLowerCase();
  for (const [category, keywords] of Object.entries(config.salesCategories)) {
    if (keywords.some(k => text.includes(k))) return category;
  }
  return "general";
}

// Hàm gợi ý sản phẩm
function suggestProduct(text) {
  text = text.toLowerCase();
  for (const p of config.products) {
    if (p.keywords.some(k => text.includes(k))) return p;
  }
  return null;
}

// Bot reply
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  console.log(`📩 Tin nhắn từ ${msg.from.username || msg.from.first_name}: ${text}`);

  const category = detectCategory(text);
  const product = suggestProduct(text);

  let prompt = `Khách hỏi: "${text}"\n`;

  switch (category) {
    case 'price':
      prompt += "Trả lời khách hàng về giá cả, nhiệt tình, thân thiện.";
      break;
    case 'product':
      prompt += "Trả lời khách hàng về sản phẩm, mô tả chi tiết, gợi ý lựa chọn.";
      break;
    case 'order':
      prompt += "Hướng dẫn khách hàng cách đặt hàng, ship hàng, thanh toán, thân thiện.";
      break;
    default:
      prompt += "Trả lời khách hàng thân thiện, hỗ trợ nhiệt tình.";
  }

  if (product) {
    prompt += `\nGợi ý sản phẩm: ${product.name}. Link Shopee: ${product.shopee}, Link TikTok Shop: ${product.tiktok}`;
  }

  try {
    const aiResponse = await openclaw.generate({
      prompt: prompt,
      max_tokens: 512
    });

    await bot.sendMessage(chatId, aiResponse.text);
  } catch (err) {
    console.error('❌ Lỗi khi gọi AI:', err);
    await bot.sendMessage(chatId, 'Xin lỗi, shop đang bận, thử lại sau 1 phút nhé.');
  }
});
