// js/systems/InputSystem.js
(function (global) {
  const Game = global.Game || (global.Game = {});
  Game.Systems = Game.Systems || {};

  Game.Systems.InputSystem = (function () {
    const keys = {
      forward: false,     // W / ArrowUp
      backward: false,    // S / ArrowDown
      turnLeft: false,    // A / ArrowLeft
      turnRight: false,   // D / ArrowRight
      strafeLeft: false,  // Q
      strafeRight: false, // E
      jump: false,        // Space
    };

    let jumpPressedThisFrame = false;

    function onKeyDown(e) {

      switch (e.code) {
        // Forward / Back
        case "KeyW":
        case "ArrowUp":
          keys.forward = true;
          break;
        case "KeyS":
        case "ArrowDown":
          keys.backward = true;
          break;

        // Turn left / right (not strafe)
        case "KeyA":
        case "ArrowLeft":
          keys.turnLeft = true;
          break;
        case "KeyD":
        case "ArrowRight":
          keys.turnRight = true;
          break;

        // NEW: Strafe left / right
        case "KeyQ":
          keys.strafeLeft = true;
          break;
        case "KeyE":
          keys.strafeRight = true;
          break;

        // Jump
        case "Space":
          keys.jump = true;
          break;

        // Camera mode hotkeys
        case "KeyZ":
          if (Game.Systems.CameraSystem && Game.Systems.CameraSystem.setMode) {
            Game.Systems.CameraSystem.setMode("follow");
          }
          break;
        case "KeyX":
          if (Game.Systems.CameraSystem && Game.Systems.CameraSystem.setMode) {
            Game.Systems.CameraSystem.setMode("top");
          }
          break;
        case "KeyC":
          if (Game.Systems.CameraSystem && Game.Systems.CameraSystem.setMode) {
            Game.Systems.CameraSystem.setMode("side_top");
          }
          break;

        default:
          break;
      }
    }

    function onKeyUp(e) {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          keys.forward = false;
          break;
        case "KeyS":
        case "ArrowDown":
          keys.backward = false;
          break;

        case "KeyA":
        case "ArrowLeft":
          keys.turnLeft = false;
          break;
        case "KeyD":
        case "ArrowRight":
          keys.turnRight = false;
          break;

        case "KeyQ":
          keys.strafeLeft = false;
          break;
        case "KeyE":
          keys.strafeRight = false;
          break;

        case "Space":
          keys.jump = false;
          break;

        default:
          break;
      }
    }

    function init(ctx) {
      console.log("[InputSystem] init()");
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);
    }

    function update(dt, ctx) {
      const player = ctx.player;
      if (!player || !player.mesh) return;

      // -------------------------------------------------
      // 1. ROTATION (A / D) -> adjust player.yaw
      // -------------------------------------------------
      const turnSpeed = Game.Constants.TURN_SPEED || 2.5; // rad/sec

      if (keys.turnLeft) {
        player.yaw += turnSpeed * dt;
      }
      if (keys.turnRight) {
        player.yaw -= turnSpeed * dt;
      }

      // Apply yaw visually
      player.setYaw(player.yaw);

      // -------------------------------------------------
      // 2. MOVEMENT VECTOR
      //
      // forwardAmount: +1 = forward, -1 = backward
      // strafeAmount : +1 = right,   -1 = left
      //
      // -------------------------------------------------

      let forwardAmount = 0;
      if (keys.forward)  forwardAmount += 1;
      if (keys.backward) forwardAmount -= 1;

      let strafeAmount = 0;
      if (keys.strafeRight) strafeAmount -= 1;
      if (keys.strafeLeft)  strafeAmount += 1;

      const sinY = Math.sin(player.yaw);
      const cosY = Math.cos(player.yaw);

      const fwdX = sinY;
      const fwdZ = cosY;

      const rightX =  cosY;
      const rightZ = -sinY;

      // Combine forward/back + strafe into world movement intent
      const worldX =
        fwdX   * forwardAmount +
        rightX * strafeAmount;

      const worldZ =
        fwdZ   * forwardAmount +
        rightZ * strafeAmount;

      if (forwardAmount !== 0 || strafeAmount !== 0) {
        player.moveDir.set(worldX, 0, worldZ);

        if (player.moveDir.lengthSq() > 0) {
          player.moveDir.normalize();
        }
      } else {
        player.moveDir.set(0, 0, 0);
      }

      if (forwardAmount !== 0 || strafeAmount !== 0) {
      }


      if (keys.jump) {
        if (!jumpPressedThisFrame) {
          player.wantsToJump = true;
          jumpPressedThisFrame = true;
        }
      }

      player.update(dt);
    }

    function postUpdate(ctx) {
      const player = ctx.player;
      if (!player) return;

      player.wantsToJump = false;
      jumpPressedThisFrame = false;
    }

    function destroy() {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    }

    return {
      init,
      update,
      postUpdate,
      destroy
    };
  })();
})(window);
