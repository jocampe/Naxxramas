(function (global) {
  const Game = global.Game || (global.Game = {});
  const C = Game.CONST;

  Game.Entities = Game.Entities || {};

  Game.Entities.Ball = function (scene) {
    // --- ball mesh ---
    const geom = new THREE.SphereGeometry(C.BALL_RADIUS, 32, 32);
    const mat = new THREE.MeshLambertMaterial({ color: 0xffcc66 });
    const ball = new THREE.Mesh(geom, mat);

    // spawn near one of the outer walls, on the ground plane
    const startX = 0; // left wall
    const startZ = C.BOUNDS;         // middle along that wall
    const startY = C.BALL_RADIUS; // sitting on floor (y=0 ground)

    ball.position.set(startX, startY, startZ);
    scene.add(ball);

    ball.lastSafePos = { x: ball.position.x, z: ball.position.z };
    ball.velocityY = 0;       // vertical velocity
    ball.isGrounded = false;  // standing on something

    // store last safe grounded XZ
    ball.lastSafePos = { x: ball.position.x, z: ball.position.z };

    // --- red dot (look target) ---
    const dotGeom = new THREE.SphereGeometry(0.2, 12, 12);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const redDot = new THREE.Mesh(dotGeom, dotMat);
    redDot.position.set(0, C.BALL_RADIUS + 0.2, -2);
    scene.add(redDot);

    // --- movement state ---
    let yaw = 0;                      // radians; 0 = facing −Z
    const TURN_SPEED = Math.PI;       // rad/s
    const baseSpeed = C.BASE_SPEED;   // constant speed
    const booster = C.BOOST_MULT;   // Shift

    // expose for camera etc
    ball.getYaw = function () { return yaw; };
    ball.getLookTarget = function () { return redDot; };
    ball.getVelocity = function () { return new THREE.Vector2(0, 0); };

    const forward = new THREE.Vector3();

    ball.updateMotion = function (dt) {
      // turn left/right
      if (Game.Input.isDown(37)) { // Left
        yaw -= TURN_SPEED * dt;
      }
      if (Game.Input.isDown(39)) { // Right
        yaw += TURN_SPEED * dt;
      }
      ball.rotation.y = yaw;

      // forward vector on XZ plane
      forward.set(Math.sin(yaw), 0, -Math.cos(yaw));

      // decide forward/back direction
      let dir = 0;
      if (Game.Input.isDown(38)) dir += 1; // Up = forward
      if (Game.Input.isDown(40)) dir -= 1; // Down = backward

      if (dir !== 0) {
        const speed = baseSpeed * (Game.Input.isDown(16) ? booster : 1.0);
        ball.position.addScaledVector(forward, dir * speed * dt);
      }

      // clamp inside world bounds on X/Z
      const B = C.BOUNDS;
      if (ball.position.x < -B) ball.position.x = -B;
      if (ball.position.x > B) ball.position.x = B;
      if (ball.position.z < -B) ball.position.z = -B;
      if (ball.position.z > B) ball.position.z = B;

      // update red dot in front of the ball
      const DOT_DIST = 3.5;
      redDot.position.copy(ball.position).addScaledVector(forward, DOT_DIST);
      redDot.position.y = C.BALL_RADIUS + 0.2;
    };

    return ball;
  };
})(window);
