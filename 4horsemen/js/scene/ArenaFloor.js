// js/scene/ArenaFloor.js
(function (global) {
    const Game = global.Game || (global.Game = {});
    Game.SceneBuilders = Game.SceneBuilders || {};

    Game.SceneBuilders.ArenaFloor = function ArenaFloor(scene) {
        const floorSize = Game.Constants.ARENA_SIZE || 200;

        const floorGeo = new THREE.PlaneGeometry(floorSize, floorSize);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.8,
            metalness: 0.0
        });

        const floorMesh = new THREE.Mesh(floorGeo, floorMat);
        floorMesh.rotation.x = -Math.PI / 2;
        floorMesh.position.set(0, 0, 0);
        floorMesh.receiveShadow = true;

        const grid = new THREE.GridHelper(Game.Constants.ARENA_SIZE, Game.Constants.ARENA_SIZE, 0x334155, 0x243041);
        grid.position.y = 0.002;
        scene.add(grid);

        scene.add(floorMesh);

        return {
            mesh: floorMesh,
            size: floorSize
        };
    };
})(window);
