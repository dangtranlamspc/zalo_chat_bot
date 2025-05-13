require("dotenv").config();
const express = require("express");
const axios = require("axios");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

const zaloToken = process.env.ZALO_ACCESS_TOKEN;
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Đảm bảo bạn có API key trong .env
});

// Đường dẫn webhook Zalo sẽ gọi
app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    // Kiểm tra tin nhắn văn bản
    if (body.event_name === "user_send_text") {
      const userId = body.sender.id;
      const userMessage = body.message.text;

      // Gửi yêu cầu tới ChatGPT
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Hello!" }],
      });

      const botReply = completion.data.choices[0].message.content;

      // Gửi lại tin nhắn cho người dùng Zalo
      await axios.post(
        "https://openapi.zalo.me/v4.0/oa/message",
        {
          recipient: { user_id: userId },
          message: { text: botReply },
        },
        {
          headers: {
            "Content-Type": "application/json",
            access_token: zaloToken,
          },
        }
      );
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Lỗi xử lý webhook:", err.message);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Zalo ChatGPT Bot đang chạy tại http://localhost:${PORT}`);
});
