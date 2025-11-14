function initPizaPanel() {
  const leftPanel = document.getElementById('dossier-panel');
  
  leftPanel.innerHTML = `
    <div style="padding: 20px; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
      <div style="width: 200px; height: 200px; border: 3px solid #00ff75; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; background: rgba(0,255,117,0.1);">
        <span style="font-size: 80px;">🦝</span>
      </div>
      <h2 style="color: #00ff75; text-shadow: 0 0 10px #00ff75; font-size: 20px; margin: 10px 0; font-family: 'Courier New', monospace;">
        The Trash Pandas Are Still Building
      </h2>
      <p style="color: #00ff75; font-size: 18px; margin: 10px 0 30px 0; font-family: 'Courier New', monospace; font-weight: bold;">
        Client Matcher
      </p>
      <button onclick="returnToAdminMenu()" style="padding: 12px 30px; background: rgba(0,255,117,0.1); border: 2px solid #00ff75; color: #00ff75; font-family: 'Courier New', monospace; font-size: 14px; cursor: pointer; border-radius: 8px; transition: all 0.3s;">
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
