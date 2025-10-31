(function (global) {
  const Game = global.Game || (global.Game = {});
  const C = Game.CONST;

  Game.Entities = Game.Entities || {};

  Game.Entities.Platform = function (scene) {
    const group = new THREE.Object3D();

    const tierCount = C.PLATFORM_HEIGHT;
    const tierHeight = C.STAIRS_HEIGHT || 1;
    const sizeDrop = C.STAIRS_WIDTH || 3;

    const tiers = [];

    for (let i = 0; i < tierCount; i++) {
      const size = C.PLATFORM_SIZE - i * sizeDrop;
      const yCenter = i * tierHeight + tierHeight * 0.5;

      const geom = new THREE.BoxGeometry(size, tierHeight, size);
      const mat = new THREE.MeshLambertMaterial({ color: 0x556b8a });
      const slab = new THREE.Mesh(geom, mat);
      slab.position.set(0, yCenter, 0);

      // subtle highlight
      const topMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.08,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -2
      });

      const topGeom = new THREE.PlaneGeometry(size * 0.98, size * 0.98);
      topGeom.rotateX(-Math.PI / 2);

      const top = new THREE.Mesh(topGeom, topMat);
      top.position.set(0, tierHeight / 2 + 0.02, 0);
      slab.add(top);

      group.add(slab);

      // store collider info for physics
      // axis-aligned square centered at (0, yCenter, 0)
      const half = size / 2;
      tiers.push({
        minX: -half,
        maxX: half,
        minZ: -half,
        maxZ: half,
        topY: yCenter + (tierHeight / 2),
        bottomY: yCenter - (tierHeight / 2),
        height: tierHeight
      });
    }

    group.tiers = tiers;

    scene.add(group);
    return group;
  };
})(window);
