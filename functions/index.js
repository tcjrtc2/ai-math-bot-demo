/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v1/https");
const logger = require("firebase-functions/logger");
const functions = require("firebase-functions");
const { OpenAI } = require("openai");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Initialize OpenAI with API key from Firebase config
const openai = new OpenAI({ apiKey: functions.config().openai.key });

// Create the chatbot function
exports.chatbot = functions.https.onRequest(async (req, res) => {
  // Set CORS headers for frontend access
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  try {
    const { message } = req.body;
    
    // Log incoming request for debugging
    logger.info("Chatbot request received", { message });
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful math tutor. Provide clear, step-by-step explanations of mathematical concepts and solutions. Use LaTeX notation for equations when appropriate." },
        { role: "user", content: message }
      ]
    });
    
    // Return the response
    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    // Log the error
    logger.error("Error in chatbot function", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});
