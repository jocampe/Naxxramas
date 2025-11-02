// js/ui/overlays.js
(function (global) {
  const Game = global.Game || (global.Game = {});
  Game.UI = Game.UI || {};

  /**
   * Game.UI.Overlays
   *
   * Handles showing/hiding overlay screens (Game Over, Victory, etc.)
   * Uses CSS classes for fade-in/out transitions.
   *
   * HTML expected:
   *   <div id="gameover-overlay" class="overlay">Game Over</div>
   *   <div id="victory-overlay" class="overlay">Victory!</div>
   */
  Game.UI.Overlays = (function () {
    const OVERLAYS = {
      gameover: document.getElementById("gameover-overlay"),
      victory: document.getElementById("victory-overlay")
    };

    function show(name) {
      const el = OVERLAYS[name];
      if (el) el.classList.add("visible");
    }

    function hide(name) {
      const el = OVERLAYS[name];
      if (el) el.classList.remove("visible");
    }

    function hideAll() {
      Object.values(OVERLAYS).forEach((el) => {
        if (el) el.classList.remove("visible");
      });
    }

    // Shorthand helpers
    function showGameOver() { show("gameover"); }
    function showVictory() { show("victory"); }

    return {
      show,
      hide,
      hideAll,
      showGameOver,
      showVictory
    };
  })();
})(window);
