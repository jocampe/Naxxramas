(function (global) {
  const Game = global.Game || (global.Game = {});
  const C = Game.CONST;

  Game.Entities = Game.Entities || {};

  Game.Entities.Pillars = function (scene) {
    const group = new THREE.Object3D();

    // Pillar config
    const PILLAR_HEIGHT = C.PILLAR_HEIGHT || 5;
    const PILLAR_SIZE = C.PILLAR_SIZE || 6.1;

    // how far to push them out from the main platform corners
    const OUT_OFFSET_X = 0.1;
    const OUT_OFFSET_Z = 0.1;

    const pHalf = PILLAR_SIZE / 2;
    const baseHalf = C.PLATFORM_SIZE / 2;
    const yCenter = PILLAR_HEIGHT / 2;

    // Pillar geometry/material
    const pillarGeom = new THREE.BoxGeometry(PILLAR_SIZE, PILLAR_HEIGHT, PILLAR_SIZE);
    const pillarMat = new THREE.MeshLambertMaterial({ color: 0x46536b });

    // Corner positions (barely offset from the base platform)
    const positions = [
      [baseHalf - pHalf + OUT_OFFSET_X, yCenter, baseHalf - pHalf + OUT_OFFSET_Z],
      [baseHalf - pHalf + OUT_OFFSET_X, yCenter, -baseHalf + pHalf - OUT_OFFSET_Z],
      [-baseHalf + pHalf - OUT_OFFSET_X, yCenter, baseHalf - pHalf + OUT_OFFSET_Z],
      [-baseHalf + pHalf - OUT_OFFSET_X, yCenter, -baseHalf + pHalf - OUT_OFFSET_Z]
    ];

    const colliders = [];

    for (let i = 0; i < positions.length; i++) {
      const [x, y, z] = positions[i];

      // create pillar mesh
      const pillar = new THREE.Mesh(pillarGeom, pillarMat);
      pillar.position.set(x, y, z);
      group.add(pillar);

      // store collider (XZ bounds)
      colliders.push({
        minX: x - pHalf,
        maxX: x + pHalf,
        minZ: z - pHalf,
        maxZ: z + pHalf
      });

      // skull cluster
      if (Game.Entities.SkullCluster) {
        const skulls = Game.Entities.SkullCluster();

        const skullScale = PILLAR_SIZE / 5;
        skulls.scale.set(skullScale, skullScale, skullScale);

        const topY = y + (PILLAR_HEIGHT / 3);
        skulls.position.set(x, topY, z);

        const angle = Math.atan2(x, z);
        skulls.rotation.y = angle;

        group.add(skulls);
      }
    }

    group.colliders = colliders; // <-- physics will use this

    scene.add(group);
    return group;
  };
})(window);
