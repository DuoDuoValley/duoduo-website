/* Public-page cursor behavior; no changes to application logic. */
(() => {
  'use strict';
  if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const root = document.documentElement;
  const selector = 'a, button, select, summary, label[for], [role="button"], [role="link"], [role="tab"], [role="menuitem"], [onclick], input[type="button"], input[type="submit"], input[type="reset"], input[type="checkbox"], input[type="radio"], input[type="file"], .btn, .button, [tabindex]:not([tabindex="-1"])';
  let hovering = false;
  let pressed = false;
  let alternate = false;
  function paint() {
    root.classList.toggle('duoduo-cursor-pressed', pressed);
    root.classList.toggle('duoduo-cursor-hover', hovering && !pressed && !alternate);
    root.classList.toggle('duoduo-cursor-hover-alt', hovering && !pressed && alternate);
  }
  function updateHover(target) {
    const next = target instanceof Element && !!target.closest(selector);
    if (next !== hovering) { hovering = next; alternate = false; paint(); }
  }
  document.addEventListener('pointerover', e => { if (e.pointerType === 'mouse') updateHover(e.target); }, true);
  document.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') updateHover(e.target); }, {passive:true, capture:true});
  document.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && e.button === 0) { pressed = true; paint(); } }, true);
  document.addEventListener('pointerup', e => { if (e.pointerType === 'mouse' && e.button === 0) { pressed = false; updateHover(e.target); paint(); } }, true);
  window.addEventListener('blur', () => { pressed = false; hovering = false; paint(); });
  document.addEventListener('pointerout', e => { if (e.pointerType === 'mouse' && !e.relatedTarget) { hovering = false; pressed = false; paint(); } }, true);
  window.setInterval(() => { if (hovering && !pressed) { alternate = !alternate; paint(); } }, 1000);
  root.classList.add('duoduo-cursor-ready');
  paint();
})();
