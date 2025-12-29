window.SignupModule = (function() {
  const config = {
    containerSelector: '#loginContainer',
    socketEventNamespace: 'registration'
  };

  function init(options = {}) {
    Object.assign(config, options);
    renderSignupUI();
    attachEventListeners();
  }

  function renderSignupUI() {
    const container = document.querySelector(config.containerSelector);
    if (!container) {
      console.error('Signup container not found');
      return;
    }

    container.innerHTML = `
      <div class="signup-tabs">
        <button class="signup-tab-btn active" data-tab="login">LOGIN</button>
        <button class="signup-tab-btn" data-tab="signup">SIGN UP</button>
      </div>

      <div class="signup-tab-content login-tab active">
        <div class="login-form">
          <input type="text" id="login-username" class="login-input" placeholder="Username" autocomplete="username" />
          <input type="password" id="login-password" class="login-input" placeholder="Password" autocomplete="current-password" />
          <button type="button" id="login-submit" class="login-button">LOGIN</button>
          <div id="login-message" class="login-message"></div>
        </div>
      </div>

      <div class="signup-tab-content signup-tab">
        <div class="signup-form">
          <input type="email" id="signup-email" class="login-input" placeholder="Email Address" autocomplete="email" />
          <input type="text" id="signup-username" class="login-input" placeholder="Username" autocomplete="username" />
          <input type="password" id="signup-password" class="login-input" placeholder="Password" autocomplete="new-password" />
          <input type="password" id="signup-confirm-password" class="login-input" placeholder="Confirm Password" autocomplete="new-password" />
          <button type="button" id="signup-submit" class="login-button">CREATE ACCOUNT</button>
          <div id="signup-message" class="login-message"></div>
        </div>
      </div>
    `;
  }

  function attachEventListeners() {
    const tabButtons = document.querySelectorAll('.signup-tab-btn');
    const tabContents = document.querySelectorAll('.signup-tab-content');
    const loginSubmit = document.getElementById('login-submit');
    const signupSubmit = document.getElementById('signup-submit');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        
        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(tc => tc.classList.remove('active'));
        
        e.target.classList.add('active');
        document.querySelector(`.${tabName}-tab`).classList.add('active');
      });
    });

    loginSubmit.addEventListener('click', handleLogin);
    signupSubmit.addEventListener('click', handleSignup);

    document.getElementById('login-username').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('login-password').focus();
    });

    document.getElementById('login-password').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') loginSubmit.click();
    });

    document.getElementById('signup-email').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('signup-username').focus();
    });

    document.getElementById('signup-username').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('signup-password').focus();
    });

    document.getElementById('signup-password').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('signup-confirm-password').focus();
    });

    document.getElementById('signup-confirm-password').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') signupSubmit.click();
    });
  }

  function handleLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const messageDiv = document.getElementById('login-message');

    if (!username || !password) {
      messageDiv.textContent = 'Please enter both username and password';
      messageDiv.className = 'login-message error';
      return;
    }

    messageDiv.textContent = 'Authenticating...';
    messageDiv.className = 'login-message';

    if (window.socket) {
      window.socket.emit('terminal-auth', { username, password });
    }
  }

  function handleSignup() {
    const email = document.getElementById('signup-email').value.trim();
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const messageDiv = document.getElementById('signup-message');

    if (!email || !username || !password || !confirmPassword) {
      messageDiv.textContent = 'Please fill in all fields';
      messageDiv.className = 'login-message error';
      return;
    }

    if (password !== confirmPassword) {
      messageDiv.textContent = 'Passwords do not match';
      messageDiv.className = 'login-message error';
      return;
    }

    if (password.length < 6) {
      messageDiv.textContent = 'Password must be at least 6 characters';
      messageDiv.className = 'login-message error';
      return;
    }

    messageDiv.textContent = 'Creating account...';
    messageDiv.className = 'login-message';

    if (window.socket) {
      window.socket.emit('registration-signup', { email, username, password });
    }
  }

  function onRegistrationResponse(data) {
    const messageDiv = document.getElementById('signup-message');
    
    if (data.success) {
      messageDiv.textContent = data.message || 'Check your email to verify your account';
      messageDiv.className = 'login-message success';
      
      document.getElementById('signup-email').value = '';
      document.getElementById('signup-username').value = '';
      document.getElementById('signup-password').value = '';
      document.getElementById('signup-confirm-password').value = '';
    } else {
      messageDiv.textContent = data.message || 'Signup failed';
      messageDiv.className = 'login-message error';
    }
  }

  return {
    init,
    onRegistrationResponse
  };
})();
