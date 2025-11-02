// js/systems/CombatSystem.js
(function (global) {
  const Game = global.Game || (global.Game = {});
  Game.Systems = Game.Systems || {};

  Game.Systems.CombatSystem = (function () {

    function ensureRegenFields(unit) {
      if (!unit) return;
      if (unit._powerRegenAccum === undefined) {
        unit._powerRegenAccum = 0;
      }
    }

    function regenPowerTick(unit, dt) {
      if (!unit || !unit.regenPower) return;

      ensureRegenFields(unit);

      // +10 every 2s => +5/sec
      const REGEN_PER_SEC = 5;
      unit._powerRegenAccum += dt * REGEN_PER_SEC;

      // add whole points
      const whole = Math.floor(unit._powerRegenAccum);
      if (whole > 0) {
        unit.regenPower(whole); // this calls _emitStatsChanged()
        unit._powerRegenAccum -= whole;
      }
    }

    function dealDamage({ target, amount }) {
      if (!target || !target.unit) return;
      if (typeof target.unit.takeDamage === "function") {
        target.unit.takeDamage(amount);
      } else {
        // fallback if not migrated yet
        target.unit.hp -= amount;
        if (target.unit.hp < 0) target.unit.hp = 0;
      }
    }

    function heal({ targetUnit, amount }) {
      if (!targetUnit) return;
      if (typeof targetUnit.heal === "function") {
        targetUnit.heal(amount);
      } else {
        // fallback
        targetUnit.hp += amount;
        if (targetUnit.hp > targetUnit.maxHP) {
          targetUnit.hp = targetUnit.maxHP;
        }
      }
    }

    function spendPower(unit, amount) {
      if (!unit) return false;
      if (typeof unit.spendPower === "function") {
        return unit.spendPower(amount); 
      } else {
        if (unit.power < amount) return false;
        unit.power -= amount;
        if (unit.power < 0) unit.power = 0;
        return true;
      }
    }

    function update(dt, ctx) {
      // passive player regen
      let playerUnit = null;
      if (ctx.player && ctx.player.unit) {
        playerUnit = ctx.player.unit;
      } else if (ctx.playerUnit) {
        playerUnit = ctx.playerUnit;
      }

      if (playerUnit) {
        regenPowerTick(playerUnit, dt);
      }

    }

    return {
      update,
      dealDamage,
      heal,
      spendPower
    };
  })();
})(window);
