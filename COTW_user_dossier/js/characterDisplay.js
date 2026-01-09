// Enhanced character display with full dossier
window.showCharacter = async (characterId) => {
    try {
        const response = await fetch(`/api/cms/character/${encodeURIComponent(characterId)}`);
        const data = await response.json();

        if (data.success) {
            const char = data.character;
            const display = document.getElementById('top-right-window-inner');
            
            display.innerHTML = `
                <div class="character-profile">
       <div style="margin-top:20px;padding-top:20px;border-top:1px solid #00ff00;">
         <h3 style="color:#00ff00;margin:10px 0;">INVENTORY</h3>
         <div id="inventory" style="margin-top:10px;">Loading inventory...</div>
       </div>

       <div style="margin-top:20px;padding-top:20px;border-top:1px solid #00ff00;">
         <h3 style="color:#00ff00;margin:10px 0;">EVENT HISTORY</h3>
         <div id="events" style="margin-top:10px;">Loading events...</div>
       </div>

       <div style="margin-top:20px;padding-top:20px;border-top:1px solid #00ff00;">
         <h3 style="color:#00ff00;margin:10px 0;">NARRATIVE SEGMENTS</h3>
         <div id="narratives" style="margin-top:10px;">Loading narratives...</div>
       </div>

       <div style="margin-top:20px;padding-top:20px;border-top:1px solid #00ff00;">
         <h3 style="color:#00ff00;margin:10px 0;">STORY ARCS</h3>
         <div id="story-arcs" style="margin-top:10px;">Loading story arcs...</div>
       </div>
                    <h2 class="character-header-name">${char.character_name}</h2>
                    <p><strong>HEX ID:</strong> ${char.character_id}</p>
                    <p><strong>Category:</strong> ${char.category}</p>
                    <p><strong>Description:</strong> ${char.description || 'No description'}</p>
                    
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #00ff00;">
                        <h3 style="color: #00ff00; margin: 10px 0;">IMAGE GALLERY</h3>
                        <input type="file" id="imageUpload" accept="image/*" style="border: 2px dashed #00ff00; padding: 10px; margin: 10px 0; cursor: pointer; background: rgba(0,0,0,0.3); width: 100%;">
                        <button onclick="uploadImage()" style="width: 100%; background: rgba(0,0,0,0.6); border: 2px solid #00ff00; color: #00ff00; padding: 10px; cursor: pointer; font-family: 'Courier New', monospace; margin-bottom: 15px;">UPLOAD IMAGE</button>
                        <div id="gallery" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px;"></div>
                    </div>
                    
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #00ff00;">
                        <h3 style="color: #00ff00; margin: 10px 0;">INVENTORY</h3>
                        <div id="inventory" style="margin-top: 10px;">Loading inventory...</div>
                    </div>
                    
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #00ff00;">
                        <h3 style="color: #00ff00; margin: 10px 0;">EVENT HISTORY</h3>
                        <div id="events" style="margin-top: 10px;">Loading events...</div>
                    </div>
                    
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #00ff00;">
                        <h3 style="color: #00ff00; margin: 10px 0;">NARRATIVE SEGMENTS</h3>
                        <div id="narratives" style="margin-top: 10px;">Loading narratives...</div>
                    </div>
                    
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #00ff00;">
                        <h3 style="color: #00ff00; margin: 10px 0;">STORY ARCS</h3>
                        <div id="story-arcs" style="margin-top: 10px;">Loading story arcs...</div>
                    </div>
                </div>
            `;
            
            window.currentCharacterId = characterId;
            loadCharacterImages(characterId);
            loadCharacterInventory(characterId);
            loadCharacterEvents(characterId);
            loadCharacterNarratives(characterId);
            loadCharacterStoryArcs(characterId);
        }
    } catch (error) {
        console.error('Error loading character:', error);
    }
};

