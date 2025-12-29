/** CMS Socket Handler for Terminal Namespace */
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
            console.error("Required CMS elements missing");
            return;
        }

        this.connect();
        this.setupEventListeners();
    }

    connect() {
        // FULL URL REQUIRED FOR COOKIE PASSING
        this.socket = io("http://localhost:3000/terminal", {
            withCredentials: true,
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: 20,
            reconnectionDelay: 500,
            timeout: 20000
        });

        // EXPOSE TO WINDOW (RESTORES window.terminalSocket API)
        window.terminalSocket = this.socket;

        this.socket.on("connect", () => {
            console.log("✓ Connected to terminal WebSocket");
            this.connected = true;
            this.showStatus("Connected to terminal");
        });

        this.socket.on("disconnect", () => {
            console.log("✗ Disconnected from terminal WebSocket");
            this.connected = false;
            this.showStatus("Disconnected — please login again.");
        });

        this.socket.on("connect_error", (err) => {
            console.error("Connection error:", err);
            this.showError("WebSocket Error — Not authenticated or server unavailable.");
        });

        this.socket.on("command-response", (response) => {
            this.handleCommandResponse(response);
        });

        // === OMIYAGE LISTENERS ===
        this.socket.on("omiyage:offer", (data) => {
            console.log("[Omiyage] Offer received:", data);
            this.showOmiyageOffer(data);
        });

        this.socket.on("omiyage:fulfilled", (data) => {
            console.log("[Omiyage] Fulfilled:", data);
            this.showOmiyageFulfilled(data);
        });

        this.socket.on("omiyage:declined", (data) => {
            console.log("[Omiyage] Declined:", data);
            this.showOmiyageDeclined(data);
        });

        this.socket.on("omiyage:error", (data) => {
            console.log("[Omiyage] Error:", data);
            this.showError(`Omiyage Error: ${data.error}`);
        });
    }

    setupEventListeners() {
        this.commandInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") this.sendCommand();
        });
    }

    sendCommand() {
        const command = this.commandInput.value.trim();
        if (!command) return;

        if (!this.connected) {
            this.showError("Not connected. Please log in first.");
            return;
        }

        this.socket.emit("terminal-command", { command });
        this.commandInput.value = "";

        this.outputDisplay.innerHTML = '<div class="loading">Processing command...</div>';
    }

    handleCommandResponse(response) {
        // === DEBUGGING ===
        console.log('[CMD] handler entered');
        console.log('[CMD] full response:', response);
        console.log('[CMD] has welcomeBeat?', !!response.welcomeBeat);
        // === END DEBUG ===

        this.outputDisplay.innerHTML = "";
        
        if (response.welcomeBeat) {
            console.log('[CMD] ✓ welcomeBeat MATCHED');
            const beat = response.welcomeBeat;
            const title = beat.title || 'Welcome';
            const template = beat.contentTemplate || {};
            const hint = template.template_hint || '';
            const speechAct = template.ltlm_speech_act || '';
            const outcome = template.ltlm_outcome_intent || '';
            const dialogueFn = template.ltlm_dialogue_function || '';
            const ltlm = beat.ltlmUtterance || null;
            const ltlmText = ltlm && ltlm.text ? ltlm.text : 'Claude does not yet have a learned welcome line for this beat.';

            const content = `
                <div class="claude-welcome">
                    <div class="welcome-title">${title}</div>
                    <div class="welcome-line">Claude: ${ltlmText}</div>
                    <div class="welcome-meta">
                        <div>Template: ${hint}</div>
                        <div>Speech act: ${speechAct}</div>
                        <div>Outcome: ${outcome}</div>
                        <div>Dialogue function: ${dialogueFn}</div>
                    </div>
                </div>
            `;
            this.showOutput(content);
            console.log('[CMD] ✓ showOutput called');
            return;
        }

        console.log('[CMD] no welcomeBeat, checking error');
        if (response.error) {
            this.showError(response.error);
            return;
        }

        const intent = response.queryType || null;
        const output = response.output || response.message;
        const data = response.data || response.entityData;

        switch (intent) {
            case "EDIT_PROFILE":
                if (data && data.entity_type === "PERSON") {
                    window.renderProfileEditor(data);
                } else {
                    this.showError("Editor access denied or entity not found.");
                }
                break;
            default:
                this.showOutput(output, response.image);
                break;
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

    // === OMIYAGE DISPLAY METHODS ===
    showOmiyageOffer(data) {
        const { choiceId, offerCount, narrative, giverName } = data;
        
        // Build number buttons
        let buttons = '';
        for (let i = 1; i <= offerCount; i++) {
            buttons += `<button class="omiyage-choice-btn" data-choice="${i}" onclick="window.cmsSocket.acceptOmiyage('${choiceId}', ${i})">${i}</button> `;
        }
        
        const content = `
            <div class="omiyage-offer">
                <div class="omiyage-giver">${giverName}</div>
                <div class="omiyage-narrative">${narrative}</div>
                <div class="omiyage-choices">
                    ${buttons}
                </div>
                <div class="omiyage-decline">
                    <button onclick="window.cmsSocket.declineOmiyage('${choiceId}')">No thank you</button>
                </div>
            </div>
        `;
        
        this.outputDisplay.innerHTML = `<div class="terminal-output">${content}</div>`;
    }

    showOmiyageFulfilled(data) {
        const { object, narrative } = data;
        const objectName = object?.object_name || 'a mysterious gift';
        const rarity = object?.rarity || 'common';
        
        const content = `
            <div class="omiyage-fulfilled">
                <div class="omiyage-narrative">${narrative}</div>
                <div class="omiyage-object">
                    <span class="rarity-${rarity}">${objectName}</span>
                </div>
            </div>
        `;
        
        this.outputDisplay.innerHTML = `<div class="terminal-output">${content}</div>`;
    }

    showOmiyageDeclined(data) {
        const { narrative } = data;
        
        const content = `
            <div class="omiyage-declined">
                <div class="omiyage-narrative">${narrative}</div>
            </div>
        `;
        
        this.outputDisplay.innerHTML = `<div class="terminal-output">${content}</div>`;
    }

    acceptOmiyage(choiceId, chosenNumber) {
        console.log(`[Omiyage] Accepting: ${choiceId} choice ${chosenNumber}`);
        this.socket.emit("omiyage:accept", { choiceId, chosenNumber });
        this.outputDisplay.innerHTML = '<div class="loading">Claude is preparing your gift...</div>';
    }

    declineOmiyage(choiceId) {
        console.log(`[Omiyage] Declining: ${choiceId}`);
        this.socket.emit("omiyage:decline", { choiceId });
    }
}

window.addEventListener("DOMContentLoaded", () => {
    window.cmsSocket = new CMSSocketHandler();
    window.cmsSocket.initialize();
});
