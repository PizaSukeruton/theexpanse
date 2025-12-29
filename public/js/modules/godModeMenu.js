// ===========================================
// LEGACY GOD MODE MENU (DISABLED)
// This file is intentionally disabled because
// admin/godMode (CRT version) now controls Level 11 menu.
// ===========================================

console.warn("[legacy godModeMenu] Disabled - using admin/godMode instead.");

if (window.ModuleRegistry) {
  window.ModuleRegistry.define('admin/godMode', {
    mount: (element) => {
      element.innerHTML = `
        <div style="color:#ff5555;font-size:12px;padding:20px;">
          Legacy God Mode Menu Disabled.<br>
          New system: <b>public/godmode-menu.js</b>
        </div>
      `;
    }
  });
}
