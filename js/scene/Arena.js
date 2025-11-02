// js/scene/Arena.js
(function (global) {
  const Game = global.Game || (global.Game = {});
  Game.SceneBuilders = Game.SceneBuilders || {};

  Game.SceneBuilders.Arena = function Arena(scene) {
    // Floor / board
    const floorData = Game.SceneBuilders.ArenaFloor(scene);

    // Walls based on arena size
    const wallData = Game.SceneBuilders.ArenaWalls(scene, {
      floorSize: floorData.size
    });

    // Central stacked platform
    const platformData = Game.SceneBuilders.ArenaPlatform(scene);
    // platformData: { meshes, tiers, baseSize }

    // Pillars around the platform, with skulls
    const pillarsData = Game.SceneBuilders.ArenaPillars(scene, {
      baseSize: platformData.baseSize
    });

    return {
      floor: floorData.mesh,
      walls: wallData.walls,
      platformTiers: platformData.tiers,
      pillarColliders: pillarsData.colliders
    };
  };
})(window);
