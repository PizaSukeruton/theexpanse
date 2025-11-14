// First Login Onboarding System
let onboardingState = 'initial';
let isTyping = false;

function typewriterEffect(text, callback) {
  const chatLog = document.getElementById('chat-log');
  const line = document.createElement('div');
  line.className = 'line';
  line.style.fontSize = '14px';
  line.style.fontWeight = 'bold';
  chatLog.appendChild(line);
  
  let index = 0;
  isTyping = true;
  
  function addChar() {
    if (index < text.length) {
      line.textContent += text[index++];
      chatLog.scrollTop = chatLog.scrollHeight;
      setTimeout(addChar, 30);
    } else {
      isTyping = false;
      if (callback) callback();
    }
  }
  addChar();
}

function updateHUD(text) {
  const hud = document.querySelector('.hud');
  if (hud) {
    hud.innerHTML = 'COTW User: ' + window.currentUser.username + ' :: ' + text;
  }
}

function addLine(text, cls = '', isSignup = false) {
  const chatLog = document.getElementById('chat-log');
  const line = document.createElement('div');
  line.className = 'line ' + cls;
  line.textContent = text;
  chatLog.appendChild(line);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function showFirstLoginOnboarding() {
  updateHUD('Preliminary Onboarding Process Underway');
  const chatLog = document.getElementById('chat-log');
  chatLog.innerHTML = '';
  
  typewriterEffect('First Log In Detected...', () => {
    addLine('', '', false);
    typewriterEffect('Please Select Your Preferred Experience....', () => {
      addLine('', '', false);
      addLine('', '', false);
      
      const btnContainer = document.createElement('div');
      btnContainer.style.cssText = 'display: flex; flex-direction: column; gap: 12px; margin: 15px 0;';
      
      const emailOnlyBtn = document.createElement('button');
      emailOnlyBtn.textContent = 'Confirm Email for Council Of The Wise Updates on all Piza Sukeruton Multiverse Initiatives';
      emailOnlyBtn.style.cssText = 'width: 100%; padding: 16px; background: rgba(0,255,117,0.1); border: 2px solid #00ff75; color: #00ff75; cursor: pointer; font-family: inherit; font-size: 13px; font-weight: bold; text-align: center; border-radius: 8px; white-space: normal; word-wrap: break-word; line-height: 1.4;';
      emailOnlyBtn.onmouseover = function() { this.style.background = 'rgba(0,255,117,0.2)'; };
      emailOnlyBtn.onmouseout = function() { this.style.background = 'rgba(0,255,117,0.1)'; };
      emailOnlyBtn.onclick = () => showEmailConfirmation();
      
      const orText = document.createElement('div');
      orText.textContent = 'or';
      orText.style.cssText = 'text-align: center; color: #00ff75; font-size: 14px; font-weight: bold; margin: 5px 0;';
      
      const continueBtn = document.createElement('button');
      continueBtn.textContent = 'Confirm Email And Continue With COTW Onboarding for Investigative Mode';
      continueBtn.style.cssText = 'width: 100%; padding: 16px; background: rgba(0,255,117,0.1); border: 2px solid #00ff75; color: #00ff75; cursor: pointer; font-family: inherit; font-size: 13px; font-weight: bold; text-align: center; border-radius: 8px; white-space: normal; word-wrap: break-word; line-height: 1.4;';
      continueBtn.onmouseover = function() { this.style.background = 'rgba(0,255,117,0.2)'; };
      continueBtn.onmouseout = function() { this.style.background = 'rgba(0,255,117,0.1)'; };
      continueBtn.onclick = () => showFullOnboarding();
      
      btnContainer.appendChild(emailOnlyBtn);
      btnContainer.appendChild(orText);
      btnContainer.appendChild(continueBtn);
      chatLog.appendChild(btnContainer);
    });
  });
}

function showEmailConfirmation() {
  updateHUD('Email Confirmation');
  const chatLog = document.getElementById('chat-log');
  chatLog.innerHTML = '';
  
  typewriterEffect('Selection Detected', () => {
    addLine('', '', false);
    typewriterEffect('Please Confirm That You Wish To Receive COTW Dossier Information Via Your Electronic Mail', () => {
      addLine('', '', false);
      addLine('', '', false);
      
      const btnContainer = document.createElement('div');
      btnContainer.style.cssText = 'display: flex; gap: 10px; margin: 10px 0;';
      
      const yesBtn = document.createElement('button');
      yesBtn.textContent = 'Yes';
      yesBtn.style.cssText = 'flex: 1; padding: 14px; background: rgba(0,255,117,0.1); border: 2px solid #00ff75; color: #00ff75; cursor: pointer; font-family: inherit; font-size: 14px; font-weight: bold; border-radius: 8px;';
      yesBtn.onmouseover = function() { this.style.background = 'rgba(0,255,117,0.2)'; };
      yesBtn.onmouseout = function() { this.style.background = 'rgba(0,255,117,0.1)'; };
      yesBtn.onclick = () => showEmailSubscribed();
      
      const noBtn = document.createElement('button');
      noBtn.textContent = 'No';
      noBtn.style.cssText = 'flex: 1; padding: 14px; background: rgba(0,255,117,0.1); border: 2px solid #00ff75; color: #00ff75; cursor: pointer; font-family: inherit; font-size: 14px; font-weight: bold; border-radius: 8px;';
      noBtn.onmouseover = function() { this.style.background = 'rgba(0,255,117,0.2)'; };
      noBtn.onmouseout = function() { this.style.background = 'rgba(0,255,117,0.1)'; };
      noBtn.onclick = () => showFirstLoginOnboarding();
      
      btnContainer.appendChild(yesBtn);
      btnContainer.appendChild(noBtn);
      chatLog.appendChild(btnContainer);
    });
  });
}

function showEmailSubscribed() {
  updateHUD('Subscription Confirmed');
  const chatLog = document.getElementById('chat-log');
  chatLog.innerHTML = '';
  
  typewriterEffect('You Have Been Subscribed And Will Receive Electronic Mails', () => {
    addLine('', '', false);
    typewriterEffect('You May Login In At Anytime To Update Your Profile To Allow Complete Onboarding Or Delete Profile', () => {
      addLine('', '', false);
      typewriterEffect('Confirm To Logout', () => {
        addLine('', '', false);
        addLine('', '', false);
        
        const btnContainer = document.createElement('div');
        btnContainer.style.cssText = 'display: flex; gap: 10px; margin: 10px 0;';
        
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = 'Confirm';
        confirmBtn.style.cssText = 'flex: 1; padding: 14px; background: rgba(0,255,117,0.1); border: 2px solid #00ff75; color: #00ff75; cursor: pointer; font-family: inherit; font-size: 14px; font-weight: bold; border-radius: 8px;';
        confirmBtn.onmouseover = function() { this.style.background = 'rgba(0,255,117,0.2)'; };
        confirmBtn.onmouseout = function() { this.style.background = 'rgba(0,255,117,0.1)'; };
        confirmBtn.onclick = () => location.reload();
        
        const returnBtn = document.createElement('button');
        returnBtn.textContent = 'Return To First Menu';
        returnBtn.style.cssText = 'flex: 1; padding: 14px; background: rgba(0,255,117,0.1); border: 2px solid #00ff75; color: #00ff75; cursor: pointer; font-family: inherit; font-size: 14px; font-weight: bold; border-radius: 8px;';
        returnBtn.onmouseover = function() { this.style.background = 'rgba(0,255,117,0.2)'; };
        returnBtn.onmouseout = function() { this.style.background = 'rgba(0,255,117,0.1)'; };
        returnBtn.onclick = () => showFirstLoginOnboarding();
        
        btnContainer.appendChild(confirmBtn);
        btnContainer.appendChild(returnBtn);
        chatLog.appendChild(btnContainer);
      });
    });
  });
}

function showFullOnboarding() {
  updateHUD('Full Onboarding Process');
  const chatLog = document.getElementById('chat-log');
  chatLog.innerHTML = '';
  typewriterEffect('Full Onboarding - Coming Soon...', () => {});
}

console.log('First Login Onboarding script loaded');
