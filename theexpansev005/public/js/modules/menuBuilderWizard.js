// public/js/modules/menuBuilderWizard.js
import { ModuleRegistry } from '../moduleRegistry.js';

ModuleRegistry.register('wizard/menuBuilder', {
  mount(container, context) {
    console.log('[menuBuilderWizard] Mounting for level:', context.targetLevel);
    
    container.innerHTML = `
      <div class="wizard-panel" style="padding: var(--padding-standard);">
        <h3 style="color: var(--accent); margin-bottom: var(--gap-medium); font-size: var(--font-menu);">
          CREATE MENU BUTTON FOR LEVEL ${context.targetLevel}
        </h3>
        
        <div class="wizard-form">
          <div class="form-group" style="margin-bottom: var(--gap-medium);">
            <label style="color: var(--white); display: block; margin-bottom: 5px; font-size: var(--font-normal);">
              Button Label:
            </label>
            <input 
              type="text" 
              id="buttonLabel" 
              placeholder="e.g., CHARACTERS"
              style="width: 100%; padding: 8px; background: rgba(0,0,0,0.5); border: 1px solid var(--accent); color: var(--accent); font-family: 'Courier New', monospace; font-size: var(--font-normal);"
            />
          </div>
          
          <div class="form-group" style="margin-bottom: var(--gap-medium);">
            <label style="color: var(--white); display: block; margin-bottom: 5px; font-size: var(--font-normal);">
              Button Order:
            </label>
            <input 
              type="number" 
              id="buttonOrder" 
              placeholder="1"
              min="1"
              value="1"
              style="width: 100%; padding: 8px; background: rgba(0,0,0,0.5); border: 1px solid var(--accent); color: var(--accent); font-family: 'Courier New', monospace; font-size: var(--font-normal);"
            />
          </div>
          
          <div class="form-actions" style="display: flex; gap: var(--gap-small);">
            <button 
              id="saveButton" 
              style="flex: 1; padding: var(--padding-button); background: rgba(0,255,117,0.2); border: 1px solid var(--accent); color: var(--accent); cursor: pointer; font-family: 'Courier New', monospace; font-weight: bold; font-size: var(--font-button);"
            >
              SAVE BUTTON
            </button>
            <button 
              id="cancelButton"
              style="flex: 1; padding: var(--padding-button); background: rgba(255,0,0,0.2); border: 1px solid var(--red); color: var(--red); cursor: pointer; font-family: 'Courier New', monospace; font-weight: bold; font-size: var(--font-button);"
            >
              CANCEL
            </button>
          </div>
          
          <div id="wizardStatus" style="margin-top: var(--gap-medium); color: #888; font-size: 11px;"></div>
        </div>
      </div>
    `;
    
    setupEventHandlers(context);
  }
});

function setupEventHandlers(context) {
  const saveBtn = document.getElementById('saveButton');
  const cancelBtn = document.getElementById('cancelButton');
  const labelInput = document.getElementById('buttonLabel');
  const orderInput = document.getElementById('buttonOrder');
  const status = document.getElementById('wizardStatus');
  
  saveBtn.addEventListener('click', async () => {
    const label = labelInput.value.trim();
    const order = parseInt(orderInput.value);
    
    if (!label) {
      status.style.color = 'var(--error)';
      status.textContent = 'ERROR: Button label is required';
      return;
    }
    
    if (!order || order < 1) {
      status.style.color = 'var(--error)';
      status.textContent = 'ERROR: Button order must be at least 1';
      return;
    }
    
    status.style.color = 'var(--accent)';
    status.textContent = 'Saving...';
    
    const terminalSocket = window.SocketManager.getTerminalSocket();
    
    terminalSocket.emit('menu-wizard:create-button', {
      access_level: context.targetLevel,
      button_label: label,
      button_order: order
    }, (response) => {
      if (response.success) {
        status.style.color = 'var(--accent)';
        status.textContent = `✓ Button created: ${response.menu_id}`;
        labelInput.value = '';
        orderInput.value = parseInt(orderInput.value) + 1;
      } else {
        status.style.color = 'var(--error)';
        status.textContent = `ERROR: ${response.error}`;
      }
    });
  });
  
  cancelBtn.addEventListener('click', () => {
    labelInput.value = '';
    orderInput.value = '1';
    status.textContent = '';
  });
}
