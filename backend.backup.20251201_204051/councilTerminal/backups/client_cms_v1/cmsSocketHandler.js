// CMS Socket Handler - Connects to terminal WebSocket
class CMSSocketHandler {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.commandInput = null;
        this.outputDisplay = null;
    }

    initialize() {
        this.commandInput = document.getElementById('command-input');
        this.outputDisplay = document.getElementById('top-right-window-inner');
        
        if (!this.commandInput || !this.outputDisplay) {
            console.error('Required elements not found');
            return;
        }

        this.connect();
        this.setupEventListeners();
    }

    connect() {
        this.socket = io('/terminal', {
            withCredentials: true
        });
        
        this.socket.on('connect', () => {
            console.log('✓ Connected to terminal WebSocket');
            this.connected = true;
            this.showStatus('Connected to terminal');
        });

        this.socket.on('disconnect', () => {
            console.log('✗ Disconnected from terminal WebSocket');
            this.connected = false;
            this.showStatus('Disconnected - You may need to log in first');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error.message);
            if (error.type === 'TransportError' && error.message === 'Unauthorized') {
                this.showError('Not authenticated. Please log in through the main terminal first.');
            }
        });

        this.socket.on('command-response', (response) => {
            this.handleCommandResponse(response);
        });
    }

    setupEventListeners() {
        this.commandInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.sendCommand();
            }
        });
    }

    sendCommand() {
        const command = this.commandInput.value.trim();
        if (!command) return;

        if (!this.connected) {
            this.showError('Not connected to server. Please log in through the main terminal first.');
            return;
        }

        this.socket.emit('terminal-command', { command });
        this.commandInput.value = '';
        
        // Show loading state
        this.outputDisplay.innerHTML = '<div class="loading">Processing command...</div>';
    }

    handleCommandResponse(response) {
        if (response.error) {
            this.showError(response.error);
        } else if (response.output) {
            this.showOutput(response.output);
        }

        // If response includes a character ID, show that character
        if (response.entityUsed && window.showCharacter) {
            // Try to find and display the character
            this.findAndShowCharacter(response.entityUsed);
        }
    }

    showError(error) {
        this.outputDisplay.innerHTML = `
            <div class="error-message">
                <h2>✗ Error</h2>
                <p>${error}</p>
            </div>
        `;
    }

    showOutput(output) {
        this.outputDisplay.innerHTML = `
            <div class="terminal-output">
                <pre>${output}</pre>
            </div>
        `;
    }

    showStatus(status) {
        this.outputDisplay.innerHTML = `
            <div class="status-message">
                <p>${status}</p>
            </div>
        `;
    }

    findAndShowCharacter(characterName) {
        // Look for character in the list
        const characterItems = document.querySelectorAll('.character-item');
        characterItems.forEach(item => {
            if (item.querySelector('.character-name').textContent === characterName) {
                item.click();
            }
        });
    }
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    window.cmsSocket = new CMSSocketHandler();
    window.cmsSocket.initialize();
});
