// js/ui/WorldBar.js
(function (global) {
  const Game = global.Game || (global.Game = {});
  Game.UI = Game.UI || {};

  /**
   * WorldBar
   *
   * Creates a floating status card (HP / Power) above an entity.
   * Returns an object:
   * {
   *   mesh: THREE.Mesh,           // add this to the scene or parent
   *   updateFromUnit(unit),       // redraw the texture from current hp/power
   *   setBillboardToCamera(cam),  // rotate to face camera
   *   setWorldPosition(x,y,z),    // move where it floats
   * }
   *
   * Usage:
   *   const wb = Game.UI.WorldBar();
   *   parent.add(wb.mesh);
   *   ...
   *   wb.updateFromUnit(h.unit);
   *   wb.setBillboardToCamera(camera);
   */
  Game.UI.WorldBar = function WorldBar() {
    // --- canvas setup ---
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const ctx2d = canvas.getContext("2d");

    // --- three texture/material/mesh setup ---
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const mat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true
    });

    const sprite = new THREE.Sprite(mat);

    sprite.scale.set(10, 2.5, 1);

    // internal draw helper
    function drawBars(unit) {
      const w = canvas.width;
      const h = canvas.height;
      ctx2d.clearRect(0, 0, w, h);

      const hpPct = unit.hp / unit.maxHP;
      const pwPct = unit.power / unit.maxPower;

      // background panel
      ctx2d.fillStyle = "rgba(0,0,0,0.6)";
      ctx2d.fillRect(0, 0, w, h);

      ctx2d.strokeStyle = "rgba(255,255,255,0.3)";
      ctx2d.lineWidth = 2;
      ctx2d.strokeRect(1, 1, w-2, h-2);

      // text
      ctx2d.font = "20px sans-serif";
      ctx2d.fillStyle = "#fff";
      ctx2d.textAlign = "left";
      ctx2d.fillText(unit.name || "Horseman", 10, 22);

      // HP bar label + bar
      ctx2d.font = "14px sans-serif";
      ctx2d.fillStyle = "#fff";
      const hpText = `HP: ${unit.hp}/${unit.maxHP}`;
      ctx2d.fillText(hpText, 10, 40);

      // hp bar back
      ctx2d.fillStyle = "rgba(80,0,0,0.6)";
      ctx2d.fillRect(120, 28, 120, 10);
      // hp bar fill
      ctx2d.fillStyle = "rgba(200,0,0,0.9)";
      ctx2d.fillRect(120, 28, 120 * hpPct, 10);

      // Power bar label + bar
      const pwText = `Power: ${unit.power}/${unit.maxPower}`;
      ctx2d.fillStyle = "#fff";
      ctx2d.fillText(pwText, 10, 58);

      // power bar back
      ctx2d.fillStyle = "rgba(0,0,80,0.6)";
      ctx2d.fillRect(120, 46, 120, 10);
      // power bar fill
      ctx2d.fillStyle = "rgba(0,100,255,0.9)";
      ctx2d.fillRect(120, 46, 120 * pwPct, 10);

      texture.needsUpdate = true;
    }

    function updateFromUnit(unit) {
      if (!unit) return;
      drawBars(unit);
    }

    function setWorldPosition(x, y, z) {
      sprite.position.set(x, y, z);
    }

    function setBillboardToCamera(cam) {
      //TODO
    }

    return {
      mesh: sprite,
      updateFromUnit,
      setWorldPosition,
      setBillboardToCamera
    };
  };
})(window);
