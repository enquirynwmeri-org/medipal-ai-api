// Load environment variables
require('dotenv').config();

// Import packages
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Root route (health check)
app.get('/', (req, res) => {
  res.send('✅ Medipal AI backend is running.');
});

// GPT-4.1 endpoint
app.post('/generate-text', async (req, res) => {
  const userPrompt = req.body.prompt;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-1106-preview',
        messages: [
          { role: 'system', content: 'You are Medipal AI assistant.' },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    const output = response.data.choices[0].message.content;
    res.json({ result: output });
  } catch (error) {
    console.error('OpenAI error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Something went wrong with OpenAI request.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ API running on port ${PORT}`);
});
