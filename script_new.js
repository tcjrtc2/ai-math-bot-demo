// Variable to store the last answer for context
let lastAnswer = '';

// Function to send message to server
async function sendMessage(message, includeLastAnswer = false) {
  const responseDiv = document.getElementById('response');
  const suggestionsDiv = document.getElementById('suggestions');
  
  responseDiv.innerText = "Solving...";
  suggestionsDiv.classList.add('hidden');

  try {
    console.log('Sending request with prompt:', message);
    
    // If includeLastAnswer is true, add the last answer as context
    let finalMessage = message;
    if (includeLastAnswer && lastAnswer) {
      finalMessage = `Regarding this previous explanation: "${lastAnswer}"\n\n${message}`;
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
    
    // Check if this is the "Explain More" button
    const includeLastAnswer = prompt === "Can you explain this in more detail?";
    
    sendMessage(prompt, includeLastAnswer);
  });
});

// Event listener for Enter key in textarea
document.getElementById('prompt').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    document.getElementById('submit').click();
  }
});
