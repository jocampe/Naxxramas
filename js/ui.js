(function (global) {
    const Game = global.Game || (global.Game = {});
    Game.UI = Game.UI || {};

    // internal cache of current stacks so we can update DOM efficiently
    const debuffState = Object.create(null);
    // debuffId will be something like "purple", "green", "blue", "pink"
    // later you can map each horseman to an id

    function getBarEl() {
        return document.getElementById("debuff-bar");
    }

    function ensureIcon(debuffId, colorHex) {
        let icon = document.querySelector(`[data-debuff="${debuffId}"]`);
        if (!icon) {
            icon = document.createElement("div");
            icon.className = "debuff-icon";
            icon.setAttribute("data-debuff", debuffId);
            icon.style.background = colorHex;

            const stackEl = document.createElement("div");
            stackEl.className = "debuff-stack";
            stackEl.textContent = "0";

            icon.appendChild(stackEl);
            getBarEl().appendChild(icon);
        }
        return icon;
    }

    Game.UI.setDebuffStacks = function (debuffId, colorHex, stacks, remainingTime) {
        debuffState[debuffId] = {
            color: colorHex,
            stacks: stacks,
            remainingTime: remainingTime || 0
        };

        const bar = document.getElementById("debuff-bar");
        let icon = document.querySelector(`[data-debuff="${debuffId}"]`);

        // --- Show icon only if stacks > 0 ---
        if (stacks > 0) {
            if (!icon) {
                icon = document.createElement("div");
                icon.className = "debuff-icon";
                icon.setAttribute("data-debuff", debuffId);
                icon.style.background = colorHex;

                const stackEl = document.createElement("div");
                stackEl.className = "debuff-stack";
                icon.appendChild(stackEl);

                // timer text below
                const timerEl = document.createElement("div");
                timerEl.className = "debuff-timer";
                timerEl.style.fontSize = "10px";
                timerEl.style.marginTop = "34px";
                timerEl.style.textAlign = "center";
                timerEl.style.width = "100%";
                timerEl.style.color = "#fff";
                timerEl.style.textShadow = "0 0 4px rgba(0,0,0,0.8)";
                icon.appendChild(timerEl);

                bar.appendChild(icon);
            }

            // Update visuals
            icon.style.background = colorHex;
            const stackEl = icon.querySelector(".debuff-stack");
            const timerEl = icon.querySelector(".debuff-timer");

            stackEl.textContent = String(stacks);
            if (remainingTime !== undefined) {
                timerEl.textContent = `${Math.ceil(remainingTime)}s`;
            }

            icon.style.display = "flex";
        } else {
            // --- Hide if no stacks ---
            if (icon) icon.remove();
        }
    };



    // convenience init you can call at Game.init()
    Game.UI.initHUD = function () {
        // 🟩 Green placeholder
        Game.UI.setDebuffStacks("plague", "#a0ff4a", 0);
        // 🟦 Blue placeholder
        Game.UI.setDebuffStacks("frost", "#bfd7ff", 0);
        // 🟪 Purple placeholder
        Game.UI.setDebuffStacks("shadow", "#b8a0ff", 0);
        // 🩷 Pink placeholder
        Game.UI.setDebuffStacks("blood", "#ffa8dc", 0);
    };

    Game.UI.ensureGameOverOverlay = function () {
        let overlay = document.getElementById('game-over-overlay');
        if (overlay) return overlay;

        overlay = document.createElement('div');
        overlay.id = 'game-over-overlay';
        overlay.innerHTML = `
      <div class="game-over-content">
        <div class="game-over-title">Game Over</div>
        <button id="restart-btn" class="restart-btn">Restart</button>
      </div>
    `;
        document.body.appendChild(overlay);

        // attach click handler once
        const restartBtn = overlay.querySelector('#restart-btn');
        restartBtn.addEventListener('click', function () {
            Game.UI.hideGameOver();
            Game.reset();
        });

        return overlay;
    };

    Game.UI.showGameOver = function () {
        // if overlay doesn't exist, create it
        let overlay = document.getElementById('game-over-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'game-over-overlay';
            overlay.innerHTML = `
        <div class="game-over-content">
          <div class="game-over-title">Game Over</div>
          <button id="restart-btn" class="restart-btn">Restart</button>
        </div>
      `;
            document.body.appendChild(overlay);
        }

        // always reattach the listener (it’s idempotent)
        const restartBtn = overlay.querySelector('#restart-btn');
        restartBtn.onclick = () => {
            console.log('Restart button clicked');
            Game.UI.hideGameOver();
            if (typeof Game.reset === 'function') {
                Game.reset();
            } else {
                console.warn('Game.reset() not found');
            }
        };

        overlay.style.display = 'flex';
        document.body.classList.add('dim-scene');
    };

    Game.UI.hideGameOver = function () {
        const overlay = document.getElementById('game-over-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        document.body.classList.remove('dim-scene');
    };

})(window);
