# Local LLM Chat Application

## Overview
A sleek, dark-themed web application for chatting with a local language model using llama.cpp server.

## Features
- Modern, responsive UI
- Dark theme with accent colors
- Streaming chat responses
- Code block rendering
- Simple, intuitive interface

## Prerequisites
- Node.js (v14 or later)
- Running llama.cpp server

## Installation

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd chatai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Server
Edit `server.js` to set your llama.cpp server URL:
```javascript
const LLAMACPP_SERVER = 'http://localhost:8080'; // Adjust to your server
```

### 4. Start the Application
```bash
npm start
```

## Technologies Used
- Node.js
- Express
- Axios
- Vanilla JavaScript
- Tailwind-inspired CSS

## Customization
- Modify `styles.css` to change color scheme
- Adjust `server.js` for different LLM server configurations

## Troubleshooting
- Ensure llama.cpp server is running
- Check browser console for errors
- Verify server URL and port

## License
Lets think of the license later shall we!


