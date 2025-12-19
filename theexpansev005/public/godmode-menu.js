// =====================================
// GOD MODE MENU - LEVEL 11 CONTROL PANEL
// The Expanse v004
// This file is ONLY for system-wide Level 11 controls
// =====================================

// ---------- CONFIG: SYSTEM-WIDE GOD MODE MENU ----------
const GOD_MODE_MENU_SECTIONS = [
  {
    title: 'SYSTEM ADMINISTRATION',
    items: [
      {
        id: 'gm-global-buttons',
        button_name: 'Global God Mode Buttons',
        action_type: 'button-wizard'
      }
    ]
  }
];

// ---------- STYLE INJECTION ----------

function addStyles() {
  const existing = document.getElementById('godmode-styles');
  if (existing) return;

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

    .menu-item-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px;
      margin: 2px 0;
      border: 1px solid rgba(255,255,255,0.3);
      background: transparent;
      border-radius: 4px;
      gap: 6px;
    }

    .menu-item-controls {
      display: flex;
      gap: 4px;
    }

    .menu-item-controls button {
      font-size: 9px;
      padding: 2px 4px;
      border-radius: 3px;
      border: 1px solid rgba(255,255,255,0.3);
    }

    .menu-item-edit { background: rgba(0,255,117,0.15); }
    .menu-item-edit:hover { background: rgba(0,255,117,0.3); }

    .menu-item-delete { background: rgba(255,0,0,0.15); }
    .menu-item-delete:hover { background: rgba(255,0,0,0.3); }
  `;
  document.head.appendChild(style);
}

// ---------- TOGGLE SECTION ----------

window.toggleSection = function(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  const button = section.previousElementSibling;
  const allSections = document.querySelectorAll('.menu-content');

  allSections.forEach(s => {
    if (s.id !== sectionId) s.style.display = 'none';
  });

  document.querySelectorAll('.menu-btn').forEach(b => {
    if (b.textContent.startsWith('▼ ')) {
      b.textContent = '▶ ' + b.textContent.substring(2);
    }
  });

  if (section.style.display === 'none') {
    section.style.display = 'block';
    button.textContent = '▼ ' + button.textContent.substring(2);
  } else {
    section.style.display = 'none';
    button.textContent = '▶ ' + button.textContent.substring(2);
  }
};

// ---------- EDIT / DELETE (LOCAL FRONT-END ONLY FOR NOW) ----------

function handleEditGodMenuItem(itemId, buttonEl) {
  console.log('[godModeMenu] Edit item:', itemId);
  const currentLabel = buttonEl.textContent.trim();
  const newLabel = window.prompt('New label:', currentLabel);
  if (!newLabel || !newLabel.trim()) return;
  buttonEl.textContent = newLabel.trim();
}

function handleDeleteGodMenuItem(itemId, rowEl) {
  console.log('[godModeMenu] Delete item:', itemId);
  if (!window.confirm('Delete this God Mode entry?')) return;
  rowEl.remove();
}

// ---------- WIZARD LAUNCHER ----------

function loadWizardFile(filename) {
  const tagId = 'wizard-' + filename.replace(/[^\w-]/g, '_');
  let script = document.getElementById(tagId);
  if (script) return window.GiftWizard?.init?.();

  script = document.createElement('script');
  script.id = tagId;
  script.src = filename;
  script.onload = () => window.GiftWizard?.init?.();
  script.onerror = e => console.error('[WIZARD] Load error:', e);
  document.body.appendChild(script);
}

// ---------- ACTION ROUTER ----------

window.loadGodModeFunction = function(actionType) {
  const content = document.getElementById('contentArea');
  const container = document.getElementById('godModeContent');

  if (!content || !container) return;

  container.style.display = 'block';

  if (actionType === 'button-wizard') {
    if (window.ModuleRegistry?.mount) {
      console.log('[godModeMenu] Launch wizard/menuBuilder for system-wide Level 11');
      window.ModuleRegistry.mount('wizard/menuBuilder', content, {
        targetLevel: 11,
        mode: 'system-wide'
      });
    } else {
      content.innerHTML = '<div style="color:red;">Module Registry not available</div>';
    }
    return;
  }

  content.innerHTML = `<div style="color:#ffcc00;">Unknown action: ${actionType}</div>`;
};

// ---------- MODULE REGISTRY DEFINITION ----------

if (window.ModuleRegistry) {
  window.ModuleRegistry.define('admin/godMode', {
    mount: async (element) => {
      console.log('[godModeMenu] Mounting...');

      element.innerHTML = `
        <div class="admin-panel" style="padding:15px;height:100%;overflow-y:auto;">
          <h2 style="color:#fff;text-shadow:0 0 10px #fff;margin-bottom:20px;font-size:16px;text-align:center;">
            GOD MODE ADMIN
          </h2>

          <div class="menu-container" id="godModeMenu"></div>

          <div id="godModeContent" style="
            margin-top:20px;
            padding:10px;
            border:1px solid #fff;
            background:rgba(255,255,255,0.02);
            min-height:100px;
            display:none;">
            <div id="contentArea"></div>
          </div>
        </div>
      `;

      const menuRoot = element.querySelector('#godModeMenu');
      if (!menuRoot) {
        console.error('[godModeMenu] No menuRoot found inside admin/godMode element');
        return;
      }

      GOD_MODE_MENU_SECTIONS.forEach((section, idx) => {
        const wrap = document.createElement('div');
        wrap.className = 'menu-item';

        const sectionId = `godSection${idx}`;

        const headerBtn = document.createElement('button');
        headerBtn.className = 'menu-btn';
        headerBtn.textContent = `▶ ${section.title}`;
        headerBtn.onclick = () => toggleSection(sectionId);

        const content = document.createElement('div');
        content.className = 'menu-content';
        content.id = sectionId;
        content.style.display = 'none';

        section.items.forEach(item => {
          const row = document.createElement('div');
          row.className = 'menu-item-row';

          const mainBtn = document.createElement('button');
          mainBtn.className = 'sub-btn';
          mainBtn.textContent = item.button_name;
          mainBtn.onclick = () => loadGodModeFunction(item.action_type);

          const controls = document.createElement('div');
          controls.className = 'menu-item-controls';

          const editBtn = document.createElement('button');
          editBtn.className = 'sub-btn menu-item-edit';
          editBtn.textContent = 'EDIT';
          editBtn.onclick = (ev) => {
            ev.stopPropagation();
            handleEditGodMenuItem(item.id, mainBtn);
          };

          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'sub-btn menu-item-delete';
          deleteBtn.textContent = 'DEL';
          deleteBtn.onclick = (ev) => {
            ev.stopPropagation();
            handleDeleteGodMenuItem(item.id, row);
          };

          controls.appendChild(editBtn);
          controls.appendChild(deleteBtn);

          row.appendChild(mainBtn);
          row.appendChild(controls);
          content.appendChild(row);
        });

        wrap.appendChild(headerBtn);
        wrap.appendChild(content);
        menuRoot.appendChild(wrap);
      });

      console.log('[godModeMenu] Menu built, root children:', menuRoot.children.length);

      addStyles();

      // Auto-open the first (and only) section so God Mode never looks empty
      if (GOD_MODE_MENU_SECTIONS.length > 0) {
        toggleSection('godSection0');
      }
    },

    unmount: () => console.log('[godModeMenu] Unmounting...')
  });
}
