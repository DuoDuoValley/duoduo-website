(() => {
  const $ = id => document.getElementById(id);
  const fmt = n => Number(n || 0).toLocaleString('zh-TW');
  const targetData = {
    standard: { name: '規範戒指', icon: 'assets/規範戒指.png' },
    eternal: { name: '永續戒指', icon: 'assets/永續戒指.png' }
  };
  const cfg = () => Number($('towerLevel').value) === 4
    ? { stone: '生命研磨石', icon: 'assets/life-grinding-stone.png', max: 10, step: 10, cost: 500000000, to: 5 }
    : { stone: '信念的研磨石', icon: 'assets/faith-grinding-stone.png', max: 20, step: 5, cost: 1000000000, to: 6 };
  let attempts = 0, successes = 0, spent = 0, stones = 0, logs = [];

  function renderLevel() {
    const c = cfg(), lv = Number($('towerLevel').value), t = targetData[$('towerTarget').value];
    $('towerLevelTitle').textContent = `${t.name} Lv.${lv}`;
    $('towerLevelBadge').textContent = `${lv} / 6`;
    $('towerProgress').style.width = `${lv / 6 * 100}%`;
    $('towerNextStep').innerHTML = `下一階段：<strong>Lv.${lv} → Lv.${c.to}</strong><br>${c.stone} 為本階段升級材料`;
  }
  function renderInfo() {
    const c = cfg(), q = Number($('towerQuantity').value) || 1;
    $('towerChanceInfo').innerHTML = `成功率 <strong>${q * c.step}%</strong> · 楓幣消耗 <strong>${fmt(q * c.cost)} 楓幣</strong> <img class="tower-currency-icon" src="assets/mesos.png" alt="楓幣">`;
    $('towerCurrentCost').innerHTML = `<div class="material-item"><img src="${c.icon}" alt=""><div><span>${c.stone}</span><strong>${q} 個</strong></div></div><div class="material-item"><img src="assets/mesos.png" alt="楓幣"><div><span>楓幣</span><strong>${fmt(q * c.cost)} 楓幣</strong></div></div>`;
    $('towerStats').innerHTML = `<div class="stat-tile"><span>本次投入研磨石</span><strong>${q} 個</strong></div><div class="stat-tile"><span>本次成功率</span><strong>${q * c.step}%</strong></div>`;
  }
  function render() {
    const c = cfg(), rate = attempts ? successes / attempts * 100 : 0;
    $('towerAttempts').textContent = attempts;
    $('towerSuccesses').textContent = successes;
    $('towerRate').textContent = attempts ? `${rate.toFixed(1)}%` : '—';
    $('towerCostSummary').innerHTML = `<div class="material-item"><img src="${c.icon}" alt=""><div><span>累積研磨石</span><strong>${fmt(stones)} 個</strong></div></div><div class="material-item"><img src="assets/mesos.png" alt="楓幣"><div><span>累積楓幣</span><strong>${fmt(spent)} 楓幣</strong></div></div>`;
    $('towerLog').innerHTML = logs.length ? logs.slice(0, 12).map(x => `<div class="log-entry ${x.ok ? 'success' : 'fail'}"><span>${x.text}</span><strong>${x.ok ? '成功' : '失敗'}</strong></div>`).join('') : '<div class="empty-state">尚無塔戒升級紀錄。</div>';
  }
  function fill() {
    const c = cfg(), s = $('towerQuantity'), old = Number(s.value) || 1;
    s.innerHTML = '';
    for (let i = 1; i <= c.max; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = `${i} 個（成功率 ${i * c.step}%）`;
      s.appendChild(option);
    }
    s.value = Math.min(c.max, old);
    renderInfo();
    renderLevel();
  }
  $('towerLevel').addEventListener('change', fill);
  $('towerTarget').addEventListener('change', () => {
    const t = targetData[$('towerTarget').value];
    renderLevel();
  });
  $('towerQuantity').addEventListener('change', renderInfo);
  $('towerAttempt').addEventListener('click', () => {
    const c = cfg(), q = Number($('towerQuantity').value) || 1, ok = Math.random() < q * c.step / 100;
    attempts++; stones += q; spent += q * c.cost;
    if (ok) successes++;
    logs.unshift({ ok, text: `${ok ? '升級成功' : '升級失敗'}｜${targetData[$('towerTarget').value].name}｜Lv.${Number($('towerLevel').value)} → Lv.${c.to}｜${c.stone} ×${q}｜${q * c.step}%` });
    $('towerMessage').className = `message ${ok ? 'success' : 'fail'}`;
    $('towerMessage').textContent = ok ? `升級成功！目前等級提升至 ${c.to} 級。` : '升級失敗，本次材料與楓幣仍計入消耗。';
    render();
  });
  function reset() {
    attempts = successes = spent = stones = 0; logs = [];
    $('towerMessage').className = 'message neutral';
    $('towerMessage').textContent = '模擬統計已重設。';
    render();
  }
  $('towerReset').addEventListener('click', reset);
  $('towerClearLog').addEventListener('click', () => { logs = []; render(); });
  fill(); render();
})();