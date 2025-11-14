function initUserPanel() {
  const leftPanel = document.getElementById('dossier-panel');
  console.log("initUserPanel called - LEVEL 1, currentUser:", currentUser);
  
  if (!leftPanel) return;
  
  leftPanel.innerHTML = `
    <div class="user-panel" style="padding: 15px; height: 100%; overflow-y: auto;">
      <h2 style="color: #00ff75; text-shadow: 0 0 10px #00ff75; margin-bottom: 20px; font-size: 16px; text-align: center;">
        USER MENU - LEVEL 1
      </h2>
      
      <div class="menu-container" id="userMenu"></div>
      
      <div id="userContent" style="margin-top: 20px; padding: 10px; border: 1px solid #00ff75; background: rgba(0,255,117,0.02); min-height: 100px; display: none;">
        <div id="contentArea"></div>
      </div>
    </div>
  `;
  
  buildUserMenu();
  addUserStyles();
}

function buildUserMenu() {
  const menu = document.getElementById('userMenu');
  const menuItems = [
    {
      title: 'PROFILE',
      items: ['View Profile', 'Edit Details', 'Settings']
    },
    {
      title: 'CHARACTERS',
      items: ['Meet Characters', 'Interactions', 'Favorites']
    },
    {
      title: 'ACCOUNT',
      items: ['Password', 'Preferences', 'Logout']
    }
  ];

  let menuHTML = '';
  menuItems.forEach((section, index) => {
    const sectionId = `userSection${index}`;
    menuHTML += `
      <div class="menu-section" style="margin-bottom: 10px;">
        <button class="menu-section-title" data-section="${sectionId}" style="width: 100%; padding: 8px; background: rgba(0,255,117,0.05); border: 1px solid #00ff75; color: #00ff75; cursor: pointer; font-family: inherit; font-size: 12px; font-weight: bold; text-align: left;">
          ▼ ${section.title}
        </button>
        <div id="${sectionId}" class="section-items" style="display: none; padding-left: 10px;">
          ${section.items.map(item => `
            <button class="menu-item" data-item="${item}" style="display: block; width: 100%; padding: 6px; margin: 3px 0; background: transparent; border: 1px solid #00ff75; color: #00ff75; cursor: pointer; font-family: inherit; font-size: 11px; text-align: left;">
              → ${item}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  });

  menu.innerHTML = menuHTML;

  document.querySelectorAll('.menu-section-title').forEach(btn => {
    btn.addEventListener('click', function() {
      const sectionId = this.dataset.section;
      const section = document.getElementById(sectionId);
      section.style.display = section.style.display === 'none' ? 'block' : 'none';
    });
  });

  document.querySelectorAll('.menu-item').forEach(btn => {
    btn.addEventListener('click', function() {
      const item = this.dataset.item;
      handleUserMenuClick(item);
    });
  });
}

function handleUserMenuClick(item) {
  console.log("User menu item clicked:", item);
}

function addUserStyles() {
  if (document.getElementById('userMenuStyles')) return;
  
  const style = document.createElement('style');
  style.id = 'userMenuStyles';
  style.textContent = `
    .user-panel {
      font-family: "Courier New", monospace;
      color: #00ff75;
    }
    .menu-section-title:hover {
      background: rgba(0,255,117,0.1) !important;
    }
    .menu-item:hover {
      background: rgba(0,255,117,0.08) !important;
      text-shadow: 0 0 5px #00ff75;
    }
  `;
  document.head.appendChild(style);
}
