// Clean collapsible admin menu
function initAdminPanel() {
  const currentUser = localStorage.getItem('terminal_user');
  if (currentUser !== 'Cheese Fang') return;
  
  const leftPanel = document.getElementById('dossier-panel');
  if (!leftPanel) return;
  
  leftPanel.innerHTML = `
    <div class="admin-panel" style="padding: 15px; height: 100%; overflow-y: auto;">
      <h2 style="color: #00ff00; text-shadow: 0 0 10px #00ff00; margin-bottom: 20px; font-size: 16px; text-align: center;">
        ADMIN CONTROL
      </h2>
      
      <div class="menu-container" id="adminMenu"></div>
      
      <div id="adminContent" style="margin-top: 20px; padding: 10px; border: 1px solid #00ff00; background: rgba(0,255,0,0.02); min-height: 100px; display: none;">
        <div id="contentArea"></div>
      </div>
    </div>
  `;
  
  buildMenu();
  addStyles();
  getAuthToken();
}

function buildMenu() {
  const menu = document.getElementById('adminMenu');
  const menuItems = [
    {
      title: 'CHARACTERS',
      items: ['View All', 'Create New', 'Edit', 'Delete']
    },
    {
      title: 'EVENTS',
      items: ['Timeline', 'Create Event', 'Multiverse']
    },
    {
      title: 'STORY ARCS',
      items: ['View Arcs', 'Create Arc', 'Progression']
    },
    {
      title: 'NARRATIVES',
      items: ['View All', 'Create New', 'Path Editor']
    },
    {
      title: 'KNOWLEDGE',
      items: ['AOK Entries', 'Transfers', 'Domains']
    },
    {
      title: 'MEDIA',
      items: ['Upload New', 'View Gallery']
    },
    {
      title: 'SYSTEM',
      items: ['Users', 'Hex Registry', 'Terminal Logs']
    }
  ];
  
  menuItems.forEach((section, idx) => {
    const div = document.createElement('div');
    div.className = 'menu-item';
    div.innerHTML = `
      <button class="menu-btn" onclick="toggleSection('section${idx}')">
        ▶ ${section.title}
      </button>
      <div class="menu-content" id="section${idx}" style="display: none;">
        ${section.items.map(item => 
          `<button class="sub-btn" onclick="handleAction('${section.title}','${item}')">${item}</button>`
        ).join('')}
      </div>
    `;
    menu.appendChild(div);
  });
}

function addStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .menu-item { margin-bottom: 5px; }
    .menu-btn {
      width: 100%;
      padding: 10px;
      background: rgba(0,255,0,0.1);
      border: 1px solid #00ff00;
      color: #00ff00;
      cursor: pointer;
      text-align: left;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      font-weight: bold;
      transition: all 0.3s;
    }
    .menu-btn:hover {
      background: rgba(0,255,0,0.2);
      text-shadow: 0 0 5px #00ff00;
    }
    .menu-content {
      padding: 5px 0 5px 20px;
      background: rgba(0,0,0,0.5);
    }
    .sub-btn {
      display: block;
      width: calc(100% - 10px);
      padding: 6px;
      margin: 2px 0;
      background: transparent;
      border: 1px solid rgba(0,255,0,0.3);
      color: #00ff00;
      cursor: pointer;
      text-align: left;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      transition: all 0.3s;
    }
    .sub-btn:hover {
      background: rgba(0,255,0,0.1);
      border-color: #00ff00;
    }
  `;
  document.head.appendChild(style);
}

window.toggleSection = function(sectionId) {
  const section = document.getElementById(sectionId);
  const button = section.previousElementSibling;
  const allSections = document.querySelectorAll('.menu-content');
  
  allSections.forEach(s => {
    if (s.id !== sectionId) s.style.display = 'none';
  });
  
  document.querySelectorAll('.menu-btn').forEach(b => {
    b.textContent = '▶ ' + b.textContent.substring(2);
  });
  
  if (section.style.display === 'none') {
    section.style.display = 'block';
    button.textContent = '▼ ' + button.textContent.substring(2);
  } else {
    section.style.display = 'none';
    button.textContent = '▶ ' + button.textContent.substring(2);
  }
};

window.handleAction = async function(section, action) {
  const content = document.getElementById('contentArea');
  const container = document.getElementById('adminContent');
  container.style.display = 'block';
  
  if (section === 'CHARACTERS' && action === 'View All') {
    await loadCharacters();
  } else if (section === 'CHARACTERS' && action === 'Create New') {
    showCreateCharacter();
  } else if (section === 'MEDIA' && action === 'Image Editor') {
    showImageEditor();
  } else {
    content.innerHTML = `<div style="color: #00ff00; padding: 20px; text-align: center;">${section} - ${action}<br>Coming Soon</div>`;
  }
};

async function loadCharacters() {
  const content = document.getElementById('contentArea');
  content.innerHTML = '<div style="color: #00ff00;">Loading...</div>';
  
  try {
    const response = await fetch('/api/character/all', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
    });
    
    const data = await response.json();
    if (data.success) {
      content.innerHTML = `
        <h3 style="color: #00ff00;">Characters (${data.characters.length})</h3>
        <div style="max-height: 300px; overflow-y: auto;">
          ${data.characters.map(char => `
            <div style="padding: 8px; border-bottom: 1px solid rgba(0,255,0,0.2);">
              <strong>${char.character_id}</strong>: ${char.character_name}
              <span style="float: right; color: rgba(0,255,0,0.6);">${char.category}</span>
            </div>
          `).join('')}
        </div>
      `;
    }
  } catch (error) {
    content.innerHTML = `<div style="color: #ff0000;">Error: ${error.message}</div>`;
  }
}

function showCreateCharacter() {
  const content = document.getElementById('contentArea');
  content.innerHTML = `
    <h3 style="color: #00ff00;">Create Character</h3>
    <input type="text" id="charName" placeholder="Name" style="width: 100%; margin: 5px 0; padding: 5px; background: #111; border: 1px solid #00ff00; color: #00ff00;">
    <select id="charCat" style="width: 100%; margin: 5px 0; padding: 5px; background: #111; border: 1px solid #00ff00; color: #00ff00;">
      <option>Protagonist</option>
      <option>Antagonist</option>
      <option>Tanuki</option>
      <option>Council Of The Wise</option>
      <option>B-Roll Chaos</option>
      <option>Machines</option>
      <option>Angry Slice Of Pizza</option>
      <option>Mutai</option>
    </select>
    <textarea id="charDesc" placeholder="Description" style="width: 100%; margin: 5px 0; padding: 5px; background: #111; border: 1px solid #00ff00; color: #00ff00; min-height: 60px;"></textarea>
    <button onclick="saveChar()" style="width: 100%; padding: 8px; background: #00ff00; color: #000; border: none; cursor: pointer; font-weight: bold;">Create</button>
  `;
}

window.saveChar = async function() {
  const name = document.getElementById('charName').value;
  const category = document.getElementById('charCat').value;
  const description = document.getElementById('charDesc').value;
  
  if (!name) return;
  
  try {
    const response = await fetch('/api/character/all', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      },
      body: JSON.stringify({ character_name: name, category, description })
    });
    
    if (response.ok) {
      handleAction('CHARACTERS', 'View All');
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
};

function showImageEditor() {
  const content = document.getElementById('contentArea');
  content.innerHTML = `
    <h3 style="color: #00ff00;">Image Editor</h3>
    <input type="file" id="imgFile" accept="image/*" style="width: 100%; margin-bottom: 10px;">
    <canvas id="imgCanvas" width="256" height="256" style="width: 100%; border: 1px solid #00ff00; background: #000; display: none;"></canvas>
    <div id="imgControls" style="display: none;">
      <label style="color: #00ff00; font-size: 12px;">CRT: <span id="crtVal">0%</span></label>
      <input type="range" id="crtSlider" min="0" max="100" value="0" style="width: 100%;">
      <button onclick="downloadImg()" style="width: 100%; margin-top: 10px; padding: 8px; background: #00ff00; color: #000; border: none; cursor: pointer;">Download</button>
    </div>
  `;
  
  setupImageEditor();
}

function setupImageEditor() {
  const input = document.getElementById('imgFile');
  const canvas = document.getElementById('imgCanvas');
  const ctx = canvas.getContext('2d');
  let img = null;
  
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      const image = new Image();
      image.onload = () => {
        img = image;
        canvas.style.display = 'block';
        document.getElementById('imgControls').style.display = 'block';
        drawImage();
      };
      image.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };
  
  document.getElementById('crtSlider').oninput = (e) => {
    document.getElementById('crtVal').textContent = e.target.value + '%';
    if (img) drawImage();
  };
  
  function drawImage() {
    ctx.clearRect(0, 0, 256, 256);
    const scale = Math.min(256/img.width, 256/img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, (256-w)/2, (256-h)/2, w, h);
    
    const crt = parseInt(document.getElementById('crtSlider').value);
    if (crt > 0) {
      const data = ctx.getImageData(0, 0, 256, 256);
      const px = data.data;
      const intensity = crt / 100;
      
      for (let i = 0; i < px.length; i += 4) {
        const avg = (px[i] + px[i+1] + px[i+2]) / 3;
        px[i] = px[i] * (1-intensity) + avg * 0.3 * intensity;
        px[i+1] = px[i+1] * (1-intensity) + avg * 1.2 * intensity;
        px[i+2] = px[i+2] * (1-intensity) + avg * 0.3 * intensity;
      }
      ctx.putImageData(data, 0, 0);
      
      for (let y = 0; y < 256; y += 3) {
        ctx.fillStyle = `rgba(0,0,0,${0.2 * intensity})`;
        ctx.fillRect(0, y, 256, 1);
      }
    }
  }
  
  window.drawImage = drawImage;
}

window.downloadImg = function() {
  const canvas = document.getElementById('imgCanvas');
  const link = document.createElement('a');
  link.download = 'edited.png';
  link.href = canvas.toDataURL();
  link.click();
};

async function getAuthToken() {
  if (localStorage.getItem('admin_token')) return;
  
  try {
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
  } catch (error) {
    console.error('Auth failed:', error);
  }
}

// Initialize
setTimeout(initAdminPanel, 1000);
