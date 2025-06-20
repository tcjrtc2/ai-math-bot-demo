document.getElementById('submit').addEventListener('click', async () => {
  const prompt = document.getElementById('prompt').value;
  const responseDiv = document.getElementById('response');

  responseDiv.innerText = "Solving...";

  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: prompt })
    });

    try {
      console.log('Parsing response...');
      const data = await response.json();
      console.log('Frontend received data:', {
        type: typeof data,
        keys: Object.keys(data),
        raw: data,
        stringified: JSON.stringify(data, null, 2)
      });
      
      if (!response.ok) {
        console.error('Server returned error status:', response.status);
        throw new Error(`Server returned ${response.status}: ${data.error || 'Unknown error'}`);
      }
      
      if (data.error) {
        console.error('Server sent error:', data.error);
        throw new Error(data.error);
      }
      
      console.log('Checking reply property:', {
        hasReply: 'reply' in data,
        replyType: typeof data.reply,
        replyValue: data.reply
      });
      
      if (typeof data.reply === 'string' && data.reply.trim()) {
        console.log('Valid reply received:', data.reply);
        responseDiv.innerText = data.reply;
        MathJax.typeset();  // Render LaTeX if any
      } else {
        console.error('Invalid response format:', {
          hasReply: 'reply' in data,
          replyType: typeof data.reply,
          fullResponse: data
        });
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error processing response:', error);
      responseDiv.innerText = `Error: ${error.message}`;
    }
  } catch (error) {
    console.error(error);
    responseDiv.innerText = "Error: " + error.message;
  }
});
