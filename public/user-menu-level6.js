function initUserMenu() {
  const leftPanel = document.getElementById('dossier-panel');
  
  leftPanel.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h2 style="color: #00ff75; text-shadow: 0 0 10px #00ff75; font-family: 'Courier New', monospace; margin-bottom: 30px;">
        LEVEL 6 ACCESS
      </h2>
      <p style="color: #00ff75; font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.6;">
        Welcome to Level 6.<br><br>
        Your interface is under construction.<br><br>
        Please check back soon.
      </p>
    </div>
  `;
}

if (typeof initUserMenu === 'function') {
  initUserMenu();
}
