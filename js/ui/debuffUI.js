// js/ui/debuffUI.js
(function (global) {
  const Game = global.Game || (global.Game = {});
  Game.UI = Game.UI || {};

  /**
   * Game.UI.DebuffUI
   *
   * Renders and updates the player's current debuffs in a container like:
   *
   * <div id="debuff-container"></div>
   *
   * Each aura looks like:
   * [colored square] 3x  24s
   *
   * Public API:
   *   Game.UI.DebuffUI.update(debuffsById, nowMs)
   *   Game.UI.DebuffUI.clear()
   *
   * Expected structure of debuffsById:
   * {
   *   plague: { color: "#00ff00", stacks: 2, expiresAt: 123456789 },
   *   frost: { color: "#00c8ff", stacks: 1, expiresAt: 123456999 }
   * }
   */
  Game.UI.DebuffUI = (function () {
    const containerId = "debuff-container";

    function getContainer() {
      return document.getElementById(containerId);
    }

    function update(debuffsById, nowMs) {
      const container = getContainer();
      if (!container) return;

      container.innerHTML = "";

      for (const [id, aura] of Object.entries(debuffsById)) {
        const timeLeftMs = Math.max(0, aura.expiresAt - nowMs);
        const timeLeftSec = Math.ceil(timeLeftMs / 1000);

        // Row wrapper
        const row = document.createElement("div");
        row.className = "debuff-row";
        row.setAttribute("data-id", id);

        // Color box
        const colorBox = document.createElement("div");
        colorBox.className = "debuff-color-box";
        colorBox.style.background = aura.color;
        row.appendChild(colorBox);

        // Info (stacks + timer)
        const info = document.createElement("div");
        info.className = "debuff-info";

        const stacksEl = document.createElement("span");
        stacksEl.className = "debuff-stacks";
        stacksEl.textContent = aura.stacks + "x";

        const timerEl = document.createElement("span");
        timerEl.className = "debuff-timer";
        timerEl.textContent = timeLeftSec + "s";

        info.appendChild(stacksEl);
        info.appendChild(timerEl);

        row.appendChild(info);
        container.appendChild(row);
      }
    }

    function clear() {
      const container = getContainer();
      if (container) {
        container.innerHTML = "";
      }
    }

    return {
      update,
      clear
    };
  })();
})(window);
