// js/systems/FloatingStatusSystem.js
(function (global) {
  const Game = global.Game || (global.Game = {});
  Game.Systems = Game.Systems || {};

  Game.Systems.FloatingStatusSystem = (function () {

    function update(dt, ctx) {
      const { horsemen, camera } = ctx;
      if (!horsemen || !camera) return;

      for (const h of horsemen) {
        if (!h) continue;
        const bar = h.worldBar;
        const unit = h.unit;

        if (!bar) continue;

        if (unit) {
          syncBarFromUnit(bar, unit);
        }

        billboard(bar.root, camera);

        if (h.root && bar.root) {
          const basePos = h.root.position;
          bar.root.position.set(basePos.x, basePos.y + 20, basePos.z);
        }
      }
    }

    function syncBarFromUnit(bar, unit) {

      if (!bar.elementsInitialized) return;

      const hp = unit.hp;
      const maxHP = unit.maxHP || 1;
      const pw = unit.power;
      const maxPW = unit.maxPower || 1;

      const hpPct = Math.max(0, Math.min(1, hp / maxHP));
      const pwPct = Math.max(0, Math.min(1, pw / maxPW));

      if (bar.hpFillEl) {
        bar.hpFillEl.scale.x = hpPct;
      }
      if (bar.hpTextEl) {
        bar.hpTextEl.textContent = hp + " / " + maxHP;
      }

      if (bar.powerFillEl) {
        bar.powerFillEl.scale.x = pwPct;
      }
      if (bar.powerTextEl) {
        bar.powerTextEl.textContent = pw + " / " + maxPW;
      }

      if (bar.nameEl && unit.name) {
        bar.nameEl.textContent = unit.name;
      }
    }

    function billboard(obj3d, camera) {
      if (!obj3d) return;
      obj3d.lookAt(camera.position.x, obj3d.position.y, camera.position.z);
    }

    return {
      update
    };
  })();
})(window);
