function initPizaPanel() {
  const leftPanel = document.getElementById('dossier-panel');
  
  leftPanel.innerHTML = `
    <div style="padding: 20px; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
      <div style="width: 200px; height: 200px; border: 3px solid #666666; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; background: rgba(102,102,102,0.1);">
        <span style="font-size: 80px;">🦝</span>
      </div>
      <h2 style="color: #666666; text-shadow: 0 0 10px #666666; font-size: 24px; margin: 10px 0; font-family: 'Courier New', monospace;">
        UNDER CONSTRUCTION
      </h2>
      <p style="color: #666666; font-size: 16px; margin: 10px 0 30px 0; font-family: 'Courier New', monospace;">
        Trash Pandas are on their way!
      </p>
      <button onclick="returnToAdminMenu()" style="padding: 12px 30px; background: rgba(102,102,102,0.1); border: 2px solid #666666; color: #666666; font-family: 'Courier New', monospace; font-size: 14px; cursor: pointer; border-radius: 8px; transition: all 0.3s;">
        RETURN TO ADMIN MENU
      </button>
    </div>
  `;
}

function returnToAdminMenu() {
  if (typeof initAdminPanel === 'function') {
    initAdminPanel();
  }
}
