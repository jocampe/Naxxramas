// js/scene/ArenaPlatform.js
(function (global) {
  const Game = global.Game || (global.Game = {});
  Game.SceneBuilders = Game.SceneBuilders || {};

  Game.SceneBuilders.ArenaPlatform = function ArenaPlatform(scene) {
    const tiers = [];

    const numTiers   = Game.Constants.PLATFORM_NUM_TIERS   || 5;
    const baseSize   = Game.Constants.PLATFORM_SIZE        || 60;
    const sizeStep   = Game.Constants.PLATFORM_SIZE_STEP   || 3;
    const heightStep = Game.Constants.PLATFORM_HEIGHT_STEP || 1.0;

    const meshes = [];

    for (let i = 0; i < numTiers; i++) {
      const tierSize   = baseSize - i * sizeStep;
      const tierHeight = (i + 1) * heightStep; 
      const boxHeight  = heightStep;          

      const geo = new THREE.BoxGeometry(tierSize, boxHeight, tierSize);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x303030,
        roughness: 0.9,
        metalness: 0.2
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        0,
        tierHeight - (boxHeight / 2),
        0
      );
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);

      meshes.push(mesh);

      const halfSize = tierSize / 2;
      tiers.push({
        minX: -halfSize,
        maxX:  halfSize,
        minZ: -halfSize,
        maxZ:  halfSize,
        topY: tierHeight
      });
    }

    return {
      meshes,
      tiers,
      baseSize 
    };
  };
})(window);
