// js/core/GameState.js
(function (global) {
  const Game = global.Game || (global.Game = {});

  /**
   * Game.State is the central registry for gameplay objects and runtime flags.
   * It stores references to the player, enemies, and general world state.
   */
  Game.State = {
    // === Core ===
    isGameOver: false,
    elapsedTime: 0,

    // === Player ===
    playerUnit: null,
    playerMesh: null,     // the visual (Three.js sphere)
    playerController: null, // will hold input later

    // === Enemies ===
    enemyUnits: [],       // array of Units for each horseman
    horsemen: [],         // visual horsemen meshes

    // === Scene references ===
    scene: null,
    camera: null,
    renderer: null,
    arena: null,          // holds platforms, walls, etc.

    // === Systems (optional references for debug) ===
    systems: {},

    reset() {
      this.isGameOver = false;
      this.elapsedTime = 0;
      this.enemyUnits.length = 0;
      this.horsemen.length = 0;
    }
  };
})(window);
