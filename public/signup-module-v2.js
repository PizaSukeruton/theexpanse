window.SignupModule = (function() {

  function init(options = {}) {
    renderButtons();
  }

  function renderButtons() {
    const container = document.querySelector('#loginContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="signup-tabs-simple">
        <button class="tab-btn login-btn" data-action="login">LOGIN</button>
        <button class="tab-btn signup-btn" data-action="signup">SIGN UP</button>
      </div>
    `;

    document.querySelector('.login-btn').addEventListener('click', () => {
      if (window.onLoginClick) window.onLoginClick();
    });

    document.querySelector('.signup-btn').addEventListener('click', () => {
      if (window.onSignupClick) window.onSignupClick();
    });
  }

  return {
    init
  };
})();
