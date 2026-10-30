"use strict";
window.DuoDuoJobsData = {
  "meta": {
    "title": "多多谷角色卡與傳授技能",
    "source": "使用者提供的職業UI.zip及角色卡及傳授連結技能表.pdf（10頁）",
    "status": "V6.5：多多谷 V282 WZ 與使用者遊戲截圖交叉核對；氣魄、海盜的祝福、實戰的知識自身與傳授連結技能已由截圖核實；其他差異仍依各技能備註。",
    "unionRankSource": "S/SS/SSS 效果對照：冒險者小屋聯盟戰地系統（2026-08-05）及使用者 PDF SSS 資料。正式上線前需確認多多谷伺服器設定。",
    "linkDetailSource": "多多谷 V282 WZ Skill／String.Skill 核對紀錄、遊戲內截圖，時之祝福採使用者指定網站等級表；外部 TMS-283 僅供差異比對。"
  },
  "series": [
    "冒險家",
    "皇家騎士團",
    "英雄團",
    "惡魔",
    "末日反抗軍",
    "曉之陣",
    "超新星",
    "超越者",
    "雷普",
    "阿尼瑪",
    "江湖",
    "Friend's世界"
  ],
  "skills": {
    "蒼刃傳授": {
      "id": "1",
      "name": "蒼刃傳授",
      "summary": "爆擊率 100% 以上、爆擊傷害 50% 以上時，爆擊傷害 +7%",
      "description": "爆擊機率100%以上，爆擊傷害50%以上時，爆擊傷害增加7%。",
      "image": "assets/skills/01.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "爆擊機率100%以上，爆擊傷害50%以上時，爆擊傷害增加3%。"
        },
        {
          "label": "Lv.2",
          "effect": "爆擊機率100%以上，爆擊傷害50%以上時，爆擊傷害增加5%。"
        },
        {
          "label": "Lv.3",
          "effect": "爆擊機率100%以上，爆擊傷害50%以上時，爆擊傷害增加7%。"
        },
        {
          "label": "傳授連結技能",
          "effect": "爆擊機率100%以上，爆擊傷害50%以上時，爆擊傷害增加7%。"
        }
      ],
      "levelKind": "single",
      "levelNote": "依多多谷 V282 WZ 逐級效果與已保存的傳授連結技能核對資料；傳授連結技能與自身不同時，以「傳授連結技能」欄為準。",
      "levelSource": "多多谷 V282 WZ Skill／String.Skill；使用者提供之遊戲截圖與指定網站例外，及先前核對之傳授連結技能數值",
      "previousDescription": "增加爆擊傷害 5%。"
    },
    "紫扇傳授": {
      "id": "2",
      "name": "紫扇傳授",
      "summary": "累積使用攻擊技能 40 次後，下次攻擊觸發傷害 +20%（12 秒）",
      "description": "發動攻擊技能40次時滿足條件\n[紫扇傳授]：12秒內傷害增加20%",
      "image": "assets/skills/02.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "發動攻擊技能40次時滿足條件\n[紫扇傳授]：12秒內傷害增加10%"
        },
        {
          "label": "Lv.2",
          "effect": "發動攻擊技能40次時滿足條件\n[紫扇傳授]：12秒內傷害增加15%"
        },
        {
          "label": "Lv.3",
          "effect": "發動攻擊技能40次時滿足條件\n[紫扇傳授]：12秒內傷害增加20%"
        },
        {
          "label": "傳授連結技能",
          "effect": "發動攻擊技能40次時滿足條件\n[紫扇傳授]：12秒內傷害增加20%"
        }
      ],
      "levelKind": "single",
      "levelNote": "依多多谷 V282 WZ 逐級效果與已保存的傳授連結技能核對資料；傳授連結技能與自身不同時，以「傳授連結技能」欄為準。",
      "levelSource": "多多谷 V282 WZ Skill／String.Skill；使用者提供之遊戲截圖與指定網站例外，及先前核對之傳授連結技能數值",
      "previousDescription": "每攻擊 40 次，總傷害增加 15%，持續 12 秒。"
    },
    "精靈集中": {
      "id": "3",
      "name": "精靈集中",
      "summary": "BOSS 傷害 +11%、爆擊率 +10%、最大 HP／MP +5%",
      "description": "BOSS 傷害 +11%、爆擊率 +10%、最大 HP／MP +5%。",
      "image": "assets/skills/03.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "增加Boss怪物傷害4%、爆擊機率4%、最大HP3%、最大MP3%"
        },
        {
          "label": "Lv.2",
          "effect": "增加Boss怪物傷害7%、爆擊機率7%、最大HP4%、最大MP4%"
        },
        {
          "label": "Lv.3",
          "effect": "Boss 怪攻擊力增加11%，爆擊機率增加10%，最大 HP 增加5%，最大 MP 增加5%。"
        },
        {
          "label": "傳授連結技能",
          "effect": "BOSS 傷害 +11%、爆擊率 +10%、最大 HP／MP +5%。"
        }
      ],
      "levelKind": "single",
      "levelNote": "依多多谷 V282 WZ 逐級效果與已保存的傳授連結技能核對資料；傳授連結技能與自身不同時，以「傳授連結技能」欄為準。 Lv.3 效果以使用者遊戲內截圖為準；WZ 節點 maxLevel=2。",
      "levelSource": "多多谷 V282 WZ Skill／String.Skill；使用者提供之遊戲截圖與指定網站例外，及先前核對之傳授連結技能數值",
      "previousDescription": "BOSS 傷害 +7%、爆擊率 +7%、最大 HP／MP +4%。"
    },
    "氣魄": {
      "id": "4",
      "name": "氣魄",
      "summary": "攻擊 BOSS 時傷害 +4%，命中再累積每層 +3%（最多 6 層）",
      "description": "BOSS 傷害 +4%；每次成功攻擊 BOSS 額外增加 3% 傷害，最多累積 6 層，每 2 秒最多觸發 1 次，持續 5 秒。",
      "image": "assets/skills/04.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "攻擊BOSS怪物時增加傷害2%。若攻擊對象為BOSS怪物，每次攻擊成功時增加1%，最多疊加6次，且每2秒發動一次疊加。持續時間5秒"
        },
        {
          "label": "Lv.2",
          "effect": "攻擊BOSS怪物時增加傷害4%。若攻擊對象為BOSS怪物，每次攻擊成功時增加2%，最多疊加6次，且每2秒發動一次疊加。持續時間5秒"
        },
        {
          "label": "Lv.3",
          "effect": "攻擊BOSS怪物時增加傷害4%。若攻擊對象為BOSS怪物，每次攻擊成功時增加3%，最多疊加6次，且每2秒發動一次疊加。持續時間5秒"
        },
        {
          "label": "傳授連結技能",
          "effect": "BOSS 傷害 +4%；每次成功攻擊 BOSS 額外增加 3% 傷害，最多累積 6 層，每 2 秒最多觸發 1 次，持續 5 秒。"
        }
      ],
      "levelKind": "single",
      "levelNote": "遊戲內「我的連結技能」及傳授連結技能的技能提示均確認 Lv.3：BOSS 基礎傷害 +4%，每次成功攻擊 BOSS 再疊加 +3%，最多 6 層，每 2 秒一次，持續 5 秒。",
      "levelSource": "多多谷 V282 WZ；2026-10-29 使用者提供之自身／傳授連結技能實際遊戲截圖",
      "previousDescription": "BOSS 傷害 +4%；攻擊 BOSS 時，BOSS 傷害額外 +12%。"
    },
    "不屈的信念": {
      "id": "5",
      "name": "不屈的信念",
      "summary": "HP 低於 15% 時，3 秒內每秒恢復最大 HP 44%（冷卻 150 秒）",
      "description": "最高等級作為傳授連結技能使用時 HP 低於 15% 自動觸發，持續 3 秒，每秒恢復最大 HP 44%，冷卻 150 秒（不含自身額外傷害）。",
      "image": "assets/skills/05.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "當前HP小於等於最大HP的15%時，將自動發動。在接下來3秒內每秒恢復最大HP的20%\n冷卻時間310秒"
        },
        {
          "label": "Lv.2",
          "effect": "當前HP小於等於最大HP的15%時，將自動發動。在接下來3秒內每秒恢復最大HP的23%\n冷卻時間290秒"
        },
        {
          "label": "Lv.3",
          "effect": "當前HP小於等於最大HP的15%時，將自動發動。在接下來3秒內每秒恢復最大HP的26%\n冷卻時間270秒"
        },
        {
          "label": "傳授連結技能",
          "effect": "最高等級作為傳授連結技能使用時 HP 低於 15% 自動觸發，持續 3 秒，每秒恢復最大 HP 44%，冷卻 150 秒（不含自身額外傷害）。"
        }
      ],
      "levelKind": "shared",
      "levelNote": "依多多谷 V282 WZ 逐級效果與已保存的傳授連結技能核對資料；傳授連結技能與自身不同時，以「傳授連結技能」欄為準。",
      "levelSource": "多多谷 V282 WZ Skill／String.Skill；使用者提供之遊戲截圖與指定網站例外，及先前核對之傳授連結技能數值",
      "previousDescription": "Lv.6：HP 低於 15% 時，每秒恢復 35% HP，持續 3 秒。"
    },
    "實戰的知識": {
      "id": "6",
      "name": "實戰的知識",
      "summary": "31% 機率掌握弱點，每層傷害／無視防禦 +5%（最多 3 層）",
      "description": "以31%機率掌握發動攻擊的敵人的弱點。掌握的弱點將持續10秒，最多疊加至3層。\n每疊加1層，傷害增加5%、無視防禦率增加5%",
      "image": "assets/skills/06.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "以15%機率掌握發動攻擊的敵人的弱點。掌握的弱點將持續10秒，最多疊加至3層。\n每疊加1層，傷害增加1%、無視防禦率增加1%"
        },
        {
          "label": "Lv.2",
          "effect": "以17%機率掌握發動攻擊的敵人的弱點。掌握的弱點將持續10秒，最多疊加至3層。\n每疊加1層，傷害增加1%、無視防禦率增加1%"
        },
        {
          "label": "Lv.3",
          "effect": "以19%機率掌握發動攻擊的敵人的弱點。掌握的弱點將持續10秒，最多疊加至3層。\n每疊加1層，傷害增加2%、無視防禦率增加2%"
        },
        {
          "label": "傳授連結技能",
          "effect": "以31%機率掌握發動攻擊的敵人的弱點。掌握的弱點將持續10秒，最多疊加至3層。\n每疊加1層，傷害增加5%、無視防禦率增加5%"
        }
      ],
      "levelKind": "shared",
      "levelNote": "遊戲內「我的連結技能」及傳授連結技能的技能提示均確認 Lv.9：31% 機率掌握弱點，持續 10 秒、最多 3 層，每層傷害與無視防禦率 +5%。",
      "levelSource": "多多谷 V282 WZ；2026-10-29 使用者提供之自身／傳授連結技能實際遊戲截圖",
      "previousDescription": "Lv.6：攻擊當前戰鬥中 HP 最高的怪物時，有 25% 機率觸發總傷害與無視防禦增幅；每層 3%，最多 3 層，持續 10 秒。"
    },
    "探險家的好奇心": {
      "id": "7",
      "name": "探險家的好奇心",
      "summary": "爆擊率 +15%、怪物收藏登錄機率 +50%",
      "description": "最高等級作為傳授連結技能使用時怪物收藏登錄機率 +50%、爆擊率 +15%（不含自身額外傷害）。",
      "image": "assets/skills/07.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "增加怪物收藏登錄率10%、爆擊機率3%"
        },
        {
          "label": "Lv.2",
          "effect": "增加怪物收藏登錄率15%、爆擊機率4%"
        },
        {
          "label": "Lv.3",
          "effect": "增加怪物收藏登錄率20%、爆擊機率6%"
        },
        {
          "label": "傳授連結技能",
          "effect": "最高等級作為傳授連結技能使用時怪物收藏登錄機率 +50%、爆擊率 +15%（不含自身額外傷害）。"
        }
      ],
      "levelKind": "shared",
      "levelNote": "依多多谷 V282 WZ 逐級效果與已保存的傳授連結技能核對資料；傳授連結技能與自身不同時，以「傳授連結技能」欄為準。",
      "levelSource": "多多谷 V282 WZ Skill／String.Skill；使用者提供之遊戲截圖與指定網站例外，及先前核對之傳授連結技能數值",
      "previousDescription": "Lv.6：爆擊率 +10%、收藏率 +35%。"
    },
    "小偷的狡詐": {
      "id": "8",
      "name": "小偷的狡詐",
      "summary": "使敵人陷入異常狀態後，傷害 +27%（10 秒；冷卻 20 秒）",
      "description": "若對敵人造成異常狀態，在接下來10秒內增加27%傷害\n冷卻時間20秒",
      "image": "assets/skills/08.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "若對敵人造成異常狀態，在接下來10秒內增加3%傷害\n冷卻時間20秒"
        },
        {
          "label": "Lv.2",
          "effect": "若對敵人造成異常狀態，在接下來10秒內增加6%傷害\n冷卻時間20秒"
        },
        {
          "label": "Lv.3",
          "effect": "若對敵人造成異常狀態，在接下來10秒內增加9%傷害\n冷卻時間20秒"
        },
        {
          "label": "傳授連結技能",
          "effect": "若對敵人造成異常狀態，在接下來10秒內增加27%傷害\n冷卻時間20秒"
        }
      ],
      "levelKind": "shared",
      "levelNote": "依多多谷 V282 WZ 逐級效果與已保存的傳授連結技能核對資料；傳授連結技能與自身不同時，以「傳授連結技能」欄為準。",
      "levelSource": "多多谷 V282 WZ Skill／String.Skill；使用者提供之遊戲截圖與指定網站例外，及先前核對之傳授連結技能數值",
      "previousDescription": "Lv.6：對怪物施加 Debuff 後，10 秒內對該目標總傷害 +18%；冷卻時間 20 秒。"
    },
    "海盜的祝福": {
      "id": "9",
      "name": "海盜的祝福",
      "summary": "全屬性各 +100、最大 HP／MP 各 +1750、所受傷害減少 21%",
      "description": "多多谷遊戲內傳授連結技能 Lv.9：STR／DEX／INT／LUK 各 +100、最大 HP／MP 各 +1750、所受傷害減少 21%，冷卻時間 5 秒。",
      "image": "assets/skills/09.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "力量 20、敏捷 20、智力 20、幸運 20、最大HP 350、最大MP 350 增加\n所受傷害 5%減少\n冷卻時間 5秒"
        },
        {
          "label": "Lv.2",
          "effect": "力量 30、敏捷 30、智力 30、幸運 30、最大HP 525、最大MP 525 增加\n所受傷害 7%減少\n冷卻時間 5秒"
        },
        {
          "label": "Lv.3",
          "effect": "力量 40、敏捷 40、智力 40、幸運 40、最大HP 700、最大MP 700 增加\n所受傷害 9%減少\n冷卻時間 5秒"
        },
        {
          "label": "傳授連結技能",
          "effect": "全屬性各 +100、最大 HP／MP 各 +1750、所受傷害減少 21%，冷卻時間 5 秒。"
        }
      ],
      "levelKind": "shared",
      "levelNote": "依多多谷遊戲內自身與傳授連結技能截圖確認：Lv.9 自身全屬性 +130、傳授連結技能全屬性 +100；兩者最大 HP／MP 均 +1750、所受傷害減少 21%。",
      "levelSource": "多多谷 V282 WZ；2026-10-29 使用者提供之自身／傳授連結技能 Lv.9 實際遊戲截圖",
      "previousDescription": "Lv.6：全屬性 +70、最大 HP／MP +1225、受擊傷害 -15%（不含百分比傷害）。"
    },
    "西格諾斯祝福": {
      "id": "10",
      "name": "西格諾斯祝福",
      "summary": "攻擊／魔法攻擊力 +35，異常狀態耐性 +22、屬性耐性 +22%",
      "description": "最高等級作為傳授連結技能使用時攻擊力／魔法攻擊力 +35，異常狀態耐性 +22、所有屬性耐性 +22%。",
      "image": "assets/skills/10.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "攻擊力與魔法攻擊力增加 7、狀態異常耐性增加 1、所有屬性耐性增加 1%"
        },
        {
          "label": "Lv.2",
          "effect": "攻擊力與魔法攻擊力增加 9、狀態異常耐性增加 3、所有屬性耐性增加 3%"
        },
        {
          "label": "Lv.3",
          "effect": "攻擊力與魔法攻擊力增加 11、狀態異常耐性增加 4、所有屬性耐性增加 4%"
        },
        {
          "label": "傳授連結技能",
          "effect": "最高等級作為傳授連結技能使用時攻擊力／魔法攻擊力 +35，異常狀態耐性 +22、所有屬性耐性 +22%。"
        }
      ],
      "levelKind": "shared",
      "levelNote": "依多多谷 V282 WZ 逐級效果與已保存的傳授連結技能核對資料；傳授連結技能與自身不同時，以「傳授連結技能」欄為準。 傳授連結技能數值沿用先前核對資料；WZ 最高級自身攻魔 +55，非傳授連結技能 +35。",
      "levelSource": "多多谷 V282 WZ Skill／String.Skill；使用者提供之遊戲截圖與指定網站例外，及先前核對之傳授連結技能數值",
      "previousDescription": "Lv.10：物理／魔法攻擊力 +25、狀態異常耐性 +15、所有屬性耐性 +15%。"
    },
    "光之守護": {
      "id": "11",
      "name": "光之守護",
      "summary": "異常狀態耐性 +100（20 秒），冷卻 120 秒",
      "description": "異常狀態耐性 +100，持續 20 秒；冷卻 120 秒（自身使用為護盾效果）。",
      "image": "assets/skills/11.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "10秒內形成護盾，最多防禦3次的傷害，傷害增加15%\n但僅限於最大HP的一定比例所給予傷害的攻擊會減少10%\n冷卻時間:120秒"
        },
        {
          "label": "Lv.2",
          "effect": "20秒內形成護盾，最多防禦6次的傷害，傷害增加20%\n但僅限於最大HP的一定比例所給予傷害的攻擊會減少20%\n冷卻時間:120秒"
        },
        {
          "label": "Lv.3",
          "effect": "30秒內生成護盾，可抵擋最多9次傷害，傷害增加25%\n但僅對按最大HP一定比例造成傷害的攻擊，所受傷害減少30%\n冷卻時間120秒\n[被動效果：傷害增加3%]"
        },
        {
          "label": "傳授連結技能",
          "effect": "異常狀態耐性 +100，持續 20 秒；冷卻 120 秒（自身使用為護盾效果）。"
        }
      ],
      "levelKind": "single",
      "levelNote": "依多多谷 V282 WZ 逐級效果與已保存的傳授連結技能核對資料；傳授連結技能與自身不同時，以「傳授連結技能」欄為準。 傳授連結技能異常狀態耐性 +100（20 秒）以使用者遊戲截圖為準；自身為護盾。",
      "levelSource": "多多谷 V282 WZ Skill／String.Skill；使用者提供之遊戲截圖與指定網站例外，及先前核對之傳授連結技能數值",
      "previousDescription": "狀態異常耐性 +100，持續 15 秒，冷卻時間 120 秒。"
    },
    "自由精神": {
      "id": "12",
      "name": "自由精神",
      "summary": "復活後無敵 12 秒；更換地圖時效果解除",
      "description": "最高等級作為傳授連結技能使用時復活後獲得 12 秒無敵；更換地圖時提前解除（不含自身額外傷害）。",
      "image": "assets/skills/12.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "復活時進入無敵狀態1秒，切換地圖時解除"
        },
        {
          "label": "Lv.2",
          "effect": "復活時進入無敵狀態2秒，切換地圖時解除"
        },
        {
          "label": "Lv.3",
          "effect": "復活時進入無敵狀態3秒，切換地圖時解除"
        },
        {
          "label": "傳授連結技能",
          "effect": "最高等級作為傳授連結技能使用時復活後獲得 12 秒無敵；更換地圖時提前解除（不含自身額外傷害）。"
        }
      ],
      "levelKind": "shared",
      "levelNote": "依多多谷 V282 WZ 逐級效果與已保存的傳授連結技能核對資料；傳授連結技能與自身不同時，以「傳授連結技能」欄為準。",
      "levelSource": "多多谷 V282 WZ Skill／String.Skill；使用者提供之遊戲截圖與指定網站例外，及先前核對之傳授連結技能數值",
      "previousDescription": "Lv.8：角色復活後，獲得 8 秒無敵效果。"
    },
    "惡魔之怒": {
      "id": "13",
      "name": "惡魔之怒",
      "summary": "BOSS 傷害 +20%",
      "description": "攻擊BOSS怪物時，傷害增加20%、吸收10的力量。",
      "image": "assets/skills/13.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "攻擊BOSS怪物時，傷害增加10%、吸收10的力量。"
        },
        {
          "label": "Lv.2",
          "effect": "攻擊BOSS怪物時，傷害增加15%、吸收10的力量。"
        },
        {
          "label": "Lv.3",
          "effect": "攻擊BOSS怪物時，傷害增加20%、吸收10的力量。"
        },
        {
          "label": "傳授連結技能",
          "effect": "攻擊BOSS怪物時，傷害增加20%、吸收10的力量。"
        }
      ],
      "levelKind": "single",
      "levelNote": "依多多谷 V282 WZ 逐級效果與已保存的傳授連結技能核對資料；傳授連結技能與自身不同時，以「傳授連結技能」欄為準。",
      "levelSource": "多多谷 V282 WZ Skill／String.Skill；使用者提供之遊戲截圖與指定網站例外，及先前核對之傳授連結技能數值",
      "previousDescription": "BOSS 傷害 +15%。"
    },
    "狂暴鬥氣": {
      "id": "14",
      "name": "狂暴鬥氣",
      "summary": "傷害 +15%",
      "description": "傷害 15% 增加",
      "image": "assets/skills/14.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "傷害 5% 增加"
        },
        {
          "label": "Lv.2",
          "effect": "傷害 10% 增加"
        },
        {
          "label": "Lv.3",
          "effect": "傷害 15% 增加"
        },
        {
          "label": "傳授連結技能",
          "effect": "傷害 15% 增加"
        }
      ],
      "levelKind": "single",
      "levelNote": "依多多谷 V282 WZ 逐級效果與已保存的傳授連結技能核對資料；傳授連結技能與自身不同時，以「傳授連結技能」欄為準。",
      "levelSource": "多多谷 V282 WZ Skill／String.Skill；使用者提供之遊戲截圖與指定網站例外，及先前核對之傳授連結技能數值",
      "previousDescription": "總傷害 +10%。"
    },
    "合成邏輯": {
      "id": "15",
      "name": "合成邏輯",
      "summary": "全屬性 +15%",
      "description": "增加所有能力值15%",
      "image": "assets/skills/15.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "增加所有能力值5%"
        },
        {
          "label": "Lv.2",
          "effect": "增加所有能力值10%"
        },
        {
          "label": "Lv.3",
          "effect": "增加所有能力值15%"
        },
        {
          "label": "傳授連結技能",
          "effect": "增加所有能力值15%"
        }
      ],
      "levelKind": "single",
      "levelNote": "依多多谷 V282 WZ 逐級效果與已保存的傳授連結技能核對資料；傳授連結技能與自身不同時，以「傳授連結技能」欄為準。",
      "levelSource": "多多谷 V282 WZ Skill／String.Skill；使用者提供之遊戲截圖與指定網站例外，及先前核對之傳授連結技能數值",
      "previousDescription": "全屬性 +10%。"
    },
    "連續擊殺優勢": {
      "id": "16",
      "name": "連續擊殺優勢",
      "summary": "連續擊殺珠經驗值獲得量 +900%",
      "description": "使用傳授連結技能時 Combo 擊殺珠經驗值 +900%（不含戰神自身永久傷害）。",
      "image": "assets/skills/16.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "永久增加連續擊殺珠子經驗值獲得量400%"
        },
        {
          "label": "Lv.2",
          "effect": "永久增加連續擊殺珠子經驗值獲得量650%"
        },
        {
          "label": "Lv.3",
          "effect": "永久增加連續擊殺珠子經驗值獲得量900%，傷害增加5%"
        },
        {
          "label": "傳授連結技能",
          "effect": "使用傳授連結技能時 Combo 擊殺珠經驗值 +900%（不含戰神自身永久傷害）。"
        }
      ],
      "levelKind": "single",
      "levelNote": "依多多谷 V282 WZ 逐級效果與已保存的傳授連結技能核對資料；傳授連結技能與自身不同時，以「傳授連結技能」欄為準。",
      "levelSource": "多多谷 V282 WZ Skill／String.Skill；使用者提供之遊戲截圖與指定網站例外，及先前核對之傳授連結技能數值",
      "previousDescription": "Combo 球經驗值 +650%。"
    },
    "輪之堅持": {
      "id": "17",
      "name": "輪之堅持",
      "summary": "符文解放效果持續時間 +70%",
      "description": "使用傳授連結技能時符文解放持續時間 +70%（不含龍魔導士自身永久傷害）。",
      "image": "assets/skills/17.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "解放的輪之力有效時間增加30%。"
        },
        {
          "label": "Lv.2",
          "effect": "解放的輪之力有效時間增加50%。"
        },
        {
          "label": "Lv.3",
          "effect": "解放的輪之力持續時間增加70%，傷害增加5%"
        },
        {
          "label": "傳授連結技能",
          "effect": "使用傳授連結技能時符文解放持續時間 +70%（不含龍魔導士自身永久傷害）。"
        }
      ],
      "levelKind": "single",
      "levelNote": "依多多谷 V282 WZ 逐級效果與已保存的傳授連結技能核對資料；傳授連結技能與自身不同時，以「傳授連結技能」欄為準。",
      "levelSource": "多多谷 V282 WZ Skill／String.Skill；使用者提供之遊戲截圖與指定網站例外，及先前核對之傳授連結技能數值",
      "previousDescription": "地圖輪持續時間 +50%。"
    },
    "精靈的祝福": {
      "id": "18",
      "name": "精靈的祝福",
      "summary": "經驗值獲得量 +20%；可使用返回技能（冷卻 600 秒）",
      "description": "使用傳授連結技能時打怪經驗值 +20%；可消耗 MP 30 使用返回精靈故鄉功能，冷卻 600 秒。",
      "image": "assets/skills/18.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "使用時返回櫻花處\n冷卻時間600秒\n[被動效果：經驗值獲得量增加10%]"
        },
        {
          "label": "Lv.2",
          "effect": "使用時返回櫻花處\n冷卻時間600秒\n[被動效果：經驗值獲得量增加15%]"
        },
        {
          "label": "Lv.3",
          "effect": "使用時返回櫻花處\n冷卻時間600秒\n[被動效果：經驗值獲得量增加20%、傷害增加5%]"
        },
        {
          "label": "傳授連結技能",
          "effect": "使用傳授連結技能時打怪經驗值 +20%；可消耗 MP 30 使用返回精靈故鄉功能，冷卻 600 秒。"
        }
      ],
      "levelKind": "single",
      "levelNote": "依多多谷 V282 WZ 逐級效果與已保存的傳授連結技能核對資料；傳授連結技能與自身不同時，以「傳授連結技能」欄為準。",
      "levelSource": "多多谷 V282 WZ Skill／String.Skill；使用者提供之遊戲截圖與指定網站例外，及先前核對之傳授連結技能數值",
      "previousDescription": "打怪經驗值 +15%；原表另記載「櫻花處回歸」。"
    },
    "致命本能": {
      "id": "19",
      "name": "致命本能",
      "summary": "爆擊率 +20%",
      "description": "使用傳授連結技能時爆擊率 +20%（不含幻影自身額外傷害）。",
      "image": "assets/skills/19.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "爆擊機率增加 10% "
        },
        {
          "label": "Lv.2",
          "effect": "爆擊機率增加 15% "
        },
        {
          "label": "Lv.3",
          "effect": "爆擊機率增加20%、傷害增加5%"
        },
        {
          "label": "傳授連結技能",
          "effect": "使用傳授連結技能時爆擊率 +20%（不含幻影自身額外傷害）。"
        }
      ],
      "levelKind": "single",
      "levelNote": "依多多谷 V282 WZ 逐級效果與已保存的傳授連結技能核對資料；傳授連結技能與自身不同時，以「傳授連結技能」欄為準。",
      "levelSource": "多多谷 V282 WZ Skill／String.Skill；使用者提供之遊戲截圖與指定網站例外，及先前核對之傳授連結技能數值",
      "previousDescription": "爆擊率 +15%。"
    },
    "滲透": {
      "id": "20",
      "name": "滲透",
      "summary": "無視防禦率 +20%",
      "description": "使用傳授連結技能時無視敵人防禦率 +20%（不含夜光自身額外傷害）。",
      "image": "assets/skills/20.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "無視防禦率增加10%"
        },
        {
          "label": "Lv.2",
          "effect": "無視防禦率增加15%"
        },
        {
          "label": "Lv.3",
          "effect": "增加20%無視防禦率、4%傷害"
        },
        {
          "label": "傳授連結技能",
          "effect": "使用傳授連結技能時無視敵人防禦率 +20%（不含夜光自身額外傷害）。"
        }
      ],
      "levelKind": "single",
      "levelNote": "依多多谷 V282 WZ 逐級效果與已保存的傳授連結技能核對資料；傳授連結技能與自身不同時，以「傳授連結技能」欄為準。",
      "levelSource": "多多谷 V282 WZ Skill／String.Skill；使用者提供之遊戲截圖與指定網站例外，及先前核對之傳授連結技能數值",
      "previousDescription": "無視防禦 +15%。"
    },
    "死裡逃生": {
      "id": "21",
      "name": "死裡逃生",
      "summary": "受到致死攻擊時，有 15% 機率存活",
      "description": "使用傳授連結技能時有 15% 機率抵擋致死攻擊（不含隱月自身額外傷害）。",
      "image": "assets/skills/21.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "受到致死攻擊時,有5%機率生存"
        },
        {
          "label": "Lv.2",
          "effect": "受到致死攻擊時,有10%機率生存"
        },
        {
          "label": "Lv.3",
          "effect": "受到致死攻擊時，以15%機率存活\n[被動效果：傷害增加5%]"
        },
        {
          "label": "傳授連結技能",
          "effect": "使用傳授連結技能時有 15% 機率抵擋致死攻擊（不含隱月自身額外傷害）。"
        }
      ],
      "levelKind": "single",
      "levelNote": "依多多谷 V282 WZ 逐級效果與已保存的傳授連結技能核對資料；傳授連結技能與自身不同時，以「傳授連結技能」欄為準。",
      "levelSource": "多多谷 V282 WZ Skill／String.Skill；使用者提供之遊戲截圖與指定網站例外，及先前核對之傳授連結技能數值",
      "previousDescription": "10% 機率擋下死亡，但不會回滿 HP。"
    },
    "鋼鐵意志": {
      "id": "22",
      "name": "鋼鐵意志",
      "summary": "最大 HP +20%",
      "description": "最大 HP +20%（傳授連結技能效果；狂龍戰士自身 Lv.3 為 HP +15%，另有變身傷害）。",
      "image": "assets/skills/22.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "HP提升5%、龍能球量條各階段增加傷害2%"
        },
        {
          "label": "Lv.2",
          "effect": "HP提升10%、龍能球量條各階段增加傷害3%"
        },
        {
          "label": "Lv.3",
          "effect": "HP提升15%、龍能球量條各階段增加傷害5%"
        },
        {
          "label": "傳授連結技能",
          "effect": "最大 HP +20%（傳授連結技能效果；狂龍戰士自身 Lv.3 為 HP +15%，另有變身傷害）。"
        }
      ],
      "levelKind": "single",
      "levelNote": "依多多谷 V282 WZ 逐級效果與已保存的傳授連結技能核對資料；傳授連結技能與自身不同時，以「傳授連結技能」欄為準。 傳授連結技能最大 HP +20% 沿用先前傳授連結技能資料；WZ 角色自身為 +15%。",
      "levelSource": "多多谷 V282 WZ Skill／String.Skill；使用者提供之遊戲截圖與指定網站例外，及先前核對之傳授連結技能數值",
      "previousDescription": "最大 HP +15%。"
    },
    "事前準備": {
      "id": "23",
      "name": "事前準備",
      "summary": "擊敗 8 名敵人或攻擊 BOSS 5 次累積準備，滿 5 次傷害 +25%（20 秒）",
      "description": "解決敵人8名，或攻擊BOSS怪物5次時，完成事前準備1次，完成5次事前準備時，連續20秒傷害增加25%。\n冷卻時間40秒",
      "image": "assets/skills/23.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "解決敵人8名，或攻擊BOSS怪物5次時，完成事前準備1次，完成5次事前準備時，連續20秒傷害增加9%。\n冷卻時間40秒"
        },
        {
          "label": "Lv.2",
          "effect": "解決敵人8名，或攻擊BOSS怪物5次時，完成事前準備1次，完成5次事前準備時，連續20秒傷害增加17%。\n冷卻時間40秒"
        },
        {
          "label": "Lv.3",
          "effect": "解決敵人8名，或攻擊BOSS怪物5次時，完成事前準備1次，完成5次事前準備時，連續20秒傷害增加25%。\n冷卻時間40秒"
        },
        {
          "label": "傳授連結技能",
          "effect": "解決敵人8名，或攻擊BOSS怪物5次時，完成事前準備1次，完成5次事前準備時，連續20秒傷害增加25%。\n冷卻時間40秒"
        }
      ],
      "levelKind": "single",
      "levelNote": "依多多谷 V282 WZ 逐級效果與已保存的傳授連結技能核對資料；傳授連結技能與自身不同時，以「傳授連結技能」欄為準。",
      "levelSource": "多多谷 V282 WZ Skill／String.Skill；使用者提供之遊戲截圖與指定網站例外，及先前核對之傳授連結技能數值",
      "previousDescription": "擊敗 5 隻怪物或對 BOSS 攻擊 5 次可累積效果；疊滿 5 層後總傷害 +17%，持續 20 秒，冷卻 40 秒。"
    },
    "集中狂攻": {
      "id": "24",
      "name": "集中狂攻",
      "summary": "攻擊低於自身等級的怪物、異常狀態敵人時，傷害各 +9%",
      "description": "攻擊比角色等級低的怪物時傷害增加9%，攻擊狀態異常的怪物時傷害增加9%",
      "image": "assets/skills/24.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "攻擊比角色等級低的怪物時傷害增加3%，攻擊狀態異常的怪物時傷害增加3%"
        },
        {
          "label": "Lv.2",
          "effect": "攻擊比角色等級低的怪物時傷害增加6%，攻擊狀態異常的怪物時傷害增加6%"
        },
        {
          "label": "Lv.3",
          "effect": "攻擊比角色等級低的怪物時傷害增加9%，攻擊狀態異常的怪物時傷害增加9%"
        },
        {
          "label": "傳授連結技能",
          "effect": "攻擊比角色等級低的怪物時傷害增加9%，攻擊狀態異常的怪物時傷害增加9%"
        }
      ],
      "levelKind": "single",
      "levelNote": "依多多谷 V282 WZ 逐級效果與已保存的傳授連結技能核對資料；傳授連結技能與自身不同時，以「傳授連結技能」欄為準。",
      "levelSource": "多多谷 V282 WZ Skill／String.Skill；使用者提供之遊戲截圖與指定網站例外，及先前核對之傳授連結技能數值",
      "previousDescription": "攻擊低於自身等級的怪物時，總傷害 +6%；攻擊處於異常狀態的怪物時，總傷害 +6%；兩項效果可疊加。"
    },
    "靈魂契約": {
      "id": "25",
      "name": "靈魂契約",
      "summary": "傷害 +60%（10 秒），冷卻 60 秒",
      "description": "消耗 MP 30；傷害 +60%，持續 10 秒，冷卻 60 秒（傳授連結技能效果為自身 Lv.3 的一半）。",
      "image": "assets/skills/25.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "消耗MP 30，10秒間傷害增加60%\n以連結技能使用時，效果減少一半\n冷卻時間90秒"
        },
        {
          "label": "Lv.2",
          "effect": "消耗MP 30，10秒間傷害增加90%\n以連結技能使用時，效果減少一半\n冷卻時間60秒"
        },
        {
          "label": "Lv.3",
          "effect": "消耗MP 30，10秒間傷害增加120%\n以連結技能使用時，效果減少一半\n冷卻時間60秒"
        },
        {
          "label": "傳授連結技能",
          "effect": "消耗 MP 30；傷害 +60%，持續 10 秒，冷卻 60 秒（傳授連結技能效果為自身 Lv.3 的一半）。"
        }
      ],
      "levelKind": "single",
      "levelNote": "依多多谷 V282 WZ 逐級效果與已保存的傳授連結技能核對資料；傳授連結技能與自身不同時，以「傳授連結技能」欄為準。",
      "levelSource": "多多谷 V282 WZ Skill／String.Skill；使用者提供之遊戲截圖與指定網站例外，及先前核對之傳授連結技能數值",
      "previousDescription": "10 秒內總傷害 +45%，冷卻時間 60 秒。"
    },
    "貴族": {
      "id": "26",
      "name": "貴族",
      "summary": "BOSS 傷害 +6%；同地圖每名隊員（含自己）傷害 +3%，最多 +12%",
      "description": "攻擊BOSS怪物時傷害增加6%\n包含自己在內，讓相同地圖中的每1名隊員 傷害增加3%，最多增加12%\n未組隊時，視為只有自己組隊。",
      "image": "assets/skills/26.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "攻擊BOSS怪物時傷害增加2%\n包含自己在內，讓相同地圖中的每1名隊員 傷害增加1%，最多增加4%\n未組隊時，視為只有自己組隊。"
        },
        {
          "label": "Lv.2",
          "effect": "攻擊BOSS怪物時傷害增加4%\n包含自己在內，讓相同地圖中的每1名隊員 傷害增加2%，最多增加8%\n未組隊時，視為只有自己組隊。"
        },
        {
          "label": "Lv.3",
          "effect": "攻擊BOSS怪物時傷害增加6%\n包含自己在內，讓相同地圖中的每1名隊員 傷害增加3%，最多增加12%\n未組隊時，視為只有自己組隊。"
        },
        {
          "label": "傳授連結技能",
          "effect": "攻擊BOSS怪物時傷害增加6%\n包含自己在內，讓相同地圖中的每1名隊員 傷害增加3%，最多增加12%\n未組隊時，視為只有自己組隊。"
        }
      ],
      "levelKind": "single",
      "levelNote": "依多多谷 V282 WZ 逐級效果與已保存的傳授連結技能核對資料；傳授連結技能與自身不同時，以「傳授連結技能」欄為準。",
      "levelSource": "多多谷 V282 WZ Skill／String.Skill；使用者提供之遊戲截圖與指定網站例外，及先前核對之傳授連結技能數值",
      "previousDescription": "BOSS 傷害 +4%；同一張地圖中，隊伍每增加 1 人，自身總傷害 +2%，最多增加 8%。"
    },
    "戰鬥的流動": {
      "id": "27",
      "name": "戰鬥的流動",
      "summary": "移動後每層傷害 +4%（最多 4 層；傳授連結技能持續 10 秒）",
      "description": "移動達指定距離後，每層傷害 +4%，最多 4 層；使用傳授連結技能時持續 10 秒（自身為 25 秒）。",
      "image": "assets/skills/27.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "移動一定距離時發動，最多可重疊4次，持續時間25秒\n，各重疊的傷害增加2%\n以連結技能使用時，持續時間減少至10秒"
        },
        {
          "label": "Lv.2",
          "effect": "移動一定距離時發動，最多可重疊4次，持續時間25秒\n，各重疊的傷害增加3%\n以連結技能使用時，持續時間減少至10秒"
        },
        {
          "label": "Lv.3",
          "effect": "移動一定距離時發動，最多可重疊4次，持續時間25秒\n，各重疊的傷害增加4%\n以連結技能使用時，持續時間減少至10秒"
        },
        {
          "label": "傳授連結技能",
          "effect": "移動達指定距離後，每層傷害 +4%，最多 4 層；使用傳授連結技能時持續 10 秒（自身為 25 秒）。"
        }
      ],
      "levelKind": "single",
      "levelNote": "依多多谷 V282 WZ 逐級效果與已保存的傳授連結技能核對資料；傳授連結技能與自身不同時，以「傳授連結技能」欄為準。",
      "levelSource": "多多谷 V282 WZ Skill／String.Skill；使用者提供之遊戲截圖與指定網站例外，及先前核對之傳授連結技能數值",
      "previousDescription": "邊移動邊攻擊可增加總傷害 3%，最多疊加 4 層（12%），持續 10 秒。"
    },
    "天賦": {
      "id": "28",
      "name": "天賦",
      "summary": "傷害 +7%；攻擊時每秒恢復 HP／MP 3%（持續 5 秒）",
      "description": "傷害 +7%；攻擊時在 5 秒內每秒恢復最大 HP／MP 的 3%，冷卻 30 秒。",
      "image": "assets/skills/28.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "傷害增加3%\n攻擊時，以100%的機率在5秒間，每秒最多恢復HP/MP的1% \n冷卻時間為30秒"
        },
        {
          "label": "Lv.2",
          "effect": "傷害增加5%\n攻擊時，以100%的機率在5秒間，每秒最多恢復HP/MP的2% \n冷卻時間為30秒"
        },
        {
          "label": "Lv.3",
          "effect": "傷害增加10%\n攻擊時，以100%的機率在5秒間，每秒最多恢復HP/MP的3% \n冷卻時間為30秒"
        },
        {
          "label": "傳授連結技能",
          "effect": "傷害 +7%；攻擊時在 5 秒內每秒恢復最大 HP／MP 的 3%，冷卻 30 秒。"
        }
      ],
      "levelKind": "single",
      "levelNote": "依多多谷 V282 WZ 逐級效果與已保存的傳授連結技能核對資料；傳授連結技能與自身不同時，以「傳授連結技能」欄為準。 傳授連結技能傷害 +7% 沿用先前核對資料；WZ 角色自身為 +10%。",
      "levelSource": "多多谷 V282 WZ Skill／String.Skill；使用者提供之遊戲截圖與指定網站例外，及先前核對之傳授連結技能數值",
      "previousDescription": "總傷害 +5%；攻擊時每秒恢復 HP／MP 2%，持續 5 秒，冷卻 30 秒。"
    },
    "無我": {
      "id": "29",
      "name": "無我",
      "summary": "戰鬥持續 5 秒發動，傷害 +1%，每層再 +3%（最多 5 層）",
      "description": "戰鬥狀態若持續 5秒就會發動，最多可重疊 5次，持續時間 5秒。\n發動時傷害增加 1%，每重疊傷害追加增加 3%",
      "image": "assets/skills/29.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "戰鬥狀態若持續 5秒就會發動，最多可重疊 5次，持續時間 5秒。\n發動時傷害增加 1%，每重疊傷害追加增加 1%"
        },
        {
          "label": "Lv.2",
          "effect": "戰鬥狀態若持續 5秒就會發動，最多可重疊 5次，持續時間 5秒。\n發動時傷害增加 1%，每重疊傷害追加增加 2%"
        },
        {
          "label": "Lv.3",
          "effect": "戰鬥狀態若持續 5秒就會發動，最多可重疊 5次，持續時間 5秒。\n發動時傷害增加 1%，每重疊傷害追加增加 3%"
        },
        {
          "label": "傳授連結技能",
          "effect": "戰鬥狀態若持續 5秒就會發動，最多可重疊 5次，持續時間 5秒。\n發動時傷害增加 1%，每重疊傷害追加增加 3%"
        }
      ],
      "levelKind": "single",
      "levelNote": "依多多谷 V282 WZ 逐級效果與已保存的傳授連結技能核對資料；傳授連結技能與自身不同時，以「傳授連結技能」欄為準。",
      "levelSource": "多多谷 V282 WZ Skill／String.Skill；使用者提供之遊戲截圖與指定網站例外，及先前核對之傳授連結技能數值",
      "previousDescription": "打怪時每隔 5 秒獲得傷害增幅，最多疊加 5 次，持續 5 秒，最終總傷害 +11%。"
    },
    "護體": {
      "id": "30",
      "name": "護體",
      "summary": "所受傷害減少 6%（包含最大 HP 比例傷害）",
      "description": "使用傳授連結技能時受擊傷害降低 6%，包含按最大 HP 比例造成的傷害。",
      "image": "assets/skills/30.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "包含依最大HP比例造成傷害的攻擊在內，所受傷害2%減少"
        },
        {
          "label": "Lv.2",
          "effect": "包含依最大HP比例造成傷害的攻擊在內，所受傷害4%減少"
        },
        {
          "label": "Lv.3",
          "effect": "包含依最大HP比例造成傷害的攻擊在內，所受傷害6%減少，傷害增加5%"
        },
        {
          "label": "傳授連結技能",
          "effect": "使用傳授連結技能時受擊傷害降低 6%，包含按最大 HP 比例造成的傷害。"
        }
      ],
      "levelKind": "single",
      "levelNote": "依多多谷 V282 WZ 逐級效果與已保存的傳授連結技能核對資料；傳授連結技能與自身不同時，以「傳授連結技能」欄為準。",
      "levelSource": "多多谷 V282 WZ Skill／String.Skill；使用者提供之遊戲截圖與指定網站例外，及先前核對之傳授連結技能數值",
      "previousDescription": "受擊傷害 -4%，包含百分比傷害。"
    },
    "大自然夥伴": {
      "id": "31",
      "name": "大自然夥伴",
      "summary": "傷害 +7%；擊退一般怪物 20 隻後，對一般怪物傷害再 +15%（30 秒）",
      "description": "永久傷害 +7%；擊敗 20 隻一般怪物後，對一般怪物傷害再 +15%，持續 30 秒，冷卻 30 秒。",
      "image": "assets/skills/31.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "傷害提升3%，\n擊退一般怪物20隻後發動大自然的幫助，大自然的幫助發動時30秒間攻擊一般怪物傷害增加7%，\n冷卻時間30秒"
        },
        {
          "label": "Lv.2",
          "effect": "傷害提升5%，\n擊退一般怪物20隻後發動大自然的幫助，大自然的幫助發動時30秒間攻擊一般怪物傷害增加11%，\n冷卻時間30秒"
        },
        {
          "label": "Lv.3",
          "effect": "傷害提升10%，\n擊退一般怪物20隻後發動大自然的幫助，大自然的幫助發動時30秒間攻擊一般怪物傷害增加15%，\n冷卻時間30秒"
        },
        {
          "label": "傳授連結技能",
          "effect": "永久傷害 +7%；擊敗 20 隻一般怪物後，對一般怪物傷害再 +15%，持續 30 秒，冷卻 30 秒。"
        }
      ],
      "levelKind": "single",
      "levelNote": "依多多谷 V282 WZ 逐級效果與已保存的傳授連結技能核對資料；傳授連結技能與自身不同時，以「傳授連結技能」欄為準。 傳授連結技能傷害 +7% 沿用先前核對資料；WZ 角色自身為 +10%。",
      "levelSource": "多多谷 V282 WZ Skill／String.Skill；使用者提供之遊戲截圖與指定網站例外，及先前核對之傳授連結技能數值",
      "previousDescription": "總傷害 +5%；擊殺 20 隻怪物後，對一般怪物總傷害 +11%，持續 30 秒，冷卻 30 秒。"
    },
    "自信心": {
      "id": "32",
      "name": "自信心",
      "summary": "無視防禦率 +15%；攻擊滿 HP 怪物傷害 +19%",
      "description": "使用傳授連結技能時無視防禦 +15%，對 HP 全滿的怪物傷害 +19%（不含虎影自身額外傷害）。",
      "image": "assets/skills/32.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "無視防禦率增加5%，攻擊HP為100%的怪物時傷害增加9%"
        },
        {
          "label": "Lv.2",
          "effect": "無視防禦率增加10%，攻擊HP為100%的怪物時傷害增加14%"
        },
        {
          "label": "Lv.3",
          "effect": "無視防禦率15%、傷害增加4%，攻擊HP為100%的怪物時傷害增加19%"
        },
        {
          "label": "傳授連結技能",
          "effect": "使用傳授連結技能時無視防禦 +15%，對 HP 全滿的怪物傷害 +19%（不含虎影自身額外傷害）。"
        }
      ],
      "levelKind": "single",
      "levelNote": "依多多谷 V282 WZ 逐級效果與已保存的傳授連結技能核對資料；傳授連結技能與自身不同時，以「傳授連結技能」欄為準。",
      "levelSource": "多多谷 V282 WZ Skill／String.Skill；使用者提供之遊戲截圖與指定網站例外，及先前核對之傳授連結技能數值",
      "previousDescription": "無視防禦 +10%；攻擊滿血怪物時總傷害 +14%。"
    },
    "時之祝福": {
      "id": "33",
      "name": "時之祝福",
      "summary": "所受傷害減少 20%、無視防禦率 +15%",
      "description": "最高等級所受傷害減少 20%、無視防禦率增加 15%（依指定網站等級表）。",
      "image": "assets/skills/33.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": "所受傷害減少3%，無視防禦率增加2%。"
        },
        {
          "label": "Lv.2",
          "effect": "所受傷害減少6%，無視防禦率增加4%。"
        },
        {
          "label": "Lv.3",
          "effect": "所受傷害減少9%，無視防禦率增加6%。"
        },
        {
          "label": "傳授連結技能",
          "effect": "最高等級所受傷害減少 20%、無視防禦率增加 15%（依指定網站等級表）。"
        }
      ],
      "levelKind": "single",
      "levelNote": "依多多谷 V282 WZ 逐級效果與已保存的傳授連結技能核對資料；傳授連結技能與自身不同時，以「傳授連結技能」欄為準。 Lv.1～6 減傷與無視以使用者指定網站等級表為準；不加入 WZ 自身額外傷害。",
      "levelSource": "多多谷 V282 WZ Skill／String.Skill；使用者提供之遊戲截圖與指定網站例外，及先前核對之傳授連結技能數值",
      "previousDescription": "Lv.5：受擊傷害 -15%，無視防禦 +10%。"
    },
    "判斷": {
      "id": "34",
      "name": "判斷",
      "summary": "爆擊傷害 +6%",
      "description": "爆擊 傷害 6% 增加",
      "image": "assets/skills/34.png",
      "levels": [
        {
          "label": "Lv.1",
          "effect": " 爆擊 傷害 2% 增加"
        },
        {
          "label": "Lv.2",
          "effect": " 爆擊 傷害 4% 增加"
        },
        {
          "label": "Lv.3",
          "effect": " 爆擊 傷害 6% 增加"
        },
        {
          "label": "傳授連結技能",
          "effect": " 爆擊 傷害 6% 增加"
        }
      ],
      "levelKind": "single",
      "levelNote": "依多多谷 V282 WZ 逐級效果與已保存的傳授連結技能核對資料；傳授連結技能與自身不同時，以「傳授連結技能」欄為準。",
      "levelSource": "多多谷 V282 WZ Skill／String.Skill；使用者提供之遊戲截圖與指定網站例外，及先前核對之傳授連結技能數值",
      "previousDescription": "爆擊傷害 +4%。"
    }
  },
  "jobs": [
    {
      "id": "j01",
      "name": "英雄",
      "series": "冒險家",
      "type": "劍士",
      "image": "assets/jobs/01.png",
      "sss": "STR +100",
      "skill": "不屈的信念",
      "pdfPage": 1,
      "unionRanks": {
        "S": "STR +40",
        "SS": "STR +80",
        "SSS": "STR +100"
      }
    },
    {
      "id": "j02",
      "name": "聖騎士",
      "series": "冒險家",
      "type": "劍士",
      "image": "assets/jobs/02.png",
      "sss": "STR +100",
      "skill": "不屈的信念",
      "pdfPage": 2,
      "unionRanks": {
        "S": "STR +40",
        "SS": "STR +80",
        "SSS": "STR +100"
      }
    },
    {
      "id": "j03",
      "name": "黑騎士",
      "series": "冒險家",
      "type": "劍士",
      "image": "assets/jobs/03.png",
      "sss": "MaxHP +6%",
      "skill": "不屈的信念",
      "pdfPage": 2,
      "unionRanks": {
        "S": "MaxHP +4%",
        "SS": "MaxHP +5%",
        "SSS": "MaxHP +6%"
      }
    },
    {
      "id": "j04",
      "name": "大魔導士火,毒",
      "series": "冒險家",
      "type": "法師",
      "image": "assets/jobs/04.png",
      "sss": "MaxMP +6%",
      "skill": "實戰的知識",
      "pdfPage": 2,
      "unionRanks": {
        "S": "MaxMP +4%",
        "SS": "MaxMP +5%",
        "SSS": "MaxMP +6%"
      }
    },
    {
      "id": "j05",
      "name": "大魔導士冰,雷",
      "series": "冒險家",
      "type": "法師",
      "image": "assets/jobs/05.png",
      "sss": "INT +100",
      "skill": "實戰的知識",
      "pdfPage": 2,
      "unionRanks": {
        "S": "INT +40",
        "SS": "INT +80",
        "SSS": "INT +100"
      }
    },
    {
      "id": "j06",
      "name": "主教",
      "series": "冒險家",
      "type": "法師",
      "image": "assets/jobs/06.png",
      "sss": "INT +100",
      "skill": "實戰的知識",
      "pdfPage": 2,
      "unionRanks": {
        "S": "INT +40",
        "SS": "INT +80",
        "SSS": "INT +100"
      }
    },
    {
      "id": "j07",
      "name": "箭神",
      "series": "冒險家",
      "type": "弓箭手",
      "image": "assets/jobs/07.png",
      "sss": "DEX +100",
      "skill": "探險家的好奇心",
      "pdfPage": 2,
      "unionRanks": {
        "S": "DEX +40",
        "SS": "DEX +80",
        "SSS": "DEX +100"
      }
    },
    {
      "id": "j08",
      "name": "神射手",
      "series": "冒險家",
      "type": "弓箭手",
      "image": "assets/jobs/08.png",
      "sss": "爆擊率 +5%",
      "skill": "探險家的好奇心",
      "pdfPage": 3,
      "unionRanks": {
        "S": "爆擊率 +3%",
        "SS": "爆擊率 +4%",
        "SSS": "爆擊率 +5%"
      }
    },
    {
      "id": "j09",
      "name": "開拓者",
      "series": "冒險家",
      "type": "弓箭手",
      "image": "assets/jobs/09.png",
      "sss": "DEX +100",
      "skill": "探險家的好奇心",
      "pdfPage": 3,
      "unionRanks": {
        "S": "DEX +40",
        "SS": "DEX +80",
        "SSS": "DEX +100"
      }
    },
    {
      "id": "j10",
      "name": "夜使者",
      "series": "冒險家",
      "type": "盜賊",
      "image": "assets/jobs/10.png",
      "sss": "爆擊率 +5%",
      "skill": "小偷的狡詐",
      "pdfPage": 3,
      "unionRanks": {
        "S": "爆擊率 +3%",
        "SS": "爆擊率 +4%",
        "SSS": "爆擊率 +5%"
      }
    },
    {
      "id": "j11",
      "name": "暗影神偷",
      "series": "冒險家",
      "type": "盜賊",
      "image": "assets/jobs/11.png",
      "sss": "LUK +100",
      "skill": "小偷的狡詐",
      "pdfPage": 3,
      "unionRanks": {
        "S": "LUK +40",
        "SS": "LUK +80",
        "SSS": "LUK +100"
      }
    },
    {
      "id": "j12",
      "name": "影武者",
      "series": "冒險家",
      "type": "盜賊",
      "image": "assets/jobs/12.png",
      "sss": "LUK +100",
      "skill": "小偷的狡詐",
      "pdfPage": 3,
      "unionRanks": {
        "S": "LUK +40",
        "SS": "LUK +80",
        "SSS": "LUK +100"
      }
    },
    {
      "id": "j13",
      "name": "拳霸",
      "series": "冒險家",
      "type": "海盜",
      "image": "assets/jobs/13.png",
      "sss": "STR +100",
      "skill": "海盜的祝福",
      "pdfPage": 3,
      "unionRanks": {
        "S": "STR +40",
        "SS": "STR +80",
        "SSS": "STR +100"
      }
    },
    {
      "id": "j14",
      "name": "槍神",
      "series": "冒險家",
      "type": "海盜",
      "image": "assets/jobs/14.png",
      "sss": "召喚獸時間 +12%",
      "skill": "海盜的祝福",
      "pdfPage": 4,
      "unionRanks": {
        "S": "召喚獸時間 +8%",
        "SS": "召喚獸時間 +10%",
        "SSS": "召喚獸時間 +12%"
      }
    },
    {
      "id": "j15",
      "name": "重砲指揮官",
      "series": "冒險家",
      "type": "海盜",
      "image": "assets/jobs/15.png",
      "sss": "STR +100",
      "skill": "海盜的祝福",
      "pdfPage": 4,
      "unionRanks": {
        "S": "STR +40",
        "SS": "STR +80",
        "SSS": "STR +100"
      }
    },
    {
      "id": "j16",
      "name": "聖魂劍士",
      "series": "皇家騎士團",
      "type": "劍士",
      "image": "assets/jobs/16.png",
      "sss": "MaxHP +2500",
      "skill": "西格諾斯祝福",
      "pdfPage": 4,
      "unionRanks": {
        "S": "MaxHP +1000",
        "SS": "MaxHP +2000",
        "SSS": "MaxHP +2500"
      }
    },
    {
      "id": "j17",
      "name": "米哈逸",
      "series": "皇家騎士團",
      "type": "劍士",
      "image": "assets/jobs/17.png",
      "sss": "MaxHP +2500",
      "skill": "光之守護",
      "pdfPage": 5,
      "unionRanks": {
        "S": "MaxHP +1000",
        "SS": "MaxHP +2000",
        "SSS": "MaxHP +2500"
      }
    },
    {
      "id": "j18",
      "name": "烈焰巫師",
      "series": "皇家騎士團",
      "type": "法師",
      "image": "assets/jobs/18.png",
      "sss": "INT +100",
      "skill": "西格諾斯祝福",
      "pdfPage": 4,
      "unionRanks": {
        "S": "INT +40",
        "SS": "INT +80",
        "SSS": "INT +100"
      }
    },
    {
      "id": "j19",
      "name": "破風使者",
      "series": "皇家騎士團",
      "type": "弓箭手",
      "image": "assets/jobs/19.png",
      "sss": "DEX +100",
      "skill": "西格諾斯祝福",
      "pdfPage": 4,
      "unionRanks": {
        "S": "DEX +40",
        "SS": "DEX +80",
        "SSS": "DEX +100"
      }
    },
    {
      "id": "j20",
      "name": "暗夜行者",
      "series": "皇家騎士團",
      "type": "盜賊",
      "image": "assets/jobs/20.png",
      "sss": "LUK +100",
      "skill": "西格諾斯祝福",
      "pdfPage": 5,
      "unionRanks": {
        "S": "LUK +40",
        "SS": "LUK +80",
        "SSS": "LUK +100"
      }
    },
    {
      "id": "j21",
      "name": "閃雷悍將",
      "series": "皇家騎士團",
      "type": "海盜",
      "image": "assets/jobs/21.png",
      "sss": "STR +100",
      "skill": "西格諾斯祝福",
      "pdfPage": 5,
      "unionRanks": {
        "S": "STR +40",
        "SS": "STR +80",
        "SSS": "STR +100"
      }
    },
    {
      "id": "j22",
      "name": "狂狼勇士",
      "series": "英雄團",
      "type": "劍士",
      "image": "assets/jobs/22.png",
      "sss": "打擊時 70% 機率恢復 HP 10%",
      "skill": "連續擊殺優勢",
      "pdfPage": 7,
      "unionRanks": {
        "S": "打擊時 70% 機率恢復 HP 6%",
        "SS": "打擊時 70% 機率恢復 HP 8%",
        "SSS": "打擊時 70% 機率恢復 HP 10%"
      }
    },
    {
      "id": "j23",
      "name": "龍魔導士",
      "series": "英雄團",
      "type": "法師",
      "image": "assets/jobs/23.png",
      "sss": "打擊時 70% 機率恢復 MP 10%",
      "skill": "輪之堅持",
      "pdfPage": 7,
      "unionRanks": {
        "S": "打擊時 70% 機率恢復 MP 6%",
        "SS": "打擊時 70% 機率恢復 MP 8%",
        "SSS": "打擊時 70% 機率恢復 MP 10%"
      }
    },
    {
      "id": "j24",
      "name": "夜光",
      "series": "英雄團",
      "type": "法師",
      "image": "assets/jobs/24.png",
      "sss": "INT +100",
      "skill": "滲透",
      "pdfPage": 7,
      "unionRanks": {
        "S": "INT +40",
        "SS": "INT +80",
        "SSS": "INT +100"
      }
    },
    {
      "id": "j25",
      "name": "精靈遊俠",
      "series": "英雄團",
      "type": "弓箭手",
      "image": "assets/jobs/25.png",
      "sss": "技能冷卻時間 -6%",
      "skill": "精靈的祝福",
      "pdfPage": 7,
      "unionRanks": {
        "S": "技能冷卻時間 -4%",
        "SS": "技能冷卻時間 -5%",
        "SSS": "技能冷卻時間 -6%"
      }
    },
    {
      "id": "j26",
      "name": "幻影俠盜",
      "series": "英雄團",
      "type": "盜賊",
      "image": "assets/jobs/26.png",
      "sss": "楓幣獲得 +5%",
      "skill": "致命本能",
      "pdfPage": 7,
      "unionRanks": {
        "S": "楓幣獲得 +3%",
        "SS": "楓幣獲得 +4%",
        "SSS": "楓幣獲得 +5%"
      }
    },
    {
      "id": "j27",
      "name": "隱月",
      "series": "英雄團",
      "type": "海盜",
      "image": "assets/jobs/27.png",
      "sss": "爆擊傷害 +6%",
      "skill": "死裡逃生",
      "pdfPage": 7,
      "unionRanks": {
        "S": "爆擊傷害 +3%",
        "SS": "爆擊傷害 +5%",
        "SSS": "爆擊傷害 +6%"
      }
    },
    {
      "id": "j28",
      "name": "惡魔殺手",
      "series": "惡魔",
      "type": "劍士",
      "image": "assets/jobs/28.png",
      "sss": "狀態異常耐性 +5",
      "skill": "惡魔之怒",
      "pdfPage": 6,
      "unionRanks": {
        "S": "狀態異常耐性 +3",
        "SS": "狀態異常耐性 +4",
        "SSS": "狀態異常耐性 +5"
      }
    },
    {
      "id": "j29",
      "name": "惡魔復仇者",
      "series": "惡魔",
      "type": "劍士",
      "image": "assets/jobs/29.png",
      "sss": "BOSS 傷害 +6%",
      "skill": "狂暴鬥氣",
      "pdfPage": 6,
      "unionRanks": {
        "S": "BOSS 傷害 +3%",
        "SS": "BOSS 傷害 +5%",
        "SSS": "BOSS 傷害 +6%"
      }
    },
    {
      "id": "j30",
      "name": "爆拳槍神",
      "series": "末日反抗軍",
      "type": "劍士",
      "image": "assets/jobs/30.png",
      "sss": "無視防禦 +6%",
      "skill": "自由精神",
      "pdfPage": 5,
      "unionRanks": {
        "S": "無視防禦 +3%",
        "SS": "無視防禦 +5%",
        "SSS": "無視防禦 +6%"
      }
    },
    {
      "id": "j31",
      "name": "煉獄巫師",
      "series": "末日反抗軍",
      "type": "法師",
      "image": "assets/jobs/31.png",
      "sss": "INT +100",
      "skill": "自由精神",
      "pdfPage": 5,
      "unionRanks": {
        "S": "INT +40",
        "SS": "INT +80",
        "SSS": "INT +100"
      }
    },
    {
      "id": "j32",
      "name": "狂豹獵人",
      "series": "末日反抗軍",
      "type": "弓箭手",
      "image": "assets/jobs/32.png",
      "sss": "攻擊時 20% 機率總傷害 +20%",
      "skill": "自由精神",
      "pdfPage": 6,
      "unionRanks": {
        "S": "攻擊時 20% 機率總傷害 +12%",
        "SS": "攻擊時 20% 機率總傷害 +16%",
        "SSS": "攻擊時 20% 機率總傷害 +20%"
      }
    },
    {
      "id": "j33",
      "name": "機甲戰神",
      "series": "末日反抗軍",
      "type": "海盜",
      "image": "assets/jobs/33.png",
      "sss": "Buff 時間 +25%",
      "skill": "自由精神",
      "pdfPage": 6,
      "unionRanks": {
        "S": "Buff 時間 +15%",
        "SS": "Buff 時間 +20%",
        "SSS": "Buff 時間 +25%"
      }
    },
    {
      "id": "j34",
      "name": "傑諾",
      "series": "末日反抗軍",
      "type": "混合",
      "image": "assets/jobs/34.png",
      "sss": "STR／DEX／LUK +50",
      "skill": "合成邏輯",
      "pdfPage": 6,
      "unionRanks": {
        "S": "STR／DEX／LUK +20",
        "SS": "STR／DEX／LUK +40",
        "SSS": "STR／DEX／LUK +50"
      }
    },
    {
      "id": "j35",
      "name": "劍豪",
      "series": "曉之陣",
      "type": "劍士",
      "image": "assets/jobs/35.png",
      "sss": "爆擊傷害 +6%",
      "skill": "蒼刃傳授",
      "pdfPage": 1,
      "unionRanks": {
        "S": "爆擊傷害 +3%",
        "SS": "爆擊傷害 +5%",
        "SSS": "爆擊傷害 +6%"
      }
    },
    {
      "id": "j36",
      "name": "陰陽師",
      "series": "曉之陣",
      "type": "法師",
      "image": "assets/jobs/36.png",
      "sss": "BOSS 傷害 +6%",
      "skill": "紫扇傳授",
      "pdfPage": 1,
      "unionRanks": {
        "S": "BOSS 傷害 +3%",
        "SS": "BOSS 傷害 +5%",
        "SSS": "BOSS 傷害 +6%"
      }
    },
    {
      "id": "j37",
      "name": "凱撒",
      "series": "超新星",
      "type": "劍士",
      "image": "assets/jobs/37.png",
      "sss": "STR +100",
      "skill": "鋼鐵意志",
      "pdfPage": 8,
      "unionRanks": {
        "S": "STR +40",
        "SS": "STR +80",
        "SSS": "STR +100"
      }
    },
    {
      "id": "j38",
      "name": "凱殷",
      "series": "超新星",
      "type": "弓箭手",
      "image": "assets/jobs/38.png",
      "sss": "DEX +100",
      "skill": "事前準備",
      "pdfPage": 8,
      "unionRanks": {
        "S": "DEX +40",
        "SS": "DEX +80",
        "SSS": "DEX +100"
      }
    },
    {
      "id": "j39",
      "name": "卡蒂娜",
      "series": "超新星",
      "type": "盜賊",
      "image": "assets/jobs/39.png",
      "sss": "LUK +100",
      "skill": "集中狂攻",
      "pdfPage": 8,
      "unionRanks": {
        "S": "LUK +40",
        "SS": "LUK +80",
        "SSS": "LUK +100"
      }
    },
    {
      "id": "j40",
      "name": "天使破壞者",
      "series": "超新星",
      "type": "海盜",
      "image": "assets/jobs/40.png",
      "sss": "DEX +100",
      "skill": "靈魂契約",
      "pdfPage": 8,
      "unionRanks": {
        "S": "DEX +40",
        "SS": "DEX +80",
        "SSS": "DEX +100"
      }
    },
    {
      "id": "j41",
      "name": "神之子",
      "series": "超越者",
      "type": "劍士",
      "image": "assets/jobs/41.png",
      "sss": "經驗值 +12%",
      "skill": "時之祝福",
      "pdfPage": 10,
      "unionRanks": {
        "S": "經驗值 +8%",
        "SS": "經驗值 +10%",
        "SSS": "經驗值 +12%"
      }
    },
    {
      "id": "j42",
      "name": "阿戴爾",
      "series": "雷普",
      "type": "劍士",
      "image": "assets/jobs/42.png",
      "sss": "STR +100",
      "skill": "貴族",
      "pdfPage": 9,
      "unionRanks": {
        "S": "STR +40",
        "SS": "STR +80",
        "SSS": "STR +100"
      }
    },
    {
      "id": "j43",
      "name": "伊利恩",
      "series": "雷普",
      "type": "法師",
      "image": "assets/jobs/43.png",
      "sss": "INT +100",
      "skill": "戰鬥的流動",
      "pdfPage": 9,
      "unionRanks": {
        "S": "INT +40",
        "SS": "INT +80",
        "SSS": "INT +100"
      }
    },
    {
      "id": "j44",
      "name": "卡莉",
      "series": "雷普",
      "type": "盜賊",
      "image": "assets/jobs/44.png",
      "sss": "LUK +100",
      "skill": "天賦",
      "pdfPage": 9,
      "unionRanks": {
        "S": "LUK +40",
        "SS": "LUK +80",
        "SSS": "LUK +100"
      }
    },
    {
      "id": "j45",
      "name": "亞克",
      "series": "雷普",
      "type": "海盜",
      "image": "assets/jobs/45.png",
      "sss": "STR +100",
      "skill": "無我",
      "pdfPage": 9,
      "unionRanks": {
        "S": "STR +40",
        "SS": "STR +80",
        "SSS": "STR +100"
      }
    },
    {
      "id": "j46",
      "name": "蓮",
      "series": "阿尼瑪",
      "type": "劍士",
      "image": "assets/jobs/46.png",
      "sss": "最大移動速度 +10",
      "skill": "護體",
      "pdfPage": 10,
      "unionRanks": {
        "S": "最大移動速度 +6",
        "SS": "最大移動速度 +8",
        "SSS": "最大移動速度 +10"
      }
    },
    {
      "id": "j47",
      "name": "菈菈",
      "series": "阿尼瑪",
      "type": "法師",
      "image": "assets/jobs/47.png",
      "sss": "INT +100",
      "skill": "大自然夥伴",
      "pdfPage": 10,
      "unionRanks": {
        "S": "INT +40",
        "SS": "INT +80",
        "SSS": "INT +100"
      }
    },
    {
      "id": "j48",
      "name": "虎影",
      "series": "阿尼瑪",
      "type": "盜賊",
      "image": "assets/jobs/48.png",
      "sss": "LUK +100",
      "skill": "自信心",
      "pdfPage": 10,
      "unionRanks": {
        "S": "LUK +40",
        "SS": "LUK +80",
        "SSS": "LUK +100"
      }
    },
    {
      "id": "j49",
      "name": "琳恩",
      "series": "江湖",
      "type": "法師",
      "image": "assets/jobs/49.png",
      "sss": "無視防禦 +6%",
      "skill": "精靈集中",
      "pdfPage": 1,
      "unionRanks": {
        "S": "無視防禦 +3%",
        "SS": "無視防禦 +5%",
        "SSS": "無視防禦 +6%"
      }
    },
    {
      "id": "j50",
      "name": "墨玄",
      "series": "江湖",
      "type": "海盜",
      "image": "assets/jobs/50.png",
      "sss": "爆擊傷害 +6%",
      "skill": "氣魄",
      "pdfPage": 1,
      "unionRanks": {
        "S": "爆擊傷害 +3%",
        "SS": "爆擊傷害 +5%",
        "SSS": "爆擊傷害 +6%"
      }
    },
    {
      "id": "j51",
      "name": "凱內西斯",
      "series": "Friend's世界",
      "type": "法師",
      "image": "assets/jobs/51.png",
      "sss": "INT +100",
      "skill": "判斷",
      "pdfPage": 10,
      "unionRanks": {
        "S": "INT +40",
        "SS": "INT +80",
        "SSS": "INT +100"
      }
    }
  ],
  "typeIcons": {
    "劍士": "assets/types/type-01.png",
    "弓箭手": "assets/types/type-02.png",
    "法師": "assets/types/type-03.png",
    "海盜": "assets/types/type-04.png",
    "混合": "assets/types/type-05.png",
    "盜賊": "assets/types/type-06.png"
  }
};
