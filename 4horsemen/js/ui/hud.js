// js/ui/hud.js
(function (global) {
  const Game = global.Game || (global.Game = {});
  Game.HUD = Game.HUD || {};

  //
  // PLAYER HUD
  //
  let _playerUnit = null;

  let hpFillEl,
    hpTextEl,
    hpOverlayTextEl,
    powerFillEl,
    powerTextEl,
    powerOverlayTextEl,
    nameEl,
    levelEl;

  //
  // TARGET HUD (next to player HUD)
  //
  let _targetUnit = null;
  let targetRootEl,       
    targetNameEl,
    targetLevelEl,
    targetHpFillEl,
    targetHpTextEl,
    targetHpOverlayEl,
    targetPowerFillEl,
    targetPowerTextEl,
    targetPowerOverlayEl;


  //
  // BOSS LIST HUD (top center)
  //
  let _bossFrames = [];

  // -------------------------
  // INIT PLAYER HUD
  // -------------------------
  Game.HUD.init = function init(opts) {
    _playerUnit = opts.unit || null;

    // player HUD DOM
    nameEl = document.getElementById("hud-name");
    levelEl = document.getElementById("hud-level");

    hpFillEl = document.getElementById("hp-fill");
    hpTextEl = document.getElementById("hp-text");
    hpOverlayTextEl = document.getElementById("hp-text-overlay");

    powerFillEl = document.getElementById("power-fill");
    powerTextEl = document.getElementById("power-text");
    powerOverlayTextEl =
      document.getElementById("power-text-overlay");

    if (nameEl && opts.name !== undefined) {
      nameEl.textContent = opts.name;
    }
    if (levelEl && opts.level !== undefined) {
      levelEl.textContent = "Lv " + opts.level;
    }

    // target HUD DOM
    targetNameEl = document.getElementById("target-hud-name");
    targetLevelEl = document.getElementById("target-hud-level");
    targetRootEl = document.getElementById("target-hud-root");

    targetHpFillEl = document.getElementById("target-hp-fill");
    targetHpTextEl = document.getElementById("target-hp-text");
    targetHpOverlayEl = document.getElementById(
      "target-hp-text-overlay"
    );

    targetPowerFillEl =
      document.getElementById("target-power-fill");
    targetPowerTextEl =
      document.getElementById("target-power-text");
    targetPowerOverlayEl = document.getElementById(
      "target-power-text-overlay"
    );

    Game.HUD.update();
    Game.HUD.updateTargetHUD();

    if (targetRootEl) {
      targetRootEl.style.display = "none";
    }

  };

  Game.HUD.setPlayerUnit = function setPlayerUnit(u) {
    _playerUnit = u;
  };

  // -------------------------
  // UPDATE PLAYER HUD
  // -------------------------
  Game.HUD.update = function update() {
    if (!_playerUnit) return;
    const hp = _playerUnit.hp;
    const maxHP = _playerUnit.maxHP || 1;
    const pw = _playerUnit.power;
    const maxPW = _playerUnit.maxPower || 1;

    const hpTextVal = hp + " / " + maxHP;
    const pwTextVal = pw + " / " + maxPW;

    if (hpTextEl) hpTextEl.textContent = hpTextVal;
    if (hpOverlayTextEl)
      hpOverlayTextEl.textContent = hpTextVal;

    if (powerTextEl) powerTextEl.textContent = pwTextVal;
    if (powerOverlayTextEl)
      powerOverlayTextEl.textContent = pwTextVal;

    const hpPct = Math.max(0, Math.min(1, hp / maxHP));
    const pwPct = Math.max(0, Math.min(1, pw / maxPW));

    if (hpFillEl) {
      hpFillEl.style.width = (hpPct * 100).toFixed(1) + "%";
    }
    if (powerFillEl) {
      powerFillEl.style.width = (pwPct * 100).toFixed(1) + "%";
    }
  };

  // -------------------------
  // TARGET HUD CONTROL
  // -------------------------
  Game.HUD.setTargetUnit = function setTargetUnit(unit, label) {

    _targetUnit = unit || null;

    if (!targetRootEl) {
      return;
    }

    if (_targetUnit) {
      targetRootEl.style.display = "block";
    } else {
      targetRootEl.style.display = "none";
    }

    if (targetNameEl) {
      targetNameEl.textContent =
        label || (_targetUnit ? _targetUnit.name || "Enemy" : "Target");
    }
    if (targetLevelEl) {
      targetLevelEl.textContent = _targetUnit ? "Lv 60" : "Lv ??";
    }

    Game.HUD.updateTargetHUD();
  };


  Game.HUD.clearTargetUnit = function clearTargetUnit() {

    _targetUnit = null;

    // hide the whole target HUD box
    if (targetRootEl) {
      targetRootEl.style.display = "none";
    }
  };


  Game.HUD.updateTargetHUD = function updateTargetHUD() {
    const u = _targetUnit;

    if (!targetRootEl) return;

    if (!u) {
      targetRootEl.style.display = "none";
      return;
    }

    targetRootEl.style.display = "block";

    const hp = u.hp;
    const maxHP = u.maxHP || 1;
    const pw = u.power;
    const maxPW = u.maxPower || 1;

    const hpTextVal = hp + " / " + maxHP;
    const pwTextVal = pw + " / " + maxPW;

    if (targetHpTextEl) targetHpTextEl.textContent = hpTextVal;
    if (targetHpOverlayEl) targetHpOverlayEl.textContent = hpTextVal;
    if (targetPowerTextEl) targetPowerTextEl.textContent = pwTextVal;
    if (targetPowerOverlayEl) targetPowerOverlayEl.textContent = pwTextVal;

    const hpPct = Math.max(0, Math.min(1, hp / maxHP));
    const pwPct = Math.max(0, Math.min(1, pw / maxPW));

    if (targetHpFillEl) {
      targetHpFillEl.style.width = (hpPct * 100).toFixed(1) + "%";
    }
    if (targetPowerFillEl) {
      targetPowerFillEl.style.width = (pwPct * 100).toFixed(1) + "%";
    }

    if (targetNameEl && u.name) {
      targetNameEl.textContent = u.name;
    }
  };



  // -------------------------
  // BOSS LIST HUD (CENTER TOP)
  // -------------------------
  Game.HUD.initBossList = function initBossList(horsemen) {
    _bossFrames = [];

    const col = document.getElementById("boss-hud-column");
    if (!col) return;

    col.innerHTML = "";

    // build one mini-frame per horseman
    for (const h of horsemen) {
      const u = h.unit;
      const frame = document.createElement("div");
      frame.className = "boss-hud-frame";

      const header = document.createElement("div");
      header.className = "boss-hud-header";

      const nameSpan = document.createElement("span");
      nameSpan.textContent = h.name || "Boss";
      const lvlSpan = document.createElement("span");
      lvlSpan.textContent = "Lv 60";

      header.appendChild(nameSpan);
      header.appendChild(lvlSpan);
      frame.appendChild(header);

      // HP row
      const hpLabelRow = document.createElement("div");
      hpLabelRow.className = "boss-bar-label";

      const hpLeft = document.createElement("span");
      hpLeft.textContent = "HP";
      const hpRight = document.createElement("span");
      const hpTrack = document.createElement("div");
      hpTrack.className = "boss-bar-track";

      const hpFill = document.createElement("div");
      hpFill.className = "boss-hp-fill";

      const hpOverlay = document.createElement("div");
      hpOverlay.className = "boss-bar-overlay";

      hpTrack.appendChild(hpFill);
      hpTrack.appendChild(hpOverlay);

      hpLabelRow.appendChild(hpLeft);
      hpLabelRow.appendChild(hpRight);

      // POWER row
      const pwLabelRow = document.createElement("div");
      pwLabelRow.className = "boss-bar-label";

      const pwLeft = document.createElement("span");
      pwLeft.textContent = "Power";
      const pwRight = document.createElement("span");
      const pwTrack = document.createElement("div");
      pwTrack.className = "boss-bar-track";

      const pwFill = document.createElement("div");
      pwFill.className = "boss-power-fill";

      const pwOverlay = document.createElement("div");
      pwOverlay.className = "boss-bar-overlay";

      pwTrack.appendChild(pwFill);
      pwTrack.appendChild(pwOverlay);

      pwLabelRow.appendChild(pwLeft);
      pwLabelRow.appendChild(pwRight);

      // attach rows
      frame.appendChild(hpLabelRow);
      frame.appendChild(hpTrack);

      frame.appendChild(pwLabelRow);
      frame.appendChild(pwTrack);

      col.appendChild(frame);

      _bossFrames.push({
        unit: u,
        nameEl: nameSpan,
        hpTextRightEl: hpRight,
        hpFillEl: hpFill,
        hpOverlayEl: hpOverlay,
        pwTextRightEl: pwRight,
        pwFillEl: pwFill,
        pwOverlayEl: pwOverlay
      });
    }

    Game.HUD.updateBossList();
  };

  Game.HUD.updateBossList = function updateBossList() {
    for (const f of _bossFrames) {
      const u = f.unit;
      if (!u) continue;

      const hp = u.hp;
      const maxHP = u.maxHP || 1;
      const pw = u.power;
      const maxPW = u.maxPower || 1;

      const hpPct = Math.max(0, Math.min(1, hp / maxHP));
      const pwPct = Math.max(0, Math.min(1, pw / maxPW));

      const hpTextVal = hp + " / " + maxHP;
      const pwTextVal = pw + " / " + maxPW;

      if (f.hpFillEl) {
        f.hpFillEl.style.width =
          (hpPct * 100).toFixed(1) + "%";
      }
      if (f.hpOverlayEl) {
        f.hpOverlayEl.textContent = hpTextVal;
      }
      if (f.hpTextRightEl) {
        f.hpTextRightEl.textContent = hpTextVal;
      }

      if (f.pwFillEl) {
        f.pwFillEl.style.width =
          (pwPct * 100).toFixed(1) + "%";
      }
      if (f.pwOverlayEl) {
        f.pwOverlayEl.textContent = pwTextVal;
      }
      if (f.pwTextRightEl) {
        f.pwTextRightEl.textContent = pwTextVal;
      }
    }
  };

})(window);
