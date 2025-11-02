// js/scene/HorsemenGroup.js
(function (global) {
  const Game = global.Game || (global.Game = {});
  Game.SceneBuilders = Game.SceneBuilders || {};
  Game.Entities = Game.Entities || {};

  Game.SceneBuilders.HorsemenGroup = function HorsemenGroup(scene) {
    const horsesOut = [];

    const ARENA_SIZE = Game.Constants.ARENA_SIZE || 200;
    const halfArena = ARENA_SIZE / 2;

    const EDGE_PADDING = 20;
    const cornerOffset = halfArena - EDGE_PADDING;

    const AURA_RADIUS = Game.Constants.AURA_RADIUS || 60;

    const HORSEMEN_DATA = [
      {
        name: "Sir Zeliek",
        corner: "NE",
        colorMain: 0x1a1a1a,
        colorTrim: 0xffffff, // white
        weaponType: "sword",
        debuffId: "shadow",
        debuffColor: "#ffffff",
        position: { x: cornerOffset, z: cornerOffset }
      },
      {
        name: "Thane Korth'azz",
        corner: "SE",
        colorMain: 0x1a1a1a,
        colorTrim: 0x00ff00, // green
        weaponType: "staff",
        debuffId: "plague",
        debuffColor: "#00ff00",
        position: { x: cornerOffset, z: -cornerOffset }
      },
      {
        name: "Lady Blaumeux",
        corner: "NW",
        colorMain: 0x1a1a1a,
        colorTrim: 0x00c8ff, // icy blue
        weaponType: "axe",
        debuffId: "frost",
        debuffColor: "#00c8ff",
        position: { x: -cornerOffset, z: cornerOffset }
      },
      {
        name: "Highlord Mograine",
        corner: "SW",
        colorMain: 0x1a1a1a,
        colorTrim: 0xff0000, // red
        weaponType: "rune_sword",
        debuffId: "blood",
        debuffColor: "#ff0000",
        position: { x: -cornerOffset, z: -cornerOffset }
      }
    ];

    function getAuraSectorAnglesForCorner(corner) {
      switch (corner) {
        case "NE":
          return { thetaStart: 0.44, thetaLength: 2.26 };
        case "NW":
          return { thetaStart: 0.44, thetaLength: 2.26 };
        case "SE":
          return { thetaStart: 0.44, thetaLength: 2.26 };
        case "SW":
          return { thetaStart: 0.44, thetaLength: 2.26 };
        default:
          return { thetaStart: 0, thetaLength: Math.PI * 2 };
      }
    }

    function buildAuraSector(colorHex, corner) {
      const angles = getAuraSectorAnglesForCorner(corner);

      const innerR = AURA_RADIUS * 0.95;
      const outerR = AURA_RADIUS;

      const ringGeo = new THREE.RingGeometry(
        innerR,
        outerR,
        64,        // segments
        1,
        angles.thetaStart,
        angles.thetaLength
      );

      const ringMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
      });

      const ringMesh = new THREE.Mesh(ringGeo, ringMat);

      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.05;

      return ringMesh;
    }

    for (const spec of HORSEMEN_DATA) {
      const hVis = Game.Entities.Horseman({
        colorMain: spec.colorMain,
        colorTrim: spec.colorTrim,
        weaponType: spec.weaponType
      });

      const root = hVis.root;

      // Place them at their corner position
      root.position.set(spec.position.x, 0, spec.position.z);

      const dx = 0 - spec.position.x;
      const dz = 0 - spec.position.z;
      const angleToCenter = Math.atan2(dx, dz);
      root.rotation.y = angleToCenter + Math.PI;

      const auraRing = buildAuraSector(spec.debuffColor, spec.corner);
      root.add(auraRing);

      const wb = Game.UI.WorldBar();
      wb.setWorldPosition(0, 20, 0);
      wb.updateFromUnit({
        name: spec.name,
        maxHP: Game.Constants.HORSEMEN_MAX_HP || 200,
        hp: Game.Constants.HORSEMEN_MAX_HP || 200,
        maxPower: Game.Constants.HORSEMEN_MAX_POWER || 100,
        power: 0
      });
      root.add(wb.mesh);

      scene.add(root);

      const horseObj = {
        name: spec.name,
        debuffId: spec.debuffId,
        debuffColor: spec.debuffColor,
        root,
        auraRing,

        getPosition: hVis.getPosition,
        faceTowards: hVis.faceTowards,

        unit: null 
      };

      horsesOut.push(horseObj);
    }

    return {
      horses: horsesOut
    };
  };
})(window);
