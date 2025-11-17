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
      // Get public socket
      const publicSocket = window.SocketManager.getPublicSocket();

      // Check token over Socket.io using Promise with timeout
      let checkData;
      try {
        checkData = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Token check timeout'));
          }, 5000);

          publicSocket.emit(
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
    const statusMessage = container.querySelector('#status-message');

    if (!name || !password || !confirmPassword) {
      if (statusMessage) statusMessage.textContent = 'Error: form fields missing';
      return;
    }

    const nameValue = name.value.trim();
    const passwordValue = password.value.trim();
    const confirmValue = confirmPassword.value.trim();

    if (!nameValue) {
      if (statusMessage) {
        statusMessage.style.color = '#ff4444';
        statusMessage.textContent = 'Please enter your name';
      }
      return;
    }

    if (!passwordValue) {
      if (statusMessage) {
        statusMessage.style.color = '#ff4444';
        statusMessage.textContent = 'Please enter a password';
      }
      return;
    }

    if (passwordValue.length < 8) {
      if (statusMessage) {
        statusMessage.style.color = '#ff4444';
        statusMessage.textContent = 'Password must be at least 8 characters';
      }
      return;
    }

    if (passwordValue !== confirmValue) {
      if (statusMessage) {
        statusMessage.style.color = '#ff4444';
        statusMessage.textContent = 'Passwords do not match';
      }
      return;
    }

    if (statusMessage) {
      statusMessage.style.color = '#00ff75';
      statusMessage.textContent = 'Submitting...';
    }

    // Get public socket
    const publicSocket = window.SocketManager.getPublicSocket();

    // Emit verification
    publicSocket.emit('registration-verify', {
      verificationToken: verifyToken,
      password: passwordValue
    });

    // Listen for response
    publicSocket.once('registration-response', (data) => {
      if (data.success) {
        if (statusMessage) {
          statusMessage.style.color = '#00ff75';
          statusMessage.textContent = 'Account created successfully! Redirecting to login...';
        }
        setTimeout(() => {
          window.location.href = '/terminal_new_v003.html';
        }, 2000);
      } else {
        if (statusMessage) {
          statusMessage.style.color = '#ff4444';
          statusMessage.textContent = data.message || 'Verification failed';
        }
      }
    });
  };
}
