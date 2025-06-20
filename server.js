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
        {          role: "system",
          content: "You are a helpful math tutor. Format your responses in this clear, easy-to-read style:\n\nProblem:\n[State the question clearly]\n\nKey Concepts:\n[Define any variables or terms using plain English]\n\nFormula:\n[Write formulas in plain text]\nExamples:\n- Area = π × radius²\n- Distance = speed × time\n- x = (-b + √(b² - 4ac)) ÷ 2a\n\nSolution:\n1. [First step in simple terms]\n2. [Next step]\n[Continue with steps]\n\nCalculation:\n[Show the actual numbers and operations]\n\nFinal Answer: [Result with units]\n\nStrictly Follow These Rules:\n1. NEVER use $ symbols or LaTeX notation\n2. Always write variables in plain text (x, y, z, a, b, c)\n3. Use these symbols:\n   × for multiplication\n   ÷ or / for division\n   = for equals\n   ² ³ for exponents when possible\n   π for pi\n   √ for square root\n4. Write fractions as:\n   - Simple ones with /: 1/2, 3/4\n   - Complex ones with ÷ or multiple lines\n5. Always explain what each variable means in plain English\n6. Break complex equations into smaller, clearer steps\n7. Include units in calculations and final answer"
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    console.log('OpenAI API Response:', completion);

    // Extract the response content
    const reply = completion.choices[0].message.content;
    console.log('Extracted reply:', reply);

    // Send the response
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
