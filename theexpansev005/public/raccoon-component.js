/**
 * Raccoon Component Factory
 * Reusable raccoon icon with configurable onclick handlers
 * Global functions for browser use
 */

/**
 * Create a clickable raccoon icon as standalone button
 * @param {Object} config - Configuration object
 * @param {string} config.type - Type: 'hex', 'log', 'custom'
 * @param {string} config.hexId - HEX ID (if type is 'hex')
 * @param {string} config.mode - Mode: 'basic' or 'expanded'
 * @param {string} config.logMessage - Message to log
 * @param {Function} config.customHandler - Custom handler function
 * @param {string} config.title - Tooltip title
 * @returns {HTMLSpanElement} Raccoon span element
 */
window.createRaccoon = function(config = {}) {
  const raccoon = document.createElement('span');
  raccoon.textContent = '🦝';
  raccoon.style.cssText = `
    cursor: pointer;
    font-size: 20px;
    padding: 6px 10px;
    background: rgba(0,255,117,0.1);
    border: 1px solid #00ff75;
    border-radius: 4px;
    transition: all 0.3s;
    display: inline-block;
    text-align: center;
    min-width: 30px;
  `;
  raccoon.title = config.title || 'Click to learn more';
  
  raccoon.onmouseover = () => {
    raccoon.style.background = 'rgba(0,255,117,0.2)';
    raccoon.style.textShadow = '0 0 5px #00ff75';
  };
  
  raccoon.onmouseout = () => {
    raccoon.style.background = 'rgba(0,255,117,0.1)';
    raccoon.style.textShadow = 'none';
  };
  
  raccoon.onclick = (e) => {
    e.stopPropagation();
    
    switch (config.type) {
      case 'hex':
        if (typeof window.socket !== 'undefined' && config.hexId) {
          window.socket.emit('explain-hex', { 
            hexId: config.hexId, 
            mode: config.mode || 'basic' 
          });
        }
        break;
        
      case 'log':
        console.log(config.logMessage || 'ℹ️ Info clicked');
        break;
        
      case 'custom':
        if (typeof config.customHandler === 'function') {
          config.customHandler();
        }
        break;
        
      default:
        console.log('🦝 Raccoon clicked');
    }
  };
  
  return raccoon;
};

/**
 * Create a button + raccoon container (raccoon OUTSIDE button)
 * @param {Object} config - Configuration
 * @param {string} config.buttonText - Button text
 * @param {Function} config.buttonClick - Button click handler
 * @param {Object} config.raccoonConfig - Raccoon configuration
 * @returns {HTMLDivElement} Container with button and raccoon
 */
window.createButtonWithRaccoon = function(config = {}) {
  const container = document.createElement('div');
  container.style.cssText = 'display: flex; gap: 8px; align-items: center; width: 100%;';
  
  const btn = document.createElement('button');
  btn.style.cssText = `
    flex: 1;
    padding: 8px;
    background: rgba(0,255,117,0.1);
    border: 1px solid #00ff75;
    color: #00ff75;
    cursor: pointer;
    text-align: left;
    font-family: 'Courier New', monospace;
    font-size: 11px;
    border-radius: 4px;
    transition: all 0.3s;
  `;
  btn.textContent = config.buttonText || 'Item';
  btn.onclick = (e) => {
    e.stopPropagation();
    if (typeof config.buttonClick === 'function') {
      config.buttonClick();
    }
  };
  btn.onmouseover = () => {
    btn.style.background = 'rgba(0,255,117,0.2)';
  };
  btn.onmouseout = () => {
    btn.style.background = 'rgba(0,255,117,0.1)';
  };
  
  const raccoon = window.createRaccoon(config.raccoonConfig || {});
  
  container.appendChild(btn);
  container.appendChild(raccoon);
  
  return container;
};
