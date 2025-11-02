// js/scene/ArenaWalls.js
(function (global) {
  const Game = global.Game || (global.Game = {});
  Game.SceneBuilders = Game.SceneBuilders || {};

  Game.SceneBuilders.ArenaWalls = function ArenaWalls(scene, opts) {
    const floorSize = opts.floorSize || 100;
    const wallHeight = 4;
    const wallThickness = 1;
    const wallColor = 0x444444;

    function makeWall(x, z, w, d) {
      const geo = new THREE.BoxGeometry(w, wallHeight, d);
      const mat = new THREE.MeshStandardMaterial({
        color: wallColor,
        metalness: 0.1,
        roughness: 0.8,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, wallHeight / 2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      return mesh;
    }

    const half = floorSize / 2;
    const long = floorSize;
    const short = wallThickness;

    const northWall = makeWall(0, -half, long, short);
    const southWall = makeWall(0,  half, long, short);
    const westWall  = makeWall(-half, 0, short, long);
    const eastWall  = makeWall( half, 0, short, long);

    return {
      walls: [northWall, southWall, westWall, eastWall],
      wallHeight,
      wallThickness
    };
  };
})(window);
