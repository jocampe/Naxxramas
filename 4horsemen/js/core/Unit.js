(function (global) {
  const Game = global.Game || (global.Game = {});
  Game.Core = Game.Core || {};

  Game.Core.Unit = function Unit(opts = {}) {

    const listeners = {
      statsChanged: [], // fired on hp/power change
      died: []          // fired on hp <= 0 once
    };

    const u = {
      id: opts.id || ("unit_" + Math.random().toString(16).slice(2)),
      name: opts.name || "Unit",

      maxHP: opts.maxHP ?? 100,
      hp: opts.hp ?? (opts.maxHP ?? 100),

      maxPower: opts.maxPower ?? 100,
      power: opts.power ?? (opts.maxPower ?? 100),

      tags: opts.tags ? opts.tags.slice() : [],

      _dead: false,

      // --- event registration ---
      onStatsChanged(cb) {
        if (typeof cb === "function") {
          listeners.statsChanged.push(cb);
        }
      },

      onDied(cb) {
        if (typeof cb === "function") {
          listeners.died.push(cb);
        }
      },

      _emitStatsChanged() {
        for (const cb of listeners.statsChanged) {
          try { cb(u); } catch (err) { console.warn(err); }
        }
      },

      _emitDied() {
        for (const cb of listeners.died) {
          try { cb(u); } catch (err) { console.warn(err); }
        }
      },

      // --- mutators ALWAYS use to change stats ---
      takeDamage(amount) {
        if (amount <= 0) return;
        u.hp -= amount;
        if (u.hp < 0) u.hp = 0;

        // trigger change
        u._emitStatsChanged();

        // handle death
        if (!u._dead && u.hp <= 0) {
          u._dead = true;
          u._emitDied();
        }
      },

      heal(amount) {
        if (amount <= 0) return;
        u.hp += amount;
        if (u.hp > u.maxHP) u.hp = u.maxHP;

        u._emitStatsChanged();
      },

      spendPower(amount) {
        if (amount <= 0) return true;
        if (u.power < amount) return false;
        u.power -= amount;
        if (u.power < 0) u.power = 0;
        u._emitStatsChanged();
        return true;
      },

      regenPower(amount) {
        if (amount <= 0) return;
        u.power += amount;
        if (u.power > u.maxPower) u.power = u.maxPower;
        u._emitStatsChanged();
      }
    };

    return u;
  };

})(window);
