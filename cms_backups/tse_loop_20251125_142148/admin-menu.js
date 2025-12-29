function initAdminPanel() {
  const leftPanel = document.getElementById('dossier-panel');
  
  leftPanel.innerHTML = `
    <div class="admin-panel">
      <h2 class="admin-header">ADMIN CONTROL PANEL</h2>
      <h3 class="admin-subheader">SELECT LEVEL TO MANAGE</h3>
      <div class="level-buttons" id="levelButtons"></div>
    </div>
  `;
  
  buildLevelButtons();
  addAdminStyles();
}

function buildLevelButtons() {
  const container = document.getElementById('levelButtons');
  
  const levels = [
    { level: 1, name: 'Piza Sukeruton', color: '#00ff75' },
    { level: 2, name: 'TSE / FSRS', color: '#00ff75' },
    { level: 3, name: 'Client Matcher', color: '#00ff75' },
    { level: 4, name: 'TmBot3000', color: '#00ff75' },
    { level: 5, name: 'Recruitment', color: '#00ff75' },
    { level: 6, name: 'RiceyBot3000', color: '#00ff75' },
    { level: 7, name: 'VanillaLand', color: '#00ff75' },
    { level: 8, name: 'RedStar', color: '#00ff75' },
    { level: 9, name: 'Vacant Lot', color: '#666666' },
    { level: 10, name: 'Vacant Lot', color: '#666666' },
    { level: 11, name: 'God Mode', color: '#ff0000' }
  ];
  
  levels.forEach(item => {
    const button = document.createElement('button');
    button.className = 'level-btn';
    button.style.borderColor = item.color;
    button.style.color = item.color;
    button.innerHTML = `
      <span style="font-weight: bold; font-size: 12px;">LEVEL ${item.level}</span><br>
      <span style="font-size: 10px; opacity: 0.8;">${item.name}</span>
    `;
    button.onclick = () => loadLevel(item.level, item.name);
    container.appendChild(button);
  });
}


function loadGodMode() {
  const script = document.createElement('script');
  script.src = 'piza-menu.js';
  script.onload = () => {
    if (typeof initPizaPanel === 'function') {
      initPizaPanel();
    }
  };
  document.body.appendChild(script);
}

function addAdminStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .admin-panel {
      font-family: "Courier New", monospace;
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 10px;
      box-sizing: border-box;
    }
    
    .admin-header {
      color: #00ff00;
      text-shadow: 0 0 10px #00ff00;
      margin: 0 0 8px 0;
      font-size: 16px;
      text-align: center;
      flex-shrink: 0;
    }
    
    .admin-subheader {
      color: #00ff00;
      text-shadow: 0 0 8px #00ff00;
      margin: 0 0 10px 0;
      font-size: 11px;
      text-align: center;
      flex-shrink: 0;
    }
    
    .level-buttons {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-height: 0;
    }
    
    .level-btn {
      flex: 1;
      width: 100%;
      background: rgba(0,0,0,0.6);
      border: 2px solid;
      cursor: pointer;
      text-align: center;
      font-family: 'Courier New', monospace;
      transition: all 0.3s;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 0;
      padding: 4px;
    }
    
    .level-btn:hover {
      background: rgba(0,255,117,0.15);
      transform: scale(1.02);
      box-shadow: 0 0 15px currentColor;
    }
  `;
  document.head.appendChild(style);
}

function loadLevel(level, name) {
  console.log(`Loading Level ${level}: ${name}`);
  
  const menuFiles = {
    1: 'piza-menu.js',
    2: 'tse-menu.js',
    3: 'clientmatch-menu.js',
    4: 'tmbot3000-menu.js',
    5: 'recruitment-menu.js',
    6: 'riceybot3000-menu.js',
    7: 'vanillaland-menu.js',
    8: 'redstar-menu.js',
    9: 'vacantlot-menu.js',
    10: 'vacantlot-menu.js',
    11: 'godmode-menu.js'
  };
  
  const scriptFile = menuFiles[level];
  
  // Remove any existing level menu scripts
  const existingScripts = document.querySelectorAll('script[data-level-menu]');
  existingScripts.forEach(s => s.remove());
  
  // Load new script
  const script = document.createElement('script');
  script.src = scriptFile + '?t=' + Date.now(); // Cache bust
  script.setAttribute('data-level-menu', 'true');
  script.onload = () => {
    // Call the init function after script loads
    if (typeof initPizaPanel === 'function') {
      initPizaPanel();
    }
  };
  document.body.appendChild(script);
}
