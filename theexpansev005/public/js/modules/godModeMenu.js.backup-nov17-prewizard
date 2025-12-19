// public/js/modules/godModeMenu.js
import { ModuleRegistry } from '../moduleRegistry.js';

ModuleRegistry.register('admin/godMode', {
  mount(container, context) {
    console.log('[godModeMenu] Mounting...');
    
    container.innerHTML = `
      <div class="admin-panel" style="padding: 15px; height: 100%; overflow-y: auto;">
        <h2 style="color: #ffffff; text-shadow: 0 0 10px #ffffff; margin-bottom: 20px; font-size: 16px; text-align: center;">
          GOD MODE ADMIN
        </h2>
        
        <div class="menu-container" id="godModeMenu"></div>
      </div>
    `;
    
    buildMenu();
    addStyles();
  }
});

function buildMenu() {
  const menu = document.getElementById('godModeMenu');
  if (!menu) return;
  
  // Create level buttons 1-11
  for (let level = 1; level <= 11; level++) {
    const div = document.createElement('div');
    div.className = 'menu-item';
    
    const isGodMode = level === 11;
    const buttonClass = isGodMode ? 'menu-btn god-mode-btn' : 'menu-btn';
    const levelText = isGodMode ? 'LEVEL 11: GOD MODE' : `LEVEL ${level}`;
    
    div.innerHTML = `
      <button class="${buttonClass}" data-level="${level}">
        ▶ ${levelText}
      </button>
      <div class="menu-content" id="levelSection${level}" style="display: none;">
        <div style="color: #888; font-size: 11px; padding: 10px;">
          No wizards configured for Level ${level}
        </div>
      </div>
    `;
    menu.appendChild(div);
    
    // Add click handler
    const btn = div.querySelector(`.${buttonClass.split(' ')[0]}`);
    const content = div.querySelector('.menu-content');
    btn.addEventListener('click', () => toggleSection(content, btn));
  }
}

function toggleSection(section, button) {
  const allSections = document.querySelectorAll('.menu-content');
  const allButtons = document.querySelectorAll('.menu-btn');
  
  // Close all other sections
  allSections.forEach(s => {
    if (s !== section) s.style.display = 'none';
  });
  
  // Reset all button arrows
  allButtons.forEach(b => {
    if (b !== button) {
      const text = b.textContent.trim();
      if (text.startsWith('▼')) {
        b.textContent = '▶' + text.substring(1);
      }
    }
  });
  
  // Toggle this section
  if (section.style.display === 'none') {
    section.style.display = 'block';
    const text = button.textContent.trim();
    button.textContent = '▼' + text.substring(1);
  } else {
    section.style.display = 'none';
    const text = button.textContent.trim();
    button.textContent = '▶' + text.substring(1);
  }
}

function addStyles() {
  if (document.getElementById('godmode-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'godmode-styles';
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
    .god-mode-btn {
      border-color: #ff0000;
      color: #ff0000;
      background: rgba(255,0,0,0.1);
    }
    .god-mode-btn:hover {
      background: rgba(255,0,0,0.2);
      text-shadow: 0 0 10px #ff0000;
    }
    .menu-content {
      padding: 5px 0 5px 10px;
      background: rgba(0,0,0,0.5);
    }
  `;
  document.head.appendChild(style);
}
