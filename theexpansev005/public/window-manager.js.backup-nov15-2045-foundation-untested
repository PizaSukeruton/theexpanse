(() => {
  const windowIds = [
    'left-window-inner',
    'top-right-window-inner',
    'bottom-right-window-inner'
  ];

  function init() {
    windowIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) {
        console.warn(`WindowManager: Element '${id}' not found.`);
        return;
      }
      el.classList.remove('wm-open');
      // DON'T add click listeners - only programmatic control
    });
    console.log('[WindowManager] ✅ Initialized');
  }

  function toggle(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('wm-open');
  }

  function loadContent(id, htmlContent) {
    const el = document.getElementById(id);
    if (!el) {
      console.error(`WindowManager: Element '${id}' not found`);
      return;
    }
    el.innerHTML = htmlContent;
    console.log(`[WindowManager] Content loaded into '${id}'`);
  }

  window.WindowManager = {
    toggle,
    loadContent
  };

  document.addEventListener('DOMContentLoaded', init);
})();
