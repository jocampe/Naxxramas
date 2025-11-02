// js/core/AbilityDefs.js
(function (global) {
  const Game = global.Game || (global.Game = {});
  Game.Core = Game.Core || {};

  Game.Core.PlayerRole = {
    TANK: "tank",
    DPS: "dps",
    HEALER: "healer"
  };

  // Helper: return the currently selected target, but only if it's alive
  // and in range of the player.
  function getExplicitTarget(playerObj, range) {
    const t = Game.State.currentTarget;
    if (!t || !t.unit || !t.root) {
      return null;
    }
    if (t.unit.hp <= 0) {
      return null;
    }

    // range check
    const ppos = playerObj.mesh.position;
    const tpos = t.root.position;
    const dx = ppos.x - tpos.x;
    const dz = ppos.z - tpos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > range) {
      return null;
    }

    return t;
  }

  Game.Core.AbilityDefs = (function () {
    const A = {};

    // 1. Melee Strike (short range, no power cost)
    A.MELEE = {
      id: "MELEE",
      name: "Melee Strike",
      cooldown: 1.0,
      costPower: 0,
      range: 6,
      execute(context) {
        const { playerObj } = context;

        const target = getExplicitTarget(playerObj, this.range);
        if (!target) {
          // no target or invalid
          return { ok: false, reason: "No valid target for melee" };
        }

        Game.Systems.CombatSystem.dealDamage({
          source: playerObj,
          target: target,
          amount: 15
        });

        return { ok: true };
      }
    };

    // 2. Ranged Attack (ranged nuke, costs power)
    A.CAST = {
      id: "CAST",
      name: "Ranged Attack",
      cooldown: 3.0,
      costPower: 20,
      range: 40,
      execute(context) {
        const { playerObj } = context;

        const target = getExplicitTarget(playerObj, this.range);
        if (!target) {
          return { ok: false, reason: "No valid target for cast" };
        }

        // spend resource first
        if (
          !Game.Systems.CombatSystem.spendPower(
            playerObj.unit,
            this.costPower
          )
        ) {
          return { ok: false, reason: "Not enough power" };
        }

        Game.Systems.CombatSystem.dealDamage({
          source: playerObj,
          target: target,
          amount: 30
        });

        return { ok: true };
      }
    };

    // 3. Dark Mend (self heal, requires power)
    A.HEAL = {
      id: "HEAL",
      name: "Heal",
      cooldown: 5.0,
      costPower: 30,
      range: 0,
      execute(context) {
        const { playerObj } = context;

        if (
          !Game.Systems.CombatSystem.spendPower(
            playerObj.unit,
            this.costPower
          )
        ) {
          return { ok: false, reason: "Not enough power" };
        }

        Game.Systems.CombatSystem.heal({
          targetUnit: playerObj.unit,
          amount: 25
        });

        return { ok: true };
      }
    };

    return {
      MELEE: A.MELEE,
      CAST: A.CAST,
      HEAL: A.HEAL
    };
  })();
})(window);
