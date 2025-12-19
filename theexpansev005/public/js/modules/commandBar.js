// public/js/modules/commandBar.js
// Command input interface module

import { ModuleRegistry } from '../moduleRegistry.js';

ModuleRegistry.register('ui/commandBar', {
  mount(container, context) {
    console.log('[commandBar] Mounting...');
   
    container.innerHTML = `
      <div class="chat-input-bar">
        <input id="chat-input" type="text" placeholder="> Enter command" autocomplete="off" />
        <button id="send-btn">Send</button>
      </div>
    `;

    const chatInput = container.querySelector('#chat-input');
    const sendBtn = container.querySelector('#send-btn');
    
    // Get terminal socket
    const terminalSocket = window.SocketManager.getTerminalSocket();

    function submitCommand() {
      const command = chatInput.value.trim();
      if (!command) return;

      console.log('[commandBar] Submitting:', command);
     
      // Check if terminal socket is authorized
      if (!window.SocketManager.isTerminalAuthorized()) {
        console.warn('[commandBar] Attempt to send command without auth');
        window.location.href = '/terminal_new_v003.html';
        return;
      }

      terminalSocket.emit('terminal-command', { command });
      chatInput.value = '';
    }

    sendBtn.addEventListener('click', submitCommand);

    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitCommand();
      }
    });

    chatInput.focus();
  }
});
