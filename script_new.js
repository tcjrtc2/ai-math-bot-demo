// Function to send message to server
async function sendMessage(message) {
  const responseDiv = document.getElementById('response');
  const suggestionsDiv = document.getElementById('suggestions');
  
  responseDiv.innerText = "Solving...";
  suggestionsDiv.classList.add('hidden');

  try {
    console.log('Sending request with prompt:', message);
    
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: message })
    });

    const data = await response.json();
    console.log('Server response:', data);

    if (data.error) {
      throw new Error(`${data.error}${data.details ? '\n' + data.details : ''}`);
    }

    if (!data.reply) {
      throw new Error('No reply received from server');
    }

    responseDiv.innerText = data.reply;
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
    sendMessage(prompt);
  });
});

// Event listener for Enter key in textarea
document.getElementById('prompt').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    document.getElementById('submit').click();
  }
});
