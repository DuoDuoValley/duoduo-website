/* Public-page cursor behavior; no changes to application logic. */
(() => {
  'use strict';
  if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const root = document.documentElement;
  const selector = 'a, button, select, summary, label[for], [role="button"], [role="link"], [role="tab"], [role="menuitem"], [onclick], input[type="button"], input[type="submit"], input[type="reset"], input[type="checkbox"], input[type="radio"], input[type="file"], input[type="range"], .btn, .button, [tabindex]:not([tabindex="-1"]):not(.news-modal-scroll)';
  let hovering = false;
  let pressed = false;
  let alternate = false;
  let selectingText = false;
  // Scroll gesture feedback shares the original 500ms glove animation clock.
  // Native scrollbar cursors are browser-controlled, so the trigger is best effort.
  let scrollHover = false;
  let scrollingByWheel = false;
  let wheelQuietTimer = 0;
  function canScrollVertically(el) {
    return el && el.scrollHeight > el.clientHeight + 3;
  }
  function nearVerticalScrollbar(target, x, y) {
    if (!(target instanceof Element)) return false;
    // Never replace the editable field's insertion cursor.
    if (target.closest('input, textarea, [contenteditable]')) return false;
    const pageScroller = document.scrollingElement || document.documentElement;
    if (canScrollVertically(pageScroller) && x >= window.innerWidth - 15 && x <= window.innerWidth) {
      return true;
    }
    for (let el = target; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
      if (!canScrollVertically(el)) continue;
      const overflow = getComputedStyle(el).overflowY;
      if (overflow !== 'auto' && overflow !== 'scroll' && overflow !== 'overlay') continue;
      const rect = el.getBoundingClientRect();
      if (x >= rect.right - 15 && x <= rect.right && y >= rect.top && y <= rect.bottom) return true;
    }
    return false;
  }
  function updateScrollHover(event) {
    const next = nearVerticalScrollbar(event.target, event.clientX, event.clientY);
    if (next !== scrollHover) { scrollHover = next; alternate = false; paint(); }
  }
  function paint() {
    const scrolling = (scrollHover || scrollingByWheel) && !selectingText;
    root.classList.toggle('duoduo-cursor-selecting', selectingText && !pressed);
    root.classList.toggle('duoduo-cursor-pressed', pressed && !scrolling);
    root.classList.toggle('duoduo-cursor-scroll', scrolling && !alternate);
    root.classList.toggle('duoduo-cursor-scroll-alt', scrolling && alternate);
    root.classList.toggle('duoduo-cursor-hover', hovering && !scrolling && !pressed && !selectingText && !alternate);
    root.classList.toggle('duoduo-cursor-hover-alt', hovering && !scrolling && !pressed && !selectingText && alternate);
  }
  function updateHover(target) {
    const next = target instanceof Element && !!target.closest(selector);
    if (next !== hovering) { hovering = next; alternate = false; paint(); }
  }
  document.addEventListener('pointerover', e => { if (e.pointerType === 'mouse') { updateHover(e.target); updateScrollHover(e); } }, true);
  document.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') { updateHover(e.target); updateScrollHover(e); } }, {passive:true, capture:true});
  document.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && e.button === 0) { pressed = true; paint(); } }, true);
  document.addEventListener('pointerup', e => { if (e.pointerType === 'mouse' && e.button === 0) { pressed = false; updateHover(e.target); paint(); } }, true);
  window.addEventListener('blur', () => { pressed = false; hovering = false; scrollHover = false; scrollingByWheel = false; clearTimeout(wheelQuietTimer); paint(); });
  document.addEventListener('pointerout', e => { if (e.pointerType === 'mouse' && !e.relatedTarget) { hovering = false; scrollHover = false; pressed = false; paint(); } }, true);
  document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    const active = document.activeElement;
    const editable = active && (active.matches('input, textarea, [contenteditable], [contenteditable] *') || active.isContentEditable);
    const next = !editable && !!selection && !selection.isCollapsed && !!selection.toString();
    if (next !== selectingText) { selectingText = next; paint(); }
  });
  document.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button === 0 && selectingText) { selectingText = false; paint(); }
  }, true);
  // Keep the exact original 500ms period for both existing hover and new scroll gloves.
  window.setInterval(() => {
    if ((hovering || scrollHover || scrollingByWheel) && (!pressed || scrollHover)) {
      alternate = !alternate; paint();
    }
  }, 500);
  document.addEventListener('wheel', event => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    const pageScroller = document.scrollingElement || document.documentElement;
    if (!canScrollVertically(pageScroller)) return;
    if (!scrollingByWheel) { scrollingByWheel = true; alternate = false; paint(); }
    clearTimeout(wheelQuietTimer);
    wheelQuietTimer = setTimeout(() => { scrollingByWheel = false; paint(); }, 900);
  }, {passive:true, capture:true});
  root.classList.add('duoduo-cursor-ready');
  paint();
})();
