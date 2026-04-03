const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());

const GEMINI_KEY = process.env.GEMINI_API_KEY;
console.log("KEY PREFIX:", GEMINI_KEY?.slice(0, 10));
const genAI = new GoogleGenerativeAI(GEMINI_KEY);

app.get("/", (req, res) => {
  res.send(`
    <html>
      <body style="font-family: Arial; max-width: 700px; margin: 40px auto;">
        <h2>🤖 AI Web Test</h2>
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

app.post("/chat", async (req, res) => {
  try {
    const text = req.body.message || "xin chào";

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const result = await model.generateContent(text);
    const reply = result.response.text();

    res.json({ ok: true, reply });
  } catch (error) {
    res.json({
      ok: false,
      error: error.message,
      full: String(error)
    });
  }
});

app.listen(3000, () => {
  console.log("Web test running on port 3000");
});
