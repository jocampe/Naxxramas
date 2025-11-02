// js/ui/AbilityBar.js
(function (global) {
  const Game = global.Game || (global.Game = {});
  Game.UI = Game.UI || {};

  /**
   * AbilityBar
   *
   * Renders the player's ability loadout (1/2/3).
   *
   * API:
   *   Game.UI.AbilityBar.init(loadout)
   *   Game.UI.AbilityBar.updateUI(runtimeState, playerUnit)
   *
   * loadout = [abilityDef, abilityDef, abilityDef]
   * abilityDef = { id, name, cooldown, costPower, ... }
   *
   * runtimeState comes from AbilitySystem.getRuntimeState()
   * runtimeState.cooldowns = [secondsLeft,...]
   */
  Game.UI.AbilityBar = (function () {
    let rootEl = null;
    let slotEls = []; // [{slotEl, cooldownEl, nameEl}, ...]

    function createSlotHTML(slotIndex, abilityDef, keyLabel) {
      const slot = document.createElement("div");
      slot.className = "ability-slot";

      const keybind = document.createElement("div");
      keybind.className = "ability-keybind";
      keybind.textContent = keyLabel;
      slot.appendChild(keybind);

      const name = document.createElement("div");
      name.className = "ability-name";
      name.textContent = abilityDef ? abilityDef.name : "";
      slot.appendChild(name);

      const cooldownOverlay = document.createElement("div");
      cooldownOverlay.className = "ability-cooldown-overlay";
      cooldownOverlay.style.display = "none";
      cooldownOverlay.textContent = "";
      slot.appendChild(cooldownOverlay);

      return {
        slotEl: slot,
        cooldownEl: cooldownOverlay,
        nameEl: name
      };
    }

    function init(loadout) {
      rootEl = document.getElementById("ability-bar-root");
      if (!rootEl) {
        console.warn("AbilityBar.init: #ability-bar-root not found");
        return;
      }

      rootEl.innerHTML = "";
      slotEls.length = 0;

      const keyLabels = ["1", "2", "3"];

      for (let i = 0; i < 3; i++) {
        const def = loadout[i];
        const ui = createSlotHTML(i, def || { name: "" }, keyLabels[i]);
        slotEls.push(ui);
        rootEl.appendChild(ui.slotEl);
      }
    }

    /**
     * runtimeState = {
     *   cooldowns: [number, number, number],
     *   loadout:   [abilityDef, abilityDef, abilityDef]
     * }
     *
     * playerUnit = the player's unit (hp, power, maxPower)
     *
     */
    function updateUI(runtimeState, playerUnit) {
      if (!slotEls.length || !runtimeState) return;

      for (let i = 0; i < slotEls.length; i++) {
        const ui = slotEls[i];
        const def = runtimeState.loadout[i];
        const cd = runtimeState.cooldowns[i] || 0;

        // Cooldown overlay
        if (cd > 0) {
          ui.cooldownEl.style.display = "flex";
          ui.cooldownEl.textContent = Math.ceil(cd).toString();
        } else {
          ui.cooldownEl.style.display = "none";
        }

        // Grey out if not enough power
        if (def && def.costPower && playerUnit) {
          const canAfford = playerUnit.power >= def.costPower;
          if (!canAfford) {
            ui.slotEl.classList.add("not-enough-power");
          } else {
            ui.slotEl.classList.remove("not-enough-power");
          }
        } else {
          ui.slotEl.classList.remove("not-enough-power");
        }
      }
    }

    return {
      init,
      updateUI
    };
  })();
})(window);
