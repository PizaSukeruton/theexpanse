// Admin panel for left side when logged in with admin privileges
function initAdminPanel() {
  // Check if user is admin (Cheese Fang with access level 5)
  const currentUser = localStorage.getItem('terminal_user');
  if (currentUser !== 'Cheese Fang') return;
  
  const leftPanel = document.getElementById('dossier-panel');
  if (!leftPanel) return;
  
  // Clear existing content and replace with admin panel
  leftPanel.innerHTML = `
    <div class="admin-panel" style="padding: 15px; height: 100%;">
      <h2 style="color: #00ff00; text-shadow: 0 0 10px #00ff00; margin-bottom: 20px;">
        ADMIN CONTROL PANEL
      </h2>
      
      <div class="admin-section" style="margin-bottom: 20px;">
        <h3 style="color: #00ff00; font-size: 14px; margin-bottom: 10px;">CHARACTER MANAGEMENT</h3>
        <div id="character-list" style="max-height: 200px; overflow-y: auto; border: 1px solid #00ff00; padding: 10px; background: rgba(0,255,0,0.05);">
          Loading characters...
        </div>
        <button onclick="showCharacterEditor()" style="width: 100%; margin-top: 10px; padding: 8px; background: rgba(0,255,0,0.1); border: 1px solid #00ff00; color: #00ff00; cursor: pointer;">
          + New Character
        </button>
      </div>
      
      <div class="admin-section" style="margin-bottom: 20px;">
        <h3 style="color: #00ff00; font-size: 14px; margin-bottom: 10px;">IMAGE EDITOR</h3>
        <input type="file" id="adminImageInput" accept="image/*" style="width: 100%; margin-bottom: 10px;">
        <canvas id="adminCanvas" width="256" height="256" style="width: 100%; border: 1px solid #00ff00; display: none;"></canvas>
        
        <div id="imageControls" style="display: none; margin-top: 10px;">
          <label style="color: #00ff00; font-size: 12px;">CRT Effect: <span id="crtVal">0%</span></label>
          <input type="range" id="crtSlider" min="0" max="100" value="0" style="width: 100%;">
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-top: 10px;">
            <button onclick="applyEffect('grayscale')" style="padding: 5px; background: #111; border: 1px solid #00ff00; color: #00ff00; cursor: pointer;">Gray</button>
            <button onclick="applyEffect('sepia')" style="padding: 5px; background: #111; border: 1px solid #00ff00; color: #00ff00; cursor: pointer;">Sepia</button>
            <button onclick="saveImage()" style="grid-column: 1/3; padding: 8px; background: #00ff00; color: #000; border: none; cursor: pointer; font-weight: bold;">Save Image</button>
          </div>
        </div>
      </div>
      
      <div class="admin-section">
        <h3 style="color: #00ff00; font-size: 14px; margin-bottom: 10px;">SYSTEM STATUS</h3>
        <div style="border: 1px solid #00ff00; padding: 10px; background: rgba(0,255,0,0.05);">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; font-size: 12px;">
            <div>Entities:</div><div id="entityCount">--</div>
            <div>Active Users:</div><div id="userCount">--</div>
            <div>Server:</div><div style="color: #00ff00;">ONLINE</div>
            <div>Access Level:</div><div style="color: #00ff00;">5</div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  loadCharacters();
  setupImageEditor();
  updateSystemStatus();
}

async function loadCharacters() {
  try {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      // Try to get token
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'Cheese Fang',
          password: 'P1zz@P@rty@666'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('admin_token', data.token);
      }
    }
    
    const charactersResponse = await fetch('/api/admin/characters', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
    });
    
    const data = await charactersResponse.json();
    const charList = document.getElementById('character-list');
    
    if (data.success && data.characters) {
      charList.innerHTML = data.characters.map(char => `
        <div style="padding: 5px; border-bottom: 1px solid rgba(0,255,0,0.2); cursor: pointer;" 
             onclick="editCharacter('${char.character_id}')">
          <strong>${char.character_id}</strong>: ${char.character_name}
          <span style="float: right; color: #888;">${char.category || 'Unknown'}</span>
        </div>
      `).join('');
      
      document.getElementById('entityCount').textContent = data.characters.length;
    }
  } catch (error) {
    console.error('Failed to load characters:', error);
  }
}

function setupImageEditor() {
  const fileInput = document.getElementById('adminImageInput');
  const canvas = document.getElementById('adminCanvas');
  const ctx = canvas.getContext('2d');
  let currentImage = null;
  
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        currentImage = img;
        canvas.style.display = 'block';
        document.getElementById('imageControls').style.display = 'block';
        drawImage();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
  
  document.getElementById('crtSlider').addEventListener('input', (e) => {
    document.getElementById('crtVal').textContent = e.target.value + '%';
    if (currentImage) drawImage();
  });
  
  window.drawImage = function() {
    if (!currentImage) return;
    
    ctx.clearRect(0, 0, 256, 256);
    
    const scale = Math.min(256 / currentImage.width, 256 / currentImage.height);
    const w = currentImage.width * scale;
    const h = currentImage.height * scale;
    const x = (256 - w) / 2;
    const y = (256 - h) / 2;
    
    ctx.drawImage(currentImage, x, y, w, h);
    
    // Apply CRT effect
    const crtValue = parseInt(document.getElementById('crtSlider').value);
    if (crtValue > 0) {
      const imageData = ctx.getImageData(0, 0, 256, 256);
      const data = imageData.data;
      const intensity = crtValue / 100;
      
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i+1] + data[i+2]) / 3;
        data[i] = data[i] * (1 - intensity) + avg * 0.3 * intensity;
        data[i+1] = data[i+1] * (1 - intensity) + avg * 1.2 * intensity;
        data[i+2] = data[i+2] * (1 - intensity) + avg * 0.3 * intensity;
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      // Scanlines
      for (let y = 0; y < 256; y += 3) {
        ctx.fillStyle = `rgba(0,0,0,${0.2 * intensity})`;
        ctx.fillRect(0, y, 256, 1);
      }
    }
  };
  
  window.applyEffect = function(effect) {
    if (!currentImage) return;
    
    const imageData = ctx.getImageData(0, 0, 256, 256);
    const data = imageData.data;
    
    if (effect === 'grayscale') {
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i+1] + data[i+2]) / 3;
        data[i] = data[i+1] = data[i+2] = avg;
      }
    } else if (effect === 'sepia') {
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i+1], b = data[i+2];
        data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
        data[i+1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
        data[i+2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  };
  
  window.saveImage = function() {
    const link = document.createElement('a');
    link.download = 'character_image.png';
    link.href = canvas.toDataURL();
    link.click();
  };
}

function updateSystemStatus() {
  // Update user count
  fetch('/api/admin/stats', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
  }).then(res => res.json()).then(data => {
    if (data.users) {
      document.getElementById('userCount').textContent = data.users;
    }
  }).catch(() => {
    document.getElementById('userCount').textContent = '1';
  });
}

window.editCharacter = function(id) {
  console.log('Edit character:', id);
  // TODO: Open character editor
};

window.showCharacterEditor = function() {
  console.log('Show new character form');
  // TODO: Show character creation form
};

// Check for admin on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initAdminPanel, 1000); // Wait for login to complete
  });
} else {
  setTimeout(initAdminPanel, 1000);
}

// Listen for login events
window.addEventListener('storage', (e) => {
  if (e.key === 'terminal_user' && e.newValue === 'Cheese Fang') {
    initAdminPanel();
  }
});
