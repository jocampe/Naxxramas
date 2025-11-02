// js/scene/PlayerBall.js
(function (global) {
  const Game = global.Game || (global.Game = {});
  Game.SceneBuilders = Game.SceneBuilders || {};

  /**
   * Game.SceneBuilders.PlayerBall(scene)
   *
   * Creates the player "avatar" in the world:
   *  - a ball mesh (the player body)
   *  - a small redDot mesh slightly in front, used for camera look-at targeting
   *
   * Also returns movement-related state that PhysicsSystem and InputSystem
   * will later operate on (velocity, yaw, etc.).
   *
   * This object is purely visual / kinematic. It does NOT store HP or Power.
   * Combat stats live in Game.State.playerUnit (Unit.js).
   */
  Game.SceneBuilders.PlayerBall = function PlayerBall(scene) {
    const player = {};

    // --------------------------------------------------
    // 1. Create the main player mesh (the "ball")
    // --------------------------------------------------
    const bodyGeo = new THREE.SphereGeometry(1, 32, 32); // radius 1 for now
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x990000,
      roughness: 0.6,
      metalness: 0.2,
      emissive: 0x220000,
      emissiveIntensity: 0.4,
    });

    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    bodyMesh.position.set(0, 10, -70); // spawn position
    scene.add(bodyMesh);

    // --------------------------------------------------
    // 2. Create the "redDot"
    // --------------------------------------------------
    const dotGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const dotMat = new THREE.MeshBasicMaterial({
      color: 0xff0000
    });
    const redDot = new THREE.Mesh(dotGeo, dotMat);
    scene.add(redDot);

    // --------------------------------------------------
    // 3. Movement / physics state
    // --------------------------------------------------
    player.mesh = bodyMesh;
    player.lookTarget = redDot;

    // Facing direction around Y (so we can rotate / strafe)
    player.yaw = 0;

    // Movement intent: populated by InputSystem
    player.moveDir = new THREE.Vector3(0, 0, 0);

    // Current horizontal speed scalar (units per second).
    player.moveSpeed = Game.Constants.PLAYER_MOVE_SPEED || 10;

    // Vertical physics
    player.velocityY = 0;      // current vertical velocity
    player.isGrounded = false; 
    player.lastSafePos = new THREE.Vector3(
      bodyMesh.position.x,
      bodyMesh.position.y,
      bodyMesh.position.z
    );

    player.wantsToJump = false;

    // --------------------------------------------------
    // 4. API methods (to be called by systems)
    // --------------------------------------------------

  
    player.syncLookTarget = function syncLookTarget() {
      const distAhead = 3;
      const heightOffset = 1.0;

      const dirX = Math.sin(player.yaw);
      const dirZ = Math.cos(player.yaw);

      redDot.position.set(
        bodyMesh.position.x + dirX * distAhead,
        bodyMesh.position.y + heightOffset,
        bodyMesh.position.z + dirZ * distAhead
      );
    };

    player.applyHorizontalMovement = function applyHorizontalMovement(dt) {
      const dx = player.moveDir.x * player.moveSpeed * dt;
      const dz = player.moveDir.z * player.moveSpeed * dt;

      bodyMesh.position.x += dx;
      bodyMesh.position.z += dz;
    };

    player.applyVerticalMovement = function applyVerticalMovement(dt) {
      bodyMesh.position.y += player.velocityY * dt;
    };


    player.snapPosition = function snapPosition(vec3) {
      bodyMesh.position.copy(vec3);
    };

    player.recordSafePosition = function recordSafePosition() {
      player.lastSafePos.copy(bodyMesh.position);
    };

    player.getPosition = function getPosition() {
      return bodyMesh.position;
    };

    player.setPosition = function setPosition(x, y, z) {
      bodyMesh.position.set(x, y, z);
    };

    player.setYaw = function setYaw(angle) {
      player.yaw = angle;
      bodyMesh.rotation.y = angle;
    };

    player.update = function update(dt) {
      player.syncLookTarget();
    };

    return player;
  };
})(window);
