;(function initGiftWizard() {
  const GW = (window.GiftWizard = window.GiftWizard || {
    state: {},
    listeners: [],
    inited: false,
    started: false
  });

  if (GW.inited) return;
  GW.inited = true;
  console.log('🎁 Gift Wizard namespace initialized');

  // Initialize state object
  Object.assign(GW.state, {
    loadingLineElement: null,
    loadingInterval: null,
    currentStep: 1,
    realm: null,
    location: null,
    giftObject: { pleasure: 0, arousal: 0, dominance: 0 },
    giver: null,
    giverInventory: [],
    selectedGift: null,
    receiver: null,
    config: {},
    results: null,
    realms: []
  });

  // Helper functions
  GW.addLoadingLine = function addLoadingLine(message = 'Searching Council Of The Wise Database') {
    GW.stopLoadingAnimation();
    const chatLog = document.querySelector('.chat-log');
    if (!chatLog) return;
    
    GW.state.loadingLineElement = document.createElement('div');
    GW.state.loadingLineElement.className = 'line';
    GW.state.loadingLineElement.style.color = '#00ff75';
    GW.state.loadingLineElement.dataset.loading = 'true';
    GW.state.loadingLineElement.textContent = message + '...';
    
    chatLog.appendChild(GW.state.loadingLineElement);
    chatLog.scrollTop = chatLog.scrollHeight;
    
    let dotCount = 0;
    GW.state.loadingInterval = setInterval(() => {
      if (!GW.state.loadingLineElement) return;
      dotCount = (dotCount + 1) % 4;
      const dots = '.'.repeat(dotCount);
      const spaces = ' '.repeat(3 - dotCount);
      GW.state.loadingLineElement.textContent = message + dots + spaces;
    }, 300);
  };

  GW.stopLoadingAnimation = function stopLoadingAnimation() {
    if (GW.state.loadingInterval) {
      clearInterval(GW.state.loadingInterval);
      GW.state.loadingInterval = null;
    }
    if (GW.state.loadingLineElement) {
      GW.state.loadingLineElement.remove();
      GW.state.loadingLineElement = null;
    }
  };

  GW.showStep1 = function showStep1() {
    const leftPanel = document.getElementById('dossier-panel');
    leftPanel.innerHTML = '<div style="padding: 15px; height: 100%; overflow-y: auto;"><h2 style="color: #00ff75; text-shadow: 0 0 10px #00ff75; margin-bottom: 20px; font-size: 14px;">🎁 GIFT EXPERIMENT WIZARD</h2><div style="color: #00ff75; font-size: 12px; margin-bottom: 15px;">STEP 1 of 8: SELECT OPERATING REALM</div><div style="color: #00ff75; margin-bottom: 15px;">Choose which realm to conduct this experiment in:</div><div id="realmButtons" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px;"><div style="color: #888; font-size: 11px; padding: 10px;">Loading realms...</div></div><button onclick="window.GiftWizard.returnToGodMode()" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.1); border: 2px solid #ffffff; color: #ffffff; font-family: Courier New, monospace; font-size: 11px; cursor: pointer; border-radius: 4px; font-weight: bold;">RETURN TO GOD MODE</button></div>';
    GW.state.currentStep = 1;
    GW.buildRealmButtons(GW.state.realms || []);
  };

  GW.buildRealmButtons = function buildRealmButtons(realms) {
    const container = document.getElementById('realmButtons');
    if (!container) return;
    container.innerHTML = '';
    if (!realms || realms.length === 0) {
      container.innerHTML = '<div style="color: #888; font-size: 11px;">No realms available</div>';
      return;
    }
    realms.forEach(realm => {
      const btn = document.createElement('button');
      btn.style.cssText = 'padding: 10px; background: rgba(0,255,117,0.1); border: 1px solid #00ff75; color: #00ff75; cursor: pointer; text-align: left; font-family: Courier New, monospace; font-size: 11px; border-radius: 4px;';
      btn.textContent = realm;
      btn.onclick = () => GW.selectRealm(realm);
      container.appendChild(btn);
    });
  };

  GW.selectRealm = function selectRealm(realm) {
    GW.state.realm = realm;
    GW.addLoadingLine('Fetching locations for ' + realm);
    window.socket?.emit('gift-wizard:get-locations', { realm });
    GW.showStep2();
  };

  GW.showStep2 = function showStep2() {
    const leftPanel = document.getElementById('dossier-panel');
    leftPanel.innerHTML = '<div style="padding: 15px; height: 100%; overflow-y: auto;"><h2 style="color: #00ff75; text-shadow: 0 0 10px #00ff75; margin-bottom: 20px; font-size: 14px;">🎁 GIFT EXPERIMENT WIZARD</h2><div style="color: #00ff75; font-size: 12px; margin-bottom: 15px;">STEP 2 of 8: SELECT LOCATION</div><div id="locationButtons" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px;"><div style="color: #888; font-size: 11px; padding: 10px;">Loading locations...</div></div><button onclick="window.GiftWizard.showStep1()" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.1); border: 2px solid #ffffff; color: #ffffff; font-family: Courier New, monospace; font-size: 11px; cursor: pointer; border-radius: 4px; font-weight: bold;">BACK</button></div>';
    GW.state.currentStep = 2;
  };

  GW.buildLocationButtons = function buildLocationButtons(locations) {
    const container = document.getElementById('locationButtons');
    if (!container) return;
    container.innerHTML = '';
    locations.forEach(loc => {
      const btn = document.createElement('button');
      btn.style.cssText = 'padding: 10px; background: rgba(0,255,117,0.1); border: 1px solid #00ff75; color: #00ff75; cursor: pointer; font-family: Courier New, monospace; font-size: 11px; border-radius: 4px; text-align: left;';
      btn.textContent = loc.name;
      btn.onclick = () => {
        GW.state.location = { id: loc.location_id, name: loc.name };
        GW.showStep3();
      };
      container.appendChild(btn);
    });
  };

  GW.showStep3 = function showStep3() {
    const leftPanel = document.getElementById('dossier-panel');
    leftPanel.innerHTML = '<div style="padding: 15px; height: 100%; overflow-y: auto;"><h2 style="color: #00ff75; text-shadow: 0 0 10px #00ff75; margin-bottom: 20px; font-size: 14px;">🎁 GIFT EXPERIMENT WIZARD</h2><div style="color: #00ff75; font-size: 12px; margin-bottom: 15px;">STEP 3 of 8: ADJUST EMOTIONAL VALENCE (PAD MODEL)</div><div style="margin-bottom: 20px;"><label style="color: #00ff75; font-size: 11px;">PLEASURE (-1 to 1)</label><input id="pleasure" type="range" min="-100" max="100" value="0" style="width: 100%; margin: 8px 0;"><div style="color: #888; font-size: 10px;" id="pleasureValue">0.00</div></div><div style="margin-bottom: 20px;"><label style="color: #00ff75; font-size: 11px;">AROUSAL (0 to 1)</label><input id="arousal" type="range" min="0" max="100" value="50" style="width: 100%; margin: 8px 0;"><div style="color: #888; font-size: 10px;" id="arousalValue">0.50</div></div><div style="margin-bottom: 20px;"><label style="color: #00ff75; font-size: 11px;">DOMINANCE (0 to 1)</label><input id="dominance" type="range" min="0" max="100" value="50" style="width: 100%; margin: 8px 0;"><div style="color: #888; font-size: 10px;" id="dominanceValue">0.50</div></div><button onclick="window.GiftWizard.savePADAndContinue()" style="width: 100%; padding: 10px; background: rgba(0,255,117,0.2); border: 2px solid #00ff75; color: #00ff75; font-family: Courier New, monospace; font-size: 12px; cursor: pointer; border-radius: 4px; font-weight: bold; margin-bottom: 8px;">NEXT: SELECT GIVER</button><button onclick="window.GiftWizard.showStep2()" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.1); border: 2px solid #ffffff; color: #ffffff; font-family: Courier New, monospace; font-size: 11px; cursor: pointer; border-radius: 4px;">BACK</button></div>';
    document.getElementById('pleasure').oninput = () => {
      document.getElementById('pleasureValue').textContent = (document.getElementById('pleasure').value / 100).toFixed(2);
    };
    document.getElementById('arousal').oninput = () => {
      document.getElementById('arousalValue').textContent = (document.getElementById('arousal').value / 100).toFixed(2);
    };
    document.getElementById('dominance').oninput = () => {
      document.getElementById('dominanceValue').textContent = (document.getElementById('dominance').value / 100).toFixed(2);
    };
  };

  GW.savePADAndContinue = function savePADAndContinue() {
    GW.state.giftObject = {
      pleasure: parseFloat((document.getElementById('pleasure').value / 100).toFixed(2)),
      arousal: parseFloat((document.getElementById('arousal').value / 100).toFixed(2)),
      dominance: parseFloat((document.getElementById('dominance').value / 100).toFixed(2))
    };
    GW.showStep4();
    GW.addLoadingLine('Fetching characters with inventory');
    window.socket?.emit('gift-wizard:get-givers-only', { realm: GW.state.realm });
  };

  GW.showStep4 = function showStep4() {
    const leftPanel = document.getElementById('dossier-panel');
    leftPanel.innerHTML = '<div style="padding: 15px; height: 100%; overflow-y: auto;"><h2 style="color: #00ff75; text-shadow: 0 0 10px #00ff75; margin-bottom: 20px; font-size: 14px;">🎁 GIFT EXPERIMENT WIZARD</h2><div style="color: #00ff75; font-size: 12px; margin-bottom: 15px;">STEP 4 of 8: SELECT GIVER CHARACTER (must have items)</div><div style="color: #888; font-size: 10px; margin-bottom: 10px;">Only characters with items in inventory are shown</div><div id="giverButtons" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px;"><div style="color: #888; font-size: 11px; padding: 10px;">Loading characters...</div></div><button onclick="window.GiftWizard.showStep3()" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.1); border: 2px solid #ffffff; color: #ffffff; font-family: Courier New, monospace; font-size: 11px; cursor: pointer; border-radius: 4px;">BACK</button></div>';
    GW.state.currentStep = 4;
  };

  GW.buildCharacterButtons = function buildCharacterButtons(characters, role) {
    const containerId = role === 'giver' ? 'giverButtons' : 'receiverButtons';
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    if (!characters || characters.length === 0) {
      container.innerHTML = '<div style="color: #888; font-size: 11px;">No characters available</div>';
      return;
    }
    characters.forEach(char => {
      const btn = document.createElement('button');
      btn.style.cssText = 'padding: 10px; background: rgba(0,255,117,0.1); border: 1px solid #00ff75; color: #00ff75; cursor: pointer; font-family: Courier New, monospace; font-size: 11px; border-radius: 4px; text-align: left; width: 100%;';
      btn.textContent = char.character_name + ' [' + char.category + ']';
      btn.onclick = () => {
        if (role === 'giver') {
          GW.state.giver = { id: char.character_id, name: char.character_name };
          GW.addLoadingLine('Fetching inventory for ' + char.character_name);
          window.socket?.emit('gift-wizard:get-giver-inventory', { giver_id: char.character_id });
        } else {
          GW.state.receiver = { id: char.character_id, name: char.character_name };
          GW.showStep6();
        }
      };
      container.appendChild(btn);
    });
  };

  GW.showStep4b = function showStep4b() {
    const leftPanel = document.getElementById('dossier-panel');
    const items = GW.state.giverInventory || [];
    leftPanel.innerHTML = '<div style="padding: 15px; height: 100%; overflow-y: auto;"><h2 style="color: #00ff75; text-shadow: 0 0 10px #00ff75; margin-bottom: 20px; font-size: 14px;">🎁 GIFT EXPERIMENT WIZARD</h2><div style="color: #00ff75; font-size: 12px; margin-bottom: 15px;">STEP 4b of 8: SELECT GIFT TO GIVE</div><div style="color: #888; font-size: 10px; margin-bottom: 10px;">' + (GW.state.giver?.name || 'Giver') + ' has ' + items.length + ' item' + (items.length !== 1 ? 's' : '') + '</div><div id="giftButtons" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px;"></div><button onclick="window.GiftWizard.showStep4()" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.1); border: 2px solid #ffffff; color: #ffffff; font-family: Courier New, monospace; font-size: 11px; cursor: pointer; border-radius: 4px;">BACK</button></div>';
    GW.state.currentStep = 4.5;
    GW.buildGiftButtons(items);
  };

  GW.buildGiftButtons = function buildGiftButtons(items) {
    const container = document.getElementById('giftButtons');
    if (!container) return;
    items.forEach(item => {
      const btn = document.createElement('button');
      btn.style.cssText = 'padding: 10px; background: rgba(0,255,117,0.1); border: 1px solid #00ff75; color: #00ff75; cursor: pointer; font-family: Courier New, monospace; font-size: 11px; border-radius: 4px; text-align: left; width: 100%;';
      btn.textContent = item.object_name + ' [' + item.object_type + ']';
      btn.onclick = () => {
        GW.state.selectedGift = { id: item.object_id, name: item.object_name, type: item.object_type };
        GW.showStep5();
        GW.addLoadingLine('Fetching potential receivers');
        window.socket?.emit('gift-wizard:get-characters', { realm: GW.state.realm });
      };
      container.appendChild(btn);
    });
  };

  GW.showStep5 = function showStep5() {
    const leftPanel = document.getElementById('dossier-panel');
    leftPanel.innerHTML = '<div style="padding: 15px; height: 100%; overflow-y: auto;"><h2 style="color: #00ff75; text-shadow: 0 0 10px #00ff75; margin-bottom: 20px; font-size: 14px;">🎁 GIFT EXPERIMENT WIZARD</h2><div style="color: #00ff75; font-size: 12px; margin-bottom: 15px;">STEP 5 of 8: SELECT RECEIVER CHARACTER</div><div id="receiverButtons" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px;"><div style="color: #888; font-size: 11px; padding: 10px;">Loading characters...</div></div><button onclick="window.GiftWizard.showStep4b()" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.1); border: 2px solid #ffffff; color: #ffffff; font-family: Courier New, monospace; font-size: 11px; cursor: pointer; border-radius: 4px;">BACK</button></div>';
    GW.state.currentStep = 5;
  };

  GW.showStep6 = function showStep6() {
    const leftPanel = document.getElementById('dossier-panel');
    const evt = GW.state;
    leftPanel.innerHTML = '<div style="padding: 15px; height: 100%; overflow-y: auto;"><h2 style="color: #00ff75; text-shadow: 0 0 10px #00ff75; margin-bottom: 20px; font-size: 14px;">🎁 GIFT EXPERIMENT WIZARD</h2><div style="color: #00ff75; font-size: 12px; margin-bottom: 15px;">STEP 6 of 8: REVIEW & EXECUTE</div><div style="background: rgba(0,255,117,0.05); padding: 12px; border-radius: 4px; margin-bottom: 15px; border: 1px solid rgba(0,255,117,0.2);"><div style="color: #00ff75; font-size: 11px; margin-bottom: 10px; font-weight: bold;">EXPERIMENT CONFIGURATION:</div><div style="color: #888; font-size: 10px; line-height: 1.8;"><div>🎁 Gift PAD: P=' + evt.giftObject.pleasure + ', A=' + evt.giftObject.arousal + ', D=' + evt.giftObject.dominance + '</div><div>👤 Giver: ' + (evt.giver?.name || 'N/A') + '</div><div>📦 Gift: ' + (evt.selectedGift?.name || 'N/A') + '</div><div>👤 Receiver: ' + (evt.receiver?.name || 'N/A') + '</div><div>📍 Location: ' + (evt.location?.name || 'N/A') + '</div><div>🌍 Realm: ' + (evt.realm || 'N/A') + '</div></div></div><button onclick="window.GiftWizard.executeGiftExchange()" style="width: 100%; padding: 12px; margin-bottom: 8px; background: rgba(0,255,117,0.3); border: 2px solid #00ff75; color: #00ff75; font-family: Courier New, monospace; font-size: 12px; cursor: pointer; border-radius: 4px; font-weight: bold;">⚡ EXECUTE GIFT EXCHANGE</button><button onclick="window.GiftWizard.showStep5()" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.1); border: 2px solid #ffffff; color: #ffffff; font-family: Courier New, monospace; font-size: 11px; cursor: pointer; border-radius: 4px;">BACK</button></div>';
    GW.state.currentStep = 6;
  };

  GW.executeGiftExchange = function executeGiftExchange() {
    const evt = GW.state;
    if (!evt.realm || !evt.location?.id || !evt.giver?.id || !evt.receiver?.id || !evt.selectedGift?.id) {
      console.warn('[GIFT] Missing required fields', evt);
      alert('Please complete all steps before executing.');
      return;
    }
    GW.addLoadingLine('Executing gift exchange');
    window.socket?.emit('gift-wizard:create-event', {
      realm: evt.realm,
      location: evt.location.name || 'Unknown',
      giver_id: evt.giver.id,
      receiver_id: evt.receiver.id,
      gift_id: evt.selectedGift.id,
      outcome: 'success',
      notes: 'Gift exchange of ' + evt.selectedGift.name + ' from ' + evt.giver.name + ' to ' + evt.receiver.name
    });
  };

  GW.showStep7 = function showStep7() {
    const leftPanel = document.getElementById('dossier-panel');
    const event = GW.state.results?.event;
    leftPanel.innerHTML = '<div style="padding: 15px; height: 100%; overflow-y: auto;"><h2 style="color: #00ff75; text-shadow: 0 0 10px #00ff75; margin-bottom: 20px; font-size: 14px;">🎁 GIFT EXPERIMENT WIZARD</h2><div style="color: #00ff75; font-size: 12px; margin-bottom: 15px;">STEP 7 of 8: RESULTS & IMPACT</div><div style="background: rgba(0,255,117,0.05); padding: 12px; border-radius: 4px; margin-bottom: 15px; border: 1px solid rgba(0,255,117,0.2);"><div style="color: #00ff75; font-size: 11px; margin-bottom: 10px; font-weight: bold;">✅ GIFT EXCHANGE EXECUTED</div><div style="color: #888; font-size: 10px; line-height: 1.8;"><div>Event ID: ' + (event?.event_id || 'N/A') + '</div><div>Status: ' + (event?.outcome || 'success') + '</div><div>Timestamp: ' + (event?.timestamp || 'N/A') + '</div></div></div><button onclick="window.GiftWizard.returnToGodMode()" style="width: 100%; padding: 10px; background: rgba(0,255,117,0.2); border: 2px solid #00ff75; color: #00ff75; font-family: Courier New, monospace; font-size: 11px; cursor: pointer; border-radius: 4px; font-weight: bold;">✅ COMPLETE & RETURN TO GOD MODE</button></div>';
    GW.state.currentStep = 7;
  };

  GW.returnToGodMode = function returnToGodMode() {
    if (typeof initAdminPanel === 'function') {
      initAdminPanel();
    }
  };

  const registerListeners = () => {
    if (!window.socket) return;
    const onRealms = ({ success, realms }) => {
      if (!success) return;
      GW.stopLoadingAnimation();
      console.log('[GIFT] realms received:', realms);
      GW.state.realms = realms;
      GW.showStep1();
    };
    const onLocations = ({ success, locations }) => {
      if (!success) return;
      GW.stopLoadingAnimation();
      console.log('[GIFT] locations received:', locations.length);
      GW.buildLocationButtons(locations);
    };
    const onGivers = ({ success, characters }) => {
      if (!success) return;
      GW.stopLoadingAnimation();
      console.log('[GIFT] givers received:', characters.length);
      GW.buildCharacterButtons(characters, 'giver');
    };
    const onGiverInventory = ({ success, items }) => {
      if (!success) return;
      GW.stopLoadingAnimation();
      console.log('[GIFT] giver inventory received:', items.length);
      GW.state.giverInventory = items;
      GW.showStep4b();
    };
    const onReceivers = ({ success, characters }) => {
      if (!success) return;
      GW.stopLoadingAnimation();
      console.log('[GIFT] characters received:', characters.length);
      GW.buildCharacterButtons(characters, 'receiver');
    };
    const onEventCreated = ({ success, event }) => {
      if (!success) return;
      GW.stopLoadingAnimation();
      console.log('[GIFT] event created:', event.event_id);
      GW.state.results = { event };
      GW.showStep7();
    };
    const onError = ({ error }) => {
      GW.stopLoadingAnimation();
      console.error('[GIFT] error:', error);
      alert('Wizard Error: ' + error);
    };
    window.socket.on('gift-wizard:realms', onRealms);
    window.socket.on('gift-wizard:locations', onLocations);
    window.socket.on('gift-wizard:givers-only', onGivers);
    window.socket.on('gift-wizard:giver-inventory', onGiverInventory);
    window.socket.on('gift-wizard:characters', onReceivers);
    window.socket.on('gift-wizard:event-created', onEventCreated);
    window.socket.on('gift-wizard:error', onError);
    GW.listeners = [
      ['gift-wizard:realms', onRealms],
      ['gift-wizard:locations', onLocations],
      ['gift-wizard:givers-only', onGivers],
      ['gift-wizard:giver-inventory', onGiverInventory],
      ['gift-wizard:characters', onReceivers],
      ['gift-wizard:event-created', onEventCreated],
      ['gift-wizard:error', onError]
    ];
  };

  GW.init = function init() {
    if (GW.started) return;
    GW.started = true;
    console.log('🎁 Gift Wizard initialized and started');
    registerListeners();
    const requestRealms = () => {
      GW.addLoadingLine('Fetching available realms');
      window.socket.emit('gift-wizard:get-realms', (res) => {
        GW.stopLoadingAnimation();
        console.log('[GIFT] ACK realms:', res);
        if (res?.success && res.realms) {
          GW.state.realms = res.realms;
          GW.showStep1();
        }
      });
    };
    if (window.socket?.connected) {
      requestRealms();
    } else {
      window.socket?.once('connect', requestRealms);
    }
  };

  GW.destroy = function destroy() {
    if (GW.listeners.length > 0) {
      GW.listeners.forEach(([event, handler]) => {
        window.socket?.off(event, handler);
      });
      GW.listeners = [];
    }
    GW.stopLoadingAnimation();
    GW.started = false;
    console.log('🎁 Gift Wizard destroyed');
  };

  GW.init();
})();
