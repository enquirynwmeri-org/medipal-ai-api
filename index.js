const express = require("express");
const axios = require("axios");
const multer = require("multer");
const cors = require("cors");
const FormData = require("form-data"); // Required for Whisper
require("dotenv").config();

const app = express();
const upload = multer();

app.use(express.json());
app.use(cors());

// ✅ Root test route
app.get("/", (req, res) => {
  res.send("✅ Medipal AI backend is running!");
});

// ✅ POST /polish-letter - Clinical letter polishing using GPT-4
app.post("/polish-letter", async (req, res) => {
  const { inputText } = req.body;
  if (!inputText) {
    return res.status(400).json({ error: "Missing inputText in request body." });
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4-1106-preview",
        messages: [
          { role: "system", content: "You are a clinical letter assistant. Use formal, clear, safe British English in all letters." },
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

    const output = response.data.choices?.[0]?.message?.content || "No content returned";
    res.status(200).json({ output });
  } catch (error) {
    console.error("Error in /polish-letter:", error.message);
    res.status(500).json({ error: "Failed to polish letter", details: error.message });
  }
});

// ✅ POST /transcribe-dictation - Audio transcription using Whisper
app.post("/transcribe-dictation", upload.single("audio"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No audio file uploaded." });
  }

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

    res.status(200).json({ transcript: response.data.text });
  } catch (error) {
    console.error("Error in /transcribe-dictation:", error.message);
    res.status(500).json({ error: "Transcription failed", details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 API
