// Clean admin menu - no hardcoded credentials
function initAdminPanel() {
  const leftPanel = document.getElementById('dossier-panel');
  console.log("initAdminPanel called, currentUser:", currentUser);
  
  if (!leftPanel) return;
  
  // Check if we have a valid token from proper login
  const token = localStorage.getItem('admin_token');
  
  if (!token) {
    console.log("No admin token found - admin panel not shown");
    return; // Don't show admin panel without proper auth
  }
  
  // Token exists, show the admin panel
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
  // REMOVED: getAuthToken() - no more auto-login
}
