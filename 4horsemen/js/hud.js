(function (global) {
  const Game = global.Game || (global.Game = {});
  Game.HUD = Game.HUD || {};

  let maxHP = 100;
  let curHP = 100;

  let maxPower = 100;
  let curPower = 100;

  function els() {
    return {
      hpFill:   document.querySelector(".hp-fill"),
      hpText:   document.querySelector(".hp-text"),
      manaFill: document.querySelector(".mana-fill"),
      manaText: document.querySelector(".mana-text"),
      nameEl:   document.querySelector(".player-name"),
      lvlEl:    document.querySelector(".player-level"),
    };
  }

  Game.HUD.init = function initHUD(opts) {
    const e = els();

    if (opts && opts.name && e.nameEl) {
      e.nameEl.textContent = opts.name;
    }
    if (opts && opts.level && e.lvlEl) {
      e.lvlEl.textContent = opts.level;
    }

    Game.HUD.setHP(maxHP, maxHP);
    Game.HUD.setPower(maxPower, maxPower);
  };

  Game.HUD.setHP = function setHP(current, max) {
    curHP = Math.max(0, Math.min(current, max));
    maxHP = max;

    const pct = maxHP > 0 ? (curHP / maxHP) * 100 : 0;

    const e = els();
    if (e.hpFill) {
      e.hpFill.style.width = pct + "%";
    }
    if (e.hpText) {
      e.hpText.textContent = Math.round(curHP); // just "100"
    }
  };

  Game.HUD.setPower = function setPower(current, max) {
    curPower = Math.max(0, Math.min(current, max));
    maxPower = max;

    const pct = maxPower > 0 ? (curPower / maxPower) * 100 : 0;

    const e = els();
    if (e.manaFill) {
      e.manaFill.style.width = pct + "%";
    }
    if (e.manaText) {
      e.manaText.textContent = Math.round(curPower); // just "100"
    }
  };

  Game.HUD.getHP = function () {
    return { curHP, maxHP };
  };

  Game.HUD.getPower = function () {
    return { curPower, maxPower };
  };

})(window);
