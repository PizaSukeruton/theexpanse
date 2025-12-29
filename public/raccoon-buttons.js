(() => {
  'use strict';

  // Soft deps (these are provided by raccoon-handler.js).
  const hasCore = () =>
    typeof window.attachRaccoonToButton === 'function' &&
    typeof window.createRaccoonForEntity === 'function' &&
    typeof window.getRaccoonHexId === 'function';

  // Normalize options
  function normOpts(opts = {}) {
    const o = { ...opts };
    o.entityType   = String(o.entityType || o.type || '').toLowerCase().trim();
    o.entityValue  = o.entityValue ?? o.value ?? '';
    o.displayName  = o.displayName ?? o.name ?? '';
    o.mode         = o.mode || 'basic';
    o.className    = o.className || '';
    o.attrs        = o.attrs || {};
    o.onClick      = typeof o.onClick === 'function' ? o.onClick : null;
    o.wrap         = o.wrap !== false; // default true (wrap in a row)
    return o;
  }

  /**
   * Programmatic helper: create a button + raccoon, fully agnostic.
   * Returns the wrapper element (contains the button and the raccoon).
   */
  function createButtonWithRaccoon(opts = {}) {
    const o = normOpts(opts);

    const row = document.createElement('div');
    row.className = `rb-row ${o.rowClass || ''}`.trim();
    row.style.cssText = 'display:flex; align-items:center; gap:6px;';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = o.text || o.label || o.displayName || 'Action';
    btn.className = `rb-btn ${o.className}`.trim();
    btn.style.cssText =
      o.style ||
      `padding:10px;background:rgba(0,255,117,0.1);border:1px solid #00ff75;color:#00ff75;
       cursor:pointer;font-family:"Courier New",monospace;font-size:11px;border-radius:4px;
       display:inline-flex;align-items:center;gap:6px;`;
    for (const [k, v] of Object.entries(o.attrs)) btn.setAttribute(k, v);

    if (o.onClick) btn.addEventListener('click', o.onClick);

    row.appendChild(btn);

    if (hasCore()) {
      // attach raccoon next to the button
      window.attachRaccoonToButton(row, btn, o.entityType, o.entityValue, o.displayName);
    } else {
      console.warn('[RB] raccoon core not ready; only rendering button.');
    }

    return o.wrap ? row : btn;
  }

  /**
   * Enhances an existing button (or clickable) by adding a raccoon next to it.
   * Reads from explicit args OR from data- attributes on the element.
   */
  function enhanceButton(el, opts = {}) {
    if (!(el instanceof HTMLElement)) return false;
    const o = normOpts({
      entityType:  opts.entityType  ?? el.dataset.raccoonType,
      entityValue: opts.entityValue ?? (el.dataset.raccoonValue || el.dataset.hex || ''),
      displayName: opts.displayName ?? (el.dataset.raccoonName || el.dataset.label || el.textContent?.trim())
    });
    // Create a row wrapper if the element has no parent context
    let row = el.parentElement;
    if (!row || getComputedStyle(row).display === 'inline') {
      row = document.createElement('span');
      row.style.cssText = 'display:inline-flex;align-items:center;gap:6px;';
      el.after(row);
      row.appendChild(el);
    }
    if (hasCore()) {
      window.attachRaccoonToButton(row, el, o.entityType, o.entityValue, o.displayName);
      return true;
    } else {
      console.warn('[RB] raccoon core not ready; skipping attach.');
      return false;
    }
  }

  /**
   * Enhance all descendants in a container that declare data-raccoon="true"
   * Supported attributes:
   *   data-raccoon="true"
   *   data-raccoon-type="realm|location|character|event"
   *   data-raccoon-value="#C30000"  (or any string resolvable by your handler)
   *   data-raccoon-name="Earth Realm"
   */
  function enhanceContainer(container = document) {
    const nodes = container.querySelectorAll('[data-raccoon="true"]');
    nodes.forEach(node => enhanceButton(node));
  }

  /**
   * Observe dynamic DOM and auto-enhance new nodes that carry data-raccoon.
   */
  function startAutoEnhance(root = document) {
    enhanceContainer(root);
    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        m.addedNodes.forEach(n => {
          if (!(n instanceof HTMLElement)) return;
          if (n.matches?.('[data-raccoon="true"]')) enhanceButton(n);
          const inner = n.querySelectorAll?.('[data-raccoon="true"]');
          inner?.forEach(el => enhanceButton(el));
        });
      }
    });
    mo.observe(root, { childList: true, subtree: true });
    return mo;
  }

  // Public API
  window.RaccoonButtons = {
    createButtonWithRaccoon,
    enhanceButton,
    enhanceContainer,
    startAutoEnhance
  };

  // Optional tiny CSS
  const styleId = 'raccoon-buttons-style';
  if (!document.getElementById(styleId)) {
    const css = document.createElement('style');
    css.id = styleId;
    css.textContent = `
      .rb-row .raccoon-anchor > * { margin-left: 6px; }
    `;
    document.head.appendChild(css);
  }

  // Auto-enhance on DOM ready (optional)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => startAutoEnhance());
  } else {
    startAutoEnhance();
  }

  console.log('[RB] Raccoon Buttons blueprint ready');
})();
