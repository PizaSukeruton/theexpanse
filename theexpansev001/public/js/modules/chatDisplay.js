// public/js/modules/chatDisplay.js
import { ModuleRegistry } from '../moduleRegistry.js';

ModuleRegistry.register('terminal/chatDisplay', {
  mount(container, context) {
    console.log('[chatDisplay] Mounting...');
   
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; padding: 16px;">
        <div id="chat-log" class="chat-log" style="flex: 1; overflow-y: auto; font-size: 14px; line-height: 1.6;"></div>
      </div>
    `;
   
    addStyles();
   
    // Get terminal socket and listen for responses
    const terminalSocket = window.SocketManager.getTerminalSocket();
    
    terminalSocket.on('connect_error', (err) => {
      if (err.message === 'Unauthorized') {
        console.warn('[chatDisplay] Terminal socket unauthorized - redirecting to login');
        window.location.href = '/terminal_new_v003.html';
      }
    });
    
    terminalSocket.on('command-response', (data) => {
      displayResponse(data);
    });
   
    // Store reference for external access
    window.chatDisplay = {
      log: logChat,
      clear: clearChat
    };
  }
});

function logChat(type, message) {
  const chatLog = document.getElementById('chat-log');
  if (!chatLog) return;
 
  const entry = document.createElement('div');
  entry.className = 'chat-line';
 
  if (type === 'user') {
    entry.innerHTML = `<span class="chat-user">YOU</span>: ${message}`;
  } else if (type === 'bot') {
    entry.innerHTML = `<span class="chat-bot">EXPANSE</span>: ${message}`;
  } else if (type === 'system') {
    entry.innerHTML = `<span class="chat-system">//</span> ${message}`;
  }
 
  chatLog.appendChild(entry);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function clearChat() {
  const chatLog = document.getElementById('chat-log');
  if (chatLog) chatLog.innerHTML = '';
}


function displayResponse(data) {
  if (data.error) {
    logChat('system', `ERROR: ${data.error}`);
  } else if (data.output) {
    logChat('bot', data.output);
  } else if (data.response) {
    logChat('bot', data.response);
  } else if (data.message) {
    logChat('bot', data.message);
  }
}
function addStyles() {
  if (document.getElementById('chat-display-styles')) return;
 
  const style = document.createElement('style');
  style.id = 'chat-display-styles';
  style.textContent = `
    .chat-log {
      color: #00ff75;
      font-family: 'Courier New', monospace;
    }
    .chat-line {
      margin-bottom: 8px;
      font-size: 14px;
    }
    .chat-user {
      color: #39ff14;
      font-weight: bold;
      margin-right: 5px;
    }
    .chat-bot {
      color: #33b8cc;
      font-weight: bold;
    }
    .chat-system {
      color: #cc8613;
      font-weight: bold;
    }
  `;
  document.head.appendChild(style);
}
