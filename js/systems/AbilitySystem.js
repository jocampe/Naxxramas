// js/systems/AbilitySystem.js
(function (global) {
  const Game = global.Game || (global.Game = {});
  Game.Systems = Game.Systems || {};

  Game.Systems.AbilitySystem = (function () {

    // fire request flags (1-shot each frame)
    const fireRequest = {
      slot1: false,
      slot2: false,
      slot3: false
    };

    function onKeyDown(e) {
      switch (e.code) {
        case "Digit1":
        case "Numpad1":
          fireRequest.slot1 = true;
          break;
        case "Digit2":
        case "Numpad2":
          fireRequest.slot2 = true;
          break;
        case "Digit3":
        case "Numpad3":
          fireRequest.slot3 = true;
          break;
      }
    }

    function onKeyUp(e) {
      // no-op for now
    }

    let abilitySlots = [];    
    let abilityCooldowns = [];  
    let playerObjRef = null;

    function init(ctx) {
      // ctx.playerRole, ctx.playerObj
      const role = ctx.playerRole || Game.Core.PlayerRole.DPS;
      abilitySlots = Game.Core.getLoadoutForRole(role);
      abilityCooldowns = abilitySlots.map(() => 0);
      playerObjRef = ctx.playerObj || null;

      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);

      // build UI bar initially
      if (Game.UI && Game.UI.AbilityBar) {
        Game.UI.AbilityBar.init(abilitySlots);
      }
    }

    function tryCast(slotIndex, gameCtx) {
      const ability = abilitySlots[slotIndex];
      if (!ability) return;

      // if on cooldown, bail
      if (abilityCooldowns[slotIndex] > 0) {
        return;
      }

      // run the ability
      const result = ability.execute({
        playerObj: gameCtx.player,
        horsemen: gameCtx.horsemen
      });

      if (result && result.ok) {
        // start cooldown
        abilityCooldowns[slotIndex] = ability.cooldown;
      }
    }

    function update(dt, ctx) {
      // tick down cooldowns
      for (let i = 0; i < abilityCooldowns.length; i++) {
        if (abilityCooldowns[i] > 0) {
          abilityCooldowns[i] -= dt;
          if (abilityCooldowns[i] < 0) abilityCooldowns[i] = 0;
        }
      }

      // consume requested casts
      if (fireRequest.slot1) tryCast(0, ctx);
      if (fireRequest.slot2) tryCast(1, ctx);
      if (fireRequest.slot3) tryCast(2, ctx);

      fireRequest.slot1 = false;
      fireRequest.slot2 = false;
      fireRequest.slot3 = false;

      // Update the UI bar every frame
      if (Game.UI && Game.UI.AbilityBar && playerObjRef && playerObjRef.unit) {
        Game.UI.AbilityBar.updateUI(
          getRuntimeState(),
          playerObjRef.unit
        );
      }
    }

    function getRuntimeState() {
      return {
        loadout: abilitySlots,
        cooldowns: abilityCooldowns
      };
    }

    function destroy() {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    }

    return {
      init,
      update,
      destroy,
      getRuntimeState
    };
  })();
})(window);
