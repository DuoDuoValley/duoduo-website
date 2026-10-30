/* 多多谷職業圖鑑 V6.5：保留原始職業與技能資料，只優化操作介面。 */
(()=>{'use strict';
  const data=window.DuoDuoJobsData;
  const byId=id=>document.getElementById(id);
  if(!data || !Array.isArray(data.jobs)){byId('resultCount').textContent='資料載入失敗，請確認 jobs-data.js 和 jobs.html 位於同一個資料夾。';return;}
  const state={series:'',search:'',type:'',trait:'',rank:'SSS'};
  const rankLabels={S:'S',SS:'SS',SSS:'SSS'};
  const unionStat=job=>job.unionRanks?.[state.rank]??job.sss;
  const escapeHtml=str=>String(str??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const skillFor=job=>data.skills[job.skill];
  // 每種技能的等級上限與繁體技能介紹（按 TMS-283 對照，保持原技能等級數值不變）。
  // V5.9：技能說明仍採用使用者提供之 V282 String.Skill.img.xml 的 desc。
  // 去除文字色碼 #c／#；其餘字詞、換行保留原始內容。
  // maxLevel 已與 Skill.wz 比對；精靈集中最高 Lv.3 以實際遊戲截圖覆蓋原 WZ Lv.2。
  const verifiedSkillDetails={
  "蒼刃傳授": {
    "maxLevel": 3,
    "intro": "不斷磨練，像青光閃耀的刀刃般，學習鍛鍊自己的曉月流基本技。"
  },
  "紫扇傳授": {
    "maxLevel": 3,
    "intro": "掌握戰鬥中隨時變化的靈力流動，並借助部分靈力，使自己暫時對敵人造成更大的傷害。\n發動攻擊技能一定次數時，準備完成，完成準備後發動下一個攻擊技能時，對自己套用持續一定時間的[紫扇傳授]效果"
  },
  "精靈集中": {
    "maxLevel": 3,
    "intro": "受到動物精靈的氣息感受到神祕的力量."
  },
  "氣魄": {
    "maxLevel": 3,
    "intro": "繼承江湖的氣魄，得到與強大敵人正面對決的力量。對敵人施加的攻擊越多，氣魄也會逐漸累積增加。"
  },
  "不屈的信念": {
    "maxLevel": 9,
    "intro": "帶著不屈的信念並處於危機狀況時，將恢復大量HP。\n村莊與不可恢復的特定狀況下無法發動，且不受冷卻時間重置、BUFF持續時間增加、恢復技能效率增加與減少的效果影響。\n若世界內有其他冒險家戰士職業群，一個角色最多可重複3次獲得連結技能。\n\n7級：冒險家戰士職業群所受永久傷害增加"
  },
  "實戰的知識": {
    "maxLevel": 9,
    "intro": "藉由實戰的觀察掌握弱點，並逐漸提升對該名敵人的傷害與無視防禦率。\n若帳號內有其他冒險家法師職業群，一個角色最多可重複3次獲得連結技能。"
  },
  "探險家的好奇心": {
    "maxLevel": 9,
    "intro": "發揮獨特的好奇心，提升怪物收藏登錄機率與爆擊機率。\n怪物收藏登錄機率以原有機率乘算套用。\n同一世界內若存在不同的冒險家弓箭手職業群，則可對單一角色最多重複套用3次連結技能。\n\n7級：冒險家弓箭手職業群永久增加傷害"
  },
  "小偷的狡詐": {
    "maxLevel": 9,
    "intro": "發揮盜賊特有的狡詐，使敵人弱化並增加傷害。\n不受冷卻時間重置效果、BUFF持續時間增加效果影響。\n若帳號內有其他冒險家盜賊職業群，一個角色最多可重複3次獲得連結技能。"
  },
  "海盜的祝福": {
    "maxLevel": 9,
    "intro": "習得海盜特有的強韌後，各項能力值提升，且所受傷害減少。\n在同一世界內若存在不同的冒險家海盜職業群，則可對單一角色最多重複套用3次連結技能。\n使用技能時，除武器、副武器、祕法符文、真實符文、寵物裝備外，其餘部位裝備的力量與敏捷會互換套用。\n\n7級：冒險家海盜職業群可獲得更多能力值提升"
  },
  "西格諾斯祝福": {
    "maxLevel": 15,
    "intro": "覺醒女皇的庇護寄宿於身，使其擺脫敵人的威脅。\n同一世界內若存在不同的西格諾斯職業群，則可對單一角色最多重複套用5次連結技能。\n\n11級：西格諾斯職業群獲得更多攻擊力與魔力"
  },
  "光之守護": {
    "maxLevel": 3,
    "intro": "獲得光之守護，一定時間內可防禦來自敵人的傷害，並增加攻擊傷害。以連結技能使用時，一定時間內狀態異常抗性增加。\n\n3級：米哈逸永久增加傷害"
  },
  "自由精神": {
    "maxLevel": 12,
    "intro": "渴望自由的反抗軍所擁有的靈魂之力。若同一世界內存在不同的末日反抗軍職業群，則單一角色最多可重複獲得4次連結技能。\n\n9級：爆拳槍神、煉獄巫師、狂豹獵人、機甲戰神永久傷害增加"
  },
  "惡魔之怒": {
    "maxLevel": 3,
    "intro": "目標為BOSS怪物時，引出其潛在的憤怒造成更強大的傷害，並且追加吸收力量。"
  },
  "狂暴鬥氣": {
    "maxLevel": 3,
    "intro": "因為憤怒增加傷害。"
  },
  "合成邏輯": {
    "maxLevel": 3,
    "intro": "特用合成邏輯設計，永久提升所有能力值。"
  },
  "連續擊殺優勢": {
    "maxLevel": 3,
    "intro": "透過鐵戟精靈瑪哈的神祕力量，獲得連擊戰鬥的祝福。\n\n3級：狂狼勇士永久傷害增加"
  },
  "輪之堅持": {
    "maxLevel": 3,
    "intro": "強化符文魔力，使解放的符文之力持續時間增加。\n\n3級：龍魔導士永久傷害增加"
  },
  "精靈的祝福": {
    "maxLevel": 3,
    "intro": "受古代精靈的祝福，可返回櫻花處，並永久增加經驗值獲得量。\n\n3級：精靈遊俠永久傷害增加"
  },
  "致命本能": {
    "maxLevel": 3,
    "intro": "擁有透過卓越洞察力找出敵人致命弱點的本能。\n\n3級：幻影俠盜永久傷害增加"
  },
  "滲透": {
    "maxLevel": 3,
    "intro": "無論如何遮蔽仍會滲透的光之力量，使敵人的防禦部分無效。\n\n3級：夜光永久傷害增加"
  },
  "死裡逃生": {
    "maxLevel": 3,
    "intro": "受到致死攻擊時，有一定機率存活。\n\n3級：隱月永久傷害增加"
  },
  "鋼鐵意志": {
    "maxLevel": 3,
    "intro": "具有鋼鐵意志的凱撒，獲得追加HP並且根據龍能球階段提升傷害。使用連結技能時僅套用HP增加。"
  },
  "事前準備": {
    "maxLevel": 3,
    "intro": "為了確實解決敵人，進行事前準備。"
  },
  "集中狂攻": {
    "maxLevel": 3,
    "intro": "能更有效的攻擊比自己弱的敵人。"
  },
  "靈魂契約": {
    "maxLevel": 3,
    "intro": "透過與愛斯卡達的契約，瞬間極大化傷害。\n靈魂契約可在使用其他技能時施放。"
  },
  "貴族": {
    "maxLevel": 3,
    "intro": "具有崇高的精神。當必須從強大的敵人手中保護某人時，會發揮更大的力量。"
  },
  "戰鬥的流動": {
    "maxLevel": 3,
    "intro": "將會維持戰鬥的流動。\n在一定時間內移動特定距離時傷害增加。"
  },
  "天賦": {
    "maxLevel": 3,
    "intro": "接受沙漠祝福並攻擊時，在短時間內恢復HP及MP。額外永久增加傷害。天賦不受冷卻時間重置、冷卻時間減少、Buff持續時間增加效果影響。\n\n3級：卡莉傷害額外增加"
  },
  "無我": {
    "maxLevel": 3,
    "intro": "集中戰鬥到遺失自我的水準。\n一定時間持續戰鬥狀態時，會增加傷害。"
  },
  "護體": {
    "maxLevel": 3,
    "intro": "透過心法修練鍛鍊身體，減少受到的攻擊傷害。\n\n3級：蓮永久傷害增加"
  },
  "大自然夥伴": {
    "maxLevel": 3,
    "intro": "與周圍自然成為夥伴並獲得幫助。對無法承受神祕自然之力的弱小怪物有更強效果。\n\n3級：菈菈的傷害額外增加"
  },
  "自信心": {
    "maxLevel": 3,
    "intro": "以面對強敵也不退縮的自信，無視敵人部分防禦率，並在攻擊滿血的怪物時造成更高傷害。\n\n3級：虎影永久傷害增加"
  },
  "時之祝福": {
    "maxLevel": 6,
    "intro": "受到優伊娜女神的祝福，降低所受傷害，並在攻擊時無視部分防禦率。\n每當獲得已啟用的女神之淚時，技能效果會變得更強。\n\n6級：神之子永久增加傷害"
  },
  "判斷": {
    "maxLevel": 3,
    "intro": "以天生的判對力對敵人造成最可能的致命傷。"
  }
};

  // V5.5：逐級詳細效果。高等共用技能的每級數字已按 TMS-283 查詢頁單獨核對；
  // 其他技能沿用 V5 已採集的 1～3 級效果。此表與原有四個快速切換互不影響。
  const expandedSkillLevelRows={
    '不屈的信念': [
      ...[20,23,26,29,32,35,38,41,44].map((heal,i)=>({level:i+1,
        effect:`HP 降至最大 HP 的 15% 以下時自動觸發；持續 3 秒，每秒恢復最大 HP 的 ${heal}%；冷卻 ${310-20*i} 秒。`,
        metrics:[`觸發門檻 15%`,`每秒恢復 ${heal}%`,`冷卻 ${310-20*i} 秒`,`持續 3 秒`]}))
    ],
    '實戰的知識': [
      ...[15,17,19,21,23,25,27,29,31].map((chance,i)=>{const v=[1,1,2,2,3,3,4,4,5][i];return {level:i+1,
        effect:`攻擊時有 ${chance}% 機率洞察敵人弱點，弱點持續 10 秒，最多疊加 3 層。每累積一層，傷害及無視防禦率各增加 ${v}%。`,
        metrics:[`觸發機率 ${chance}%`,`每層傷害 +${v}%`,`每層無視 +${v}%`,`最多 3 層`]};})
    ],
    '探險家的好奇心':[
      ...[10,15,20,25,30,35,40,45,50].map((collection,i)=>{let critical=[3,4,6,7,9,10,12,13,15][i];return {level:i+1,
        effect:`怪物收藏登錄機率提高 ${collection}%，爆擊率提高 ${critical}%。`,
        metrics:[`收藏機率 +${collection}%`,`爆擊率 +${critical}%`]};})
    ],
    '小偷的狡詐':[
      ...Array.from({length:9},(_,i)=>{let v=(i+1)*3;return {level:i+1,
        effect:`使敵人陷入異常狀態時，傷害增加 ${v}%，持續 10 秒；再次發動需等待 20 秒。`,
        metrics:[`傷害 +${v}%`,`持續 10 秒`,`冷卻 20 秒`]};})
    ],
    '海盜的祝福':[
      ...[20,30,40,50,60,70,90,110,130].map((stat,i)=>{let hp=[350,525,700,875,1050,1225,1400,1575,1750][i],damage=[5,7,9,11,13,15,17,19,21][i];return {level:i+1,
        effect:`STR、DEX、INT、LUK 各提高 ${stat}；最大 HP、MP 各增加 ${hp}；受到傷害減少 ${damage}%；冷卻 5 秒。`,
        metrics:[`全屬性 +${stat}`,`HP／MP +${hp}`,`受擊 -${damage}%`,`冷卻 5 秒`]};})
    ],
    '西格諾斯祝福':[
      ...[7,9,11,13,15,17,19,21,23,25,31,37,43,49,55].map((atk,i)=>{let res=[1,3,4,6,7,9,10,12,13,15,16,18,19,21,22][i];return {level:i+1,
        effect:`攻擊力、魔法攻擊力各增加 ${atk}；異常狀態耐性增加 ${res}；所有屬性耐性增加 ${res}%。`,
        metrics:[`攻／魔 +${atk}`,`異常耐性 +${res}`,`屬性耐性 +${res}%`]};})
    ],
    '自由精神':[
      ...Array.from({length:12},(_,i)=>({level:i+1,
        effect:`角色復活後獲得 ${i+1} 秒無敵狀態；切換地圖時提前解除。`,
        metrics:[`復活無敵 ${i+1} 秒`,`切換地圖解除`]}))
    ],
    '時之祝福':[
      ...[3,6,9,12,15,20].map((absorb,i)=>{let ignore=[2,4,6,8,10,15][i];return {level:i+1,
        effect:`受到的傷害減少 ${absorb}%，無視敵人防禦率增加 ${ignore}%。`,
        metrics:[`受擊傷害 -${absorb}%`,`無視防禦 +${ignore}%`]};})
    ]
  };
  // 對 V5 原有 3 級效果中省略的條件補上已知的完整敘述，避免表格出現「上述條件」卻不知道是什麼。
  const fullThreeLevelRows={
    '蒼刃傳授':[3,5,7].map((v,i)=>({level:i+1,effect:`爆擊率 100% 以上，且爆擊傷害 50% 以上時，爆擊傷害額外增加 ${v}%。`,metrics:[`爆傷 +${v}%`,`爆率條件 ≥100%`,`爆傷條件 ≥50%`]})),
    '氣魄':[2,4,6].map((v,i)=>{let stack=i+1;return {level:i+1,effect:`對 BOSS 的傷害增加 ${v}%。攻擊 BOSS 後還可累積額外效果，每層 BOSS 傷害再增加 ${stack}%，最多疊加 6 層，每 2 秒最多累積 1 層，效果持續 5 秒。`,metrics:[`BOSS 傷害 +${v}%`,`每層 +${stack}%`,`最多 6 層`,`持續 5 秒`]};}),
    '事前準備':[9,17,25].map((v,i)=>({level:i+1,effect:`擊殺 8 隻怪物，或對 BOSS 攻擊命中 5 次，會累積 1 層準備效果；累積到 5 層後，傷害增加 ${v}%，持續 20 秒，冷卻 40 秒。`,metrics:[`傷害 +${v}%`,`需 5 層`,`持續 20 秒`,`冷卻 40 秒`]})),
    '集中狂攻':[3,6,9].map((v,i)=>({level:i+1,effect:`攻擊等級比自己低的怪物時，傷害增加 ${v}%；攻擊處於異常狀態的怪物時，傷害再增加 ${v}%。`,metrics:[`低等怪 +${v}%`,`異常目標 +${v}%`]})),
    '大自然夥伴':[[3,7],[5,11],[10,15]].map(([base,extra],i)=>({level:i+1,effect:`永久傷害增加 ${base}%；擊殺 20 隻一般怪物後，對一般怪物的傷害額外增加 ${extra}%，持續 30 秒，冷卻 30 秒。`,metrics:[`傷害 +${base}%`,`一般怪 +${extra}%`,`持續 30 秒`,`冷卻 30 秒`]}))
  };
  // V5.7：獨立技能詳細頁的逐級效果；不得由四個速查摘要反向推算。
  // 各級表列角色自身效果；「傳授連結技能」按鈕顯示同技能最高等級可傳授連結技能的效果。
  const auditedThreeLevelRows={
    '蒼刃傳授':[3,5,7].map((n,i)=>({level:i+1,effect:`爆擊率 100% 以上且爆擊傷害 50% 以上時，爆擊傷害額外增加 ${n}%。`,metrics:[`爆擊傷害 +${n}%`,`爆擊率 ≥100%`,`爆傷 ≥50%`]})),
    '紫扇傳授':[10,15,20].map((n,i)=>({level:i+1,effect:`累積使用攻擊技能 40 次後，下一次使用攻擊技能可觸發傷害增加 ${n}% 的效果，持續 12 秒。`,metrics:[`傷害 +${n}%`,`攻擊 40 次`,`持續 12 秒`]})),
    '精靈集中':[[4,4,3],[7,7,4],[11,10,5]].map(([boss,crit,hp],i)=>({level:i+1,effect:`BOSS 傷害 +${boss}%，爆擊率 +${crit}%，最大 HP 與 MP 各增加 ${hp}%。`,metrics:[`BOSS +${boss}%`,`爆擊率 +${crit}%`,`HP／MP +${hp}%`]})),
    '氣魄':[[2,1],[4,2],[4,3]].map(([base,extra],i)=>({level:i+1,effect:`攻擊 BOSS 怪物時傷害增加 ${base}%；每次成功攻擊 BOSS 額外增加 ${extra}% 傷害，最多累積 6 層，每 2 秒最多觸發一次，效果維持 5 秒。`,metrics:[`BOSS 傷害 +${base}%`,`每層 +${extra}%`,`最多 6 層`,`持續 5 秒`]})),
    '光之守護':[[10,3,15,10],[20,6,20,20],[30,9,25,30]].map(([sec,hits,dmg,reduction],i)=>({level:i+1,effect:`自身使用時產生護盾，維持 ${sec} 秒，最多抵擋 ${hits} 次攻擊；傷害 +${dmg}%，依最大 HP 比例造成的攻擊傷害減少 ${reduction}%，冷卻 120 秒。${i===2?' Lv.3 自身另有永久傷害 +3%。':''}`,metrics:[`護盾 ${sec} 秒`,`最多 ${hits} 次`,`傷害 +${dmg}%`,`比例傷害 -${reduction}%`,`冷卻 120 秒`]})),
    '惡魔之怒':[10,15,20].map((n,i)=>({level:i+1,effect:`攻擊 BOSS 怪物時傷害 +${n}%；使用惡魔血月斬時額外吸收 10 點精氣。`,metrics:[`BOSS 傷害 +${n}%`,`吸收精氣 10 點`]})),
    '狂暴鬥氣':[5,10,15].map((n,i)=>({level:i+1,effect:`傷害增加 ${n}%。`,metrics:[`傷害 +${n}%`]})),
    '合成邏輯':[5,10,15].map((n,i)=>({level:i+1,effect:`全屬性提高 ${n}%。`,metrics:[`全屬性 +${n}%`]})),
    '連續擊殺優勢':[400,650,900].map((n,i)=>({level:i+1,effect:`連續擊殺珠（Combo 擊殺珠）的經驗值增加 ${n}%。${i===2?' 戰神自身另外獲得永久傷害 +5%。':''}`,metrics:[`擊殺珠 EXP +${n}%`]})),
    '輪之堅持':[30,50,70].map((n,i)=>({level:i+1,effect:`符文解放的效果持續時間增加 ${n}%。${i===2?' 龍魔導士自身另外獲得永久傷害 +5%。':''}`,metrics:[`符文效果時間 +${n}%`]})),
    '精靈的祝福':[10,15,20].map((n,i)=>({level:i+1,effect:`打怪獲得經驗值 +${n}%；可消耗 MP 30 返回精靈故鄉，移動功能冷卻 600 秒。${i===2?' 精靈遊俠自身另外獲得永久傷害 +5%。':''}`,metrics:[`經驗值 +${n}%`,`移動消耗 MP 30`,`冷卻 600 秒`]})),
    '致命本能':[10,15,20].map((n,i)=>({level:i+1,effect:`爆擊率增加 ${n}%。${i===2?' 幻影自身另外獲得永久傷害 +5%。':''}`,metrics:[`爆擊率 +${n}%`]})),
    '滲透':[10,15,20].map((n,i)=>({level:i+1,effect:`無視敵人防禦率增加 ${n}%。${i===2?' 夜光自身另外獲得永久傷害 +4%。':''}`,metrics:[`無視防禦 +${n}%`]})),
    '死裡逃生':[5,10,15].map((n,i)=>({level:i+1,effect:`受到足以致死的攻擊時，有 ${n}% 機率存活。${i===2?' 隱月自身另外獲得永久傷害 +5%。':''}`,metrics:[`致死攻擊存活率 ${n}%`]})),
    '鋼鐵意志':[[5,2],[10,3],[15,5]].map(([hp,dmg],i)=>({level:i+1,effect:`自身最大 HP 增加 ${hp}%；依照變身值階段，傷害提高 ${dmg}%。作為傳授連結技能提供給其他角色時只有最大 HP 加成，數值與自身效果不同。`,metrics:[`自身 HP +${hp}%`,`變身傷害 +${dmg}%`]})),
    '事前準備':[9,17,25].map((n,i)=>({level:i+1,effect:`擊敗 8 隻一般怪物或命中 BOSS 5 次可累積一層準備效果；累積 5 層後傷害 +${n}%，持續 20 秒，冷卻 40 秒。`,metrics:[`傷害 +${n}%`,`需 5 層`,`持續 20 秒`,`冷卻 40 秒`]})),
    '集中狂攻':[3,6,9].map((n,i)=>({level:i+1,effect:`攻擊等級低於自身的怪物時，傷害 +${n}%；攻擊處於異常狀態的怪物時，再增加 ${n}% 傷害。`,metrics:[`低等怪 +${n}%`,`異常敵人 +${n}%`]})),
    '靈魂契約':[[60,90],[90,60],[120,60]].map(([dmg,cd],i)=>({level:i+1,effect:`自身使用時消耗 MP 30，傷害增加 ${dmg}%，持續 10 秒，冷卻 ${cd} 秒。透過傳授連結技能使用時，傷害加成減半為 +${dmg/2}%。`,metrics:[`自身傷害 +${dmg}%`,`傳授連結技能傷害 +${dmg/2}%`,`持續 10 秒`,`冷卻 ${cd} 秒`]})),
    '貴族':[[2,1],[4,2],[6,3]].map(([boss,per],i)=>({level:i+1,effect:`BOSS 傷害 +${boss}%；同地圖每位隊伍成員（包含自己）使傷害額外增加 ${per}%，最多計算 4 名成員；單人未組隊亦視為 1 人。`,metrics:[`BOSS 傷害 +${boss}%`,`每位隊員 +${per}%`,`最多 4 人`]})),
    '戰鬥的流動':[2,3,4].map((n,i)=>({level:i+1,effect:`移動達指定距離時發動，每層傷害 +${n}%，最多疊加 4 次。自身效果持續 25 秒；透過傳授連結技能使用時，每層傷害相同，但持續時間縮短為 10 秒。`,metrics:[`每層傷害 +${n}%`,`最多 4 層`,`自身 25 秒`,`傳授連結技能 10 秒`]})),
    '天賦':[[3,1],[5,2],[10,3]].map(([dmg,heal],i)=>({level:i+1,effect:`自身傷害 +${dmg}%；攻擊時可發動恢復效果，在 5 秒內每秒恢復最大 HP／MP 的 ${heal}%，冷卻 30 秒。${i===2?' 等級 3 作為傳授連結技能使用時的傷害加成為 +7%。':''}`,metrics:[`自身傷害 +${dmg}%`,`每秒恢復 ${heal}%`,`持續 5 秒`,`冷卻 30 秒`]})),
    '無我':[1,2,3].map((n,i)=>({level:i+1,effect:`每維持戰鬥狀態 5 秒，累積一層傷害 +${n}%，最多 5 層；首次開始戰鬥額外 +1% 傷害，每層效果持續 5 秒。`,metrics:[`每層傷害 +${n}%`,`最多 5 層`,`持續 5 秒`]})),
    '護體':[2,4,6].map((n,i)=>({level:i+1,effect:`受到的攻擊傷害降低 ${n}%，包含按最大 HP 比例造成的傷害。${i===2?' 蓮自身另外獲得永久傷害 +5%。':''}`,metrics:[`受擊傷害 -${n}%`]})),
    '大自然夥伴':[[3,7],[5,11],[10,15]].map(([base,extra],i)=>({level:i+1,effect:`自身永久傷害 +${base}%。擊敗 20 隻一般怪物後，對一般怪物的傷害額外增加 ${extra}%，持續 30 秒，冷卻 30 秒。${i===2?' 使用傳授連結技能時基本傷害加成改為 +7%。':''}`,metrics:[`自身傷害 +${base}%`,`一般怪 +${extra}%`,`持續 30 秒`,`冷卻 30 秒`]})),
    '自信心':[[5,9],[10,14],[15,19]].map(([ignore,full],i)=>({level:i+1,effect:`無視敵人防禦率 +${ignore}%；對 HP 為全滿狀態的怪物，傷害 +${full}%。${i===2?' 虎影自身額外獲得永久傷害 +4%。':''}`,metrics:[`無視防禦 +${ignore}%`,`滿血怪傷害 +${full}%`]})),
    '判斷':[2,4,6].map((n,i)=>({level:i+1,effect:`爆擊傷害增加 ${n}%。`,metrics:[`爆擊傷害 +${n}%`]}))
  };
  // V5.9：34 種技能共 156 筆逐級效果。155 筆 WZ 公式／文字與精靈集中 Lv.3 截圖，
  // 其中「時之祝福」全六級改以使用者指定網站數值為準；共用原本 UI / CSS / 選單。
  // 自身等級表與「傳授連結技能」按鈕的效果分開處理，避免 V282 自身額外效果誤套用於傳授連結技能。
  const wzOfficialLevelRows={"蒼刃傳授":[{"level":1,"effect":"爆擊機率100%以上，爆擊傷害50%以上時，爆擊傷害增加3%。","metrics":["爆擊傷害 +3%","爆擊率 ≥100%","爆傷 ≥50%"],"source":"V282 WZ"},{"level":2,"effect":"爆擊機率100%以上，爆擊傷害50%以上時，爆擊傷害增加5%。","metrics":["爆擊傷害 +5%","爆擊率 ≥100%","爆傷 ≥50%"],"source":"V282 WZ"},{"level":3,"effect":"爆擊機率100%以上，爆擊傷害50%以上時，爆擊傷害增加7%。","metrics":["爆擊傷害 +7%","爆擊率 ≥100%","爆傷 ≥50%"],"source":"V282 WZ"}],"紫扇傳授":[{"level":1,"effect":"發動攻擊技能40次時滿足條件\n[紫扇傳授]：12秒內傷害增加10%","metrics":["傷害 +10%","攻擊 40 次","持續 12 秒"],"source":"V282 WZ"},{"level":2,"effect":"發動攻擊技能40次時滿足條件\n[紫扇傳授]：12秒內傷害增加15%","metrics":["傷害 +15%","攻擊 40 次","持續 12 秒"],"source":"V282 WZ"},{"level":3,"effect":"發動攻擊技能40次時滿足條件\n[紫扇傳授]：12秒內傷害增加20%","metrics":["傷害 +20%","攻擊 40 次","持續 12 秒"],"source":"V282 WZ"}],"精靈集中":[{"level":1,"effect":"增加Boss怪物傷害4%、爆擊機率4%、最大HP3%、最大MP3%","metrics":["BOSS +4%","爆擊率 +4%","HP／MP +3%"],"source":"V282 WZ"},{"level":2,"effect":"增加Boss怪物傷害7%、爆擊機率7%、最大HP4%、最大MP4%","metrics":["BOSS +7%","爆擊率 +7%","HP／MP +4%"],"source":"V282 WZ"},{"level":3,"effect":"Boss 怪攻擊力增加11%，爆擊機率增加10%，最大 HP 增加5%，最大 MP 增加5%。","metrics":["BOSS +11%","爆擊率 +10%","HP／MP +5%"],"source":"遊戲實測"}],"氣魄":[{"level":1,"effect":"攻擊BOSS怪物時增加傷害2%。若攻擊對象為BOSS怪物，每次攻擊成功時增加1%，最多疊加6次，且每2秒發動一次疊加。持續時間5秒","metrics":["BOSS 傷害 +2%","每層 +1%","最多 6 層","持續 5 秒"],"source":"V282 WZ"},{"level":2,"effect":"攻擊BOSS怪物時增加傷害4%。若攻擊對象為BOSS怪物，每次攻擊成功時增加2%，最多疊加6次，且每2秒發動一次疊加。持續時間5秒","metrics":["BOSS 傷害 +4%","每層 +2%","最多 6 層","持續 5 秒"],"source":"V282 WZ"},{"level":3,"effect":"攻擊BOSS怪物時增加傷害4%。若攻擊對象為BOSS怪物，每次攻擊成功時增加3%，最多疊加6次，且每2秒發動一次疊加。持續時間5秒","metrics":["BOSS 傷害 +4%","每層 +3%","最多 6 層","持續 5 秒"],"source":"V282 WZ"}],"不屈的信念":[{"level":1,"effect":"當前HP小於等於最大HP的15%時，將自動發動。在接下來3秒內每秒恢復最大HP的20%\n冷卻時間310秒","metrics":["觸發門檻 15%","每秒恢復 20%","冷卻 310 秒","持續 3 秒"],"source":"V282 WZ"},{"level":2,"effect":"當前HP小於等於最大HP的15%時，將自動發動。在接下來3秒內每秒恢復最大HP的23%\n冷卻時間290秒","metrics":["觸發門檻 15%","每秒恢復 23%","冷卻 290 秒","持續 3 秒"],"source":"V282 WZ"},{"level":3,"effect":"當前HP小於等於最大HP的15%時，將自動發動。在接下來3秒內每秒恢復最大HP的26%\n冷卻時間270秒","metrics":["觸發門檻 15%","每秒恢復 26%","冷卻 270 秒","持續 3 秒"],"source":"V282 WZ"},{"level":4,"effect":"當前HP小於等於最大HP的15%時，將自動發動。在接下來3秒內每秒恢復最大HP的29%\n冷卻時間250秒","metrics":["觸發門檻 15%","每秒恢復 29%","冷卻 250 秒","持續 3 秒"],"source":"V282 WZ"},{"level":5,"effect":"當前HP小於等於最大HP的15%時，將自動發動。在接下來3秒內每秒恢復最大HP的32%\n冷卻時間230秒","metrics":["觸發門檻 15%","每秒恢復 32%","冷卻 230 秒","持續 3 秒"],"source":"V282 WZ"},{"level":6,"effect":"當前HP小於等於最大HP的15%時，將自動發動。在接下來3秒內每秒恢復最大HP的35%\n冷卻時間210秒","metrics":["觸發門檻 15%","每秒恢復 35%","冷卻 210 秒","持續 3 秒"],"source":"V282 WZ"},{"level":7,"effect":"當目前HP低於最大HP的15%時自動發動，在3秒內每1秒恢復最大HP的38%\n再次發動冷卻時間 190秒\n[被動效果：傷害 2% 增加]","metrics":["觸發門檻 15%","每秒恢復 38%","冷卻 190 秒","持續 3 秒"],"source":"V282 WZ"},{"level":8,"effect":"當目前HP低於最大HP的15%時自動發動，在3秒內每1秒恢復最大HP的41%\n再次發動冷卻時間 170秒\n[被動效果：傷害 4% 增加]","metrics":["觸發門檻 15%","每秒恢復 41%","冷卻 170 秒","持續 3 秒"],"source":"V282 WZ"},{"level":9,"effect":"當目前HP低於最大HP的15%時自動發動，在3秒內每1秒恢復最大HP的44%\n再次發動冷卻時間 150秒\n[被動效果：傷害 6% 增加]","metrics":["觸發門檻 15%","每秒恢復 44%","冷卻 150 秒","持續 3 秒"],"source":"V282 WZ"}],"實戰的知識":[{"level":1,"effect":"以15%機率掌握發動攻擊的敵人的弱點。掌握的弱點將持續10秒，最多疊加至3層。\n每疊加1層，傷害增加1%、無視防禦率增加1%","metrics":["觸發機率 15%","每層傷害 +1%","每層無視 +1%","最多 3 層"],"source":"V282 WZ"},{"level":2,"effect":"以17%機率掌握發動攻擊的敵人的弱點。掌握的弱點將持續10秒，最多疊加至3層。\n每疊加1層，傷害增加1%、無視防禦率增加1%","metrics":["觸發機率 17%","每層傷害 +1%","每層無視 +1%","最多 3 層"],"source":"V282 WZ"},{"level":3,"effect":"以19%機率掌握發動攻擊的敵人的弱點。掌握的弱點將持續10秒，最多疊加至3層。\n每疊加1層，傷害增加2%、無視防禦率增加2%","metrics":["觸發機率 19%","每層傷害 +2%","每層無視 +2%","最多 3 層"],"source":"V282 WZ"},{"level":4,"effect":"以21%機率掌握發動攻擊的敵人的弱點。掌握的弱點將持續10秒，最多疊加至3層。\n每疊加1層，傷害增加2%、無視防禦率增加2%","metrics":["觸發機率 21%","每層傷害 +2%","每層無視 +2%","最多 3 層"],"source":"V282 WZ"},{"level":5,"effect":"以23%機率掌握發動攻擊的敵人的弱點。掌握的弱點將持續10秒，最多疊加至3層。\n每疊加1層，傷害增加3%、無視防禦率增加3%","metrics":["觸發機率 23%","每層傷害 +3%","每層無視 +3%","最多 3 層"],"source":"V282 WZ"},{"level":6,"effect":"以25%機率掌握發動攻擊的敵人的弱點。掌握的弱點將持續10秒，最多疊加至3層。\n每疊加1層，傷害增加3%、無視防禦率增加3%","metrics":["觸發機率 25%","每層傷害 +3%","每層無視 +3%","最多 3 層"],"source":"V282 WZ"},{"level":7,"effect":"以27%機率掌握發動攻擊的敵人的弱點。掌握的弱點將持續10秒，最多疊加至3層。\n每疊加1層，傷害增加4%、無視防禦率增加4%","metrics":["觸發機率 27%","每層傷害 +4%","每層無視 +4%","最多 3 層"],"source":"V282 WZ"},{"level":8,"effect":"以29%機率掌握發動攻擊的敵人的弱點。掌握的弱點將持續10秒，最多疊加至3層。\n每疊加1層，傷害增加4%、無視防禦率增加4%","metrics":["觸發機率 29%","每層傷害 +4%","每層無視 +4%","最多 3 層"],"source":"V282 WZ"},{"level":9,"effect":"以31%機率掌握發動攻擊的敵人的弱點。掌握的弱點將持續10秒，最多疊加至3層。\n每疊加1層，傷害增加5%、無視防禦率增加5%","metrics":["觸發機率 31%","每層傷害 +5%","每層無視 +5%","最多 3 層"],"source":"V282 WZ"}],"探險家的好奇心":[{"level":1,"effect":"增加怪物收藏登錄率10%、爆擊機率3%","metrics":["收藏機率 +10%","爆擊率 +3%"],"source":"V282 WZ"},{"level":2,"effect":"增加怪物收藏登錄率15%、爆擊機率4%","metrics":["收藏機率 +15%","爆擊率 +4%"],"source":"V282 WZ"},{"level":3,"effect":"增加怪物收藏登錄率20%、爆擊機率6%","metrics":["收藏機率 +20%","爆擊率 +6%"],"source":"V282 WZ"},{"level":4,"effect":"增加怪物收藏登錄率25%、爆擊機率7%","metrics":["收藏機率 +25%","爆擊率 +7%"],"source":"V282 WZ"},{"level":5,"effect":"增加怪物收藏登錄率30%、爆擊機率9%","metrics":["收藏機率 +30%","爆擊率 +9%"],"source":"V282 WZ"},{"level":6,"effect":"增加怪物收藏登錄率35%、爆擊機率10%","metrics":["收藏機率 +35%","爆擊率 +10%"],"source":"V282 WZ"},{"level":7,"effect":"怪物收藏登錄機率40%、爆擊機率12%、傷害增加2%","metrics":["收藏機率 +40%","爆擊率 +12%"],"source":"V282 WZ"},{"level":8,"effect":"怪物收藏登錄機率45%、爆擊機率13%、傷害增加4%","metrics":["收藏機率 +45%","爆擊率 +13%"],"source":"V282 WZ"},{"level":9,"effect":"怪物收藏登錄機率50%、爆擊機率15%、傷害增加6%","metrics":["收藏機率 +50%","爆擊率 +15%"],"source":"V282 WZ"}],"小偷的狡詐":[{"level":1,"effect":"若對敵人造成異常狀態，在接下來10秒內增加3%傷害\n冷卻時間20秒","metrics":["傷害 +3%","持續 10 秒","冷卻 20 秒"],"source":"V282 WZ"},{"level":2,"effect":"若對敵人造成異常狀態，在接下來10秒內增加6%傷害\n冷卻時間20秒","metrics":["傷害 +6%","持續 10 秒","冷卻 20 秒"],"source":"V282 WZ"},{"level":3,"effect":"若對敵人造成異常狀態，在接下來10秒內增加9%傷害\n冷卻時間20秒","metrics":["傷害 +9%","持續 10 秒","冷卻 20 秒"],"source":"V282 WZ"},{"level":4,"effect":"若對敵人造成異常狀態，在接下來10秒內增加12%傷害\n冷卻時間20秒","metrics":["傷害 +12%","持續 10 秒","冷卻 20 秒"],"source":"V282 WZ"},{"level":5,"effect":"若對敵人造成異常狀態，在接下來10秒內增加15%傷害\n冷卻時間20秒","metrics":["傷害 +15%","持續 10 秒","冷卻 20 秒"],"source":"V282 WZ"},{"level":6,"effect":"若對敵人造成異常狀態，在接下來10秒內增加18%傷害\n冷卻時間20秒","metrics":["傷害 +18%","持續 10 秒","冷卻 20 秒"],"source":"V282 WZ"},{"level":7,"effect":"若對敵人造成異常狀態，在接下來10秒內增加21%傷害\n冷卻時間20秒","metrics":["傷害 +21%","持續 10 秒","冷卻 20 秒"],"source":"V282 WZ"},{"level":8,"effect":"若對敵人造成異常狀態，在接下來10秒內增加24%傷害\n冷卻時間20秒","metrics":["傷害 +24%","持續 10 秒","冷卻 20 秒"],"source":"V282 WZ"},{"level":9,"effect":"若對敵人造成異常狀態，在接下來10秒內增加27%傷害\n冷卻時間20秒","metrics":["傷害 +27%","持續 10 秒","冷卻 20 秒"],"source":"V282 WZ"}],"海盜的祝福":[{"level":1,"effect":"力量 20、敏捷 20、智力 20、幸運 20、最大HP 350、最大MP 350 增加\n所受傷害 5%減少\n冷卻時間 5秒","metrics":["全屬性 +20","HP／MP +350","受擊 -5%","冷卻 5 秒"],"source":"V282 WZ"},{"level":2,"effect":"力量 30、敏捷 30、智力 30、幸運 30、最大HP 525、最大MP 525 增加\n所受傷害 7%減少\n冷卻時間 5秒","metrics":["全屬性 +30","HP／MP +525","受擊 -7%","冷卻 5 秒"],"source":"V282 WZ"},{"level":3,"effect":"力量 40、敏捷 40、智力 40、幸運 40、最大HP 700、最大MP 700 增加\n所受傷害 9%減少\n冷卻時間 5秒","metrics":["全屬性 +40","HP／MP +700","受擊 -9%","冷卻 5 秒"],"source":"V282 WZ"},{"level":4,"effect":"力量 50、敏捷 50、智力 50、幸運 50、最大HP 875、最大MP 875 增加\n所受傷害 11%減少\n冷卻時間 5秒","metrics":["全屬性 +50","HP／MP +875","受擊 -11%","冷卻 5 秒"],"source":"V282 WZ"},{"level":5,"effect":"力量 60、敏捷 60、智力 60、幸運 60、最大HP 1050、最大MP 1050 增加\n所受傷害 13%減少\n冷卻時間 5秒","metrics":["全屬性 +60","HP／MP +1050","受擊 -13%","冷卻 5 秒"],"source":"V282 WZ"},{"level":6,"effect":"力量 70、敏捷 70、智力 70、幸運 70、最大HP 1225、最大MP 1225 增加\n所受傷害 15%減少\n冷卻時間 5秒","metrics":["全屬性 +70","HP／MP +1225","受擊 -15%","冷卻 5 秒"],"source":"V282 WZ"},{"level":7,"effect":"力量 90、敏捷 90、智力 90、幸運 90、最大HP 1400、最大MP 1400 增加\n所受傷害 17%減少\n冷卻時間 5秒","metrics":["全屬性 +90","HP／MP +1400","受擊 -17%","冷卻 5 秒"],"source":"V282 WZ"},{"level":8,"effect":"力量 110、敏捷 110、智力 110、幸運 110、最大HP 1575、最大MP 1575 增加\n所受傷害 19%減少\n冷卻時間 5秒","metrics":["全屬性 +110","HP／MP +1575","受擊 -19%","冷卻 5 秒"],"source":"V282 WZ"},{"level":9,"effect":"力量 130、敏捷 130、智力 130、幸運 130、最大HP 1750、最大MP 1750 增加\n所受傷害 21%減少\n冷卻時間 5秒","metrics":["全屬性 +130","HP／MP +1750","受擊 -21%","冷卻 5 秒"],"source":"V282 WZ"}],"西格諾斯祝福":[{"level":1,"effect":"攻擊力與魔法攻擊力增加 7、狀態異常耐性增加 1、所有屬性耐性增加 1%","metrics":["攻／魔 +7","異常耐性 +1","屬性耐性 +1%"],"source":"V282 WZ"},{"level":2,"effect":"攻擊力與魔法攻擊力增加 9、狀態異常耐性增加 3、所有屬性耐性增加 3%","metrics":["攻／魔 +9","異常耐性 +3","屬性耐性 +3%"],"source":"V282 WZ"},{"level":3,"effect":"攻擊力與魔法攻擊力增加 11、狀態異常耐性增加 4、所有屬性耐性增加 4%","metrics":["攻／魔 +11","異常耐性 +4","屬性耐性 +4%"],"source":"V282 WZ"},{"level":4,"effect":"攻擊力與魔法攻擊力增加 13、狀態異常耐性增加 6、所有屬性耐性增加 6%","metrics":["攻／魔 +13","異常耐性 +6","屬性耐性 +6%"],"source":"V282 WZ"},{"level":5,"effect":"攻擊力與魔法攻擊力增加 15、狀態異常耐性增加 7、所有屬性耐性增加 7%","metrics":["攻／魔 +15","異常耐性 +7","屬性耐性 +7%"],"source":"V282 WZ"},{"level":6,"effect":"攻擊力與魔法攻擊力增加 17、狀態異常耐性增加 9、所有屬性耐性增加 9%","metrics":["攻／魔 +17","異常耐性 +9","屬性耐性 +9%"],"source":"V282 WZ"},{"level":7,"effect":"攻擊力與魔法攻擊力增加 19、狀態異常耐性增加 10、所有屬性耐性增加 10%","metrics":["攻／魔 +19","異常耐性 +10","屬性耐性 +10%"],"source":"V282 WZ"},{"level":8,"effect":"攻擊力與魔法攻擊力增加 21、狀態異常耐性增加 12、所有屬性耐性增加 12%","metrics":["攻／魔 +21","異常耐性 +12","屬性耐性 +12%"],"source":"V282 WZ"},{"level":9,"effect":"攻擊力與魔法攻擊力增加 23、狀態異常耐性增加 13、所有屬性耐性增加 13%","metrics":["攻／魔 +23","異常耐性 +13","屬性耐性 +13%"],"source":"V282 WZ"},{"level":10,"effect":"攻擊力與魔法攻擊力增加 25、狀態異常耐性增加 15、所有屬性耐性增加 15%","metrics":["攻／魔 +25","異常耐性 +15","屬性耐性 +15%"],"source":"V282 WZ"},{"level":11,"effect":"攻擊力與魔法攻擊力增加 31、狀態異常耐性增加 16、所有屬性耐性增加 16%","metrics":["攻／魔 +31","異常耐性 +16","屬性耐性 +16%"],"source":"V282 WZ"},{"level":12,"effect":"攻擊力與魔法攻擊力增加 37、狀態異常耐性增加 18、所有屬性耐性增加 18%","metrics":["攻／魔 +37","異常耐性 +18","屬性耐性 +18%"],"source":"V282 WZ"},{"level":13,"effect":"攻擊力與魔法攻擊力增加 43、狀態異常耐性增加 19、所有屬性耐性增加 19%","metrics":["攻／魔 +43","異常耐性 +19","屬性耐性 +19%"],"source":"V282 WZ"},{"level":14,"effect":"攻擊力與魔法攻擊力增加 49、狀態異常耐性增加 21、所有屬性耐性增加 21%","metrics":["攻／魔 +49","異常耐性 +21","屬性耐性 +21%"],"source":"V282 WZ"},{"level":15,"effect":"攻擊力與魔法攻擊力增加 55、狀態異常耐性增加 22、所有屬性耐性增加 22%","metrics":["攻／魔 +55","異常耐性 +22","屬性耐性 +22%"],"source":"V282 WZ"}],"光之守護":[{"level":1,"effect":"10秒內形成護盾，最多防禦3次的傷害，傷害增加15%\n但僅限於最大HP的一定比例所給予傷害的攻擊會減少10%\n冷卻時間:120秒","metrics":["護盾 10 秒","最多 3 次","傷害 +15%","比例傷害 -10%","冷卻 120 秒"],"source":"V282 WZ"},{"level":2,"effect":"20秒內形成護盾，最多防禦6次的傷害，傷害增加20%\n但僅限於最大HP的一定比例所給予傷害的攻擊會減少20%\n冷卻時間:120秒","metrics":["護盾 20 秒","最多 6 次","傷害 +20%","比例傷害 -20%","冷卻 120 秒"],"source":"V282 WZ"},{"level":3,"effect":"30秒內生成護盾，可抵擋最多9次傷害，傷害增加25%\n但僅對按最大HP一定比例造成傷害的攻擊，所受傷害減少30%\n冷卻時間120秒\n[被動效果：傷害增加3%]","metrics":["護盾 30 秒","最多 9 次","傷害 +25%","比例傷害 -30%","冷卻 120 秒","被動傷害 +3%"],"source":"V282 WZ"}],"自由精神":[{"level":1,"effect":"復活時進入無敵狀態1秒，切換地圖時解除","metrics":["復活無敵 1 秒","切換地圖解除"],"source":"V282 WZ"},{"level":2,"effect":"復活時進入無敵狀態2秒，切換地圖時解除","metrics":["復活無敵 2 秒","切換地圖解除"],"source":"V282 WZ"},{"level":3,"effect":"復活時進入無敵狀態3秒，切換地圖時解除","metrics":["復活無敵 3 秒","切換地圖解除"],"source":"V282 WZ"},{"level":4,"effect":"復活時進入無敵狀態4秒，切換地圖時解除","metrics":["復活無敵 4 秒","切換地圖解除"],"source":"V282 WZ"},{"level":5,"effect":"復活時進入無敵狀態5秒，切換地圖時解除","metrics":["復活無敵 5 秒","切換地圖解除"],"source":"V282 WZ"},{"level":6,"effect":"復活時進入無敵狀態6秒，切換地圖時解除","metrics":["復活無敵 6 秒","切換地圖解除"],"source":"V282 WZ"},{"level":7,"effect":"復活時進入無敵狀態7秒，切換地圖時解除","metrics":["復活無敵 7 秒","切換地圖解除"],"source":"V282 WZ"},{"level":8,"effect":"復活時進入無敵狀態8秒，切換地圖時解除","metrics":["復活無敵 8 秒","切換地圖解除"],"source":"V282 WZ"},{"level":9,"effect":"復活時在9秒內為無敵狀態，移動地圖時解除\n[被動效果：傷害增加2%]","metrics":["復活無敵 9 秒","切換地圖解除"],"source":"V282 WZ"},{"level":10,"effect":"復活時在10秒內為無敵狀態，移動地圖時解除\n[被動效果：傷害增加3%]","metrics":["復活無敵 10 秒","切換地圖解除"],"source":"V282 WZ"},{"level":11,"effect":"復活時在11秒內為無敵狀態，移動地圖時解除\n[被動效果：傷害增加4%]","metrics":["復活無敵 11 秒","切換地圖解除"],"source":"V282 WZ"},{"level":12,"effect":"復活時在12秒內為無敵狀態，移動地圖時解除\n[被動效果：傷害增加5%]","metrics":["復活無敵 12 秒","切換地圖解除"],"source":"V282 WZ"}],"惡魔之怒":[{"level":1,"effect":"攻擊BOSS怪物時，傷害增加10%、吸收10的力量。","metrics":["BOSS 傷害 +10%","吸收精氣 10 點"],"source":"V282 WZ"},{"level":2,"effect":"攻擊BOSS怪物時，傷害增加15%、吸收10的力量。","metrics":["BOSS 傷害 +15%","吸收精氣 10 點"],"source":"V282 WZ"},{"level":3,"effect":"攻擊BOSS怪物時，傷害增加20%、吸收10的力量。","metrics":["BOSS 傷害 +20%","吸收精氣 10 點"],"source":"V282 WZ"}],"狂暴鬥氣":[{"level":1,"effect":"傷害 5% 增加","metrics":["傷害 +5%"],"source":"V282 WZ"},{"level":2,"effect":"傷害 10% 增加","metrics":["傷害 +10%"],"source":"V282 WZ"},{"level":3,"effect":"傷害 15% 增加","metrics":["傷害 +15%"],"source":"V282 WZ"}],"合成邏輯":[{"level":1,"effect":"增加所有能力值5%","metrics":["全屬性 +5%"],"source":"V282 WZ"},{"level":2,"effect":"增加所有能力值10%","metrics":["全屬性 +10%"],"source":"V282 WZ"},{"level":3,"effect":"增加所有能力值15%","metrics":["全屬性 +15%"],"source":"V282 WZ"}],"連續擊殺優勢":[{"level":1,"effect":"永久增加連續擊殺珠子經驗值獲得量400%","metrics":["擊殺珠 EXP +400%"],"source":"V282 WZ"},{"level":2,"effect":"永久增加連續擊殺珠子經驗值獲得量650%","metrics":["擊殺珠 EXP +650%"],"source":"V282 WZ"},{"level":3,"effect":"永久增加連續擊殺珠子經驗值獲得量900%，傷害增加5%","metrics":["擊殺珠 EXP +900%"],"source":"V282 WZ"}],"輪之堅持":[{"level":1,"effect":"解放的輪之力有效時間增加30%。","metrics":["符文效果時間 +30%"],"source":"V282 WZ"},{"level":2,"effect":"解放的輪之力有效時間增加50%。","metrics":["符文效果時間 +50%"],"source":"V282 WZ"},{"level":3,"effect":"解放的輪之力持續時間增加70%，傷害增加5%","metrics":["符文效果時間 +70%"],"source":"V282 WZ"}],"精靈的祝福":[{"level":1,"effect":"使用時返回櫻花處\n冷卻時間600秒\n[被動效果：經驗值獲得量增加10%]","metrics":["經驗值 +10%","移動消耗 MP 30","冷卻 600 秒"],"source":"V282 WZ"},{"level":2,"effect":"使用時返回櫻花處\n冷卻時間600秒\n[被動效果：經驗值獲得量增加15%]","metrics":["經驗值 +15%","移動消耗 MP 30","冷卻 600 秒"],"source":"V282 WZ"},{"level":3,"effect":"使用時返回櫻花處\n冷卻時間600秒\n[被動效果：經驗值獲得量增加20%、傷害增加5%]","metrics":["經驗值 +20%","移動消耗 MP 30","冷卻 600 秒"],"source":"V282 WZ"}],"致命本能":[{"level":1,"effect":"爆擊機率增加 10% ","metrics":["爆擊率 +10%"],"source":"V282 WZ"},{"level":2,"effect":"爆擊機率增加 15% ","metrics":["爆擊率 +15%"],"source":"V282 WZ"},{"level":3,"effect":"爆擊機率增加20%、傷害增加5%","metrics":["爆擊率 +20%"],"source":"V282 WZ"}],"滲透":[{"level":1,"effect":"無視防禦率增加10%","metrics":["無視防禦 +10%"],"source":"V282 WZ"},{"level":2,"effect":"無視防禦率增加15%","metrics":["無視防禦 +15%"],"source":"V282 WZ"},{"level":3,"effect":"增加20%無視防禦率、4%傷害","metrics":["無視防禦 +20%"],"source":"V282 WZ"}],"死裡逃生":[{"level":1,"effect":"受到致死攻擊時,有5%機率生存","metrics":["致死攻擊存活率 5%"],"source":"V282 WZ"},{"level":2,"effect":"受到致死攻擊時,有10%機率生存","metrics":["致死攻擊存活率 10%"],"source":"V282 WZ"},{"level":3,"effect":"受到致死攻擊時，以15%機率存活\n[被動效果：傷害增加5%]","metrics":["致死攻擊存活率 15%"],"source":"V282 WZ"}],"鋼鐵意志":[{"level":1,"effect":"HP提升5%、龍能球量條各階段增加傷害2%","metrics":["自身 HP +5%","變身傷害 +2%"],"source":"V282 WZ"},{"level":2,"effect":"HP提升10%、龍能球量條各階段增加傷害3%","metrics":["自身 HP +10%","變身傷害 +3%"],"source":"V282 WZ"},{"level":3,"effect":"HP提升15%、龍能球量條各階段增加傷害5%","metrics":["自身 HP +15%","變身傷害 +5%"],"source":"V282 WZ"}],"事前準備":[{"level":1,"effect":"解決敵人8名，或攻擊BOSS怪物5次時，完成事前準備1次，完成5次事前準備時，連續20秒傷害增加9%。\n冷卻時間40秒","metrics":["傷害 +9%","需 5 層","持續 20 秒","冷卻 40 秒"],"source":"V282 WZ"},{"level":2,"effect":"解決敵人8名，或攻擊BOSS怪物5次時，完成事前準備1次，完成5次事前準備時，連續20秒傷害增加17%。\n冷卻時間40秒","metrics":["傷害 +17%","需 5 層","持續 20 秒","冷卻 40 秒"],"source":"V282 WZ"},{"level":3,"effect":"解決敵人8名，或攻擊BOSS怪物5次時，完成事前準備1次，完成5次事前準備時，連續20秒傷害增加25%。\n冷卻時間40秒","metrics":["傷害 +25%","需 5 層","持續 20 秒","冷卻 40 秒"],"source":"V282 WZ"}],"集中狂攻":[{"level":1,"effect":"攻擊比角色等級低的怪物時傷害增加3%，攻擊狀態異常的怪物時傷害增加3%","metrics":["低等怪 +3%","異常敵人 +3%"],"source":"V282 WZ"},{"level":2,"effect":"攻擊比角色等級低的怪物時傷害增加6%，攻擊狀態異常的怪物時傷害增加6%","metrics":["低等怪 +6%","異常敵人 +6%"],"source":"V282 WZ"},{"level":3,"effect":"攻擊比角色等級低的怪物時傷害增加9%，攻擊狀態異常的怪物時傷害增加9%","metrics":["低等怪 +9%","異常敵人 +9%"],"source":"V282 WZ"}],"靈魂契約":[{"level":1,"effect":"消耗MP 30，10秒間傷害增加60%\n以連結技能使用時，效果減少一半\n冷卻時間90秒","metrics":["自身傷害 +60%","傳授連結技能傷害 +30%","持續 10 秒","冷卻 90 秒"],"source":"V282 WZ"},{"level":2,"effect":"消耗MP 30，10秒間傷害增加90%\n以連結技能使用時，效果減少一半\n冷卻時間60秒","metrics":["自身傷害 +90%","傳授連結技能傷害 +45%","持續 10 秒","冷卻 60 秒"],"source":"V282 WZ"},{"level":3,"effect":"消耗MP 30，10秒間傷害增加120%\n以連結技能使用時，效果減少一半\n冷卻時間60秒","metrics":["自身傷害 +120%","傳授連結技能傷害 +60%","持續 10 秒","冷卻 60 秒"],"source":"V282 WZ"}],"貴族":[{"level":1,"effect":"攻擊BOSS怪物時傷害增加2%\n包含自己在內，讓相同地圖中的每1名隊員 傷害增加1%，最多增加4%\n未組隊時，視為只有自己組隊。","metrics":["BOSS 傷害 +2%","每位隊員 +1%","最多 4 人"],"source":"V282 WZ"},{"level":2,"effect":"攻擊BOSS怪物時傷害增加4%\n包含自己在內，讓相同地圖中的每1名隊員 傷害增加2%，最多增加8%\n未組隊時，視為只有自己組隊。","metrics":["BOSS 傷害 +4%","每位隊員 +2%","最多 4 人"],"source":"V282 WZ"},{"level":3,"effect":"攻擊BOSS怪物時傷害增加6%\n包含自己在內，讓相同地圖中的每1名隊員 傷害增加3%，最多增加12%\n未組隊時，視為只有自己組隊。","metrics":["BOSS 傷害 +6%","每位隊員 +3%","最多 4 人"],"source":"V282 WZ"}],"戰鬥的流動":[{"level":1,"effect":"移動一定距離時發動，最多可重疊4次，持續時間25秒\n，各重疊的傷害增加2%\n以連結技能使用時，持續時間減少至10秒","metrics":["每層傷害 +2%","最多 4 層","自身 25 秒","傳授連結技能 10 秒"],"source":"V282 WZ"},{"level":2,"effect":"移動一定距離時發動，最多可重疊4次，持續時間25秒\n，各重疊的傷害增加3%\n以連結技能使用時，持續時間減少至10秒","metrics":["每層傷害 +3%","最多 4 層","自身 25 秒","傳授連結技能 10 秒"],"source":"V282 WZ"},{"level":3,"effect":"移動一定距離時發動，最多可重疊4次，持續時間25秒\n，各重疊的傷害增加4%\n以連結技能使用時，持續時間減少至10秒","metrics":["每層傷害 +4%","最多 4 層","自身 25 秒","傳授連結技能 10 秒"],"source":"V282 WZ"}],"天賦":[{"level":1,"effect":"傷害增加3%\n攻擊時，以100%的機率在5秒間，每秒最多恢復HP/MP的1% \n冷卻時間為30秒","metrics":["自身傷害 +3%","每秒恢復 1%","持續 5 秒","冷卻 30 秒"],"source":"V282 WZ"},{"level":2,"effect":"傷害增加5%\n攻擊時，以100%的機率在5秒間，每秒最多恢復HP/MP的2% \n冷卻時間為30秒","metrics":["自身傷害 +5%","每秒恢復 2%","持續 5 秒","冷卻 30 秒"],"source":"V282 WZ"},{"level":3,"effect":"傷害增加10%\n攻擊時，以100%的機率在5秒間，每秒最多恢復HP/MP的3% \n冷卻時間為30秒","metrics":["自身傷害 +10%","每秒恢復 3%","持續 5 秒","冷卻 30 秒"],"source":"V282 WZ"}],"無我":[{"level":1,"effect":"戰鬥狀態若持續 5秒就會發動，最多可重疊 5次，持續時間 5秒。\n發動時傷害增加 1%，每重疊傷害追加增加 1%","metrics":["每層傷害 +1%","最多 5 層","持續 5 秒"],"source":"V282 WZ"},{"level":2,"effect":"戰鬥狀態若持續 5秒就會發動，最多可重疊 5次，持續時間 5秒。\n發動時傷害增加 1%，每重疊傷害追加增加 2%","metrics":["每層傷害 +2%","最多 5 層","持續 5 秒"],"source":"V282 WZ"},{"level":3,"effect":"戰鬥狀態若持續 5秒就會發動，最多可重疊 5次，持續時間 5秒。\n發動時傷害增加 1%，每重疊傷害追加增加 3%","metrics":["每層傷害 +3%","最多 5 層","持續 5 秒"],"source":"V282 WZ"}],"護體":[{"level":1,"effect":"包含依最大HP比例造成傷害的攻擊在內，所受傷害2%減少","metrics":["受擊傷害 -2%"],"source":"V282 WZ"},{"level":2,"effect":"包含依最大HP比例造成傷害的攻擊在內，所受傷害4%減少","metrics":["受擊傷害 -4%"],"source":"V282 WZ"},{"level":3,"effect":"包含依最大HP比例造成傷害的攻擊在內，所受傷害6%減少，傷害增加5%","metrics":["受擊傷害 -6%"],"source":"V282 WZ"}],"大自然夥伴":[{"level":1,"effect":"傷害提升3%，\n擊退一般怪物20隻後發動大自然的幫助，大自然的幫助發動時30秒間攻擊一般怪物傷害增加7%，\n冷卻時間30秒","metrics":["自身傷害 +3%","一般怪 +7%","持續 30 秒","冷卻 30 秒"],"source":"V282 WZ"},{"level":2,"effect":"傷害提升5%，\n擊退一般怪物20隻後發動大自然的幫助，大自然的幫助發動時30秒間攻擊一般怪物傷害增加11%，\n冷卻時間30秒","metrics":["自身傷害 +5%","一般怪 +11%","持續 30 秒","冷卻 30 秒"],"source":"V282 WZ"},{"level":3,"effect":"傷害提升10%，\n擊退一般怪物20隻後發動大自然的幫助，大自然的幫助發動時30秒間攻擊一般怪物傷害增加15%，\n冷卻時間30秒","metrics":["自身傷害 +10%","一般怪 +15%","持續 30 秒","冷卻 30 秒"],"source":"V282 WZ"}],"自信心":[{"level":1,"effect":"無視防禦率增加5%，攻擊HP為100%的怪物時傷害增加9%","metrics":["無視防禦 +5%","滿血怪傷害 +9%"],"source":"V282 WZ"},{"level":2,"effect":"無視防禦率增加10%，攻擊HP為100%的怪物時傷害增加14%","metrics":["無視防禦 +10%","滿血怪傷害 +14%"],"source":"V282 WZ"},{"level":3,"effect":"無視防禦率15%、傷害增加4%，攻擊HP為100%的怪物時傷害增加19%","metrics":["無視防禦 +15%","滿血怪傷害 +19%"],"source":"V282 WZ"}],"時之祝福":[{"level":1,"effect":"所受傷害減少3%，無視防禦率增加2%。","metrics":["受擊傷害 -3%","無視防禦 +2%"],"source":"指定網站"},{"level":2,"effect":"所受傷害減少6%，無視防禦率增加4%。","metrics":["受擊傷害 -6%","無視防禦 +4%"],"source":"指定網站"},{"level":3,"effect":"所受傷害減少9%，無視防禦率增加6%。","metrics":["受擊傷害 -9%","無視防禦 +6%"],"source":"指定網站"},{"level":4,"effect":"所受傷害減少12%，無視防禦率增加8%。","metrics":["受擊傷害 -12%","無視防禦 +8%"],"source":"指定網站"},{"level":5,"effect":"所受傷害減少15%，無視防禦率增加10%。","metrics":["受擊傷害 -15%","無視防禦 +10%"],"source":"指定網站"},{"level":6,"effect":"所受傷害減少20%，無視防禦率增加15%。","metrics":["受擊傷害 -20%","無視防禦 +15%"],"source":"指定網站"}],"判斷":[{"level":1,"effect":" 爆擊 傷害 2% 增加","metrics":["爆擊傷害 +2%"],"source":"V282 WZ"},{"level":2,"effect":" 爆擊 傷害 4% 增加","metrics":["爆擊傷害 +4%"],"source":"V282 WZ"},{"level":3,"effect":" 爆擊 傷害 6% 增加","metrics":["爆擊傷害 +6%"],"source":"V282 WZ"}]};

  // 與 V5.5 高級共用技能表合計 34 種，每個技能等級必須各有一筆。
  // 自用/傳授連結技能效果在詳細表與快捷按鈕一致化；不影響職業分類、卡片或聯盟戰地數值。
  const auditedTransfers={
    '氣魄':'BOSS 傷害 +4%；每次成功攻擊 BOSS 額外增加 3% 傷害，最多累積 6 層，每 2 秒最多觸發 1 次，持續 5 秒。',
    '精靈集中':'BOSS 傷害 +11%、爆擊率 +10%、最大 HP／MP +5%。',
    '靈魂契約':'消耗 MP 30；傷害 +60%，持續 10 秒，冷卻 60 秒（傳授連結技能效果為自身 Lv.3 的一半）。',
    '戰鬥的流動':'移動達指定距離後，每層傷害 +4%，最多 4 層；使用傳授連結技能時持續 10 秒（自身為 25 秒）。',
    '光之守護':'異常狀態耐性 +100，持續 20 秒；冷卻 120 秒（自身使用為護盾效果）。',
    '鋼鐵意志':'最大 HP +20%（傳授連結技能效果；狂龍戰士自身 Lv.3 為 HP +15%，另有變身傷害）。',
    '天賦':'傷害 +7%；攻擊時在 5 秒內每秒恢復最大 HP／MP 的 3%，冷卻 30 秒。',
    '大自然夥伴':'永久傷害 +7%；擊敗 20 隻一般怪物後，對一般怪物傷害再 +15%，持續 30 秒，冷卻 30 秒。',
    '海盜的祝福':'全屬性各 +100、最大 HP／MP 各 +1750、所受傷害減少 21%，冷卻時間 5 秒（多多谷遊戲內傳授連結技能截圖已確認）。',
    '西格諾斯祝福':'最高等級作為傳授連結技能使用時攻擊力／魔法攻擊力 +35，異常狀態耐性 +22、所有屬性耐性 +22%。',
    '不屈的信念':'最高等級作為傳授連結技能使用時 HP 低於 15% 自動觸發，持續 3 秒，每秒恢復最大 HP 44%，冷卻 150 秒（不含自身額外傷害）。',
    '探險家的好奇心':'最高等級作為傳授連結技能使用時怪物收藏登錄機率 +50%、爆擊率 +15%（不含自身額外傷害）。',
    '自由精神':'最高等級作為傳授連結技能使用時復活後獲得 12 秒無敵；更換地圖時提前解除（不含自身額外傷害）。',
    '時之祝福':'最高等級所受傷害減少 20%、無視防禦率增加 15%（依指定網站等級表）。',
    '連續擊殺優勢':'使用傳授連結技能時 Combo 擊殺珠經驗值 +900%（不含戰神自身永久傷害）。',
    '輪之堅持':'使用傳授連結技能時符文解放持續時間 +70%（不含龍魔導士自身永久傷害）。',
    '精靈的祝福':'使用傳授連結技能時打怪經驗值 +20%；可消耗 MP 30 使用返回精靈故鄉功能，冷卻 600 秒。',
    '致命本能':'使用傳授連結技能時爆擊率 +20%（不含幻影自身額外傷害）。',
    '滲透':'使用傳授連結技能時無視敵人防禦率 +20%（不含夜光自身額外傷害）。',
    '死裡逃生':'使用傳授連結技能時有 15% 機率抵擋致死攻擊（不含隱月自身額外傷害）。',
    '護體':'使用傳授連結技能時受擊傷害降低 6%，包含按最大 HP 比例造成的傷害。',
    '自信心':'使用傳授連結技能時無視防禦 +15%，對 HP 全滿的怪物傷害 +19%（不含虎影自身額外傷害）。'
  };
  // 其他 12 種技能的最高傳授連結技能效果與其最高自身等級相同，無須額外換算。
  for(const [name,skill] of Object.entries(data.skills)){
    const rows=wzOfficialLevelRows[name]||auditedThreeLevelRows[name]||expandedSkillLevelRows[name];
    if(!rows||rows.length!==verifiedSkillDetails[name]?.maxLevel){throw new Error('技能逐級資料不完整：'+name);}
    // 注意：共用技能的 Lv.1、Lv.2、Lv.3 是真正的技能級別，非以前的多職業混合摘要。
    const transfer=auditedTransfers[name]||rows[rows.length-1].effect;
    skill.levels=[...rows.slice(0,3).map(row=>({label:'Lv.'+row.level,effect:row.effect})),{label:'傳授連結技能',effect:transfer}];
    skill.levelNote=`可比較 Lv.1～Lv.${verifiedSkillDetails[name].maxLevel} 的技能效果；「傳授連結技能」顯示提供給其他角色時的效果。完整資料可點擊「完整等級表」。`;
    // 對存在跨版或自身／傳授連結技能來源差異的項目標示出處，不把推測寫成已確認的遊戲數值。
    if(name==='氣魄')skill.levelNote+=' 多多谷遊戲內自身 Lv.3 與傳授連結技能 Lv.3 截圖已確認 BOSS 基礎傷害 +4%、每層 +3%。';
    if(name==='海盜的祝福')skill.levelNote+=' 多多谷遊戲內截圖已確認：自身全屬性 +130、傳授連結技能全屬性 +100；兩者最大 HP／MP 均 +1750、所受傷害減少 21%。';
    if(name==='實戰的知識')skill.levelNote+=' 多多谷遊戲內自身與傳授連結技能 Lv.9 均為 31% 機率掌握弱點，每層傷害及無視防禦率 +5%，持續 10 秒、最多 3 層。';
    if(name==='精靈集中')skill.levelNote+=' Lv.3 依多多谷實際遊戲截圖，不以 WZ 節點的 Lv.2 上限取代。';
    if(name==='時之祝福')skill.levelNote+=' 各級所受傷害與無視防禦依指定網站資料表，不把額外傷害效果混入傳授連結技能。';
  }
  // 校正高級共用技能表：附帶的自身永久效果不可錯算為傳授連結技能加成。
  for(const [name,rows] of Object.entries({
    '不屈的信念':expandedSkillLevelRows['不屈的信念'],
    '探險家的好奇心':expandedSkillLevelRows['探險家的好奇心'],
    '自由精神':expandedSkillLevelRows['自由精神']
  })){
    for(const row of rows){if(row.level>= (name==='自由精神'?9:7)){
      const bonus=name==='自由精神'?[2,3,4,5][row.level-9]:[2,4,6][row.level-7];
      row.effect+=` 此等級另有職業自身永久傷害 +${bonus}%，不適用於傳授連結技能。`;
    }}
  }
  const cleanFullEffect=text=>String(text||'').replace(/^(?:高階)?(?:自用|傳授連結技能)(?:時|[：:])?\s*/,'').replace(/^相同(?:發動)?條件下[，,]?\s*/,'在相同條件下，');
  const skillDetailRows=skill=>{
    if(wzOfficialLevelRows[skill.name])return wzOfficialLevelRows[skill.name];
    if(auditedThreeLevelRows[skill.name])return auditedThreeLevelRows[skill.name];
    if(expandedSkillLevelRows[skill.name])return expandedSkillLevelRows[skill.name];
    if(fullThreeLevelRows[skill.name])return fullThreeLevelRows[skill.name];
    // 一般三等級技能：V5 所有 Lv.1／Lv.2／Lv.3 資料已有逐階敘述，不以公式猜測。
    const rows=(skill.levels||[]).slice(0,3).filter(row=>row&&row.effect);
    return rows.map((row,i)=>({level:i+1,effect:cleanFullEffect(row.effect),metrics:
      [...new Set((String(row.effect).match(/[+−-]?\d+(?:\.\d+)?\s*%|\d+\s*秒|\d+\s*層|\d+\s*次/g)||[]))].slice(0,4).map(x=>x.replace(/\s+/g,' '))}));
  };
  const skillLevelTable=skill=>{
    const rows=skillDetailRows(skill);
    const max=verifiedSkillDetails[skill.name]?.maxLevel||rows.length;
    const valid=rows.length===max;
    const head=`<div class="skill-full-level-heading"><strong>各等級詳細效果</strong><span>Lv.1～Lv.${max}</span></div>`;
    if(!valid)return head+`<p class="skill-full-level-unverified">尚未取得全部等級的確定數值，暫不顯示不完整等級表。</p>`;
    const table=`<div class="skill-full-level-table" role="table" aria-label="${escapeHtml(skill.name)}各等級效果"><div class="skill-full-row skill-full-head" role="row"><div role="columnheader">等級</div><div role="columnheader">等級效果</div><div role="columnheader">關鍵數值</div></div>${rows.map(row=>`<div class="skill-full-row" role="row"><div role="cell" class="skill-full-lv">Lv.${row.level}</div><div role="cell" class="skill-full-effect">${escapeHtml(row.effect).replace(/\n/g,'<br>')}</div><div role="cell" class="skill-full-metrics">${(row.metrics||[]).map(x=>`<span>${escapeHtml(x)}</span>`).join('')}</div></div>`).join('')}</div>`;
    // 表格中 Lv.3 是職業本身效果；技能可使用傳授連結技能時沿用 V5 獨立確定的傳授連結技能效果，避免混淆。
    const self=String(rows[rows.length-1]?.effect||'');
    const passed=String(skill.levels?.[3]?.effect||'');
    const difference=Object.prototype.hasOwnProperty.call(auditedTransfers,skill.name) && !['精靈集中','氣魄','時之祝福'].includes(skill.name) && cleanFullEffect(self)!==cleanFullEffect(passed);
    const transfer=difference?`<div class="skill-full-transfer"><strong>最高等級傳授連結技能效果（與自身效果不同）</strong><p>${escapeHtml(cleanFullEffect(passed))}</p></div>`:'';
    return head+table+transfer;
  };

  // 等級與傳授連結技能選項已在按鈕上標示；說明文字只顯示效果本身，不更改任何數值。
  const displaySkillEffect=effect=>String(effect??'').replace(/^(?:高階)?(?:自用|傳授連結技能)(?:時)?[：:]?\s*/, '');
  const normalized=str=>String(str??'').toLocaleLowerCase('zh-Hant').replace(/\s+/g,'');
  let lastFocus=null;
  let browseScrollY=0;
  const rememberedLevels=new Map();
  const copyText=async value=>{
    if(navigator.clipboard?.writeText && window.isSecureContext){await navigator.clipboard.writeText(value);return;}
    const input=document.createElement('textarea');input.value=value;input.setAttribute('readonly','');input.style.cssText='position:fixed;left:-9999px;top:0;opacity:0';document.body.append(input);input.select();
    try{if(!document.execCommand('copy'))throw new Error('copy failed');}finally{input.remove();}
  };
  let activeTooltipController=null;
  byId('seriesTotal').textContent=data.series.length;
  byId('jobTotal').textContent=data.jobs.length;
  byId('skillTotal').textContent=Object.keys(data.skills).length;
  const chip=document.querySelector('.test-chip');if(chip&&chip.lastChild?.nodeType===3)chip.lastChild.textContent=' 獨立測試版 V6.5';
  const hint=document.querySelector('.section-hint');if(hint)hint.textContent='相同傳授連結技能合併顯示；S、SS、SSS 可一鍵切換，各職業效果仍獨立。';
  const heroDesc=document.querySelector('.hero-desc');if(heroDesc)heroDesc.textContent='從冒險家到江湖、超越者，快速查找各職業 S／SS／SSS 角色卡能力，以及對應的傳授連結技能。';
  const types=[...new Set(data.jobs.map(j=>j.type))];
  types.forEach(type=>{const option=document.createElement('option');option.value=type;option.textContent=type;byId('typeSelect').append(option);});
  const seriesTabs=byId('seriesTabs');
  // 在 V3 現有的篩選面板下方加入全域戰地等級切換，不更動既有 HTML 結構。
  const rankToolbar=document.createElement('div');
  rankToolbar.className='union-rank-toolbar';
  rankToolbar.innerHTML=`<div class="union-rank-description"><strong>角色卡</strong><span>選擇顯示等級 · 一般 S Lv.140／SS Lv.200／SSS Lv.250（神之子 S 為 Lv.180）</span></div><div class="union-rank-actions" role="group" aria-label="角色卡等級"><button type="button" data-union-rank="S" aria-pressed="false">S</button><button type="button" data-union-rank="SS" aria-pressed="false">SS</button><button type="button" data-union-rank="SSS" aria-pressed="true" class="active">SSS</button></div>`;
  document.querySelector('.filter-panel').insertAdjacentElement('afterend',rankToolbar);
  // V6.1：原位切換保留；捲過控制列後只浮動小型 S／SS／SSS 切換器。
  // 兩組都控制同一個 state.rank，避免外頁與內頁顯示不同等級。
  const floatingRank=document.createElement('div');
  floatingRank.className='union-rank-floating';
  floatingRank.hidden=true;
  floatingRank.setAttribute('aria-label','浮動角色卡等級切換');
  floatingRank.innerHTML=`<span class="union-floating-label">角色卡</span><div class="union-rank-actions" role="group" aria-label="浮動角色卡等級"><button type="button" data-union-rank="S" aria-pressed="false">S</button><button type="button" data-union-rank="SS" aria-pressed="false">SS</button><button type="button" data-union-rank="SSS" aria-pressed="true" class="active">SSS</button></div>`;
  document.body.append(floatingRank);
  function updateFloatingRank(){
    const dialog=byId('jobDialog');
    floatingRank.hidden=!(rankToolbar.getBoundingClientRect().bottom<=0 && !dialog?.open);
  }
  let rankScrollQueued=false;
  window.addEventListener('scroll',()=>{
    if(rankScrollQueued)return;
    rankScrollQueued=true;
    requestAnimationFrame(()=>{rankScrollQueued=false;updateFloatingRank();});
  },{passive:true});
  window.addEventListener('resize',updateFloatingRank,{passive:true});
  byId('jobDialog').addEventListener('close',()=>{updateFloatingRank();requestAnimationFrame(updateFloatingRank);});
  floatingRank.addEventListener('click',e=>{
    const button=e.target.closest('[data-union-rank]');
    if(button)setUnionRank(button.dataset.unionRank);
  });
  function refreshUnionRank(){
    document.querySelectorAll('[data-union-job]').forEach(el=>{
      const job=data.jobs.find(j=>String(j.id)===el.dataset.unionJob);
      if(job)el.textContent=unionStat(job);
    });
    document.querySelectorAll('[data-union-label]').forEach(el=>{el.textContent=state.rank+' 角色卡';});
    document.querySelectorAll('[data-dialog-union-title]').forEach(el=>{el.textContent=el.dataset.dialogUnionTitle==='multiple'?'各職業獨立的角色卡 · '+state.rank+' 效果':'角色卡 · '+state.rank+' 效果';});
    document.querySelectorAll('[data-union-rank]').forEach(el=>{
      const active=el.dataset.unionRank===state.rank;
      el.classList.toggle('active',active);
      el.setAttribute('aria-pressed',String(active));
    });
  }
  function setUnionRank(rank){
    if(!Object.prototype.hasOwnProperty.call(rankLabels,rank))return;
    state.rank=rank;
    refreshUnionRank();
  }
  rankToolbar.addEventListener('click',e=>{
    const button=e.target.closest('[data-union-rank]');
    if(button)setUnionRank(button.dataset.unionRank);
  });

  // 共用技能僅限原本同系列：完整保留 ZIP 的 12 大系列，避免跨系列誤合併。
  const allGroups=[];const groupByKey=new Map();
  data.jobs.forEach(job=>{
    const key=JSON.stringify([job.series,job.skill]);
    let group=groupByKey.get(key);
    if(!group){group={id:'group'+allGroups.length,series:job.series,skill:job.skill,jobs:[]};groupByKey.set(key,group);allGroups.push(group);}
    group.jobs.push(job);
  });
  const groupById=new Map(allGroups.map(group=>[group.id,group]));
  const sharedCount=allGroups.filter(g=>g.jobs.length>1).length;
  const groupedJobs=allGroups.filter(g=>g.jobs.length>1).reduce((n,g)=>n+g.jobs.length,0);
  function renderTabs(){
    const families=[{name:'全部系列',value:'',count:data.jobs.length},...data.series.map(name=>({name,value:name,count:data.jobs.filter(j=>j.series===name).length}))];
    seriesTabs.innerHTML=families.map(item=>`<button type="button" class="series-tab ${item.value===state.series?'active':''}" data-series="${escapeHtml(item.value)}" aria-pressed="${item.value===state.series}">${escapeHtml(item.name)} <em>${item.count}</em></button>`).join('');
  }
  function matchJob(job){
    const skill=skillFor(job);
    if(state.series && job.series!==state.series)return false;
    if(state.type && job.type!==state.type)return false;
    const haystack=normalized([job.name,job.series,job.type,job.sss,skill?.name,skill?.summary,skill?.description].join(' '));
    if(state.search && !haystack.includes(normalized(state.search)))return false;
    if(state.trait && !haystack.includes(normalized(state.trait)))return false;
    return true;
  }
  function jobCard(job,group){
    const skill=skillFor(job);const typeIcon=data.typeIcons[job.type];
    return `<button type="button" class="job-card solo-card-tile" data-groupid="${group.id}" aria-label="查看${escapeHtml(job.name)}的角色卡與傳授連結技能">
      <img class="solo-banner" src="${escapeHtml(job.image)}" alt="${escapeHtml(job.name)}職業卡片" width="152" height="74" loading="lazy" decoding="async">
      <strong class="solo-member-name">${escapeHtml(job.name)}</strong>
      <span class="solo-member-type">${escapeHtml(job.series)} <span>·</span> <img src="${escapeHtml(typeIcon)}" alt="" width="14" height="14">${escapeHtml(job.type)}</span>
      <div class="solo-member-stat"><span data-union-label>${state.rank} 角色卡</span><b data-union-job="${escapeHtml(job.id)}">${escapeHtml(unionStat(job))}</b></div>
      <div class="solo-skill"><img src="${escapeHtml(skill.image)}" alt="" width="26" height="26" loading="lazy"><div><span>傳授連結技能</span><strong>${escapeHtml(skill.name)}</strong></div></div>
      <p class="solo-skill-summary">${escapeHtml(skill.summary)}</p>
      <div class="solo-view-more"><span>查看完整技能說明</span><span aria-hidden="true">↗</span></div>
    </button>`;
  }
  function memberTile(job){
    const icon=data.typeIcons[job.type];
    return `<div class="shared-member">
      <img class="shared-banner" src="${escapeHtml(job.image)}" alt="${escapeHtml(job.name)}職業卡片" width="152" height="74" loading="lazy" decoding="async">
      <strong class="shared-member-name">${escapeHtml(job.name)}</strong>
      <span class="shared-member-type"><img src="${escapeHtml(icon)}" alt="" width="14" height="14">${escapeHtml(job.type)}</span>
      <div class="shared-member-stat"><span data-union-label>${state.rank} 角色卡</span><b data-union-job="${escapeHtml(job.id)}">${escapeHtml(unionStat(job))}</b></div>
    </div>`;
  }
  function sharedCard(group){
    const skill=skillFor(group.jobs[0]);
    return `<button type="button" class="job-card shared-card" data-groupid="${group.id}" aria-label="查看${escapeHtml(group.jobs.map(j=>j.name).join('、'))}共用的${escapeHtml(skill.name)}與各自角色卡效果">
      <div class="shared-head"><div><div class="shared-eyebrow">${escapeHtml(group.series)} <span>·</span> 共用傳授連結技能</div><strong class="shared-heading">${escapeHtml(skill.name)}</strong></div><span class="shared-count">${group.jobs.length} 個職業</span></div>
      <div class="shared-roster">${group.jobs.map(memberTile).join('')}</div>
      <div class="shared-skill"><img class="skill-icon" src="${escapeHtml(skill.image)}" alt="" width="32" height="32" loading="lazy"><div><span>共同傳授連結技能</span><strong>${escapeHtml(skill.name)}</strong><p>${escapeHtml(skill.summary)}</p></div></div>
      <div class="card-footer"><span>查看全部職業角色卡與完整技能說明</span><span class="arrow" aria-hidden="true">↗</span></div>
    </button>`;
  }
  function render(){
    renderTabs();const matched=data.jobs.filter(matchJob);
    const matchingIds=new Set(matched.map(j=>j.id));
    // 符合篩選的任一職業會顯示完整共用技能卡，方便比較同行職業的獨立 SSS 能力。
    const found=allGroups.filter(group=>group.jobs.some(j=>matchingIds.has(j.id)));
    const shared=found.filter(group=>group.jobs.length>1);
    const solo=found.filter(group=>group.jobs.length===1);
    const sharedHtml=shared.length?`<section class="card-collection" aria-label="共用傳授連結技能職業"><div class="collection-head"><h3>共用傳授連結技能</h3><span>${shared.length} 組 · ${shared.reduce((n,g)=>n+g.jobs.length,0)} 個職業</span></div><div class="shared-grid">${shared.map(sharedCard).join('')}</div></section>`:'';
    const soloHtml=solo.length?`<section class="card-collection" aria-label="獨立傳授連結技能職業">${shared.length?`<div class="collection-head"><h3>獨立職業</h3><span>${solo.length} 個職業</span></div>`:''}<div class="individual-grid">${solo.map(group=>jobCard(group.jobs[0],group)).join('')}</div></section>`:'';
    byId('jobsGrid').innerHTML=sharedHtml+soloHtml;
    const subset=matched.length<data.jobs.length;
    byId('resultCount').innerHTML=`目前顯示 <strong>${found.length}</strong> 張卡片${subset?`，符合 <strong>${matched.length}</strong> 個職業（共用技能卡會顯示同組所有職業）`:`，涵蓋 <strong>${data.jobs.length}</strong> 個職業`}`;
    byId('emptyState').hidden=found.length>0;
    byId('resetFilters').hidden=!(state.series||state.search||state.type||state.trait);
  }
  function reset(){state.series='';state.search='';state.type='';state.trait='';byId('searchInput').value='';byId('typeSelect').value='';byId('traitSelect').value='';render();}
  function showGroup(group){
    const skill=skillFor(group.jobs[0]);if(!skill)return;
    if(activeTooltipController){activeTooltipController.abort();activeTooltipController=null;}
    lastFocus=document.activeElement;
    browseScrollY=window.scrollY;
    const multiple=group.jobs.length>1;
    // V6.0：先顯示自身最高等級效果；傳授連結技能與各級切換分開，且共用同一張技能圖示。
    // 直接沿用 V5.9 核對過的原始資料，不調整任何技能數值。
    const ownRows=skillDetailRows(skill);
    const selfMax=verifiedSkillDetails[skill.name]?.maxLevel||ownRows.length;
    const selfRow=ownRows[ownRows.length-1];
    const selfEffect=selfRow?.effect||'尚無可核對的角色自身效果。';
    const metricList=Array.isArray(selfRow?.metrics)?selfRow.metrics:[];
    const ownMetrics=metricList.length?`<div class="dialog-self-metrics" aria-label="自身效果重點">${metricList.slice(0,7).map(metric=>`<span>${escapeHtml(metric)}</span>`).join('')}</div>`:'';
    // 真正可選等級直接取完整 WZ 逐級資料，不再只取 skill.levels 的前三筆。
    // 傳授連結技能依然沿用 V5.9 已核對的獨立效果，不能由自身最高級冒充。
    const transfer=skill.levels?.find(row=>row.label==='傳授連結技能')?.effect||ownRows[ownRows.length-1]?.effect||'';
    const levelOptions=[...ownRows.map(row=>({label:`Lv.${row.level}`,effect:row.effect})),{label:'傳授連結技能',effect:transfer}];
    const transferIndex=levelOptions.length-1;
    const selectedLevel=Math.min(rememberedLevels.get(skill.name)??transferIndex,transferIndex); // 記住此技能上一次切換項目。
    const skillLevelLabel=i=>i===transferIndex?`傳授連結技能效果 · 最高 Lv.${selfMax}`:`角色自身效果 · Lv.${levelOptions[i]?.label?.replace('Lv.','')||i+1}`;
    const levelControls=selfMax<=3
      ?`<div class="skill-level-tabs" role="group" aria-label="${escapeHtml(skill.name)}技能等級">${levelOptions.map((row,i)=>`<button type="button" class="skill-level-tab ${i===selectedLevel?'active':''}" data-level-index="${i}" aria-pressed="${i===selectedLevel}">${escapeHtml(row.label)}</button>`).join('')}</div>`
      :`<div class="skill-level-selection"><div class="skill-level-picker"><label for="skillLevelSelect">選擇技能等級</label><div class="skill-level-stepper"><button type="button" class="skill-level-step" id="skillLevelPrev" aria-label="上一級技能效果" title="上一級">‹</button><select class="skill-level-select" id="skillLevelSelect" aria-label="${escapeHtml(skill.name)}等級切換"><option value="">選擇 Lv.1～Lv.${selfMax}</option>${ownRows.map((row,i)=>`<option value="${i}">Lv.${row.level}</option>`).join('')}</select><button type="button" class="skill-level-step" id="skillLevelNext" aria-label="下一級技能效果" title="下一級">›</button></div></div><button type="button" class="skill-transfer-button ${selectedLevel===transferIndex?'active':''}" data-transfer-index="${transferIndex}" aria-pressed="${selectedLevel===transferIndex}">傳授連結技能</button></div>`;
    const levelHtml=levelOptions.length?`<section class="dialog-section-card dialog-transfer-card"><div class="dialog-section-head"><div><span class="dialog-section-kicker">LINK SKILL</span><h3>等級效果與傳授連結技能</h3></div><span class="dialog-section-badge">Lv.1～Lv.${selfMax}</span></div><p class="dialog-section-help">可比較 Lv.1～Lv.${selfMax} 各級技能效果，或切換查看作為傳授連結技能提供給其他角色時的效果。</p>${levelControls}<div class="skill-level-result" role="status" aria-live="polite"><div class="skill-level-result-heading"><div class="skill-level-result-title" id="skillLevelResultLabel">${escapeHtml(skillLevelLabel(selectedLevel))}</div><button type="button" class="skill-copy-button" id="copySkillEffect" title="複製目前選擇的技能效果" aria-label="複製目前技能名稱、等級和效果">複製效果</button></div><p class="skill-level-effect" id="skillLevelEffect">${escapeHtml(displaySkillEffect(levelOptions[selectedLevel].effect))}</p></div><p class="skill-level-note">${escapeHtml(skill.levelNote||'')}</p></section>`:'';
    const members=group.jobs.map(job=>`<div class="dialog-member"><img src="${escapeHtml(job.image)}" alt="${escapeHtml(job.name)}職業卡片" width="152" height="74"><div><strong>${escapeHtml(job.name)}</strong><span>${escapeHtml(job.type)} · <span data-union-label>${state.rank} 角色卡</span></span><b data-union-job="${escapeHtml(job.id)}">${escapeHtml(unionStat(job))}</b></div></div>`).join('');
    byId('jobDialog').querySelector('.job-skill-tooltip')?.remove();
    byId('jobDialogContent').innerHTML=`<div class="dialog-head dialog-group-head"><img src="${escapeHtml(group.jobs[0].image)}" alt="" width="152" height="74"><div><div class="dialog-sub">${escapeHtml(group.series)}</div><h2>${multiple?'共用傳授連結技能':escapeHtml(group.jobs[0].name)}</h2><div class="dialog-meta">${multiple?`${group.jobs.length} 個職業 · ${escapeHtml(skill.name)}`:`${escapeHtml(group.jobs[0].type)} · 職業資料`}</div></div><button type="button" class="dialog-close" id="closeJobDialog" aria-label="關閉詳細資料">×</button></div>
      <div class="dialog-body dialog-body-v60">
        <section class="dialog-info dialog-skill-top"><div class="dialog-skill"><button type="button" id="skillDetailTrigger" class="skill-detail-trigger" aria-expanded="false" aria-label="查看${escapeHtml(skill.name)}的完整技能介紹與等級表" title="查看完整技能介紹與等級表"><img src="${escapeHtml(skill.image)}" alt="" width="40" height="40"></button><div class="dialog-skill-name"><span class="dialog-section-kicker">技能資訊</span><strong>${escapeHtml(skill.name)}</strong><span>自身與傳授連結技能共用相同技能圖示</span></div><button type="button" class="skill-open-table" id="skillOpenTable">完整等級表 <span aria-hidden="true">↗</span></button></div></section>
        <section class="dialog-section-card dialog-self-card" aria-label="角色自身技能效果"><div class="dialog-section-head"><div><span class="dialog-section-kicker">OWN SKILL</span><h3>角色自身效果</h3></div><span class="dialog-section-badge">最高 Lv.${selfMax}</span></div><p class="dialog-self-effect">${escapeHtml(displaySkillEffect(selfEffect))}</p>${ownMetrics}</section>
        ${levelHtml}
        <section class="dialog-info dialog-union-section"><div class="dialog-section-head"><div><span class="dialog-section-kicker">LEGION</span><h3 data-dialog-union-title="${multiple?'multiple':'single'}">${multiple?`各職業獨立的角色卡 · ${state.rank} 效果`:`角色卡 · ${state.rank} 效果`}</h3></div></div><div class="dialog-union-ranks" role="group" aria-label="詳細資料：角色卡等級"><button type="button" data-union-rank="S">S</button><button type="button" data-union-rank="SS">SS</button><button type="button" data-union-rank="SSS">SSS</button></div>${multiple?`<div class="dialog-members">${members}</div>`:`<div class="dialog-stat" data-union-job="${escapeHtml(group.jobs[0].id)}">${escapeHtml(unionStat(group.jobs[0]))}</div>`}</section>
      </div>`;
    const dialog=byId('jobDialog');if(!dialog.open)dialog.showModal();
    refreshUnionRank();
    updateFloatingRank();
    byId('jobDialogContent').querySelector('.dialog-union-ranks')?.addEventListener('click',event=>{
      const button=event.target.closest('[data-union-rank]');
      if(button)setUnionRank(button.dataset.unionRank);
    });
    const levelTabs=byId('jobDialogContent').querySelector('.skill-level-tabs');
    const levelSelect=byId('jobDialogContent').querySelector('#skillLevelSelect');
    const prevLevelButton=byId('jobDialogContent').querySelector('#skillLevelPrev');
    const nextLevelButton=byId('jobDialogContent').querySelector('#skillLevelNext');
    const transferButton=byId('jobDialogContent').querySelector('[data-transfer-index]');
    let currentLevel=selectedLevel;
    const selectLevel=index=>{
      const row=levelOptions[index];if(!row)return;
      currentLevel=index;rememberedLevels.set(skill.name,index);
      if(levelTabs)levelTabs.querySelectorAll('button').forEach(el=>{
        const active=Number(el.dataset.levelIndex)===index;
        el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));
      });
      if(levelSelect)levelSelect.value=index===transferIndex?'':String(index);
      // 傳授連結技能是另一種效果，不加入自身 Lv.1～Lv.N 的步進序列。
      if(prevLevelButton)prevLevelButton.disabled=index===transferIndex||index===0;
      if(nextLevelButton)nextLevelButton.disabled=index===transferIndex||index===ownRows.length-1;
      if(transferButton){const active=index===transferIndex;transferButton.classList.toggle('active',active);transferButton.setAttribute('aria-pressed',String(active));}
      byId('skillLevelEffect').textContent=displaySkillEffect(row.effect);
      byId('skillLevelResultLabel').textContent=skillLevelLabel(index);
    };
    if(levelTabs)levelTabs.addEventListener('click',event=>{
      const button=event.target.closest('[data-level-index]');
      if(button)selectLevel(Number(button.dataset.levelIndex));
    });
    selectLevel(selectedLevel);
    byId('copySkillEffect')?.addEventListener('click',async()=>{
      const button=byId('copySkillEffect');
      const content=[skill.name,skillLevelLabel(currentLevel),displaySkillEffect(levelOptions[currentLevel].effect)].join('\n');
      try{await copyText(content);button.textContent='已複製 ✓';button.dataset.copyStatus='ok';}
      catch{button.textContent='複製失敗';button.dataset.copyStatus='error';}
      button.setAttribute('aria-label',button.textContent);
    });
    if(levelSelect)levelSelect.addEventListener('change',()=>{
      if(levelSelect.value!=='')selectLevel(Number(levelSelect.value));
      else selectLevel(transferIndex);
    });
    if(transferButton)transferButton.addEventListener('click',()=>selectLevel(transferIndex));
    if(prevLevelButton)prevLevelButton.addEventListener('click',()=>selectLevel(currentLevel-1));
    if(nextLevelButton)nextLevelButton.addEventListener('click',()=>selectLevel(currentLevel+1));
    // 技能說明浮窗不顯示 ID、技能類型及資料來源；與戰地等級切換完全獨立。
    const dialogSkillEvents=new AbortController();
    activeTooltipController=dialogSkillEvents;
    const trigger=byId('skillDetailTrigger');
    const extra=verifiedSkillDetails[skill.name];
    const intro=extra?.intro||'此技能的介紹尚待核對。';
    const tooltip=document.createElement('aside');
    tooltip.id='jobSkillTooltip';
    tooltip.className='job-skill-tooltip';
    tooltip.setAttribute('role','tooltip');
    tooltip.setAttribute('aria-label',skill.name+'技能介紹');
    tooltip.hidden=true;
    tooltip.innerHTML=`<div class="job-skill-tooltip-head"><img src="${escapeHtml(skill.image)}" width="42" height="42" alt=""><div><small>技能介紹</small><strong>${escapeHtml(skill.name)}</strong></div><button type="button" class="job-skill-tooltip-close" aria-label="關閉技能介紹">×</button></div><div class="job-skill-tooltip-meta"><span>最高等級</span><b>${extra?.maxLevel??'待核對'}</b></div><div class="job-skill-tooltip-label">技能說明</div><p>${escapeHtml(intro).replace(/\n/g,'<br>')}</p>${skillLevelTable(skill)}`;
    dialog.append(tooltip);
    trigger.setAttribute('aria-describedby',tooltip.id);
    const closeTooltip=()=>{tooltip.hidden=true;trigger.setAttribute('aria-expanded','false');};
    const positionTooltip=()=>{
      const rect=trigger.getBoundingClientRect();
      const width=Math.min(850,innerWidth-24);
      tooltip.style.width=width+'px';
      tooltip.style.left=Math.min(Math.max(12,rect.left),Math.max(12,innerWidth-width-12))+'px';
      tooltip.style.top='12px';
      const height=tooltip.getBoundingClientRect().height;
      let top=rect.bottom+10;
      if(top+height>innerHeight-12 && rect.top-height-10>=12)top=rect.top-height-10;
      tooltip.style.top=Math.min(Math.max(12,top),Math.max(12,innerHeight-height-12))+'px';
    };
    byId('skillOpenTable').addEventListener('click',()=>trigger.click());
    trigger.addEventListener('click',()=>{
      if(!tooltip.hidden){closeTooltip();return;}
      tooltip.hidden=false;trigger.setAttribute('aria-expanded','true');positionTooltip();
    });
    tooltip.querySelector('.job-skill-tooltip-close').addEventListener('click',()=>{closeTooltip();trigger.focus();});
    dialog.addEventListener('click',event=>{if(!tooltip.hidden&&!tooltip.contains(event.target)&&!trigger.contains(event.target)&&!byId('skillOpenTable').contains(event.target))closeTooltip();},{signal:dialogSkillEvents.signal});
    // 切換下拉等級時，瀏覽器可能延後觸發對話框捲動；浮窗跟隨定位，不應被誤關閉。
    byId('jobDialogContent').addEventListener('scroll',()=>{if(!tooltip.hidden)positionTooltip();},{signal:dialogSkillEvents.signal,passive:true});
    dialog.addEventListener('keydown',event=>{if(event.key==='Escape'&&!tooltip.hidden){event.stopPropagation();event.preventDefault();closeTooltip();trigger.focus();}},{signal:dialogSkillEvents.signal,capture:true});
    window.addEventListener('resize',()=>{if(!tooltip.hidden)positionTooltip();},{signal:dialogSkillEvents.signal});
    dialog.addEventListener('close',()=>{
      // 舊對話框的 close 事件若在新對話框開啟後才送達，不得誤刪新浮窗。
      if(dialog.open)return;
      tooltip.remove();dialogSkillEvents.abort();
      if(activeTooltipController===dialogSkillEvents)activeTooltipController=null;
    },{signal:dialogSkillEvents.signal});
    byId('closeJobDialog').addEventListener('click',()=>dialog.close(),{once:true});byId('closeJobDialog').focus();
  }
  seriesTabs.addEventListener('click',e=>{const button=e.target.closest('[data-series]');if(!button)return;state.series=button.dataset.series;render();});
  byId('searchInput').addEventListener('input',e=>{state.search=e.target.value;render();});
  byId('typeSelect').addEventListener('change',e=>{state.type=e.target.value;render();});
  byId('traitSelect').addEventListener('change',e=>{state.trait=e.target.value;render();});
  byId('resetFilters').addEventListener('click',reset);byId('emptyReset').addEventListener('click',reset);
  byId('jobsGrid').addEventListener('click',e=>{const button=e.target.closest('[data-groupid]');if(!button)return;const group=groupById.get(button.dataset.groupid);if(group)showGroup(group);});
  byId('jobDialog').addEventListener('click',e=>{if(e.target===byId('jobDialog'))byId('jobDialog').close();});
  byId('jobDialog').addEventListener('close',()=>{
    if(lastFocus&&lastFocus.isConnected)lastFocus.focus({preventScroll:true});
    window.scrollTo({top:browseScrollY,behavior:'instant'});
    updateFloatingRank();
  });
  document.addEventListener('keydown',e=>{if(e.key==='/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) && !byId('jobDialog').open){e.preventDefault();byId('searchInput').focus();}});
  // 與官網完全共用 duoduo_theme：從圖鑑切換後，返回官網會保持相同模式。
  const themeToggle=byId('themeToggle');
  const applyTheme=(value)=>{
    const light=value!=='dark';
    document.documentElement.dataset.theme=light?'light':'dark';
    const icon=byId('themeIcon'),label=byId('themeLabel');
    if(icon)icon.textContent=light?'☾':'☼';
    if(label)label.textContent=light?'深色模式':'淺色模式';
    if(themeToggle)themeToggle.title=light?'切換深色模式':'切換淺色模式';
  };
  let theme='light';
  try{theme=localStorage.getItem('duoduo_theme')==='dark'?'dark':'light';}catch{}
  applyTheme(theme);
  themeToggle?.addEventListener('click',()=>{
    theme=document.documentElement.dataset.theme==='dark'?'light':'dark';
    applyTheme(theme);
    try{localStorage.setItem('duoduo_theme',theme);}catch{}
  });
  window.addEventListener('storage',e=>{
    if(e.key==='duoduo_theme')applyTheme(e.newValue==='dark'?'dark':'light');
  });
  render();
})();
