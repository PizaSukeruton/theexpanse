function initStorytellerEditor() {
    const leftPanel = document.getElementById('dossier-panel');
    
    leftPanel.innerHTML = `
        <div style="padding: 20px; height: 100%; display: flex; flex-direction: column; overflow-y: auto; font-family: Courier New, monospace;">
            <h2 style="color: #00ff75; text-shadow: 0 0 10px #00ff75; margin-bottom: 20px; font-size: 16px;">
                📝 STORYTELLER EDITOR
            </h2>
            
            <!-- Tab Navigation -->
            <div style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid #00ff75;">
                <button onclick="switchStoryTab('segments')" id="tab-segments" style="flex: 1; padding: 10px; background: rgba(0,255,117,0.2); border: none; border-bottom: 2px solid #00ff75; color: #00ff75; cursor: pointer; font-weight: bold;">
                    SEGMENTS
                </button>
                <button onclick="switchStoryTab('paths')" id="tab-paths" style="flex: 1; padding: 10px; background: transparent; border: none; border-bottom: 2px solid transparent; color: #00ff75; cursor: pointer;">
                    PATHS
                </button>
                <button onclick="switchStoryTab('play')" id="tab-play" style="flex: 1; padding: 10px; background: transparent; border: none; border-bottom: 2px solid transparent; color: #00ff75; cursor: pointer;">
                    PLAY
                </button>
            </div>
            
            <!-- SEGMENTS TAB -->
            <div id="segments-tab" style="display: block; flex: 1; overflow-y: auto;">
                <h3 style="color: #00ff75; margin: 10px 0;">CREATE STORY SEGMENT</h3>
                
                <div style="margin-bottom: 15px;">
                    <label style="color: #00ff75; font-size: 12px;">Segment ID (auto):</label>
                    <input id="seg-id" type="text" readonly style="width: 100%; padding: 8px; background: rgba(0,32,0,0.95); border: 1px solid #00ff75; color: #00ff75; font-family: Courier New; margin: 5px 0;" />
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="color: #00ff75; font-size: 12px;">Title:</label>
                    <input id="seg-title" type="text" placeholder="e.g. The Battle Begins" style="width: 100%; padding: 8px; background: rgba(0,32,0,0.95); border: 1px solid #00ff75; color: #00ff75; font-family: Courier New; margin: 5px 0;" />
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="color: #00ff75; font-size: 12px;">Content (Story Text):</label>
                    <textarea id="seg-content" placeholder="Write the story here..." style="width: 100%; height: 120px; padding: 8px; background: rgba(0,32,0,0.95); border: 1px solid #00ff75; color: #00ff75; font-family: Courier New; resize: none; margin: 5px 0;"></textarea>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="color: #00ff75; font-size: 12px;">Mood/Tags:</label>
                    <input id="seg-mood" type="text" placeholder="e.g. intense, peaceful, suspenseful" style="width: 100%; padding: 8px; background: rgba(0,32,0,0.95); border: 1px solid #00ff75; color: #00ff75; font-family: Courier New; margin: 5px 0;" />
                </div>
                
                <button onclick="saveSegment()" style="width: 100%; padding: 12px; background: rgba(0,255,117,0.1); border: 2px solid #00ff75; color: #00ff75; cursor: pointer; font-weight: bold; margin-bottom: 20px; border-radius: 4px;">
                    💾 SAVE SEGMENT
                </button>
                
                <hr style="border: none; border-top: 1px solid #004400; margin: 20px 0;">
                
                <h3 style="color: #00ff75; margin: 10px 0;">EXISTING SEGMENTS</h3>
                <div id="segments-list" style="border: 1px solid #00ff75; padding: 10px; background: rgba(0,32,0,0.6); max-height: 300px; overflow-y: auto; border-radius: 4px;">
                    <div style="color: #00aa55; font-size: 12px;">Loading segments...</div>
                </div>
            </div>
            
            <!-- PATHS TAB -->
            <div id="paths-tab" style="display: none; flex: 1; overflow-y: auto;">
                <h3 style="color: #00ff75; margin: 10px 0;">CREATE STORY PATH (CHOICE)</h3>
                
                <div style="margin-bottom: 15px;">
                    <label style="color: #00ff75; font-size: 12px;">Path ID (auto):</label>
                    <input id="path-id" type="text" readonly style="width: 100%; padding: 8px; background: rgba(0,32,0,0.95); border: 1px solid #00ff75; color: #00ff75; font-family: Courier New; margin: 5px 0;" />
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="color: #00ff75; font-size: 12px;">Source Segment ID:</label>
                    <input id="path-source" type="text" placeholder="e.g. #C00001" style="width: 100%; padding: 8px; background: rgba(0,32,0,0.95); border: 1px solid #00ff75; color: #00ff75; font-family: Courier New; margin: 5px 0;" />
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="color: #00ff75; font-size: 12px;">Target Segment ID:</label>
                    <input id="path-target" type="text" placeholder="e.g. #C00002" style="width: 100%; padding: 8px; background: rgba(0,32,0,0.95); border: 1px solid #00ff75; color: #00ff75; font-family: Courier New; margin: 5px 0;" />
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="color: #00ff75; font-size: 12px;">Choice Text (What player sees):</label>
                    <input id="path-choice" type="text" placeholder="e.g. Attack the enemy" style="width: 100%; padding: 8px; background: rgba(0,32,0,0.95); border: 1px solid #00ff75; color: #00ff75; font-family: Courier New; margin: 5px 0;" />
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="color: #00ff75; font-size: 12px;">Path Type:</label>
                    <select id="path-type" style="width: 100%; padding: 8px; background: rgba(0,32,0,0.95); border: 1px solid #00ff75; color: #00ff75; font-family: Courier New; margin: 5px 0;">
                        <option>linear_progression</option>
                        <option>branch_choice</option>
                        <option>consequence</option>
                        <option>loop</option>
                    </select>
                </div>
                
                <button onclick="savePath()" style="width: 100%; padding: 12px; background: rgba(0,255,117,0.1); border: 2px solid #00ff75; color: #00ff75; cursor: pointer; font-weight: bold; margin-bottom: 20px; border-radius: 4px;">
                    🔗 CREATE PATH
                </button>
                
                <hr style="border: none; border-top: 1px solid #004400; margin: 20px 0;">
                
                <h3 style="color: #00ff75; margin: 10px 0;">EXISTING PATHS</h3>
                <div id="paths-list" style="border: 1px solid #00ff75; padding: 10px; background: rgba(0,32,0,0.6); max-height: 300px; overflow-y: auto; border-radius: 4px;">
                    <div style="color: #00aa55; font-size: 12px;">Loading paths...</div>
                </div>
            </div>
            
            <!-- PLAY TAB -->
            <div id="play-tab" style="display: none; flex: 1; overflow-y: auto;">
                <h3 style="color: #00ff75; margin: 10px 0;">PLAY YOUR STORY</h3>
                
                <div style="margin-bottom: 15px;">
                    <label style="color: #00ff75; font-size: 12px;">Select Character:</label>
                    <select id="play-character" style="width: 100%; padding: 8px; background: rgba(0,32,0,0.95); border: 1px solid #00ff75; color: #00ff75; font-family: Courier New; margin: 5px 0;">
                        <option value="%23700002">Claude The Tanuki</option>
                        <option value="%23700004">Slicifer</option>
                        <option value="%23700003">Frankie Trouble</option>
                    </select>
                </div>
                
                <button onclick="startStoryPlayer()" style="width: 100%; padding: 12px; background: rgba(0,255,117,0.1); border: 2px solid #00ff75; color: #00ff75; cursor: pointer; font-weight: bold; margin-bottom: 20px; border-radius: 4px;">
                    ▶ PLAY STORY
                </button>
                
                <div id="player-content" style="border: 1px solid #00ff75; padding: 15px; background: rgba(0,32,0,0.6); border-radius: 4px; display: none;">
                    <!-- Player will render here -->
                </div>
            </div>
            
            <!-- Return Button -->
            <button onclick="returnToAdminMenu()" style="width: 100%; padding: 10px; background: rgba(255,0,0,0.1); border: 2px solid #ff4444; color: #ff4444; cursor: pointer; font-family: Courier New; margin-top: 20px; border-radius: 4px; font-weight: bold;">
                ✕ RETURN
            </button>
        </div>
    `;
    
    loadSegments();
    loadPaths();
    generateSegmentId();
    generatePathId();
}