window.loadCharacterInventory = async (characterId) => {
    try {
        const response = await fetch(`/api/cms/character/${encodeURIComponent(characterId)}/inventory`);
        const data = await response.json();
        
        const inventoryDiv = document.getElementById('inventory');
        
        if (data.success && data.inventory.length > 0) {
            inventoryDiv.innerHTML = data.inventory.map(item => `
                <div style="border: 1px solid #00ff75; padding: 10px; margin: 5px 0; background: rgba(0,255,117,0.05);">
                    <div><strong>${item.object_name}</strong> (${item.object_id})</div>
                    <div style="color: #00ff75;">PAD: P=${item.p} A=${item.a} D=${item.d}</div>
                    <div style="font-size: 0.9em; color: #888;">
                        ${item.acquisition_method || 'Unknown method'}
                        ${item.source_character_name ? ' from ' + item.source_character_name : ''}
                    </div>
                </div>
            `).join('');
        } else {
            inventoryDiv.innerHTML = '<div style="color: #666;">No items in inventory</div>';
        }
    } catch (error) {
        console.error('Error loading inventory:', error);
        document.getElementById('inventory').innerHTML = '<div style="color: #ff0000;">Error loading inventory</div>';
    }
};

window.loadCharacterEvents = async (characterId) => {
    try {
        const response = await fetch(`/api/cms/character/${encodeURIComponent(characterId)}/events`);
        const data = await response.json();
        
        const eventsDiv = document.getElementById('events');
        
        if (data.success && data.events.length > 0) {
            eventsDiv.innerHTML = data.events.map(event => `
                <div style="border: 1px solid #00ff75; padding: 10px; margin: 5px 0; background: rgba(0,255,117,0.05);">
                    <div><strong>${event.event_type}</strong> (${event.event_id})</div>
                    <div style="color: #00ff75;">${new Date(event.timestamp).toLocaleString()}</div>
                    <div style="font-size: 0.9em; color: #888;">
                        ${event.realm} - ${event.location}
                        ${event.outcome ? '<br>Outcome: ' + event.outcome : ''}
                    </div>
                </div>
            `).join('');
        } else {
            eventsDiv.innerHTML = '<div style="color: #666;">No events recorded</div>';
        }
    } catch (error) {
        console.error('Error loading events:', error);
        document.getElementById('events').innerHTML = '<div style="color: #ff0000;">Error loading events</div>';
    }
};

window.loadCharacterNarratives = async (characterId) => {
    try {
        const response = await fetch(`/api/cms/character/${encodeURIComponent(characterId)}/narratives`);
        const data = await response.json();
        
        const narrativesDiv = document.getElementById('narratives');
        
        if (data.success && data.narratives.length > 0) {
            narrativesDiv.innerHTML = data.narratives.map(narrative => `
                <div style="border: 1px solid #00ff75; padding: 10px; margin: 5px 0; background: rgba(0,255,117,0.05);">
                    <div><strong>${narrative.title}</strong> (${narrative.segment_id})</div>
                    <div style="color: #00ff75;">Type: ${narrative.segment_type}</div>
                    <div style="font-size: 0.9em; color: #888;">
                        ${narrative.summary || 'No summary available'}
                    </div>
                </div>
            `).join('');
        } else {
            narrativesDiv.innerHTML = '<div style="color: #666;">No narrative segments</div>';
        }
    } catch (error) {
        console.error('Error loading narratives:', error);
        document.getElementById('narratives').innerHTML = '<div style="color: #ff0000;">Error loading narratives</div>';
    }
};

window.loadCharacterStoryArcs = async (characterId) => {
    try {
        const response = await fetch(`/api/cms/character/${encodeURIComponent(characterId)}/story-arcs`);
        const data = await response.json();
        
        const storyArcsDiv = document.getElementById('story-arcs');
        
        if (data.success && data.storyArcs.length > 0) {
            storyArcsDiv.innerHTML = data.storyArcs.map(arc => `
                <div style="border: 1px solid #00ff75; padding: 10px; margin: 5px 0; background: rgba(0,255,117,0.05);">
                    <div><strong>${arc.title}</strong> (${arc.arc_id})</div>
                    <div style="color: #00ff75;">Role: ${arc.role_in_arc || 'Participant'}</div>
                </div>
            `).join('');
        } else {
            storyArcsDiv.innerHTML = '<div style="color: #666;">No story arcs assigned</div>';
        }
    } catch (error) {
        console.error('Error loading story arcs:', error);
        document.getElementById('story-arcs').innerHTML = '<div style="color: #ff0000;">Error loading story arcs</div>';
    }
};



