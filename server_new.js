const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    console.log('Received message:', message);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful math tutor. Provide step-by-step explanations and use LaTeX notation where appropriate."
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    console.log('OpenAI API Response:', completion);

    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      throw new Error('Invalid response structure from OpenAI');
    }

    const reply = completion.choices[0].message.content;
    console.log('Extracted reply:', reply);

    res.json({ reply: reply });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.response?.data?.error?.message || 'Unknown error'
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
