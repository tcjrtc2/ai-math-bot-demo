// Variables to store context
let lastAnswer = '';
let originalQuestion = '';

// Function to send message to server
async function sendMessage(message, includeContext = false, contextType = '') {
  const responseDiv = document.getElementById('response');
  const suggestionsDiv = document.getElementById('suggestions');
  
  responseDiv.innerText = "Solving...";
  suggestionsDiv.classList.add('hidden');

  try {
    console.log('Sending request with prompt:', message);
    
    // Process the message based on context type
    let finalMessage = message;
    
    if (includeContext) {
      if (contextType === 'explain' && lastAnswer) {
        finalMessage = `Regarding this previous explanation: "${lastAnswer}"\n\n${message}`;
      } 
      else if (contextType === 'practice' && originalQuestion) {
        finalMessage = `Based on this original question: "${originalQuestion}"\n\n${message}`;
      }
      else if (contextType === 'confused' && lastAnswer) {
        finalMessage = `I was confused by this explanation: "${lastAnswer}"\n\nThe original question was: "${originalQuestion}"\n\n${message}`;
      }
      else if (contextType === 'test' && originalQuestion) {
        finalMessage = `Create a mini practice test about the concepts in this question: "${originalQuestion}"\n\n${message}`;
      }
    }
    
    // Check if this is a new original question (not a follow-up)
    if (!includeContext) {
      originalQuestion = message;
    }
    
    // Use the Express server
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: finalMessage })
    });

    const data = await response.json();
    console.log('Server response:', data);

    if (data.error) {
      throw new Error(`${data.error}${data.details ? '\n' + data.details : ''}`);
    }

    if (!data.reply) {
      throw new Error('No reply received from server');    }

    responseDiv.innerText = data.reply;
    // Store the current answer for potential future reference
    lastAnswer = data.reply;
    
    MathJax.typeset();  // Render LaTeX if any
    
    // Show suggestions after successful response
    suggestionsDiv.classList.remove('hidden');
  } catch (error) {
    console.error('Error:', error);
    responseDiv.innerText = error.message;
  }
}

// Event listener for main submit button
document.getElementById('submit').addEventListener('click', () => {
  const prompt = document.getElementById('prompt').value;
  sendMessage(prompt);
});

// Event listeners for suggestion buttons
document.querySelectorAll('.suggestion-btn').forEach(button => {
  button.addEventListener('click', () => {
    const prompt = button.getAttribute('data-prompt');
    document.getElementById('prompt').value = prompt;
    
    // Determine which context to include based on the button
    let includeContext = false;
    let contextType = '';
    
    if (prompt === "Can you explain this in more detail?") {
      includeContext = true;
      contextType = 'explain';
    } 
    else if (prompt === "Create a practice problem about this topic") {
      includeContext = true;
      contextType = 'practice';
    }
    else if (prompt === "I'm still confused, can you explain this another way?") {
      includeContext = true;
      contextType = 'confused';
    }
    else if (prompt === "Create a mini practice test about this topic") {
      includeContext = true;
      contextType = 'test';
    }
    
    sendMessage(prompt, includeContext, contextType);
  });
});

// Event listener for Enter key in textarea
document.getElementById('prompt').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    document.getElementById('submit').click();
  }
});
