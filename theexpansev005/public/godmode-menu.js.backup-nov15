function initPizaPanel() {
  const leftPanel = document.getElementById('dossier-panel');
  
  leftPanel.innerHTML = `
    <div class="admin-panel" style="padding: 15px; height: 100%; overflow-y: auto;">
      <h2 style="color: #ffffff; text-shadow: 0 0 10px #ffffff; margin-bottom: 20px; font-size: 16px; text-align: center;">
        GOD MODE ADMIN
      </h2>
      
      <div class="menu-container" id="godModeMenu"></div>
      
      <div id="godModeContent" style="margin-top: 20px; padding: 10px; border: 1px solid #ffffff; background: rgba(255,255,255,0.02); min-height: 100px; display: none;">
        <div id="contentArea"></div>
      </div>
      
      <button onclick="returnToAdminMenu()" style="width: 100%; padding: 10px; margin-top: 15px; background: rgba(255,255,255,0.1); border: 2px solid #ffffff; color: #ffffff; font-family: 'Courier New', monospace; font-size: 12px; cursor: pointer; border-radius: 8px; font-weight: bold;">
        RETURN TO ADMIN MENU
      </button>
    </div>
  `;
  
  buildMenu();
  addStyles();
}

function returnToAdminMenu() {
  if (typeof initAdminPanel === 'function') {
    initAdminPanel();
  }
}

async function buildMenu() {
  const menu = document.getElementById('godModeMenu');
  
  const wizards = [{ wizard_id: '#F00001', wizard_name: 'Gift Experiment Wizard' }];
  
  const menuItems = [
    {
      title: 'WIZARDS',
      items: wizards
    }
  ];
  
  menuItems.forEach((section, idx) => {
    const div = document.createElement('div');
    div.className = 'menu-item';
    div.innerHTML = `
      <button class="menu-btn" onclick="toggleSection('godSection${idx}')">
        ▶ ${section.title}
      </button>
      <div class="menu-content" id="godSection${idx}" style="display: none;">
        ${section.items.map(item => 
          `<div style="display: flex; align-items: center; justify-content: space-between; padding: 6px; margin: 2px 0; border: 1px solid rgba(255,255,255,0.3); background: transparent; border-radius: 4px;">
            <button class="sub-btn" onclick="handleWizardAction('${item.wizard_name}')" style="flex: 1; margin: 0; border: none; background: transparent; text-align: left;">
              ${item.wizard_name}
            </button>
            <span class="help-icon" onclick="askAboutWizard('${item.wizard_id}')" style="cursor: pointer; font-size: 16px; margin-left: 8px; padding: 4px 8px; transition: all 0.3s;" title="Learn more about this wizard">
              🦝
            </span>
          </div>`
        ).join('')}
      </div>
    `;
    menu.appendChild(div);
  });
}

async function fetchAvailableWizards() {
  try {
    const response = await fetch('/api/god-mode/wizards', {
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}` 
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.wizards || [];
    }
  } catch (error) {
    console.error('Error fetching wizards:', error);
  }
  
  return [];
}

function addStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .menu-item { margin-bottom: 5px; }
    .menu-btn {
      width: 100%;
      padding: 10px;
      background: rgba(255,255,255,0.1);
      border: 1px solid #ffffff;
      color: #ffffff;
      cursor: pointer;
      text-align: left;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      font-weight: bold;
      transition: all 0.3s;
    }
    .menu-btn:hover {
      background: rgba(255,255,255,0.2);
      text-shadow: 0 0 5px #ff0000;
    }
    .menu-content {
      padding: 5px 0 5px 10px;
      background: rgba(0,0,0,0.5);
    }
    .sub-btn {
      padding: 0;
      background: transparent;
      border: none;
      color: #ffffff;
      cursor: pointer;
      text-align: left;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      transition: all 0.3s;
    }
    .sub-btn:hover {
      text-shadow: 0 0 5px #00ff75;
    }
    .help-icon {
      opacity: 0.7;
      transition: all 0.3s;
    }
    .help-icon:hover {
      opacity: 1;
      transform: scale(1.2);
      filter: drop-shadow(0 0 5px #00ff75);
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

window.handleWizardAction = function(wizardName) {
  console.log('Loading wizard:', wizardName);
  
  if (wizardName === 'Gift Experiment Wizard') {
    loadWizardFile('gift-wizard.js');
  }
};

window.askAboutWizard = function(wizardId) {
  console.log('User asked about wizard:', wizardId);
  
  // Send socket message to get basic info about the wizard
  if (typeof window.socket !== "undefined") {
    window.socket.emit('explain-hex', { 
      hexId: wizardId, 
      mode: 'basic' 
    });
  }
};

function loadWizardFile(filename) {
  const existingScripts = document.querySelectorAll('script[data-wizard]');
  existingScripts.forEach(s => s.remove());
  
  const script = document.createElement('script');
  script.src = filename + '?t=' + Date.now();
  script.setAttribute('data-wizard', 'true');
  script.onload = () => {
    if (typeof initWizard === 'function') {
      initWizard();
    }
  };
  document.body.appendChild(script);
}
