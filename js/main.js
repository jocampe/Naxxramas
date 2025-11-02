// js/main.js
(function (global) {
  const Game = global.Game || (global.Game = {});
  Game.Systems = Game.Systems || {};
  Game.SceneBuilders = Game.SceneBuilders || {};
  Game.State = Game.State || {};

  /**
   * Game.init()
   * - Creates scene, camera, renderer
   * - Builds arena / player / horsemen visuals
   * - Creates logical Units (player + enemies)
   * - Binds HUD to the player Unit
   * - Sets up systems and starts the main loop
   */
  Game.init = function init() {
    // -----------------------------
    // Scene / Renderer / Camera
    // -----------------------------
    const scene = new THREE.Scene();
    Game.State.scene = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 10, 20);
    Game.State.camera = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    document.body.appendChild(renderer.domElement);
    Game.State.renderer = renderer;

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // -----------------------------
    // Build world
    // -----------------------------
    // Arena (floor, walls, stairs, pillars...)
    Game.State.arena = Game.SceneBuilders.Arena(scene);

    // Player visual (ball)
    const playerVisual = Game.SceneBuilders.PlayerBall(scene);
    Game.State.playerMesh = playerVisual;


    // -----------------------------
    // Gameplay Units (stats)
    // -----------------------------
    Game.Core = Game.Core || {};
    if (!Game.Core.Unit && Game.Core && Game.Core.Unit) {
      Game.Core.Unit = Game.Core.Unit;
    }

    // Player unit (HP/power etc)
    Game.State.playerUnit = Game.Core.Unit({
      id: "player",
      maxHP: Game.Constants.PLAYER_MAX_HP,
      hp: Game.Constants.PLAYER_MAX_HP,
      maxPower: Game.Constants.PLAYER_MAX_POWER,
      power: Game.Constants.PLAYER_MAX_POWER,
      tags: ["player"]
    });


    playerVisual.unit = Game.State.playerUnit;

    Game.State.player = playerVisual;

    // subscribe HUD to instant stat updates
    if (Game.State.playerUnit.onStatsChanged) {
      Game.State.playerUnit.onStatsChanged(function (u) {
        if (Game.HUD && Game.HUD.update) {
          Game.HUD.update();
        }
      });
    }

    // Horsemen (the 4 bosses w/ aura wedges & worldBar sprites)
    const horsemenGroup = Game.SceneBuilders.HorsemenGroup(scene);
    Game.State.horsemen = horsemenGroup.horses.slice(); // copy array

    // Enemy units for each horseman + sync their floating worldBar
    Game.State.enemyUnits = [];
    for (const h of Game.State.horsemen) {
      // give horseman a Unit
      const u = Game.Core.Unit({
        id: h.debuffId || ("enemy_" + Math.random().toString(16).slice(2)),
        name: h.name || h.debuffId || "Horseman",
        maxHP: Game.Constants.HORSEMEN_MAX_HP,
        hp: Game.Constants.HORSEMEN_MAX_HP,
        maxPower: Game.Constants.HORSEMEN_MAX_POWER,
        power: Game.Constants.HORSEMEN_MAX_POWER,
        tags: ["enemy", "horseman"]
      });

      h.unit = u;

      if (h.worldBar) {
        // initial sync
        if (typeof h.worldBar.updateFromUnit === "function") {
          h.worldBar.updateFromUnit(u);
        }

        // SUBSCRIBE: whenever stats change, update floating bar
        if (u.onStatsChanged) {
          u.onStatsChanged(function (changedUnit) {
            // update floating bar
            if (h.worldBar && typeof h.worldBar.updateFromUnit === "function") {
              h.worldBar.updateFromUnit(changedUnit);
            }

            // update boss list UI
            if (Game.HUD && Game.HUD.updateBossList) {
              Game.HUD.updateBossList();
            }

            // if this guy is my current target, also refresh target HUD
            if (Game.State.currentTarget === h) {
              if (Game.HUD && Game.HUD.updateTargetHUD) {
                Game.HUD.updateTargetHUD();
              }
            }
          });
        }

      }
    }


    // -----------------------------
    // HUD setup
    // -----------------------------
    // Bind HUD to the player unit.
    Game.HUD.init({
      name: "Player",
      level: 60,
      unit: Game.State.playerUnit
    });

    if (Game.HUD && Game.HUD.initBossList) {
      Game.HUD.initBossList(Game.State.horsemen);
    }


    // -----------------------------
    // Death / Game Over hookup
    // -----------------------------
    if (Game.State.playerUnit.onDied) {
      Game.State.playerUnit.onDied(function () {
        Game.State.isGameOver = true;

        if (
          Game.State.systems.aura &&
          Game.State.systems.aura.clearAll
        ) {
          Game.State.systems.aura.clearAll();
        }

        if (Game.UI && Game.UI.Overlays) {
          Game.UI.Overlays.showGameOver();
        }
      });
    }

    // -----------------------------
    // Systems bootstrap
    // -----------------------------
    Game.State.systems = Game.State.systems || {};

    Game.State.systems.input = Game.Systems.InputSystem || null;
    Game.State.systems.physics = Game.Systems.PhysicsSystem || null;
    Game.State.systems.aura = Game.Systems.AuraSystem || null;
    Game.State.systems.camera = Game.Systems.CameraSystem || null;
    Game.State.systems.combat = Game.Systems.CombatSystem || null;
    Game.State.systems.floatingStatus =
      Game.Systems.FloatingStatusSystem || null;
    Game.State.systems.ability =
      Game.Systems.AbilitySystem || null;

    // Init InputSystem so it can start listening to keys (WASD/jump)
    if (
      Game.State.systems.input &&
      Game.State.systems.input.init
    ) {
      Game.State.systems.input.init({
        player: Game.State.playerMesh
      });
    }

    // Init AuraSystem so it can start tracking stacks on player
    if (Game.State.systems.aura && Game.State.systems.aura.init) {
      Game.State.systems.aura.init({
        playerUnit: Game.State.playerUnit,
        horsemen: Game.State.horsemen
      });
    } else {
      console.warn("[main] AuraSystem missing or has no init()");
    }


    // Init AbilitySystem so keys 1/2/3 work and UI bar appears
    // AbilitySystem expects:
    //  - playerRole (for future spec-based loadouts)
    //  - playerObj  (must have .mesh and .unit)
    if (
      Game.State.systems.ability &&
      Game.State.systems.ability.init
    ) {
      Game.State.systems.ability.init({
        playerRole: Game.Core.PlayerRole
          ? Game.Core.PlayerRole.DPS
          : "dps", // fallback if enum missing
        playerObj: Game.State.player
      });
    }


    // Restart button (TODO)
    const restartBtn = document.getElementById("restart-btn");
    if (restartBtn) {
      restartBtn.addEventListener("click", function () {
      });
    }

    Game.State.systems.target = Game.Systems.TargetSystem || null;

    if (Game.State.systems.target && Game.State.systems.target.init) {
      Game.State.systems.target.init({
        scene: Game.State.scene,
        camera: Game.State.camera,
        renderer: Game.State.renderer
      });
    }


    // Handle resize
    window.addEventListener("resize", onWindowResize, false);
    function onWindowResize() {
      if (!Game.State.camera || !Game.State.renderer) return;
      Game.State.camera.aspect =
        window.innerWidth / window.innerHeight;
      Game.State.camera.updateProjectionMatrix();
      Game.State.renderer.setSize(
        window.innerWidth,
        window.innerHeight
      );
    }

    // Init timing / flags
    Game.State.isGameOver = false;
    Game.State.elapsedTime = 0;
    Game._lastFrameTime = performance.now();

    // Kick off loop
    requestAnimationFrame(Game.loop);
  };

  /**
   * Game.loop()
   * - Runs every frame
   * - Computes delta time
   * - Updates systems in a predictable order
   * - Renders the scene
   */
  Game.loop = function loop(now) {
    const dt = (now - Game._lastFrameTime) / 1000;
    Game._lastFrameTime = now;

    Game.State.elapsedTime += dt;
    const gameActive = !Game.State.isGameOver;

    // 1. Input
    if (
      gameActive &&
      Game.State.systems.input &&
      Game.State.systems.input.update
    ) {
      Game.State.systems.input.update(dt, {
        player: Game.State.playerMesh,
        camera: Game.State.camera
      });
    }

    // 2. Physics
    if (
      gameActive &&
      Game.State.systems.physics &&
      Game.State.systems.physics.update
    ) {
      Game.State.systems.physics.update(dt, {
        player: Game.State.playerMesh,
        arena: Game.State.arena
      });
    }

    // 2.5 clear jump pulse
    if (
      gameActive &&
      Game.State.systems.input &&
      Game.State.systems.input.postUpdate
    ) {
      Game.State.systems.input.postUpdate({
        player: Game.State.playerMesh
      });
    }

    // 3. Aura / debuffs (may damage player HP)
    if (gameActive &&
      Game.State.systems.aura &&
      Game.State.systems.aura.update) {

      Game.State.systems.aura.update(dt, {
        playerUnit: Game.State.playerUnit,
        horsemen: Game.State.horsemen,
        elapsedTime: Game.State.elapsedTime
      });
    }

    // 4. Combat tick / maintenance
    if (
      gameActive &&
      Game.State.systems.combat &&
      Game.State.systems.combat.update
    ) {
      Game.State.systems.combat.update(dt, {
        playerUnit: Game.State.playerUnit,
        enemyUnits: Game.State.enemyUnits,
        player: Game.State.player,
        horsemen: Game.State.horsemen
      });
    }

    // 5. Abilities (press 1/2/3, spend power, deal dmg, heal)
    if (
      gameActive &&
      Game.State.systems.ability &&
      Game.State.systems.ability.update
    ) {
      Game.State.systems.ability.update(dt, {
        player: Game.State.player,           // has .unit
        horsemen: Game.State.horsemen        // each has .unit
      });
    }

    // 6. Floating horsemen HP bars (sync worldBar texture from h.unit)
    if (
      Game.State.systems.floatingStatus &&
      Game.State.systems.floatingStatus.update
    ) {
      Game.State.systems.floatingStatus.update(dt, {
        horsemen: Game.State.horsemen,
        camera: Game.State.camera
      });
    }

    // 🔥 HUD refresh (player, target, boss list)
    if (Game.HUD) {
      if (Game.HUD.update) {
        Game.HUD.update(); // player hp/power
      }
      if (Game.HUD.updateTargetHUD) {
        Game.HUD.updateTargetHUD(); // current target box
      }
      if (Game.HUD.updateBossList) {
        Game.HUD.updateBossList(); // 4 boss frames in center top
      }
    }


    // TargetSystem (click-to-select target)
    if (
      Game.State.systems.target &&
      Game.State.systems.target.update
    ) {
      Game.State.systems.target.update(dt, {
        scene: Game.State.scene,
        camera: Game.State.camera,
        renderer: Game.State.renderer,
        horsemen: Game.State.horsemen
      });
    }


    // 7. Camera follow / top / side
    if (
      Game.State.systems.camera &&
      Game.State.systems.camera.update
    ) {
      Game.State.systems.camera.update(dt, {
        camera: Game.State.camera,
        player: Game.State.playerMesh,
        renderer: Game.State.renderer
      });
    }

    // 8. Render
    if (
      Game.State.renderer &&
      Game.State.scene &&
      Game.State.camera
    ) {
      Game.State.renderer.render(
        Game.State.scene,
        Game.State.camera
      );
    }

    requestAnimationFrame(Game.loop);
  };

})(window);
