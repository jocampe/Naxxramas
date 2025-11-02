// js/systems/CameraSystem.js
(function (global) {
  const Game = global.Game || (global.Game = {});
  Game.Systems = Game.Systems || {};

  /**
   * CameraSystem
   *
   * Modes:
   *  - "follow"    (Z): chase cam behind the player, smooth
   *  - "top"       (X): fixed ceiling camera looking straight down at arena
   *  - "side_top"  (C): fixed high diagonal camera looking toward arena
   *
   * InputSystem switches modes by calling setMode("follow" | "top" | "side_top").
   */
  Game.Systems.CameraSystem = (function () {
    let mode = "follow";

    let camPos = null;

    const FOLLOW_DISTANCE   = Game.Constants.CAMERA_DISTANCE   ?? 15;
    const FOLLOW_HEIGHT     = Game.Constants.CAMERA_HEIGHT     ?? 6;
    const FOLLOW_SMOOTHNESS = Game.Constants.CAMERA_SMOOTHNESS ?? 0.08;

    const FIXED_HEIGHT = 200;

    const TOP_ANCHOR_X = 0;
    const TOP_ANCHOR_Z = 0;

    const SIDE_ANCHOR_X = 40;
    const SIDE_ANCHOR_Z = 40;

    function ensureVec3(v) {
      if (v) return v;
      return new THREE.Vector3();
    }

    function setMode(newMode) {
      mode = newMode;
    }

    function getMode() {
      return mode;
    }


    function update(dt, ctx) {
      const camera = ctx.camera;
      const player = ctx.player;
      if (!camera) return;

      if (mode === "follow") {
        if (!player || !player.mesh) return;

        const playerPos = player.mesh.position;
        const lookTarget = player.lookTarget
          ? player.lookTarget.position
          : player.mesh.position;

        const yaw = player.yaw || 0;
        const forwardX = Math.sin(yaw);
        const forwardZ = Math.cos(yaw);

        const camTargetX = playerPos.x - forwardX * FOLLOW_DISTANCE;
        const camTargetY = playerPos.y + FOLLOW_HEIGHT;
        const camTargetZ = playerPos.z - forwardZ * FOLLOW_DISTANCE;

        camPos = ensureVec3(camPos);

        if (camPos.lengthSq() === 0 && camera.position.lengthSq() === 0) {
          camPos.set(camTargetX, camTargetY, camTargetZ);
          camera.position.copy(camPos);
        }

        // smooth follow
        camPos.lerp(
          new THREE.Vector3(camTargetX, camTargetY, camTargetZ),
          FOLLOW_SMOOTHNESS
        );

        camera.position.copy(camPos);
        camera.lookAt(lookTarget);
        return;
      }

      if (mode === "top") {
        const camX = TOP_ANCHOR_X;
        const camY = FIXED_HEIGHT;
        const camZ = TOP_ANCHOR_Z;

        camera.position.set(camX, camY, camZ);

        camera.lookAt(TOP_ANCHOR_X, 0, TOP_ANCHOR_Z);
        return;
      }

      if (mode === "side_top") {
        const camX = SIDE_ANCHOR_X;
        const camY = FIXED_HEIGHT;
        const camZ = SIDE_ANCHOR_Z;

        camera.position.set(camX, camY, camZ);

        // Look at arena center
        camera.lookAt(0, 0, 0);
        return;
      }

      setMode("follow");
    }

    return {
      update,
      setMode,
      getMode
    };
  })();
})(window);
