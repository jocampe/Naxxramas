(function (global) {
  const Game = global.Game || (global.Game = {});
  Game.isGameOver = Game.isGameOver || false;
  const C = Game.CONST;

  let board, walls, ball, platform;
  const clock = new THREE.Clock();

  Game.init = function () {
    Game.Input.attach();
    const { scene } = Game.Scene.create();

    board = Game.Entities.Board(scene);
    walls = Game.Entities.Walls(scene);
    platform = Game.Entities.Platform(scene);
    ball = Game.Entities.Ball(scene);
    pillars = Game.Entities.Pillars(scene);
    horsemen = Game.Entities.HorsemenGroup(scene);

    Game.Scene.attachBall(ball);
    Game.Scene.updateCamera(0);
    Game.Scene.render();

    // HUDs
    Game.UI.initHUD(); // debuff HUD already exists in top-right
    Game.HUD.init({
      name: "Player",
      level: 1
    });

    // start HP/mana full (100/100)
    Game.HUD.setHP(100, 100);
    Game.HUD.setPower(100, 100);

    Game.Abilities.init();

  };

  Game.animate = function animate() {
    requestAnimationFrame(animate);

    const dt = Math.min(0.033, clock.getDelta());

    if (!Game.isGameOver) {
      // alive gameplay updates
      if (ball && ball.updateMotion) {
        ball.updateMotion(dt);

        if (Game.Physics && Game.Physics.solveBallVsPlatform)
          Game.Physics.solveBallVsPlatform(ball, platform, dt);

        if (Game.Physics && Game.Physics.solveBallVsPillars)
          Game.Physics.solveBallVsPillars(ball, pillars);
      }

      if (Game.Debuffs && Game.Debuffs.update) {
        Game.Debuffs.update(dt, ball, horsemen);
      }
    } else {
      // still call Debuffs.update, but it'll early-return and just keep HUD in sync
      if (Game.Debuffs && Game.Debuffs.update) {
        Game.Debuffs.update(dt, ball, horsemen);
      }
    }

    if (!Game.isGameOver && Game.Abilities && Game.Abilities.update) {
      Game.Abilities.update(dt);
    }


    Game.Scene.updateCamera(dt);
    Game.Scene.render();
  };


  Game.reset = function () {
    console.log("Restarting game...");

    // 1. revive
    Game.isGameOver = false;

    // 2. reset debuffs + HP UI
    if (Game.Debuffs && Game.Debuffs.reset) {
      Game.Debuffs.reset();
    }

    // 3. reset power bar to 100 as well
    if (Game.HUD && Game.HUD.setPower) {
      Game.HUD.setPower(100, 100);
    }

    // 4. move ball back to starting position
    //    adjust this to wherever you want spawn to be
    if (ball) {
      ball.position.set(0, 5, 0); // spawn spot
      // if you track vertical velocity/jump velocity, zero it here
      if (ball.velocity) {
        ball.velocity.set(0, 0, 0);
      }
    }

    // 5. remove the dim overlay class just in case UI didn't do it yet
    document.body.classList.remove('dim-scene');

    if (Game.Abilities && Game.Abilities.reset) {
      Game.Abilities.reset();
    }


    console.log("Game restarted.");
  };



})(window);
