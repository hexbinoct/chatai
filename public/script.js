document.addEventListener('DOMContentLoaded', () => {
  const messageInput = document.getElementById('message-input');
  const sendBtn = document.getElementById('send-btn');
  const chatMessages = document.getElementById('chat-messages');

  // Message history to maintain context
  const messages = [];

  function createCodeBlock(code) {
      const codeBlockDiv = document.createElement('div');
      codeBlockDiv.classList.add('message', 'ai-message', 'code-block');
      
      const preElement = document.createElement('pre');
      const codeElement = document.createElement('code');
      codeElement.textContent = code;
      preElement.appendChild(codeElement);
      codeBlockDiv.appendChild(preElement);
      
      return codeBlockDiv;
  }

  function addMessage(content, isUser = true, isCodeBlock = false) {
      let messageDiv;
      if (isCodeBlock) {
          messageDiv = createCodeBlock(content);
      } else {
          messageDiv = document.createElement('div');
          messageDiv.classList.add('message');
          messageDiv.classList.add(isUser ? 'user-message' : 'ai-message');
          messageDiv.textContent = content;
      }
      
      chatMessages.appendChild(messageDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      return messageDiv;
  }

  async function sendMessage() {
      const userMessage = messageInput.value.trim();
      if (!userMessage) return;

      // Clear input
      messageInput.value = '';

      // Add user message to chat
      addMessage(userMessage);

      // Prepare messages for API
      messages.push({
          role: 'user',
          content: userMessage
      });

      try {
          const response = await fetch('/api/chat', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ messages })
          });

          // Create AI response container
          const aiResponseDiv = addMessage('', false);
          let fullResponse = '';
          let isCodeBlock = false;
          let currentCodeBlock = '';

          // Use EventSource for streaming
          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                  if (line.startsWith('data: ')) {
                      const content = line.slice(6);
                      
                      // Check for code block start/end
                      if (content.includes('```')) {
                          isCodeBlock = !isCodeBlock;
                          
                          if (!isCodeBlock) {
                              // Render complete code block
                              aiResponseDiv.innerHTML = '';
                              addMessage(currentCodeBlock, false, true);
                              currentCodeBlock = '';
                              fullResponse = '';
                          }
                          continue;
                      }

                      if (content === '[DONE]') break;

                      if (isCodeBlock) {
                          currentCodeBlock += content;
                      } else {
                          fullResponse += content;
                          aiResponseDiv.textContent = fullResponse;
                      }
                  }
              }
          }

          // Add final non-code block message if exists
          if (fullResponse.trim()) {
              aiResponseDiv.textContent = fullResponse;
          }

          // Add AI response to context
          messages.push({
              role: 'assistant',
              content: fullResponse
          });

      } catch (error) {
          console.error('Error sending message:', error);
          addMessage('Sorry, there was an error communicating with the LLM.', false);
      }
  }

  // Event Listeners
  sendBtn.addEventListener('click', sendMessage);
  messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
      }
  });

});

