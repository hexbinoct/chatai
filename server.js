const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Llama.cpp server configuration
const LLAMACPP_SERVER = 'http://localhost:8080'; // Adjust to your llama.cpp server address

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Streaming endpoint for chat completions
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    // Set headers for server-sent events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-open');

    // Transform messages to llama.cpp format if needed
    const response = await axios.post(`${LLAMACPP_SERVER}/v1/chat/completions`, {
      messages: messages,
      stream: true,
      max_tokens: 150
    }, { responseType: 'stream' });

    // Stream the response back to the client
    response.data.on('data', (chunk) => {
      // Parse and send each chunk
      const lines = chunk.toString().split('\n');
      lines.forEach(line => {
        if (line.startsWith('data: ')) {
          try {
            const parsedChunk = JSON.parse(line.slice(6));
            if (parsedChunk.choices && parsedChunk.choices[0].delta.content) {
              res.write(`data: ${parsedChunk.choices[0].delta.content}\n\n`);
            }
          } catch (error) {
            console.error('Error parsing stream chunk:', error);
          }
        }
      });
    });

    response.data.on('end', () => {
      res.write('data: [DONE]\n\n');
      res.end();
    });

  } catch (error) {
    console.error('Error communicating with LLM:', error);
    res.status(500).json({ error: 'Failed to get response from LLM' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});