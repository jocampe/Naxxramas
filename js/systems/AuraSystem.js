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
      // preferred: playerMesh.mesh.position (because PlayerBall likely returns { mesh, ... })
      if (Game.State &&
        Game.State.playerMesh &&
        Game.State.playerMesh.mesh &&
        Game.State.playerMesh.mesh.position) {

        return {
          x: Game.State.playerMesh.mesh.position.x,
          y: Game.State.playerMesh.mesh.position.y,
          z: Game.State.playerMesh.mesh.position.z
        };
      }

      // fallback: if playerMesh has getPosition() from old code
      if (Game.State &&
        Game.State.playerMesh &&
        typeof Game.State.playerMesh.getPosition === "function") {
        return Game.State.playerMesh.getPosition();
      }

      console.warn("[AuraSystem] getPlayerWorldPos() could not find position");
      return null;
    }

    function getHorsemanWorldPos(horse) {
      // preferred: horse.root.position (the group added to scene)
      if (horse && horse.root && horse.root.position) {
        return {
          x: horse.root.position.x,
          y: horse.root.position.y,
          z: horse.root.position.z
        };
      }

      // fallback: old API
      if (horse && typeof horse.getPosition === "function") {
        return horse.getPosition();
      }

      console.warn("[AuraSystem] getHorsemanWorldPos() no position for", horse);
      return null;
    }

    function isPlayerInAuraRange(horse) {
      const pPos = getPlayerWorldPos();
      const hPos = getHorsemanWorldPos(horse);
      if (!pPos || !hPos) return false;

      const dist = distanceXZ(pPos, hPos);

      // debug distance
      console.log(
        "[AuraSystem] dist to",
        horse.name || horse.debuffId,
        "=",
        dist.toFixed(1),
        "(radius", AURA_RADIUS, ")"
      );

      return dist <= AURA_RADIUS;
    }


    function distanceXZ(a, b) {
      const dx = a.x - b.x;
      const dz = a.z - b.z;
      return Math.sqrt(dx * dx + dz * dz);
    }


    function applyAuraStack(horse, nowMs) {
      const debuffId = horse.debuffId;
      const color = horse.debuffColor || "#ffffff";

      console.log("[AuraSystem] applyAuraStack() called for", debuffId, "at", nowMs);

      if (!_playerUnit) {
        console.warn("[AuraSystem] no _playerUnit in applyAuraStack");
        return;
      }

      // If we migrated Unit to the new event-driven version,
      // it should have .takeDamage(). Let's confirm.
      if (typeof _playerUnit.takeDamage !== "function") {
        console.warn("[AuraSystem] playerUnit.takeDamage is missing!", _playerUnit);
      }

      // Create entry if needed
      if (!debuffsById[debuffId]) {
        debuffsById[debuffId] = {
          color,
          stacks: 0,
          expiresAt: nowMs + STACK_DURATION * 1000
        };
        console.log("[AuraSystem] created new debuff bucket for", debuffId);
      }

      // increment stacks
      debuffsById[debuffId].stacks += 1;
      debuffsById[debuffId].expiresAt = nowMs + STACK_DURATION * 1000;

      const stacksNow = debuffsById[debuffId].stacks;
      const dmg = stacksNow * DAMAGE_PER_STACK;

      console.log(
        "[AuraSystem] debuff",
        debuffId,
        "now stacks=", stacksNow,
        "expiresAt=", debuffsById[debuffId].expiresAt,
        "dealing dmg=", dmg
      );

      // Apply damage to player
      if (typeof _playerUnit.takeDamage === "function") {
        _playerUnit.takeDamage(dmg);
        console.log(
          "[AuraSystem] dealt",
          dmg,
          "damage to player. player hp now",
          _playerUnit.hp,
          "/",
          _playerUnit.maxHP
        );
      } else {
        // fallback just in case you're still on older Unit without takeDamage()
        _playerUnit.hp -= dmg;
        if (_playerUnit.hp < 0) _playerUnit.hp = 0;

        console.log(
          "[AuraSystem] fallback damage applied. player hp now",
          _playerUnit.hp,
          "/",
          _playerUnit.maxHP
        );

        // if you haven't yet wired HUD.onStatsChanged(),
        // HUD may not update automatically here.
        if (_playerUnit.onStatsChanged) {
          _playerUnit.onStatsChanged.forEach?.(cb => cb(_playerUnit));
        }
      }
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

      console.log("[AuraSystem.init] playerUnit:", _playerUnit);
      console.log("[AuraSystem.init] horsemen:", _horsemen);
      console.log("[AuraSystem.init] horsemen count:", _horsemen.length);

      debuffsById = {};
      tickAccumulator = 0;
    }

    function update(dt, ctx) {
      // just to be safe, keep refs fresh
      if (ctx && ctx.playerUnit) _playerUnit = ctx.playerUnit;
      if (ctx && ctx.horsemen) _horsemen = ctx.horsemen;

      if (!_playerUnit) return;

      // we used to check `_playerUnit.alive`, but Units don't have `.alive`.
      // We'll consider the unit "dead" if hp <= 0.
      const isDead = (_playerUnit.hp !== undefined && _playerUnit.hp <= 0);
      if (isDead) {
        // player is dead, aura stops ticking
        return;
      }

      tickAccumulator += dt;
      const nowMs = performance.now();

      // OPTIONAL DEBUG: see that update() is actually running past the guard
      // console.log("[AuraSystem.update] tickAccumulator:", tickAccumulator.toFixed(2));

      // every APPLY_INTERVAL seconds, evaluate auras and maybe add stacks
      if (tickAccumulator >= APPLY_INTERVAL) {
        tickAccumulator = 0;

        // loop horsemen and see if player is in range of each
        for (const horse of _horsemen) {
          if (!horse) continue;

          const inRange = isPlayerInAuraRange(horse);

          // DEBUG RANGE CHECK
          // We'll log once per interval so it's not insane spam:
          if (horse && horse.name) {
            console.log(
              "[AuraSystem] check range:",
              horse.name,
              "inRange=", inRange
            );
          }

          if (inRange) {
            console.log(
              "[AuraSystem] in range of",
              horse.name || horse.debuffId,
              "-> applying aura stack"
            );
            applyAuraStack(horse, nowMs);
          } else {
            // optional: you already log inRange=false above
          }

        }
      }

      // after applying stacks, remove any expired ones
      decayExpiredDebuffs(nowMs);

      // update the debuff UI in the top-right
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
