// Add this to the dossier-login.html after the existing JavaScript

function initImageEditor() {
  const leftPanel = document.getElementById('dossier-panel');
  
  // Create editor toggle button
  const editorButton = document.createElement('button');
  editorButton.textContent = '📷 Edit Image';
  editorButton.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 8px 12px;
    background: rgba(0,255,0,0.1);
    border: 1px solid #00ff00;
    color: #00ff00;
    cursor: pointer;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    z-index: 100;
  `;
  
  // Add button to portrait wrapper
  const portraitWrap = leftPanel.querySelector('.portrait-wrap');
  portraitWrap.appendChild(editorButton);
  
  editorButton.addEventListener('click', () => {
    toggleImageEditor();
  });
}

function toggleImageEditor() {
  const leftPanel = document.getElementById('dossier-panel');
  const existingEditor = document.getElementById('mini-image-editor');
  
  if (existingEditor) {
    existingEditor.remove();
    return;
  }
  
  // Create mini image editor
  const editorDiv = document.createElement('div');
  editorDiv.id = 'mini-image-editor';
  editorDiv.innerHTML = `
    <div style="padding: 15px; background: rgba(0,16,0,0.9); border: 1px solid #00ff00; border-radius: 8px; margin-top: 10px;">
      <h3 style="color: #00ff00; margin: 0 0 10px 0;">Image Editor</h3>
      
      <input type="file" id="miniFileInput" accept="image/*" style="width: 100%; margin-bottom: 10px;">
      
      <canvas id="miniCanvas" width="256" height="256" style="width: 100%; border: 1px solid #00ff00; margin-bottom: 10px;"></canvas>
      
      <div style="display: grid; gap: 5px;">
        <label style="color: #00ff00; font-size: 12px;">Brightness: <span id="brightVal">0</span></label>
        <input type="range" id="miniBrightness" min="-100" max="100" value="0" style="width: 100%;">
        
        <label style="color: #00ff00; font-size: 12px;">CRT Effect: <span id="crtVal">0%</span></label>
        <input type="range" id="miniCRT" min="0" max="100" value="0" style="width: 100%;">
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-top: 10px;">
          <button onclick="applyMiniEffect('grayscale')" style="padding: 5px; background: #111; border: 1px solid #00ff00; color: #00ff00; cursor: pointer;">Gray</button>
          <button onclick="applyMiniEffect('sepia')" style="padding: 5px; background: #111; border: 1px solid #00ff00; color: #00ff00; cursor: pointer;">Sepia</button>
          <button onclick="applyMiniEffect('invert')" style="padding: 5px; background: #111; border: 1px solid #00ff00; color: #00ff00; cursor: pointer;">Invert</button>
          <button onclick="applyMiniEffect('reset')" style="padding: 5px; background: #111; border: 1px solid #00ff00; color: #00ff00; cursor: pointer;">Reset</button>
        </div>
        
        <button onclick="saveMiniImage()" style="padding: 8px; margin-top: 10px; background: #00ff00; color: #000; border: none; cursor: pointer; font-weight: bold;">Apply to Portrait</button>
      </div>
    </div>
  `;
  
  leftPanel.appendChild(editorDiv);
  
  // Initialize mini canvas
  const miniCanvas = document.getElementById('miniCanvas');
  const miniCtx = miniCanvas.getContext('2d');
  let miniImage = null;
  
  document.getElementById('miniFileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        miniImage = img;
        drawMiniImage();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
  
  document.getElementById('miniBrightness').addEventListener('input', (e) => {
    document.getElementById('brightVal').textContent = e.target.value;
    if (miniImage) drawMiniImage();
  });
  
  document.getElementById('miniCRT').addEventListener('input', (e) => {
    document.getElementById('crtVal').textContent = e.target.value + '%';
    if (miniImage) drawMiniImage();
  });
  
  window.drawMiniImage = function() {
    if (!miniImage) return;
    
    miniCtx.clearRect(0, 0, 256, 256);
    
    const brightness = parseInt(document.getElementById('miniBrightness').value);
    miniCtx.filter = `brightness(${100 + brightness}%)`;
    
    // Scale and center image
    const scale = Math.min(256 / miniImage.width, 256 / miniImage.height);
    const w = miniImage.width * scale;
    const h = miniImage.height * scale;
    const x = (256 - w) / 2;
    const y = (256 - h) / 2;
    
    miniCtx.drawImage(miniImage, x, y, w, h);
    
    // Apply CRT effect if needed
    const crtValue = parseInt(document.getElementById('miniCRT').value);
    if (crtValue > 0) {
      const imageData = miniCtx.getImageData(0, 0, 256, 256);
      const data = imageData.data;
      const intensity = crtValue / 100;
      
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i+1] + data[i+2]) / 3;
        data[i] = data[i] * (1 - intensity) + avg * 0.3 * intensity;
        data[i+1] = data[i+1] * (1 - intensity) + avg * 1.2 * intensity;
        data[i+2] = data[i+2] * (1 - intensity) + avg * 0.3 * intensity;
      }
      
      miniCtx.putImageData(imageData, 0, 0);
      
      // Scanlines
      for (let y = 0; y < 256; y += 3) {
        miniCtx.fillStyle = `rgba(0,0,0,${0.2 * intensity})`;
        miniCtx.fillRect(0, y, 256, 1);
      }
    }
  };
  
  window.applyMiniEffect = function(effect) {
    if (!miniImage) return;
    
    const imageData = miniCtx.getImageData(0, 0, 256, 256);
    const data = imageData.data;
    
    switch(effect) {
      case 'grayscale':
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i+1] + data[i+2]) / 3;
          data[i] = data[i+1] = data[i+2] = avg;
        }
        break;
      case 'sepia':
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i+1], b = data[i+2];
          data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
          data[i+1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
          data[i+2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
        }
        break;
      case 'invert':
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 255 - data[i];
          data[i+1] = 255 - data[i+1];
          data[i+2] = 255 - data[i+2];
        }
        break;
      case 'reset':
        document.getElementById('miniBrightness').value = 0;
        document.getElementById('miniCRT').value = 0;
        document.getElementById('brightVal').textContent = '0';
        document.getElementById('crtVal').textContent = '0%';
        miniCtx.filter = 'none';
        drawMiniImage();
        return;
    }
    
    miniCtx.putImageData(imageData, 0, 0);
  };
  
  window.saveMiniImage = function() {
    const portrait = document.getElementById('agent-portrait');
    portrait.src = miniCanvas.toDataURL();
    
    // Save to localStorage for persistence
    localStorage.setItem('custom_portrait', miniCanvas.toDataURL());
    
    // Close editor
    document.getElementById('mini-image-editor').remove();
  };
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initImageEditor);
} else {
  initImageEditor();
}

// Check for saved portrait on load
const savedPortrait = localStorage.getItem('custom_portrait');
if (savedPortrait) {
  const portrait = document.getElementById('agent-portrait');
  if (portrait) {
    portrait.src = savedPortrait;
  }
}