function switchStoryTab(tab) {
    document.getElementById('segments-tab').style.display = 'none';
    document.getElementById('paths-tab').style.display = 'none';
    document.getElementById('play-tab').style.display = 'none';
    
    document.getElementById('tab-segments').style.borderBottom = '2px solid transparent';
    document.getElementById('tab-paths').style.borderBottom = '2px solid transparent';
    document.getElementById('tab-play').style.borderBottom = '2px solid transparent';
    
    document.getElementById(tab + '-tab').style.display = 'block';
    document.getElementById('tab-' + tab).style.borderBottom = '2px solid #00ff75';
}

async function generateSegmentId() {
    document.getElementById('seg-id').value = '#C' + Math.random().toString(16).substr(2, 5).toUpperCase().padStart(5, '0');
}

async function generatePathId() {
    document.getElementById('path-id').value = '#P' + Math.random().toString(16).substr(2, 5).toUpperCase().padStart(5, '0');
}

async function saveSegment() {
    const segment = {
        segment_id: document.getElementById('seg-id').value,
        title: document.getElementById('seg-title').value,
        content: document.getElementById('seg-content').value,
        sentiment_tags: { mood: document.getElementById('seg-mood').value }
    };
    
    if (!segment.title || !segment.content) {
        alert('⚠ Please fill in Title and Content');
        return;
    }
    
    try {
        const response = await fetch('/api/narrative/segment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(segment)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Segment saved: ' + segment.segment_id);
            document.getElementById('seg-title').value = '';
            document.getElementById('seg-content').value = '';
            document.getElementById('seg-mood').value = '';
            generateSegmentId();
            loadSegments();
        } else {
            alert('❌ Error: ' + (data.error?.message || data.error));
        }
    } catch (error) {
        alert('❌ Failed: ' + error.message);
    }
}