/* ==========================================================
   ADD SAFE DELETE UI + PASSWORD-CONFIRM WORKFLOW
   ========================================================== */

window.deleteCharacterPrompt = (characterId, characterName) => {
    const win = document.getElementById('top-right-window-inner');

    win.innerHTML = `
        <div class="admin-content" style="border:1px solid #00ff75;padding:20px;">
            <h2 style="color:#00ff75;">⚠ DELETE CHARACTER</h2>
            <p>You are about to permanently remove:</p>
            <p style="color:#00ff75;"><strong>${characterName} (${characterId})</strong></p>

            <p>This action CANNOT be undone.</p>

            <hr style="border-color:#00ff75;margin:15px 0;">

            <p style="margin-bottom:5px;">Enter admin password to continue:</p>
            <input type="password" id="delete-admin-password"
                style="padding:8px;width:100%;background:rgba(0,255,117,0.1);border:1px solid #00ff75;color:#00ff75;">

            <button onclick="confirmDeleteCharacter('${characterId}','${characterName}')"
                style="margin-top:15px;padding:10px;width:100%;border:1px solid #00ff75;background:rgba(0,255,117,0.2);color:#00ff75;cursor:pointer;">
                CONFIRM DELETE
            </button>

            <button onclick="showCharacter('${characterId}')"
                style="margin-top:10px;padding:10px;width:100%;border:1px solid #00ff75;background:transparent;color:#00ff75;cursor:pointer;">
                CANCEL
            </button>
        </div>
    `;
};


window.confirmDeleteCharacter = async (characterId, characterName) => {
    const password = document.getElementById("delete-admin-password").value;

    if (!password || password.length < 3) {
        alert("Admin password required.");
        return;
    }

    const res = await fetch(`/api/cms/character/${encodeURIComponent(characterId)}/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
    });

    const data = await res.json();

    const win = document.getElementById('top-right-window-inner');

    if (!data.success) {
        win.innerHTML = `
            <div class="admin-content" style="padding:20px;color:#00ff75;">
                <h2>Delete Failed</h2>
                <p>${data.error}</p>
                <button onclick="deleteCharacterPrompt('${characterId}','${characterName}')"
                    style="margin-top:20px;padding:10px;border:1px solid #00ff75;background:rgba(0,255,117,0.2);color:#00ff75;">
                    Try Again
                </button>
            </div>
        `;
        return;
    }

    win.innerHTML = `
        <div class="success-message" style="padding:20px;color:#00ff75;">
            <h2>✓ Character Deleted</h2>
            <p>${characterName} has been safely removed.</p>
            <button onclick="loadCharacterList()"
                style="margin-top:20px;padding:10px;border:1px solid #00ff75;background:rgba(0,255,117,0.2);color:#00ff75;">
                Return to Character List
            </button>
        </div>
    `;
};



/* ==========================================================
   ADD DELETE BUTTON INSIDE showCharacter()
   (This is appended after existing HTML injection logic)
   ========================================================== */

if (window.injectDeleteButton === undefined) {
    window.injectDeleteButton = (characterId, name) => {
        const container = document.getElementById("top-right-window-inner");
        if (!container) return;

        const btn = document.createElement("button");
        btn.innerText = "DELETE CHARACTER";
        btn.style = `
            margin-top:20px;
            padding:10px;
            width:100%;
            border:1px solid #00ff75;
            background:rgba(255,0,0,0.15);
            color:#ff4f4f;
            cursor:pointer;
            font-weight:bold;
        `;
        btn.onclick = () => deleteCharacterPrompt(characterId, name);

        container.appendChild(btn);
    };
}



/* ==========================================================
   PATCH: Attach delete button after character loads
   ========================================================== */

if (window.hookDeleteButtonIntoShowCharacter === undefined) {
    window.hookDeleteButtonIntoShowCharacter = true;

    const originalShowCharacter = window.showCharacter;

    window.showCharacter = async (characterId) => {
        await originalShowCharacter(characterId);

        try {
            const nameEl = document.querySelector(".character-header-name");
            const characterName = nameEl ? nameEl.innerText.trim() : "Unknown";

            if (window.injectDeleteButton) {
                injectDeleteButton(characterId, characterName);
            }
        } catch (err) {
            console.error("Delete button inject failed:", err);
        }
    };
}
