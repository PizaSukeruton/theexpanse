import { ModuleRegistry } from '../moduleRegistry.js';

ModuleRegistry.register('dossier/setup', {
  async mount(container, context) {
    console.log('[verificationFlow/setup] Mounting...');
    
    const { verifyToken } = context;

    if (!verifyToken) {
      container.innerHTML = `
        <div style="padding: 16px; color: #ff4444; text-align: center;">
          <p>Invalid verification link - no token found</p>
          <p>Please request a new email from the login screen.</p>
        </div>
      `;
      return;
    }

    // Show loading state
    container.innerHTML = `
      <div style="padding: 16px; color: #00ff75; text-align: center;">
        <p>Verifying token...</p>
      </div>
    `;

    try {
      // Check if token is valid via Socket.io
      if (!window.socket) {
        console.error('[verificationFlow/setup] window.socket is not defined');
        container.innerHTML = `
          <div style="padding: 16px; color: #ff4444; text-align: center;">
            <p>Connection error.</p>
            <p>Please refresh the page and try again.</p>
          </div>
        `;
        return;
      }

      // Check token over Socket.io using Promise with timeout
      let checkData;
      try {
        checkData = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Token check timeout'));
          }, 5000);

          window.socket.emit(
            'check-verification-token',
            { verificationToken: verifyToken },
            (response) => {
              clearTimeout(timeout);
              resolve(response);
            }
          );
        });
      } catch (err) {
        console.error('[verificationFlow/setup] Token check error:', err);
        container.innerHTML = `
          <div style="padding: 16px; color: #ff4444; text-align: center;">
            <p>Error verifying link.</p>
            <p>Please refresh the page and try again.</p>
          </div>
        `;
        return;
      }

      if (!checkData || !checkData.success) {
        container.innerHTML = `
          <div style="padding: 16px; color: #ff4444; text-align: center;">
            <p>Invalid or expired verification link.</p>
            <p>Please request a new email from the login screen.</p>
          </div>
        `;
        return;
      }

      // Load dossier form
      const dossierRes = await fetch('/expanse_user_dossier.html');
      const dossierHtml = await dossierRes.text();
      
      // Parse and inject
      const parser = new DOMParser();
      const dossierDoc = parser.parseFromString(dossierHtml, 'text/html');
      const dossierContainer = dossierDoc.querySelector('.dossier-container');

      if (!dossierContainer) {
        container.innerHTML = `
          <div style="padding: 16px; color: #ff4444; text-align: center;">
            <p>Error loading dossier form</p>
          </div>
        `;
        return;
      }

      // Inject dossier HTML
      container.innerHTML = dossierContainer.innerHTML;

      // Wire up dossier handlers
      setupDossierHandlers(container, verifyToken);

    } catch (err) {
      console.error('[verificationFlow/setup] Error:', err);
      container.innerHTML = `
        <div style="padding: 16px; color: #ff4444; text-align: center;">
          <p>Error loading verification form</p>
          <p>${err.message}</p>
        </div>
      `;
    }
  }
});

function setupDossierHandlers(container, verifyToken) {
  console.log('[verificationFlow] Setting up dossier handlers...');

  // Toggle section expansion
  window.toggleSection = function(sectionId) {
    const content = container.querySelector(`#${sectionId}`);
    if (!content) return;

    const header = content.previousElementSibling;
    const toggle = header ? header.querySelector('.section-toggle') : null;

    container.querySelectorAll('.section-content').forEach(section => {
      if (section.id !== sectionId) {
        section.classList.remove('active');
        const sectionHeader = section.previousElementSibling;
        const sectionToggle = sectionHeader ? sectionHeader.querySelector('.section-toggle') : null;
        if (sectionToggle) sectionToggle.textContent = '▶';
      }
    });

    content.classList.toggle('active');
    if (toggle) toggle.textContent = content.classList.contains('active') ? '▼' : '▶';
  };

  // Newsletter preference
  window.setNewsletter = function(choice) {
    window.newsletterChoice = choice;
    const yesBtn = container.querySelector('#newsletterYes');
    const noBtn = container.querySelector('#newsletterNo');
    if (yesBtn) yesBtn.classList.toggle('active', choice);
    if (noBtn) noBtn.classList.toggle('active', !choice);
  };

  // Complete setup submission
  window.completeSetup = function() {
    const name = container.querySelector('#name');
    const password = container.querySelector('#password');
    const confirmPassword = container.querySelector('#confirmPassword');
    const completeBtn = container.querySelector('#completeBtn');

    if (!name || !password || !confirmPassword || !completeBtn) {
      console.error('[verificationFlow] Form elements not found');
      alert('Form error. Please refresh the page.');
      return;
    }

    const nameVal = name.value.trim();
    const passwordVal = password.value;
    const confirmVal = confirmPassword.value;

    // Validation
    if (!nameVal) {
      alert('Name is required');
      return;
    }

    if (!passwordVal) {
      alert('Password is required');
      return;
    }

    if (passwordVal.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    if (passwordVal !== confirmVal) {
      alert('Passwords do not match');
      return;
    }

    // Guard socket
    if (!window.socket) {
      console.error('[verificationFlow] window.socket is not defined');
      alert('Connection error. Please refresh the page.');
      return;
    }

    completeBtn.classList.add('loading');

    window.socket.emit('registration-verify', {
      verificationToken: verifyToken,
      password: passwordVal,
      newsletter: window.newsletterChoice || false
    });
  };

  // Listen for registration response
  if (window.socket) {
    window.socket.once('registration-response', (data) => {
      const completeBtn = container.querySelector('#completeBtn');
      if (completeBtn) {
        completeBtn.classList.remove('loading');
      }

      if (data.success) {
        container.innerHTML = `
          <div style="padding: 16px; color: #00ff75; text-align: center;">
            <p>✓ Profile setup complete!</p>
            <p>Logging in...</p>
          </div>
        `;
        
        // Store user data
        window.currentUser = data.user;
        localStorage.setItem('terminal_user', data.user.username);
        
        setTimeout(() => {
          // Load user menu based on access level
          if (data.user.access_level >= 11) {
            loadScript('admin-menu.js');
          } else {
            loadScript('user-menu-level' + data.user.access_level + '.js');
          }
          
          // Redirect to terminal with user loaded
          window.location.href = '/terminal_new_v003.html';
        }, 1500);
      } else {
        alert(data.message || data.error || 'Setup failed');
      }
    });
    
    function loadScript(filename) {
      const script = document.createElement('script');
      script.src = filename;
      document.body.appendChild(script);
    }
  }

  // Set initial newsletter choice
  window.newsletterChoice = true;
}
