(function (global) {
  const Game = global.Game || (global.Game = {});

  Game.CONST = {
    BOARD_SIZE: 200,          // <- updated
    BALL_RADIUS: 1.2,
    WALL_THICKNESS: 1,
    WALL_HEIGHT: 2,

    BASE_SPEED: 15,             // units/s (constant speed)
    BOOST_MULT: 1.6,           // hold Shift to move faster (still instant)

    // Platform
    PLATFORM_SIZE: 60,        // width/depth (square)
    PLATFORM_HEIGHT: 5,       // box height (thickness)
    STAIRS_HEIGHT: 1,
    STAIRS_WIDTH: 3,

    PILLAR_HEIGHT: 5,
    PILLAR_SIZE: 6.1,

    RING_POSITION_START: 3.73,
    RING_POSITION_LEN: 1.97,

    RING_OUTER_RADIUS: 75,
    RING_INNER_RADIUS: 74,
  };

  Game.CONST.BOUNDS =
    (Game.CONST.BOARD_SIZE / 2) - Game.CONST.BALL_RADIUS - (Game.CONST.WALL_THICKNESS / 2);
})(window);
