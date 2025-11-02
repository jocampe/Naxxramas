// js/systems/PhysicsSystem.js
(function (global) {
  const Game = global.Game || (global.Game = {});
  Game.Systems = Game.Systems || {};

  Game.Systems.PhysicsSystem = (function () {
    // shared velocity vector for the player
    const vel = new THREE.Vector3(0, 0, 0);

    function applyMovementAndGravity(dt, player) {
      const moveSpeed   = Game.Constants.PLAYER_MOVE_SPEED || 12;
      const gravity     = Game.Constants.PLAYER_GRAVITY     || 30;
      const jumpForce   = Game.Constants.PLAYER_JUMP_FORCE  || 18;

      // horizontal motion from input
      if (player.moveDir && player.moveDir.lengthSq() > 0) {
        vel.x = player.moveDir.x * moveSpeed;
        vel.z = player.moveDir.z * moveSpeed;
      } else {
        vel.x = 0;
        vel.z = 0;
      }

      // jumping
      if (player.wantsToJump && player.isGrounded) {
        vel.y = jumpForce;
        player.isGrounded = false;
      }

      // gravity
      vel.y -= gravity * dt;

      // integrate velocity -> position
      const pos = player.mesh.position;
      pos.x += vel.x * dt;
      pos.y += vel.y * dt;
      pos.z += vel.z * dt;
    }

    function resolveGroundHeight(player, arena) {
      const FLOOR_Y       = Game.Constants.FLOOR_Y          || 0;
      const PLAYER_RADIUS = Game.Constants.PLAYER_RADIUS    || 2;
      const MAX_STEP      = Game.Constants.MAX_STEP_HEIGHT  || 1.1;

      const pos = player.mesh.position;
      let targetSurfaceY = FLOOR_Y;

      if (arena && arena.platformTiers) {
        for (let i = 0; i < arena.platformTiers.length; i++) {
          const tier = arena.platformTiers[i];
          if (
            pos.x >= tier.minX &&
            pos.x <= tier.maxX &&
            pos.z >= tier.minZ &&
            pos.z <= tier.maxZ
          ) {
            if (
              tier.topY > targetSurfaceY &&
              tier.topY - targetSurfaceY <= MAX_STEP + PLAYER_RADIUS
            ) {
              targetSurfaceY = tier.topY;
            }
          }
        }
      }

      return targetSurfaceY + PLAYER_RADIUS;
    }

    function solveGroundCollision(player, arena) {
      const pos = player.mesh.position;
      const desiredCenterY = resolveGroundHeight(player, arena);

      if (pos.y <= desiredCenterY) {
        pos.y = desiredCenterY;
        vel.y = 0;
        player.isGrounded = true;

        if (player.recordSafePosition) {
          player.recordSafePosition();
        }
      } else {
        player.isGrounded = false;
      }
    }

    function solvePillars(player, arena) {
      if (!arena || !arena.pillarColliders) return;

      const PLAYER_RADIUS = Game.Constants.PLAYER_RADIUS || 2;
      const pos = player.mesh.position;

      for (const box of arena.pillarColliders) {
        const minX = box.minX - PLAYER_RADIUS;
        const maxX = box.maxX + PLAYER_RADIUS;
        const minZ = box.minZ - PLAYER_RADIUS;
        const maxZ = box.maxZ + PLAYER_RADIUS;

        const insideX = pos.x >= minX && pos.x <= maxX;
        const insideZ = pos.z >= minZ && pos.z <= maxZ;
        if (!insideX || !insideZ) continue;

        // smallest push out
        const distLeft   = pos.x - minX;
        const distRight  = maxX - pos.x;
        const distTop    = maxZ - pos.z;
        const distBottom = pos.z - minZ;

        const minPush = Math.min(distLeft, distRight, distTop, distBottom);

        if (minPush === distLeft) {
          pos.x = minX;
        } else if (minPush === distRight) {
          pos.x = maxX;
        } else if (minPush === distTop) {
          pos.z = maxZ;
        } else {
          pos.z = minZ;
        }

        if (player.recordSafePosition) {
          player.recordSafePosition();
        }
      }
    }

    function solveArenaBounds(player, arena) {
      const ARENA_SIZE     = Game.Constants.ARENA_SIZE   || 200;
      const PLAYER_RADIUS  = Game.Constants.PLAYER_RADIUS || 2;

      const halfArena = ARENA_SIZE / 2;

      const minX = -halfArena + PLAYER_RADIUS;
      const maxX =  halfArena - PLAYER_RADIUS;
      const minZ = -halfArena + PLAYER_RADIUS;
      const maxZ =  halfArena - PLAYER_RADIUS;

      const pos = player.mesh.position;

      if (pos.x < minX) pos.x = minX;
      if (pos.x > maxX) pos.x = maxX;
      if (pos.z < minZ) pos.z = minZ;
      if (pos.z > maxZ) pos.z = maxZ;
    }

    function update(dt, ctx) {
      const player = ctx.player;
      const arena  = ctx.arena;
      if (!player || !player.mesh) return;

      // 1. movement and gravity integration
      applyMovementAndGravity(dt, player);

      // 2. vertical collision with ground + platform tiers
      solveGroundCollision(player, arena);

      // 3. horizontal collision with pillars
      solvePillars(player, arena);

      // 4. clamp to arena bounds (can't leave map)
      solveArenaBounds(player, arena);
    }

    return {
      update
    };
  })();
})(window);
