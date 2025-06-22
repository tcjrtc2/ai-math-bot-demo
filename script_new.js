// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9FZm-3-o3Z5i3pPNk8uvwsnFuBKIB5-A",
  authDomain: "nsu-bot-server-test.firebaseapp.com",
  projectId: "nsu-bot-server-test",
  storageBucket: "nsu-bot-server-test.firebasestorage.app",
  messagingSenderId: "169660316820",
  appId: "1:169660316820:web:b5555a63473a9f48c08881"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Function to send message to server
async function sendMessage(message) {
  const responseDiv = document.getElementById('response');
  const suggestionsDiv = document.getElementById('suggestions');
  
  responseDiv.innerText = "Solving...";
  suggestionsDiv.classList.add('hidden');

  try {
    console.log('Sending request with prompt:', message);
      // Use the deployed Firebase function URL
    // Format: https://<region>-<project-id>.cloudfunctions.net/chatbot
    const response = await fetch('https://us-central1-nsu-bot-server-test.cloudfunctions.net/chatbot', {
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
