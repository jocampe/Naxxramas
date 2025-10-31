(function (global) {
  const Game = global.Game || (global.Game = {});
  const C = Game.CONST;
  Game.Entities = Game.Entities || {};

  Game.Entities.HorsemenGroup = function (scene) {
    const group = new THREE.Object3D();

    const half = C.BOARD_SIZE / 2;
    const MARGIN = 15; // keep them slightly inside the walls

    const HORSEMEN = [
      { main: 0x3a2d5d, trim: 0xb8a0ff, weapon: "axe" },         // purple
      { main: 0x4a3a00, trim: 0xa0ff4a, weapon: "staff" },       // green
      { main: 0x4a4f5c, trim: 0xbfd7ff, weapon: "sword" },       // blue/gray
      { main: 0x5a3055, trim: 0xffa8dc, weapon: "rune_sword" }   // pink
    ];

    // World placement for each horseman
    const placements = [
      { x: half - MARGIN, z: half - MARGIN, idx: 0 }, // +X +Z
      { x: half - MARGIN, z: -half + MARGIN, idx: 1 }, // +X -Z
      { x: -half + MARGIN, z: half - MARGIN, idx: 2 }, // -X +Z
      { x: -half + MARGIN, z: -half + MARGIN, idx: 3 }  // -X -Z
    ];

    const horses = [];

    for (let i = 0; i < placements.length; i++) {
      const p = placements[i];
      const spec = HORSEMEN[p.idx];

      // make the horseman
      const h = Game.Entities.Horseman(spec.main, spec.trim, spec.weapon);

      h.debuffId = ["shadow", "plague", "frost", "blood"][p.idx];
      h.debuffColor = [0xb8a0ff, 0xa0ff4a, 0xbfd7ff, 0xffa8dc][p.idx];

      // position at the corner
      h.position.set(p.x, 0, p.z);

      // rotate so that local -Z points toward (0,0)
      // same logic you already had:
      const yaw = Math.atan2(p.x, p.z);
      h.rotation.y = yaw;

      // now add its forward-facing 90° arc using its own trim color
      if (h.addForwardRangeArc) {
        h.addForwardRangeArc(spec.trim);
      }

      group.add(h);
      horses.push(h);
    }

    group.horses = horses;

    scene.add(group);
    return group;
  };
})(window);
