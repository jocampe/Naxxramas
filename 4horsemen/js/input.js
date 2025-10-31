(function (global) {
  const Game = global.Game || (global.Game = {});
  const keys = Object.create(null);

  function onKeyDown(e) {
    keys[e.keyCode || e.which] = true;
    if ([37, 38, 39, 40].includes(e.keyCode)) e.preventDefault(); // stop scrolling
  }
  function onKeyUp(e) {
    keys[e.keyCode || e.which] = false;
  }

  Game.Input = {
    attach() {
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
    },
    detach() {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    },
    isDown(code) {
      return !!keys[code];
    }
  };
})(window);
