// public/js/appRouter.js
// SPA Router - detects scene from URL and mounts modules

import WindowManager from './windowManager.js';

// Import all modules
import './modules/authFlow.js';
import './modules/verificationFlow.js';
import './modules/commandBar.js';
import './modules/godModeMenu.js';
import './modules/chatDisplay.js';

// Scene definitions
const scenes = {
  login: [
    { windowId: 'left-panel', moduleId: null },
    { windowId: 'top-right-window', moduleId: 'auth/login' },
    { windowId: 'bottom-right-window', moduleId: null }
  ],
  terminal: [
    { windowId: 'left-panel', moduleId: 'admin/godMode' },
    { windowId: 'top-right-window', moduleId: 'terminal/chatDisplay' },
    { windowId: 'bottom-right-window', moduleId: 'ui/commandBar' }
  ],
  signup: [
    { windowId: 'left-panel', moduleId: 'auth/signup' },
    { windowId: 'top-right-window', moduleId: null },
    { windowId: 'bottom-right-window', moduleId: null }
  ],
  verify: [
    { windowId: 'left-panel', moduleId: null },
    { windowId: 'top-right-window', moduleId: 'dossier/setup' },
    { windowId: 'bottom-right-window', moduleId: null }
  ]
};

// Detect scene from URL parameters
function detectScene() {
  const params = new URLSearchParams(window.location.search);
  // Check if user is authenticated
  const authenticated = params.get("authenticated");
  if (authenticated === "true") return "terminal";
  const verify = params.get('verify');
  const mode = params.get('mode');

  if (verify) return 'verify';
  if (mode === 'signup') return 'signup';
  return 'login';
}

// Extract context from URL parameters
function extractContext(sceneName) {
  const params = new URLSearchParams(window.location.search);
  const context = {};

  if (sceneName === 'verify') {
    const verifyToken = params.get('verify');
    if (verifyToken) {
      context.verifyToken = verifyToken;
      console.log('[AppRouter] Extracted verifyToken from URL');
    }
  }

  return context;
}

// Load scene
function loadScene(sceneName) {
  console.log('[AppRouter] Loading scene: ' + sceneName);

  const scene = scenes[sceneName];
  if (!scene) {
    console.error('[AppRouter] Scene not found: ' + sceneName);
    return;
  }

  // Extract context based on scene
  const sceneContext = extractContext(sceneName);

  // Build debug info
  const debugInfo = {};

  scene.forEach(slot => {
    const moduleId = slot.moduleId || '(empty)';
    debugInfo[slot.windowId] = moduleId;

    if (slot.moduleId) {
      WindowManager.mountModule(slot.windowId, slot.moduleId, sceneContext);
    } else {
      WindowManager.clear(slot.windowId);
    }
  });

  console.log('[AppRouter] Scene loaded:', debugInfo);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('[AppRouter] DOMContentLoaded');

  // Get actual DOM elements
  const leftPanelEl = document.getElementById('left-panel');
  const topRightEl = document.getElementById('top-right-window');
  const bottomRightEl = document.getElementById('bottom-right-window');

  console.log('[AppRouter] DOM elements found:', {
    leftPanel: !!leftPanelEl,
    topRight: !!topRightEl,
    bottomRight: !!bottomRightEl
  });

  // Register windows with actual DOM elements
  WindowManager.registerWindow('left-panel', leftPanelEl);
  WindowManager.registerWindow('top-right-window', topRightEl);
  WindowManager.registerWindow('bottom-right-window', bottomRightEl);

  console.log('[AppRouter] Windows registered');

  // Detect and load scene
  const scene = detectScene();
  console.log('[AppRouter] Detected scene: ' + scene);
  loadScene(scene);

  // Listen for URL changes
  window.addEventListener('popstate', () => {
    const newScene = detectScene();
    loadScene(newScene);
  });
});

export { loadScene, detectScene };
