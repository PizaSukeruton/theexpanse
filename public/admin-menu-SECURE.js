// SECURE VERSION - admin-menu.js
// Fixed: November 6, 2025, 7:42 PM AEST
// Removed all hardcoded credentials and auto-login

function initAdminPanel() {
  const leftPanel = document.getElementById('dossier-panel');
  console.log("initAdminPanel called");
  
  // REMOVED: Hardcoded user check
  // Authentication should be handled server-side
  
  if (!leftPanel) return;
  
  // Check if user has valid authentication
  const token = localStorage.getItem('admin_token');
  if (!token) {
    leftPanel.innerHTML = `
      <div class="admin-panel" style="padding: 15px;">
        <h2 style="color: #ff0000;">AUTHENTICATION REQUIRED</h2>
        <p style="color: #ff0000;">Please log in through proper channels</p>
      </div>
    `;
    return;
  }
  
  // Verify token with server before showing admin panel
  verifyAdminAccess(token).then(isValid => {
    if (isValid) {
      buildAdminInterface(leftPanel);
    } else {
      leftPanel.innerHTML = `
        <div class="admin-panel" style="padding: 15px;">
          <h2 style="color: #ff0000;">ACCESS DENIED</h2>
          <p style="color: #ff0000;">Invalid or expired token</p>
        </div>
      `;
      localStorage.removeItem('admin_token');
    }
  });
}

async function verifyAdminAccess(token) {
  try {
    const response = await fetch('/api/admin/verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.ok;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
}

function buildAdminInterface(leftPanel) {
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
}

// REMOVED: getAuthToken() function with hardcoded credentials
// Authentication must be handled through proper login flow

// Rest of the functions remain the same but without hardcoded credentials
// All API calls should use token obtained through proper authentication

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
      items: ['Image Editor']
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

// Continue with other functions but ensure all use proper authentication
// No hardcoded credentials anywhere
