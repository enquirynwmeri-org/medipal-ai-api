const express = require("express");
const axios = require("axios");
const multer = require("multer");
const cors = require("cors");
const FormData = require("form-data");
require("dotenv").config();

const app = express();
const upload = multer();
app.use(express.json());
app.use(cors());

// Root check
app.get("/", (req, res) => {
  res.send("✅ Medipal AI backend is running.");
});

// POST /polish-letter
app.post("/polish-letter", async (req, res) => {
  const { inputText } = req.body;
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4-1106-preview",
        messages: [
          { role: "system", content: "You are a clinical letter assistant." },
          { role: "user", content: `Polish this clinic letter:\n\n${inputText}` }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    res.send({ output: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// POST /transcribe-dictation
app.post("/transcribe-dictation", upload.single("audio"), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });
    formData.append("model", "whisper-1");

    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    res.send({ transcript: response.data.text });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ API running on port ${PORT}`));