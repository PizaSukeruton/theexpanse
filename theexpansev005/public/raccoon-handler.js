(() => {
  'use strict';

  if (window.__raccoonHandlerInit) return;
  window.__raccoonHandlerInit = true;

  function normalizeHex(hex) {
    if (typeof hex !== 'string') return null;
    const m = hex.trim().match(/^#?([0-9a-fA-F]{6})$/);
    return m ? `#${m[1].toUpperCase()}` : null;
  }

  function canonicalType(t) {
    const s = String(t || '').toLowerCase().trim();
    if (['realm', 'realms', 'world', 'universe'].includes(s)) return 'realm';
    if (['location', 'locations', 'loc', 'place'].includes(s)) return 'location';
    if (['character', 'char', 'npc', 'pc', 'characters'].includes(s)) return 'character';
    if (['event', 'events', 'ev'].includes(s)) return 'event';
    return s || 'unknown';
  }

  const bus = {
    q: [],
    ready: false,
    onReady(fn) {
      if (this.ready) { try { fn(); } catch {} return; }
      this.q.push(fn);
    },
    setReady() {
      this.ready = true;
      const tasks = this.q.splice(0);
      for (const fn of tasks) { try { fn(); } catch {} }
    }
  };

  function awaitCreateRaccoon(maxWaitMs = 3000) {
    if (typeof window.createRaccoon === 'function') {
      bus.setReady();
      return;
    }
    const started = Date.now();
    const timer = setInterval(() => {
      if (typeof window.createRaccoon === 'function') {
        clearInterval(timer);
        bus.setReady();
      } else if (Date.now() - started > maxWaitMs) {
        clearInterval(timer);
        bus.setReady();
      }
    }, 50);
  }

  const RACCOON_HEX_MAPPINGS = {
    realm: {
      'Piza Sukeruton': '#70000A'
    },
    location: {
      '#C30000': '#C30000',
      '#C30005': '#C30005'
    },
    character: {},
    event: {}
  };

  const RESOLVERS = {
    realm: [],
    location: [],
    character: [],
    event: []
  };

  function addMapping(entityType, key, hex) {
    const type = canonicalType(entityType);
    if (!RACCOON_HEX_MAPPINGS[type]) RACCOON_HEX_MAPPINGS[type] = {};
    const nhex = normalizeHex(hex);
    if (!nhex) {
      console.warn('[RACCOON] addMapping invalid hex:', hex);
      return false;
    }
    RACCOON_HEX_MAPPINGS[type][key] = nhex;
    return true;
  }

  function addResolver(entityType, resolverFn) {
    const type = canonicalType(entityType);
    if (!RESOLVERS[type]) RESOLVERS[type] = [];
    if (typeof resolverFn === 'function') {
      RESOLVERS[type].push(resolverFn);
      return true;
    }
    return false;
  }

  async function getRaccoonHexId(entityType, entityValue) {
    const type = canonicalType(entityType);
    const value = (entityValue ?? '').toString().trim();

    const direct = normalizeHex(value);
    if (direct) return direct;

    const map = RACCOON_HEX_MAPPINGS[type] || {};
    if (Object.prototype.hasOwnProperty.call(map, value)) return map[value];

    const k = Object.keys(map).find(k => k.toLowerCase() === value.toLowerCase());
    if (k) return map[k];

    if (type === 'character' || type === 'event') {
      return null;
    }

    const resolvers = RESOLVERS[type] || [];
    for (const fn of resolvers) {
      try {
        const out = await fn(value);
        const nhex = normalizeHex(out);
        if (nhex) return nhex;
      } catch (e) {
        console.warn('[RACCOON] resolver failed:', e?.message || e);
      }
    }

    return null;
  }

  function createRaccoonForEntity(entityType, entityValue, displayName = '') {
    let cancelled = false;

    const el = document.createElement('span');
    el.className = 'raccoon-anchor';
    el.style.display = 'inline-flex';
    el.style.verticalAlign = 'middle';

    (async () => {
      const hexId = await getRaccoonHexId(entityType, entityValue);
      if (cancelled) return;

      if (!hexId) {
        console.warn(`[RACCOON] No hex mapping for ${entityType}: ${entityValue}`);
        el.remove();
        return;
      }

      const title = `Learn more about ${displayName || entityValue}`;
      const payload = { type: 'hex', hexId, mode: 'basic', title };

      const render = () => {
        try {
          const child = window.createRaccoon?.(payload);
          if (child) {
            child.setAttribute('aria-label', title);
            child.setAttribute('role', 'button');
            el.replaceChildren(child);
          } else {
            console.warn('[RACCOON] createRaccoon unavailable yet.');
          }
        } catch (e) {
          console.error('[RACCOON] create failed:', e?.message || e);
        }
      };

      bus.onReady(render);
    })();

    return Object.assign(el, {
      destroy() { cancelled = true; el.remove(); }
    });
  }

  function attachRaccoonToButton(container, btn, entityType, entityValue, displayName = '') {
    const root = container || btn?.parentElement;
    if (!root || !btn) return false;

    const raccoon = createRaccoonForEntity(entityType, entityValue, displayName);
    btn.after(raccoon);
    return true;
  }

  window.RACCOON_HEX_MAPPINGS = RACCOON_HEX_MAPPINGS;
  window.addRaccoonMapping   = addMapping;
  window.addRaccoonResolver  = addResolver;
  window.getRaccoonHexId     = getRaccoonHexId;
  window.createRaccoonForEntity = createRaccoonForEntity;
  window.attachRaccoonToButton  = attachRaccoonToButton;

  awaitCreateRaccoon();

  const styleId = 'raccoon-handler-style';
  if (!document.getElementById(styleId)) {
    const css = document.createElement('style');
    css.id = styleId;
    css.textContent = `
      .raccoon-anchor > * { margin-left: 6px; }
      .raccoon-anchor button, .raccoon-anchor [role="button"] { outline: none; }
    `;
    document.head.appendChild(css);
  }

  console.log('[RACCOON] Handler ready');
})();