async function savePath() {
    const path = {
        path_id: document.getElementById('path-id').value,
        source_segment_id: document.getElementById('path-source').value,
        target_segment_id: document.getElementById('path-target').value,
        choice_text: document.getElementById('path-choice').value,
        path_type: document.getElementById('path-type').value
    };
    
    if (!path.source_segment_id || !path.target_segment_id || !path.choice_text) {
        alert('⚠ Please fill in all fields');
        return;
    }
    
    try {
        const response = await fetch('/api/narrative/path', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(path)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Path created: ' + path.path_id);
            document.getElementById('path-source').value = '';
            document.getElementById('path-target').value = '';
            document.getElementById('path-choice').value = '';
            generatePathId();
            loadPaths();
        } else {
            alert('❌ Error: ' + (data.error?.message || data.error));
        }
    } catch (error) {
        alert('❌ Failed: ' + error.message);
    }
}

async function loadSegments() {
    try {
        const response = await fetch('/api/narrative/segments');
        const data = await response.json();
        
        const list = document.getElementById('segments-list');
        if (data.segments && data.segments.length > 0) {
            list.innerHTML = data.segments
                .map(seg => `
                    <div style="padding: 8px; margin-bottom: 8px; border: 1px solid #004400; border-radius: 3px; background: rgba(0,16,0,0.8);">
                        <div style="color: #00ff75; font-weight: bold;">${seg.segment_id}: ${seg.title}</div>
                        <div style="color: #00aa55; font-size: 11px;">${seg.content.substring(0, 60)}...</div>
                    </div>
                `)
                .join('');
        } else {
            list.innerHTML = '<div style="color: #00aa55; font-size: 12px;">No segments yet.</div>';
        }
    } catch (error) {
        console.error('Error loading segments:', error);
    }
}

async function loadPaths() {
    try {
        const response = await fetch('/api/narrative/paths');
        const data = await response.json();
        
        const list = document.getElementById('paths-list');
        if (data.paths && data.paths.length > 0) {
            list.innerHTML = data.paths
                .map(p => `
                    <div style="padding: 8px; margin-bottom: 8px; border: 1px solid #004400; border-radius: 3px; background: rgba(0,16,0,0.8);">
                        <div style="color: #00ff75; font-weight: bold;">${p.path_id}</div>
                        <div style="color: #00aa55; font-size: 11px;">${p.source_segment_id} → ${p.target_segment_id}</div>
                        <div style="color: #006600; font-size: 10px;">◆ ${p.choice_text}</div>
                    </div>
                `)
                .join('');
        } else {
            list.innerHTML = '<div style="color: #00aa55; font-size: 12px;">No paths yet.</div>';
        }
    } catch (error) {
        console.error('Error loading paths:', error);
    }
}

async function startStoryPlayer() {
    const characterId = document.getElementById('play-character').value;
    const playerContent = document.getElementById('player-content');
    playerContent.style.display = 'block';
    playerContent.innerHTML = '<div style="color: #00ff75;">Loading story...</div>';
    
    try {
        const response = await fetch(`/api/narrative/storyteller/${characterId}`);
        const data = await response.json();
        
        if (data.success) {
            const story = data.data;
            playerContent.innerHTML = `
                <h3 style="color: #00ff75; margin: 0 0 10px 0;">${story.title}</h3>
                <div style="color: #00ff75; font-size: 13px; line-height: 1.8; margin-bottom: 15px;">
                    ${story.narrative_text}
                </div>
                <button onclick="continueStory()" style="width: 100%; padding: 8px; background: rgba(0,255,117,0.1); border: 1px solid #00ff75; color: #00ff75; cursor: pointer; border-radius: 3px;">
                    ▶ Continue
                </button>
            `;
        } else {
            playerContent.innerHTML = `<div style="color: #ff4444;">Error: ${data.error.message}</div>`;
        }
    } catch (error) {
        playerContent.innerHTML = `<div style="color: #ff4444;">Error: ${error.message}</div>`;
    }
}

async function continueStory() {
    startStoryPlayer();
}

function returnToAdminMenu() {
    if (typeof initAdminPanel === 'function') {
        initAdminPanel();
    }
}
