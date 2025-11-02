// js/systems/AuraSystem.js
(function (global) {
  const Game = global.Game || (global.Game = {});
  Game.Systems = Game.Systems || {};

  /**
   * AuraSystem
   *
   * Responsibilities:
   * - Each horseman has an aura radius.
   * - If the player is inside that radius:
   *    - Periodically apply/refresh a stack of that aura.
   *    - Deal damage to the player based on current stack count.
   * - Track individual stacks with decay timers.
   * - Update debuff UI (stack counts + remaining duration).
   *
   * Key model:
   *   debuffs[debuffId] = {
   *     color: "#00ff00",
   *     stacks: number,
   *     expiresAt: number (ms timestamp when the LAST stack will fall off)
   *   }
   *
   * Model 1 timer per aura for now:
   *   - Every time we reapply/add a stack, we "refresh" expiresAt.
   *   - After duration passes, that aura's stacks drop to 0.
   *
   */

  Game.Systems.AuraSystem = (function () {
    // ----------------------------
    // CONFIG / TUNABLES
    // ----------------------------

    const APPLY_INTERVAL = Game.Constants.AURA_TICK_INTERVAL ?? 1.0;

    const STACK_DURATION = 30.0;

    const DAMAGE_PER_STACK = Game.Constants.AURA_DAMAGE_PER_STACK ?? 3;

    const AURA_RADIUS = Game.Constants.AURA_RADIUS ?? 10;

    // ----------------------------
    // INTERNAL STATE
    // ----------------------------

    // debuffsById tracks current stacks info per aura ID ("plague", "frost", etc)
    //
    // {
    //   plague: {
    //     color: "#00ff00",
    //     stacks: 2,
    //     expiresAt: <ms timestamp>
    //   },
    //   frost: {
    //     color: "#00c8ff",
    //     stacks: 1,
    //     expiresAt: <ms timestamp>
    //   }
    // }
    //
    let debuffsById = {};

    let tickAccumulator = 0;

    let _playerUnit = null;
    let _horsemen = null;

    // ----------------------------
    // UTILS
    // ----------------------------

    function getPlayerWorldPos() {
      if (!Game.State || !Game.State.playerMesh) {
        return null;
      }
      return Game.State.playerMesh.getPosition();
    }

    function distanceXZ(a, b) {
      const dx = a.x - b.x;
      const dz = a.z - b.z;
      return Math.sqrt(dx * dx + dz * dz);
    }

    function isPlayerInAuraRange(horse) {
      const pPos = getPlayerWorldPos();
      if (!pPos) return false;

      const hPos = horse.getPosition();
      const dist = distanceXZ(pPos, hPos);
      return dist <= AURA_RADIUS;
    }

    function applyAuraStack(horse, nowMs) {
      if (!_playerUnit || !_playerUnit.alive) return;

      const debuffId = horse.debuffId;
      const color = horse.debuffColor || "#ffffff";

      if (!debuffsById[debuffId]) {
        debuffsById[debuffId] = {
          color,
          stacks: 0,
          expiresAt: nowMs + STACK_DURATION * 1000
        };
      }

      // increment stacks
      debuffsById[debuffId].stacks += 1;

      // refresh timer
      debuffsById[debuffId].expiresAt = nowMs + STACK_DURATION * 1000;

      // deal damage based on stacks
      const stacksNow = debuffsById[debuffId].stacks;
      const dmg = stacksNow * DAMAGE_PER_STACK;

      // Apply damage to the player's Unit,
      // HUD is already listening to hpChanged.
      _playerUnit.takeDamage(dmg);
    }

    function decayExpiredDebuffs(nowMs) {
      for (const [id, aura] of Object.entries(debuffsById)) {
        if (aura.expiresAt <= nowMs) {
          delete debuffsById[id];
        }
      }
    }

    // ----------------------------
    // UI SYNC
    // ----------------------------

    function updateDebuffUI(nowMs) {
      const container = document.getElementById("debuff-container");
      if (!container) return;

      container.innerHTML = "";

      for (const [id, aura] of Object.entries(debuffsById)) {
        const timeLeftMs = Math.max(0, aura.expiresAt - nowMs);
        const timeLeftSec = Math.ceil(timeLeftMs / 1000);

        // Build row
        const row = document.createElement("div");
        row.className = "debuff-row";
        row.setAttribute("data-id", id);

        // Color box
        const colorBox = document.createElement("div");
        colorBox.className = "debuff-color-box";
        colorBox.style.background = aura.color;
        row.appendChild(colorBox);

        // Info wrapper
        const info = document.createElement("div");
        info.className = "debuff-info";

        const stacksEl = document.createElement("span");
        stacksEl.className = "debuff-stacks";
        stacksEl.textContent = aura.stacks + "x";

        const timerEl = document.createElement("span");
        timerEl.className = "debuff-timer";
        timerEl.textContent = timeLeftSec + "s";

        info.appendChild(stacksEl);
        info.appendChild(timerEl);

        row.appendChild(info);

        container.appendChild(row);
      }
    }

    // ----------------------------
    // Public API
    // ----------------------------

    function init(ctx) {
      _playerUnit = ctx.playerUnit || null;
      _horsemen = ctx.horsemen || [];

      debuffsById = {};
      tickAccumulator = 0;
    }

    function update(dt, ctx) {
      if (!_playerUnit) return;
      if (!_playerUnit.alive) {
        return;
      }

      if (ctx && ctx.playerUnit) _playerUnit = ctx.playerUnit;
      if (ctx && ctx.horsemen) _horsemen = ctx.horsemen;

      tickAccumulator += dt;

      const nowMs = performance.now();

      if (tickAccumulator >= APPLY_INTERVAL) {
        tickAccumulator = 0;

        for (const horse of _horsemen) {
          if (isPlayerInAuraRange(horse)) {
            applyAuraStack(horse, nowMs);
          }
        }
      }

      // Remove expired stacks
      decayExpiredDebuffs(nowMs);

      // Update debuff UI panel
      updateDebuffUI(nowMs);
    }

    function clearAll() {
      debuffsById = {};
      tickAccumulator = 0;
      updateDebuffUI(performance.now());
    }

    return {
      init,
      update,
      clearAll
    };
  })();
})(window);
