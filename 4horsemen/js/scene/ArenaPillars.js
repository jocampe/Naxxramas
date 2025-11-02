// js/scene/ArenaPillars.js
(function (global) {
  const Game = global.Game || (global.Game = {});
  Game.SceneBuilders = Game.SceneBuilders || {};
  Game.Entities = Game.Entities || {};

  /**
   * ArenaPillars(scene, opts)
   *
   * Creates 4 chunky box pillars at the corners of the base platform,
   * decorates them with skull clusters,
   * and returns collider data in AABB form (minX/maxX/minZ/maxZ for each pillar).
   *
   * PhysicsSystem will use these colliders to keep the player from clipping in.
   */
  Game.SceneBuilders.ArenaPillars = function ArenaPillars(scene, opts) {
    const basePlatformSize = opts.baseSize || Game.Constants.PLATFORM_SIZE || 60;

    const PILLAR_HEIGHT = Game.Constants.PILLAR_HEIGHT || 5;
    const PILLAR_SIZE   = Game.Constants.PILLAR_SIZE   || 6.1;

    // slight outward offset so they sit just off the base platform corners
    const OUT_OFFSET_X = 0.1;
    const OUT_OFFSET_Z = 0.1;

    const pHalf    = PILLAR_SIZE / 2;
    const baseHalf = basePlatformSize / 2;
    const yCenter  = PILLAR_HEIGHT / 2;

    // geo/material for the pillar chunk
    const pillarGeom = new THREE.BoxGeometry(PILLAR_SIZE, PILLAR_HEIGHT, PILLAR_SIZE);
    const pillarMat  = new THREE.MeshLambertMaterial({ color: 0x46536b });

    const group = new THREE.Object3D();
    const colliders = [];

    const positions = [
      [ baseHalf - pHalf + OUT_OFFSET_X, yCenter,  baseHalf - pHalf + OUT_OFFSET_Z],
      [ baseHalf - pHalf + OUT_OFFSET_X, yCenter, -baseHalf + pHalf - OUT_OFFSET_Z],
      [-baseHalf + pHalf - OUT_OFFSET_X, yCenter,  baseHalf - pHalf + OUT_OFFSET_Z],
      [-baseHalf + pHalf - OUT_OFFSET_X, yCenter, -baseHalf + pHalf - OUT_OFFSET_Z]
    ];

    for (let i = 0; i < positions.length; i++) {
      const [x, y, z] = positions[i];

      // 1. the actual pillar block
      const pillar = new THREE.Mesh(pillarGeom, pillarMat);
      pillar.position.set(x, y, z);
      group.add(pillar);

      // 2. collider info (AABB in XZ)
      colliders.push({
        minX: x - pHalf,
        maxX: x + pHalf,
        minZ: z - pHalf,
        maxZ: z + pHalf
      });

      // 3. skull cluster decoration on top
      if (Game.Entities.SkullCluster) {
        const skulls = Game.Entities.SkullCluster();

        // scale skull cluster relative to pillar size
        const skullScale = PILLAR_SIZE / 5;
        skulls.scale.set(skullScale, skullScale, skullScale);

        // lift skulls above pillar
        const topY = y + (PILLAR_HEIGHT / 3);
        skulls.position.set(x, topY, z);

        // rotate skulls to face outward from center
        const angle = Math.atan2(x, z);
        skulls.rotation.y = angle;

        group.add(skulls);
      }
    }
    group.colliders = colliders;

    scene.add(group);

    return {
      group,
      colliders
    };
  };
})(window);
