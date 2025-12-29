// socketManager.js - WebSocket connection for CMS
// Integrates with existing socket.io server

class SocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.messageHandlers = new Map();
  }

  connect() {
    if (this.socket) {
      console.log('[SocketManager] Already connected');
      return;
    }

    console.log('[SocketManager] Connecting to server...');
    this.socket = io();

    this.socket.on('connect', () => {
      console.log('[SocketManager] ✓ Connected to server');
      this.isConnected = true;
      this.emit('cms:connected');
    });

    this.socket.on('disconnect', () => {
      console.log('[SocketManager] ✗ Disconnected from server');
      this.isConnected = false;
      this.emit('cms:disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('[SocketManager] Socket error:', error);
      this.emit('cms:error', error);
    });

    // Listen for intent matcher responses
    this.socket.on('terminal:response', (response) => {
      console.log('[SocketManager] Intent response received:', response);
      this.emit('intent:response', response);
    });

    return this.socket;
  }

  // Send command to intent matcher
  sendCommand(command, context = {}) {
    if (!this.isConnected) {
      console.error('[SocketManager] Not connected to server');
      return Promise.reject(new Error('Not connected'));
    }

    console.log('[SocketManager] Sending command:', command);
    
    return new Promise((resolve) => {
      this.socket.emit('terminal:command', {
        command,
        context: {
          domain: 'character_management',
          ...context
        }
      });

      // Wait for response
      const timeout = setTimeout(() => {
        resolve({ error: 'Timeout waiting for response' });
      }, 5000);

      this.socket.once('terminal:response', (response) => {
        clearTimeout(timeout);
        resolve(response);
      });
    });
  }

  // Event emitter for internal communication
  on(event, handler) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event).push(handler);
  }

  emit(event, data) {
    const handlers = this.messageHandlers.get(event) || [];
    handlers.forEach(handler => handler(data));
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

// Export singleton instance
const socketManager = new SocketManager();
export default socketManager;
