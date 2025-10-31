(function (global) {
  const Game = global.Game || (global.Game = {});
  Game.Abilities = Game.Abilities || {};

  // --- configuration ---
  const DEFAULT_ABILITIES = [
    {
      id: "fireball",
      name: "Fireball",
      color: "#ff6b6b",
      key: "1",
      cooldown: 8,
      currentCD: 0,
      onUse: function () {
        // TODO: implement Fireball effect (damage enemies in front of player)
        console.log("Fireball cast!");
      },
    },
    {
      id: "slash",
      name: "Slash",
      color: "#f9a825",
      key: "2",
      cooldown: 5,
      currentCD: 0,
      onUse: function () {
        // TODO: implement Slash effect (short melee damage)
        console.log("Slash executed!");
      },
    },
    {
      id: "heal",
      name: "Heal",
      color: "#4caf50",
      key: "3",
      cooldown: 15,
      currentCD: 0,
      onUse: function () {
        // TODO: implement Heal effect (restore player HP)
        console.log("Heal used!");
      },
    },
  ];

  let abilities = [];

  // --- UI setup ---
  function createUI() {
    let bar = document.getElementById("abilities-bar");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "abilities-bar";
      document.body.appendChild(bar);
    }

    bar.innerHTML = ""; // clear existing

    abilities.forEach((ab) => {
      const div = document.createElement("div");
      div.className = "ability-slot";
      div.style.backgroundColor = ab.color;

      const label = document.createElement("div");
      label.className = "ability-label";
      label.textContent = ab.key.toUpperCase();

      const cd = document.createElement("div");
      cd.className = "cooldown";
      cd.textContent = "";

      div.appendChild(label);
      div.appendChild(cd);
      bar.appendChild(div);

      ab.uiElement = div;
      ab.cdElement = cd;
    });
  }

  // --- logic ---
  function useAbility(ab) {
    if (ab.currentCD > 0) return; // still cooling down
    ab.currentCD = ab.cooldown;
    ab.onUse();
  }

  Game.Abilities.init = function (customAbilities) {
    abilities = customAbilities || DEFAULT_ABILITIES;
    createUI();

    window.addEventListener("keydown", (e) => {
      const key = e.key;
      const ab = abilities.find((a) => a.key === key);
      if (ab && !Game.isGameOver) {
        useAbility(ab);
      }
    });
  };

  Game.Abilities.update = function (dt) {
    abilities.forEach((ab) => {
      if (ab.currentCD > 0) {
        ab.currentCD -= dt;
        if (ab.currentCD < 0) ab.currentCD = 0;

        ab.cdElement.textContent = ab.currentCD > 0 ? ab.currentCD.toFixed(0) : "";
        ab.uiElement.classList.toggle("on-cooldown", ab.currentCD > 0);
      }
    });
  };

  Game.Abilities.reset = function () {
    abilities.forEach((ab) => (ab.currentCD = 0));
    abilities.forEach((ab) => {
      if (ab.cdElement) ab.cdElement.textContent = "";
      if (ab.uiElement) ab.uiElement.classList.remove("on-cooldown");
    });
  };
})(window);
