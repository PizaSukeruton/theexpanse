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
        this.socket = io('/terminal', { withCredentials: true });

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
            if (e.key === 'Enter') this.sendCommand();
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

        this.outputDisplay.innerHTML = '<div class="loading">Processing command...</div>';
    }

    handleCommandResponse(response) {
        const intent = response.queryType;
        const output = response.output;
        const data = response.entityData;

        this.outputDisplay.innerHTML = "";

        if (response.error) {
            this.showError(response.error);
            return;
        }

        switch (intent) {
            case "EDIT_PROFILE":
                if (data && data.entity_type === "PERSON") {
                    window.renderProfileEditor(data);
                } else {
                    this.showError("Editor access denied or entity not found.");
                }
                break;

            case "WHO":
            case "WHAT":
            case "WHERE":
            case "SHOW_IMAGE":
            case "SEARCH":
            case "CAN":
            case "WHEN":
            case "WHY":
            case "HOW":
            case "WHICH":
            case "IS":
                this.showOutput(output, response.image);
                break;

            default:
                this.showOutput(output);
                break;
        }

        if (intent === "EDIT_PROFILE") {
            if (response.entityUsed && window.showCharacter) {
                this.findAndShowCharacter(response.entityUsed);
            }
        }
    }

    showStatus(message) {
        if (!this.outputDisplay) return;
        this.outputDisplay.innerHTML = `
            <div class="terminal-output">
                <div class="status-line">${message}</div>
            </div>`;
    }

    showError(message) {
        if (!this.outputDisplay) return;
        this.outputDisplay.innerHTML = `
            <div class="terminal-output">
                <div class="error-line">${message}</div>
            </div>`;
    }

    showOutput(output, imageUrl) {
        let content = output || "";

        if (imageUrl) {
            content += `
                <div class="image-wrapper">
                    <img src="${imageUrl}" alt="Result Image"
                        style="max-width:300px; max-height:300px;">
                </div>`;
        }

        this.outputDisplay.innerHTML = `
            <div class="terminal-output">
                ${content}
            </div>`;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.cmsSocket = new CMSSocketHandler();
    window.cmsSocket.initialize();
});
