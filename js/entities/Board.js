(function (global) {
  const Game = global.Game || (global.Game = {});
  const C = Game.CONST;

  Game.Entities = Game.Entities || {};

  Game.Entities.Board = function (scene) {
    // board plane
    const plane = new THREE.PlaneGeometry(C.BOARD_SIZE, C.BOARD_SIZE);
    plane.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshLambertMaterial({ color: 0x1a1f2a });
    const mesh = new THREE.Mesh(plane, mat);
    scene.add(mesh);

    // grid helper (optional)
    const grid = new THREE.GridHelper(C.BOARD_SIZE, C.BOARD_SIZE, 0x334155, 0x243041);
    grid.position.y = 0.002;
    scene.add(grid);

    return mesh;
  };
})(window);
