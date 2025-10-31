(function (global) {
    const Game = global.Game || (global.Game = {});
    const C = Game.CONST;

    Game.Physics = Game.Physics || {};

    const MAX_STEP_HEIGHT = C.STAIRS_HEIGHT || 1;
    const FALL_SPEED = 40;

    function getSupportingTier(ball, platform) {
        if (!platform || !platform.tiers) return null;

        const x = ball.position.x;
        const z = ball.position.z;

        let best = null;
        let bestTop = -Infinity;

        for (let i = 0; i < platform.tiers.length; i++) {
            const t = platform.tiers[i];
            if (x >= t.minX && x <= t.maxX &&
                z >= t.minZ && z <= t.maxZ) {
                if (t.topY > bestTop) {
                    bestTop = t.topY;
                    best = t;
                }
            }
        }
        return best;
    }

    Game.Physics.solveBallVsPlatform = function (ball, platform, dt) {
        const radius = C.BALL_RADIUS;
        const baseGroundY = 0;
        const GRAVITY = 60;       // downward acceleration (tweak feel)
        const JUMP_STRENGTH = 25; // initial jump speed (tweak feel)

        const tier = (function getSupportingTier() {
            if (!platform || !platform.tiers) return null;
            const x = ball.position.x;
            const z = ball.position.z;
            let best = null;
            let bestTop = -Infinity;
            for (let i = 0; i < platform.tiers.length; i++) {
                const t = platform.tiers[i];
                if (x >= t.minX && x <= t.maxX && z >= t.minZ && z <= t.maxZ) {
                    if (t.topY > bestTop) {
                        bestTop = t.topY;
                        best = t;
                    }
                }
            }
            return best;
        })();

        // what’s the ground height under us?
        let groundY = baseGroundY;
        if (tier) groundY = tier.topY;

        const desiredBallY = groundY + radius;
        const currentBallY = ball.position.y;
        const currentBottomY = currentBallY - radius;
        const verticalRise = groundY - currentBottomY;

        // Jump input
        const wantsToJump = Game.Input.isDown(32); // Spacebar

        // Apply gravity
        ball.velocityY -= GRAVITY * dt;
        ball.position.y += ball.velocityY * dt;

        // --- COLLISION / LANDING ---
        if (ball.position.y <= desiredBallY) {
            // landed or grounded
            ball.position.y = desiredBallY;
            ball.velocityY = 0;
            ball.isGrounded = true;
        } else {
            // mid-air
            ball.isGrounded = false;
        }

        // --- STEP UP if horizontally climbing ---
        const MAX_STEP_HEIGHT = C.STAIRS_HEIGHT || 1;
        if (verticalRise > 0 && ball.isGrounded) {
            if (verticalRise <= MAX_STEP_HEIGHT + 0.001) {
                ball.position.y = desiredBallY;
            } else {
                if (ball.lastSafePos) {
                    ball.position.x = ball.lastSafePos.x;
                    ball.position.z = ball.lastSafePos.z;
                }
            }
        }

        // --- HANDLE JUMP ---
        if (ball.isGrounded && wantsToJump) {
            ball.velocityY = JUMP_STRENGTH;
            ball.isGrounded = false;
        }

        // Update safe position when grounded
        if (ball.isGrounded) {
            ball.lastSafePos.x = ball.position.x;
            ball.lastSafePos.z = ball.position.z;
        }
    };


    // Basic AABB vs sphere (XZ only) for pillars
    Game.Physics.solveBallVsPillars = function (ball, pillars) {
        if (!pillars || !pillars.colliders) return;

        const br = C.BALL_RADIUS;

        for (const box of pillars.colliders) {
            // find closest point on the box to the ball center
            const cx = Math.max(box.minX, Math.min(ball.position.x, box.maxX));
            const cz = Math.max(box.minZ, Math.min(ball.position.z, box.maxZ));

            const dx = ball.position.x - cx;
            const dz = ball.position.z - cz;
            const distSq = dx * dx + dz * dz;

            // if center is inside the box + ball radius → collision
            if (distSq < br * br) {
                const dist = Math.sqrt(distSq) || 0.0001;
                const overlap = br - dist;

                // normalize
                const nx = dx / dist;
                const nz = dz / dist;

                // push ball out
                ball.position.x += nx * overlap;
                ball.position.z += nz * overlap;

                // optional: store safe position
                ball.lastSafePos.x = ball.position.x;
                ball.lastSafePos.z = ball.position.z;
            }
        }
    };

    Game.Physics.checkBallInHorsemenRange = function (ball, horsemenGroup) {
        const activeDebuffs = {};

        if (!horsemenGroup || !horsemenGroup.horses) return activeDebuffs;

        const ballPos = ball.position;
        const C = Game.CONST;

        for (let i = 0; i < horsemenGroup.horses.length; i++) {
            const horse = horsemenGroup.horses[i];
            const ring = horse.rangeIndicator;
            if (!ring) continue;

            // Horseman world position (center of ring)
            const pos = new THREE.Vector3();
            horse.getWorldPosition(pos);

            // Distance to ball (XZ plane)
            const dx = ballPos.x - pos.x;
            const dz = ballPos.z - pos.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            const outerR = C.RING_OUTER_RADIUS || 75;
            if (dist <= outerR) {
                const debuffId = horse.debuffId || `horse_${i}`;
                activeDebuffs[debuffId] = true;
            }
        }

        return activeDebuffs;
    };

})(window);
