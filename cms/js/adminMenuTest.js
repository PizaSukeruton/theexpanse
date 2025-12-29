// Admin Menu System for CMS (TEST VERSION)

// ===== Helper: Render Placeholder =====
const renderPlaceholder = (title, message = "This module is under construction.") => {
    const display = document.getElementById('top-right-window-inner');
    display.innerHTML = `
        <div class="admin-content">
            <h2>${title}</h2>
            <p>${message}</p>
        </div>
    `;
};

// ===== Main Menu Loader =====
window.showAdminMenu = () => {
    const leftPanel = document.getElementById('character-list-container');

    // UPDATED MENU: Simplified Character Management
    leftPanel.innerHTML = `
        <div class="admin-menu">
            <div class="menu-section">
                <h3 class="menu-header">CHARACTER MANAGEMENT</h3>
                <button class="menu-button" onclick="loadCharacterList()">View All Characters</button>
                <button class="menu-button" onclick="showCreateCharacter()">Create New Character</button>
            </div>
            
            <div class="menu-section">
                <h3 class="menu-header">ENTITY MANAGEMENT</h3>
                <button class="menu-button" onclick="showAllEntities()">View All Entities</button>
                <button class="menu-button" onclick="showCreateEntity()">Create Entity</button>
                <button class="menu-button" onclick="showKnowledgeEditor()">Knowledge Entity Editor</button>
                <button class="menu-button" onclick="showEntityRelationships()">Entity Relationships</button>
            </div>
            
            <div class="menu-section">
                <h3 class="menu-header">WORLD BUILDING</h3>
                <button class="menu-button" onclick="showLocationsManager()">Locations Manager</button>
                <button class="menu-button" onclick="showObjectsDatabase()">Objects Database</button>
                <button class="menu-button" onclick="showKnowledgeDomains()">Knowledge Domains</button>
                <button class="menu-button" onclick="showKnowledgeItems()">Knowledge Items</button>
            </div>
            
            <div class="menu-section">
                <h3 class="menu-header">NARRATIVE SYSTEM</h3>
                <button class="menu-button" onclick="showStoryArcs()">Story Arcs Manager</button>
                <button class="menu-button" onclick="showNarrativeSegments()">Narrative Segments</button>
                <button class="menu-button" onclick="showNarrativePaths()">Narrative Paths</button>
                <button class="menu-button" onclick="showCharacterStoryAssign()">Character-Story Assignment</button>
            </div>
            
            <div class="menu-section">
                <h3 class="menu-header">EVENTS SYSTEM</h3>
                <button class="menu-button" onclick="showMultiverseEvents()">Multiverse Events Log</button>
                <button class="menu-button" onclick="showPsychicEvents()">Psychic Events Monitor</button>
                <button class="menu-button" onclick="showOmiyageEvents()">Omiyage (Gift) Events</button>
                <button class="menu-button" onclick="showCreateEvent()">Create New Event</button>
            </div>
            
            <div class="menu-section">
                <h3 class="menu-header">USER & SYSTEM</h3>
                <button class="menu-button" onclick="showUserManagement()">User Management</button>
                <button class="menu-button" onclick="showSystemSettings()">System Settings</button>
                <button class="menu-button" onclick="showDatabaseHealth()">Database Health</button>
                <button class="menu-button" onclick="showHexMonitor()">Hex ID Monitor</button>
            </div>
        </div>
    `;
};

// ===== Character Management Logic =====

// 1. Load the list on the LEFT
window.loadCharacterList = async () => {
    try {
        const response = await fetch("/api/cms/characters");
        const data = await response.json();

        if (data.success) {
            const listContainer = document.getElementById("character-list-container");

            // On click, we call showCharacter(id, name)
            listContainer.innerHTML = data.characters.map(char => `
                <div class="character-item" onclick="showCharacter('${char.character_id}', '${char.character_name.replace(/'/g, "\\'")}')">
                    <div class="character-name">${char.character_name}</div>
                    <div class="character-category">${char.category || 'Unknown'}</div>
                </div>
            `).join("") + `
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #00ff75;">
                    <button class="menu-button" onclick="showAdminMenu()">Return To Main Menu</button>
                </div>
            `;

            // Reset the Right Window
            document.getElementById("top-right-window-inner").innerHTML = `
                <div class="success-message">
                    <h2>Select a Character</h2>
                    <p>Loaded ${data.count} characters.</p> 
                    <p>Click a name on the left to open the Character Dashboard.</p>
                </div>
            `;
        }
    } catch (err) {
        console.error("Error:", err);
        alert("Failed to load character list.");
    }
};

