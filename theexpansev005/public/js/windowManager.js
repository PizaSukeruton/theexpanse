// public/js/windowManager.js
// Manages window state, content, and module mounting

import ModuleRegistry from './moduleRegistry.js';

const WindowManager = (() => {
  const windows = {};

  function registerWindow(id, element, defaultEffect = 'none') {
    windows[id] = {
      id,
      el: element,
      effect: defaultEffect,
      state: 'closed',
      currentModule: null
    };
    console.log(`[WindowManager] Registered window: ${id}`);
  }

  function setState(id, state, effectOverride) {
    const win = windows[id];
    if (!win) {
      console.warn(`[WindowManager] Window "${id}" not found`);
      return;
    }

    const effect = effectOverride || win.effect;
    win.state = state;

    win.el.classList.remove('window-open', 'window-closed');
    win.el.classList.add(state === 'open' ? 'window-open' : 'window-closed');

    console.log(`[WindowManager] ${id} → ${state}`);
  }

  function setContent(id, html) {
    const win = windows[id];
    if (!win) {
      console.warn(`[WindowManager] Window "${id}" not found`);
      return;
    }
    // Find the .window-inner inside this window
    const innerEl = win.el.querySelector('.window-inner');
    if (innerEl) {
      innerEl.innerHTML = html;
    } else {
      console.warn(`[WindowManager] No .window-inner found in ${id}`);
    }
  }

  function clear(id) {
    const win = windows[id];
    if (!win) {
      console.warn(`[WindowManager] Window "${id}" not found`);
      return;
    }
    // Clear only the inner content, preserve .window-inner structure
    const innerEl = win.el.querySelector('.window-inner');
    if (innerEl) {
      innerEl.innerHTML = '';
    }
    win.currentModule = null;
  }

  function mountModule(windowId, moduleId, context = {}) {
    const win = windows[windowId];
    if (!win) {
      console.warn(`[WindowManager] Window "${windowId}" not found`);
      return;
    }

    console.log(`[WindowManager] Mounting ${moduleId} into ${windowId}`);

    clear(windowId);
    setState(windowId, 'open');

    const mod = ModuleRegistry.get(moduleId);
    if (!mod || typeof mod.mount !== 'function') {
      console.warn(`[WindowManager] Module "${moduleId}" has no mount() function`);
      return;
    }

    win.currentModule = moduleId;

    const enrichedContext = {
      ...context,
      windowId,
      WindowManager
    };

    // Pass the .window-inner element to the module
    const innerEl = win.el.querySelector('.window-inner');
    if (innerEl) {
      mod.mount(innerEl, enrichedContext);
    } else {
      console.warn(`[WindowManager] No .window-inner found in ${windowId}`);
    }

    console.log(`[WindowManager] Module "${moduleId}" mounted in ${windowId}`);
  }

  function getState(id) {
    const win = windows[id];
    return win ? win.state : null;
  }

  function getCurrentModule(id) {
    const win = windows[id];
    return win ? win.currentModule : null;
  }

  return {
    registerWindow,
    setState,
    setContent,
    clear,
    mountModule,
    getState,
    getCurrentModule
  };
})();

export default WindowManager;
