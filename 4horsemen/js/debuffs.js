(function (global) {
  const Game = global.Game || (global.Game = {});
  Game.Debuffs = Game.Debuffs || {};

  const stacks = Object.create(null); // { debuffId: stackCount }
  const timers = Object.create(null); // { debuffId: secondsRemaining }

  const APPLY_INTERVAL = 10; // seconds between stack applications
  const DECAY_TIME    = 30;  // per-debuff lifespan
  const PLAYER_MAX_HP = 100;

  let tickTimer = 0;
  let playerHP = PLAYER_MAX_HP;

  // damage curve:
  // gaining stack 1 -> take 10 HP
  // gaining stack 2 -> take 20 HP
  // gaining stack 3 -> take 40 HP
  // gaining stack 4 -> take 80 HP
  // etc.
  function damageForStackLevel(nRaw) {
    const n = Math.max(0, Math.floor(nRaw || 0));
    if (n === 0) return 0;
    if (n === 1) return 10;
    if (n === 2) return 20;
    return 40 * Math.pow(2, n - 3);
  }

  function refreshAllHUD(horsemen) {
    const horses = horsemen?.horses || [];

    for (let i = 0; i < horses.length; i++) {
      const h = horses[i];
      const id = h.debuffId;
      const color = `#${h.debuffColor.toString(16).padStart(6, '0')}`;

      const s = stacks[id] || 0;
      const t = timers[id] || 0;

      Game.UI.setDebuffStacks(id, color, s, Math.max(0, t));
    }

    Game.HUD.setHP(playerHP, PLAYER_MAX_HP);
  }

  // helper to clear all debuffs immediately
  function clearAllDebuffs() {
    for (const k in stacks) {
      stacks[k] = 0;
    }
    for (const k in timers) {
      timers[k] = 0;
    }
  }

  // PUBLIC: expose current HP so other systems can read it if needed
  Game.Debuffs.getHP = function () {
    return playerHP;
  };

  Game.Debuffs.update = function (dt, ball, horsemen) {
    // If game is over, do nothing here except keep HUD in sync
    if (Game.isGameOver) {
      refreshAllHUD(horsemen);
      return;
    }

    tickTimer += dt;

    // 1) Tick down timers and expire debuffs normally
    for (const id in stacks) {
      if (stacks[id] > 0) {
        timers[id] -= dt;
        if (timers[id] <= 0) {
          stacks[id] = 0;
          timers[id] = 0;
        }
      }
    }

    // 2) Every APPLY_INTERVAL seconds:
    //    - Determine which horsemen we're in range of
    //    - For each: +1 stack, refresh timer, apply damage equal to NEW stack level
    if (tickTimer >= APPLY_INTERVAL) {
      tickTimer = 0;

      let inRangeMap = {};
      if (ball && horsemen && Game.Physics && Game.Physics.checkBallInHorsemenRange) {
        inRangeMap = Game.Physics.checkBallInHorsemenRange(ball, horsemen);
      }

      const horses = horsemen.horses;
      let totalDamageThisTick = 0;

      for (let i = 0; i < horses.length; i++) {
        const h = horses[i];
        const id = h.debuffId;

        if (inRangeMap[id]) {
          const prevStacks = stacks[id] || 0;
          const newStacks = prevStacks + 1;

          stacks[id] = newStacks;
          timers[id] = DECAY_TIME;

          // damage is FULL value of that new stack level
          const dmg = damageForStackLevel(newStacks);
          totalDamageThisTick += dmg;

          console.log(
            `[Debuff ${id}] prevStacks=${prevStacks} newStacks=${newStacks} dmg=${dmg}`
          );
        }
      }

      if (totalDamageThisTick > 0) {
        playerHP = Math.max(0, playerHP - totalDamageThisTick);
        console.log(`HP after tick: ${playerHP}`);
      }
    }

    // 3) Check for death
    if (playerHP <= 0 && !Game.isGameOver) {
      Game.isGameOver = true;

      // hard set HP to 0 in HUD just to avoid -1 rounding, etc
      playerHP = 0;

      // wipe all debuffs immediately so UI shows no active curses
      clearAllDebuffs();

      // final HUD sync before freeze
      refreshAllHUD(horsemen);

      // show overlay
      Game.UI.showGameOver();

      return;
    }

    // 4) Normal HUD sync (alive case)
    refreshAllHUD(horsemen);
  };

  Game.Debuffs.reset = function () {
    // reset internal state
    for (const k in stacks) delete stacks[k];
    for (const k in timers) delete timers[k];
    tickTimer = 0;
    playerHP = PLAYER_MAX_HP;

    // also push full HP to HUD, and hide all debuffs
    if (Game.HUD) {
      Game.HUD.setHP(playerHP, PLAYER_MAX_HP);
    }
    if (Game.UI) {
      // force debuff bar to clear
      const debuffBar = document.getElementById("debuff-bar");
      if (debuffBar) debuffBar.innerHTML = "";
    }
  };
})(window);