// 2. Show the Dashboard on the RIGHT
window.showCharacter = (id, name) => {
    const display = document.getElementById("top-right-window-inner");
    
    display.innerHTML = `
        <div class="admin-content">
            <div style="border-bottom: 1px solid #00ff75; padding-bottom: 10px; margin-bottom: 20px;">
                <h2 style="margin:0; text-transform: uppercase;">${name}</h2>
                <small style="color: #666;">ID: ${id}</small>
            </div>

            <div class="dashboard-grid" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                <button class="menu-button" onclick="showEditCharacter('${id}')">
                    ✏️ Edit Profile
                </button>
                <button class="menu-button" onclick="showInventoryManager('${id}')">
                    🎒 Inventory
                </button>
                <button class="menu-button" onclick="showTraitsManager('${id}')">
                    🧠 Traits & PAD
                </button>
            </div>

            <div id="character-workspace" style="padding: 20px; background: rgba(0, 0, 0, 0.2); border: 1px dashed #444; min-height: 200px;">
                <p style="color: #888; text-align: center; padding-top: 80px;">Select a tool above to manage <strong>${name}</strong>.</p>
            </div>
        </div>
    `;
};

// 3. Create New Character Logic
window.showCreateCharacter = () => {
    const display = document.getElementById("top-right-window-inner");
    display.innerHTML = `
        <div class="admin-content">
            <h2>Create New Character</h2>
            <form id="create-character-form" style="display: flex; flex-direction: column; gap: 10px; max-width: 400px;">
                <input type="text" id="char-name" placeholder="Character Name" required>
                <select id="char-category">
                    <option>Angry Slice Of Pizza</option>
                    <option>Antagonist</option>
                    <option>B-Roll Chaos</option>
                    <option>Council Of The Wise</option>
                    <option>Protagonist</option>
                    <option>Tanuki</option>
                </select>
                <textarea id="char-description" placeholder="Description"></textarea>
                <input type="password" id="admin-password" placeholder="Admin Password" required>
                <button type="submit">Create Character</button>
            </form>
        </div>`;

    const form = document.getElementById("create-character-form");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("char-name").value;
        const category = document.getElementById("char-category").value;
        const description = document.getElementById("char-description").value;
        const password = document.getElementById("admin-password").value;

        try {
            const response = await fetch("/api/cms/character/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    character_name: name,
                    category: category,
                    description: description,
                    password: password
                })
            });

            const result = await response.json();
            if (result.success) {
                display.innerHTML = `
                    <div class="success-message">
                        <h2>✓ Character Created!</h2>
                        <p>Name: ${result.character.character_name}</p>
                        <button class="menu-button" onclick="showCreateCharacter()">Create Another</button>
                        <button class="menu-button" onclick="showAdminMenu()">Return to Menu</button>
                    </div>`;
            } else {
                alert("Error: " + result.error);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Connection failed.");
        }
    });
};

// ===== Character Tools (Sub-functions) =====

window.showEditCharacter = (id) => {
    const workspace = document.getElementById('character-workspace');
    workspace.innerHTML = `
        <h3>Edit Profile</h3>
        <p>Editing character ID: <strong>${id}</strong></p>
        <p><em>(Form fields will go here)</em></p>
    `;
};

window.showInventoryManager = (id) => {
    const workspace = document.getElementById('character-workspace');
    workspace.innerHTML = `
        <h3>Inventory Manager</h3>
        <p>Managing inventory for ID: <strong>${id}</strong></p>
        <p><em>(Inventory list will go here)</em></p>
    `;
};

window.showTraitsManager = (id) => {
    const workspace = document.getElementById('character-workspace');
    workspace.innerHTML = `
        <h3>Traits & PAD Values</h3>
        <p>Adjusting stats for ID: <strong>${id}</strong></p>
        <p><em>(PAD Sliders will go here)</em></p>
    `;
};

// ===== Entity Manager Buttons =====

window.showAllEntities = () => EntityManager.showAllEntities();
window.showCreateEntity = () => EntityManager.showCreateEntity();
window.showKnowledgeEditor = () => EntityManager.showKnowledgeEditor();
window.showEntityRelationships = () =>
    EntityManager.manageRelationshipsSelector
        ? EntityManager.manageRelationshipsSelector()
        : EntityManager.showAllEntities();

// ===== Placeholders =====
window.showLocationsManager = () => renderPlaceholder("Locations Manager");
window.showObjectsDatabase = () => renderPlaceholder("Objects Database");
window.showKnowledgeDomains = () => renderPlaceholder("Knowledge Domains");
window.showKnowledgeItems = () => renderPlaceholder("Knowledge Items");
window.showStoryArcs = () => renderPlaceholder("Story Arcs Manager");
window.showNarrativeSegments = () => renderPlaceholder("Narrative Segments");
window.showNarrativePaths = () => renderPlaceholder("Narrative Paths");
window.showCharacterStoryAssign = () => renderPlaceholder("Character-Story Assignment");
window.showMultiverseEvents = () => renderPlaceholder("Multiverse Events Log");
window.showPsychicEvents = () => renderPlaceholder("Psychic Events Monitor");
window.showOmiyageEvents = () => renderPlaceholder("Omiyage (Gift) Events");
window.showCreateEvent = () => renderPlaceholder("Create New Event");
window.showUserManagement = () => renderPlaceholder("User Management");
window.showSystemSettings = () => renderPlaceholder("System Settings");
window.showDatabaseHealth = () => renderPlaceholder("Database Health");
window.showHexMonitor = () => renderPlaceholder("Hex ID Monitor");
