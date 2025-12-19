// public/js/modules/pizzaMenu.js
import { ModuleRegistry } from '../moduleRegistry.js';

ModuleRegistry.register('admin/pizzaMenu', {
  mount(container, context) {
    console.log('[pizzaMenu] Mounting...');
    
    container.innerHTML = `
      <div class="admin-panel" style="padding: var(--padding-standard); height: 100%; overflow-y: auto; display: flex; flex-direction: column;">
        <h2 style="color: var(--accent); text-shadow: 0 0 10px var(--accent); margin-bottom: 20px; font-size: var(--font-menu); text-align: center;">
          PIZA SUKERUTON MULTIVERSE
        </h2>
        
        <div class="menu-container" id="pizzaMenu" style="flex: 1;">
          <div style="color: var(--accent); font-size: 12px; padding: var(--padding-button); text-align: center;">
            Loading menu...
          </div>
        </div>
        
        <div style="margin-top: 20px;">
          <button id="logoutBtn" style="width: 100%; padding: var(--padding-button); background: rgba(255,0,0,0.2); border: 1px solid var(--red); color: var(--red); cursor: pointer; font-family: 'Courier New', monospace; font-weight: bold; font-size: var(--font-button);">
            LOGOUT
          </button>
        </div>
      </div>
    `;
    
    fetchMenuButtons();
    addStyles();
    setupLogout();
  }
});

async function fetchMenuButtons() {
  const menu = document.getElementById('pizzaMenu');
  if (!menu) return;
  
  try {
    const terminalSocket = window.SocketManager.getTerminalSocket();
    
    terminalSocket.emit('menu:fetch', { access_level: 1 }, (response) => {
      if (response.success && response.buttons.length > 0) {
        buildMenu(response.buttons);
      } else {
        menu.innerHTML = `
          <div style="color: #888; font-size: 12px; padding: var(--padding-button); text-align: center;">
            No menu items configured
          </div>
        `;
      }
    });
  } catch (error) {
    console.error('[pizzaMenu] Error fetching buttons:', error);
    menu.innerHTML = `
      <div style="color: var(--error); font-size: 12px; padding: var(--padding-button);">
        Error loading menu
      </div>
    `;
  }
}

function buildMenu(buttons) {
  const menu = document.getElementById('pizzaMenu');
  if (!menu) return;
  
  menu.innerHTML = '';
  
  // Sort by button_order
  buttons.sort((a, b) => a.button_order - b.button_order);
  
  buttons.forEach(button => {
    const div = document.createElement('div');
    div.className = 'menu-item';
    
    div.innerHTML = `
      <button class="menu-btn" data-menu-id="${button.menu_id}">
        ▶ ${button.button_label}
      </button>
      <div class="menu-content" id="menuSection${button.menu_id}" style="display: none;">
        <div style="color: #888; font-size: 11px; padding: var(--padding-button);">
          No actions configured for ${button.button_label}
        </div>
      </div>
    `;
    menu.appendChild(div);
    
    // Add click handler
    const btn = div.querySelector('.menu-btn');
    const content = div.querySelector('.menu-content');
    btn.addEventListener('click', () => toggleSection(content, btn));
  });
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

function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (!logoutBtn) return;
  
  logoutBtn.addEventListener('click', async () => {
    try {
      const response = await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        window.location.href = '/terminal_new_v003.html';
      }
    } catch (error) {
      console.error('[pizzaMenu] Logout error:', error);
    }
  });
}

function addStyles() {
  if (document.getElementById('pizza-menu-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'pizza-menu-styles';
  style.textContent = `
    .menu-item { margin-bottom: 5px; }
    .menu-btn {
      width: 100%;
      padding: var(--padding-button);
      background: rgba(0,255,117,0.1);
      border: 1px solid var(--accent);
      color: var(--accent);
      cursor: pointer;
      text-align: left;
      font-family: 'Courier New', monospace;
      font-size: var(--font-button);
      font-weight: bold;
      transition: all 0.3s;
    }
    .menu-btn:hover {
      background: rgba(0,255,117,0.2);
      text-shadow: 0 0 5px var(--accent);
    }
    .menu-content {
      padding: 5px 0 5px var(--padding-button);
      background: rgba(0,0,0,0.5);
    }
  `;
  document.head.appendChild(style);
}
