// js/constants.js
(function (global) {
  const Game = global.Game || (global.Game = {});

  Game.Constants = {
    // WORLD SIZE
    ARENA_SIZE: 200,        // full floor side length
    PLATFORM_SIZE: 60,      // size of the bottom step of the central platform

    // PLATFORM STACKING
    PLATFORM_NUM_TIERS: 5,
    PLATFORM_SIZE_STEP: 3,
    PLATFORM_HEIGHT_STEP: 1.0,

    // PILLARS
    PILLAR_HEIGHT: 5,
    PILLAR_SIZE: 6.1,

    // PLAYER
    PLAYER_MAX_HP: 100,
    PLAYER_MAX_POWER: 100,
    PLAYER_MOVE_SPEED: 12,
    PLAYER_JUMP_FORCE: 18,
    PLAYER_GRAVITY: 30,
    PLAYER_RADIUS: 2,

    // HORSEMEN
    HORSEMEN_MAX_HP: 200,
    HORSEMEN_MAX_POWER: 100,
    AURA_RADIUS: 60,
    AURA_TICK_INTERVAL: 10,
    AURA_DAMAGE_PER_STACK: 10,

    // PHYSICS
    GRAVITY: 9.8,
    FLOOR_Y: 0,
    MAX_STEP_HEIGHT: 1.1, 

    // CAMERA
    CAMERA_DISTANCE: 20,
    CAMERA_HEIGHT: 10,
    CAMERA_SMOOTHNESS: 0.08,

    // CAMERA FIXED MODES
    CAMERA_TOP_HEIGHT: 80,
    CAMERA_SIDE_HEIGHT: 80,

    // MOVEMENT
    TURN_SPEED: 2.5, // radians per second, ~143 deg/sec


    // DEBUG
    ENABLE_DEBUG_HELPERS: false,
  };
})(window);
