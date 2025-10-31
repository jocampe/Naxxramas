(function (global) {
  const Game = global.Game || (global.Game = {});
  const C = Game.CONST;

  Game.Entities = Game.Entities || {};

  Game.Entities.Walls = function (scene) {
    const group = new THREE.Object3D();
    const mat = new THREE.MeshLambertMaterial({ color: 0x3b4458 });

    const half = C.BOARD_SIZE / 2;
    const t = C.WALL_THICKNESS, h = C.WALL_HEIGHT;

    const wN = new THREE.Mesh(new THREE.BoxGeometry(C.BOARD_SIZE, h, t), mat);
    const wS = new THREE.Mesh(new THREE.BoxGeometry(C.BOARD_SIZE, h, t), mat);
    const wE = new THREE.Mesh(new THREE.BoxGeometry(t, h, C.BOARD_SIZE), mat);
    const wW = new THREE.Mesh(new THREE.BoxGeometry(t, h, C.BOARD_SIZE), mat);

    wN.position.set(0, h / 2, half);
    wS.position.set(0, h / 2, -half);
    wE.position.set(half, h / 2, 0);
    wW.position.set(-half, h / 2, 0);

    group.add(wN, wS, wE, wW);
    scene.add(group);
    return group;
  };
})(window);
