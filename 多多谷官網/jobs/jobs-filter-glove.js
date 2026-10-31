/* 只針對桌面細指標的兩個篩選 select，以可鍵盤操作的頁內下拉取代原生 OS popup。
 * 原生 select 保留作為篩選狀態來源；手機／觸控與 JS 未啟動時沿用原生控制。 */
(() => {
  'use strict';
  if (!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches) return;

  const controllers = [];
  const closeOthers = except => controllers.forEach(item => {
    if (item !== except) item.close(false);
  });
  const enhance = id => {
    const native = document.getElementById(id);
    const old = native?.closest('label.select-wrap');
    if (!native || !old || !native.options.length) return;
    const wrap = document.createElement('div');
    wrap.className = old.className + ' dd-glove-select';
    while (old.firstChild) wrap.append(old.firstChild);
    old.replaceWith(wrap);

    const label = wrap.querySelector('span')?.textContent?.trim() || '篩選';
    native.hidden = true;
    native.tabIndex = -1;
    native.setAttribute('aria-hidden', 'true');
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'dd-glove-trigger';
    trigger.setAttribute('aria-label', label);
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    const list = document.createElement('div');
    list.className = 'dd-glove-menu';
    list.id = `${id}-glove-list`;
    list.hidden = true;
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', label);
    trigger.setAttribute('aria-controls', list.id);
    const text = document.createElement('span');
    text.className = 'dd-glove-text';
    const chevron = document.createElement('span');
    chevron.className = 'dd-glove-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    trigger.append(text, chevron);
    wrap.append(trigger, list);

    const getOptions = () => Array.from(list.querySelectorAll('[role="option"]'));
    const sync = () => {
      text.textContent = native.selectedOptions[0]?.textContent || '';
      getOptions().forEach(option => option.setAttribute('aria-selected', String(option.dataset.value === native.value)));
    };
    const close = restoreFocus => {
      if (list.hidden) return;
      list.hidden = true;
      wrap.classList.remove('dd-glove-open');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.removeAttribute('aria-activedescendant');
      if (restoreFocus) trigger.focus({preventScroll: true});
    };
    const open = (focus = false, last = false) => {
      closeOthers(control);
      list.hidden = false;
      wrap.classList.add('dd-glove-open');
      trigger.setAttribute('aria-expanded', 'true');
      list.style.top = '';
      list.style.bottom = '';
      // 若視窗底部空間不夠，選單向上展開，避免被截斷。
      const rect = wrap.getBoundingClientRect();
      const below = window.innerHeight - rect.bottom;
      if (below < Math.min(310, list.scrollHeight + 12) && rect.top > below) {
        list.style.top = 'auto';
        list.style.bottom = 'calc(100% + 4px)';
      }
      if (focus) {
        const options = getOptions();
        const target = last ? options[options.length - 1] : options.find(el => el.dataset.value === native.value) || options[0];
        target?.focus({preventScroll: true});
        target?.scrollIntoView({block:'nearest'});
      }
    };
    const control = {close};
    controllers.push(control);
    Array.from(native.options).forEach((source, index) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'dd-glove-option';
      item.id = `${id}-glove-option-${index}`;
      item.setAttribute('role', 'option');
      item.tabIndex = -1;
      item.dataset.value = source.value;
      item.textContent = source.textContent;
      item.addEventListener('click', () => {
        if (native.value !== source.value) {
          native.value = source.value;
          native.dispatchEvent(new Event('change', {bubbles: true}));
        }
        sync();
        close(true);
      });
      list.append(item);
    });
    sync();
    native.addEventListener('change', sync);
    trigger.addEventListener('click', () => list.hidden ? open() : close(false));
    trigger.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        open(true, e.key === 'ArrowUp' || e.key === 'End');
      } else if (e.key === 'Escape' && !list.hidden) {
        e.preventDefault(); close(true);
      }
    });
    list.addEventListener('keydown', e => {
      const options = getOptions();
      const i = options.indexOf(document.activeElement);
      if (e.key === 'Escape') {e.preventDefault(); close(true); return;}
      if (e.key === 'Tab') {close(false); return;}
      if (e.key === 'Enter' || e.key === ' ') {e.preventDefault(); options[i]?.click(); return;}
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
        e.preventDefault();
        const n = e.key === 'Home' ? 0 : e.key === 'End' ? options.length-1 : e.key === 'ArrowDown' ? Math.min(i+1,options.length-1) : Math.max(i-1,0);
        options[n]?.focus({preventScroll:true});
        options[n]?.scrollIntoView({block:'nearest'});
      }
    });
    return sync;
  };

  const syncAll = [enhance('typeSelect'), enhance('traitSelect')].filter(Boolean);
  // 原本的 reset() 是程式指定 value，不會自動觸發 change，需同步顯示文字。
  ['resetFilters','emptyReset'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => syncAll.forEach(sync => sync()));
  });
  document.addEventListener('pointerdown', e => {
    if (!e.target.closest('.dd-glove-select')) closeOthers(null);
  }, true);
  document.addEventListener('focusin', e => {
    if (!e.target.closest('.dd-glove-select')) closeOthers(null);
  });
  window.addEventListener('blur', () => closeOthers(null));
})();
