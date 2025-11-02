// js/entities/Horseman.js
(function (global) {
  const Game = global.Game || (global.Game = {});
  const C = Game.Constants; // bridge old C -> new constants

  Game.Entities = Game.Entities || {};

  /**
   * Game.Entities.Horseman(options)
   *
   * options:
   *  {
   *    colorMain: 0x...,    // main armor/body color
   *    colorTrim: 0x...,    // accent color
   *    weaponType: 'sword' | 'axe' | 'staff' | 'rune_sword'
   *  }
   *
   * Returns:
   *  {
   *    root: THREE.Object3D,           // full horse + rider model
   *    addForwardRangeArc(colorHex),   // draw 90° wedge in front
   *    faceTowards(x, z),              // rotate so it faces a world point
   *    setY(y),                        // lift/drop whole model
   *    getPosition(),                  // world position ref
   *  }
   */
  Game.Entities.Horseman = function (options) {
    const colorMain  = options.colorMain  ?? 0x1a1a1a;
    const colorTrim  = options.colorTrim  ?? 0xaa0000;
    const weaponType = options.weaponType ?? "sword";

    const group = new THREE.Object3D();

    // -----------------------
    // HORSE BASE / BODY
    // -----------------------

    // Horse torso (armored chest)
    const bodyGeom = new THREE.BoxGeometry(8, 4, 14); // width, height, depth
    const bodyMat = new THREE.MeshLambertMaterial({ color: colorMain });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.set(0, 3, 0);
    group.add(body);

    // Horse neck
    const neckGeom = new THREE.BoxGeometry(4, 4, 4);
    const neck = new THREE.Mesh(neckGeom, bodyMat);
    neck.position.set(0, 5, -7); // forward
    neck.rotation.x = THREE.Math.degToRad(-15);
    group.add(neck);

    // Horse head (angular helm-style head)
    const headGeom = new THREE.BoxGeometry(3, 3, 4);
    const headMat = new THREE.MeshLambertMaterial({ color: colorTrim });
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.set(0, 6, -9);
    head.rotation.x = THREE.Math.degToRad(-15);
    group.add(head);

    // Face spike / horn / nose armor
    const hornGeom = new THREE.ConeGeometry(1, 3, 6);
    const hornMat = new THREE.MeshLambertMaterial({ color: colorTrim });
    const horn = new THREE.Mesh(hornGeom, hornMat);
    horn.rotation.x = THREE.Math.degToRad(90);
    horn.position.set(0, 5.5, -11);
    group.add(horn);

    // Chest plate / front armor
    const chestGeom = new THREE.CylinderGeometry(1.5, 2.5, 4, 6);
    const chestMat = new THREE.MeshLambertMaterial({ color: colorTrim });
    const chest = new THREE.Mesh(chestGeom, chestMat);
    chest.rotation.x = THREE.Math.degToRad(90);
    chest.position.set(0, 2.8, -2);
    group.add(chest);

    // Rear armor / rump
    const rearGeom = new THREE.BoxGeometry(7, 3.5, 5);
    const rear = new THREE.Mesh(rearGeom, bodyMat);
    rear.position.set(0, 3.2, 6.5);
    group.add(rear);

    // Side flares / wing-like shoulder plates
    function makeSideFlare(sign) {
      const flareGeom = new THREE.BoxGeometry(4, 2, 2);
      const flareMat = new THREE.MeshLambertMaterial({ color: colorTrim });
      const flare = new THREE.Mesh(flareGeom, flareMat);
      flare.position.set(4 * sign, 3.5, -2);
      flare.rotation.z = THREE.Math.degToRad(20 * -sign);
      return flare;
    }
    group.add(makeSideFlare(1));
    group.add(makeSideFlare(-1));

    // -----------------------
    // LEGS / HOOF ARMOR
    // -----------------------

    function makeLeg(hipX, hipZ) {
      const legRoot = new THREE.Object3D();

      // upper leg / thigh
      const upperGeom = new THREE.BoxGeometry(2, 3, 2);
      const upperMat = new THREE.MeshLambertMaterial({ color: colorMain });
      const upper = new THREE.Mesh(upperGeom, upperMat);
      upper.position.set(0, -1.5, 0); // center -1.5 below hip
      legRoot.add(upper);

      // lower leg
      const lowerGeom = new THREE.BoxGeometry(1.5, 2.5, 1.5);
      const lowerMat = new THREE.MeshLambertMaterial({ color: colorMain });
      const lower = new THREE.Mesh(lowerGeom, lowerMat);
      lower.position.set(0, -4.25, 0); // see original math
      legRoot.add(lower);

      // hoof
      const hoofGeom = new THREE.CylinderGeometry(0.8, 1.2, 1, 6);
      const hoofMat = new THREE.MeshLambertMaterial({ color: 0x000000 });
      const hoof = new THREE.Mesh(hoofGeom, hoofMat);
      hoof.rotation.x = THREE.Math.degToRad(90);
      hoof.position.set(0, -6, 0);
      legRoot.add(hoof);

      // attach whole leg under horse body:
      legRoot.position.set(hipX, 1, hipZ);
      return legRoot;
    }

    // front legs (fwd: z ~ -5)
    group.add(makeLeg(2.5, -5));
    group.add(makeLeg(-2.5, -5));

    // back legs
    group.add(makeLeg(2.5, 5));
    group.add(makeLeg(-2.5, 5));

    // -----------------------
    // RIDER (torso, pauldrons, skull head, weapon)
    // -----------------------

    const rider = new THREE.Object3D();

    // torso / armor plate
    const torsoGeom = new THREE.BoxGeometry(4, 5, 2.5);
    const torsoMat = new THREE.MeshLambertMaterial({ color: colorMain });
    const torso = new THREE.Mesh(torsoGeom, torsoMat);
    torso.position.set(0, 10, 0);
    rider.add(torso);

    // chest gem / accent piece
    const gemGeom = new THREE.CylinderGeometry(0.7, 1.2, 1.5, 6);
    const gemMat = new THREE.MeshLambertMaterial({ color: colorTrim });
    const gem = new THREE.Mesh(gemGeom, gemMat);
    gem.rotation.z = THREE.Math.degToRad(90);
    gem.position.set(0, 9, 1.5);
    rider.add(gem);

    // shoulders / pauldrons
    function makePauldron(sideSign) {
      const p = new THREE.Object3D();

      const padGeom = new THREE.BoxGeometry(2.5, 2, 3);
      const padMat = new THREE.MeshLambertMaterial({ color: colorTrim });
      const pad = new THREE.Mesh(padGeom, padMat);
      pad.position.set(2 * sideSign, 11, 0.5);
      pad.rotation.z = THREE.Math.degToRad(15 * -sideSign);
      p.add(pad);

      const spikeGeom = new THREE.ConeGeometry(0.5, 2, 6);
      const spikeMat = new THREE.MeshLambertMaterial({ color: colorTrim });
      const spike = new THREE.Mesh(spikeGeom, spikeMat);
      spike.position.set(2 * sideSign, 12.5, 0.5);
      spike.rotation.x = THREE.Math.degToRad(-20);
      spike.rotation.z = THREE.Math.degToRad(20 * -sideSign);
      p.add(spike);

      return p;
    }
    rider.add(makePauldron(1));
    rider.add(makePauldron(-1));

    // skull head for rider
    if (Game.Entities.SkullHead) {
      const skullHead = Game.Entities.SkullHead();
      skullHead.scale.set(0.9, 0.9, 0.9);
      skullHead.position.set(0, 13, 0);
      // horse faces -Z, skull built to face +Z -> 180° flip
      skullHead.rotation.y = THREE.Math.degToRad(180);
      rider.add(skullHead);
    }

    //
    // WEAPON BUILDERS
    //
    function buildSword() {
      const sword = new THREE.Object3D();

      const bladeGeom = new THREE.BoxGeometry(0.4, 5, 0.8);
      const bladeMat = new THREE.MeshLambertMaterial({ color: 0xbfc8d6 });
      const blade = new THREE.Mesh(bladeGeom, bladeMat);
      blade.position.set(0, 2.5, 0);
      sword.add(blade);

      const hiltGeom = new THREE.CylinderGeometry(0.2, 0.2, 1, 6);
      const hiltMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
      const hilt = new THREE.Mesh(hiltGeom, hiltMat);
      hilt.position.set(0, 0, 0);
      sword.add(hilt);

      sword.position.set(2.5, 12, -1.5);
      sword.rotation.z = THREE.Math.degToRad(-20);

      return sword;
    }

    function buildAxe() {
      const axe = new THREE.Object3D();

      const handleGeom = new THREE.CylinderGeometry(0.3, 0.3, 5, 6);
      const handleMat = new THREE.MeshLambertMaterial({ color: 0x4a3a2a });
      const handle = new THREE.Mesh(handleGeom, handleMat);
      handle.position.set(0, 2.5, 0);
      axe.add(handle);

      const headBlockGeom = new THREE.BoxGeometry(2, 1, 1);
      const headBlockMat = new THREE.MeshLambertMaterial({ color: 0x777777 });
      const headBlock = new THREE.Mesh(headBlockGeom, headBlockMat);
      headBlock.position.set(0, 4.2, 0);
      axe.add(headBlock);

      const spikeGeom = new THREE.ConeGeometry(0.5, 1.5, 6);
      const spikeMat = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });

      const spikeCenter = new THREE.Mesh(spikeGeom, spikeMat);
      spikeCenter.rotation.x = THREE.Math.degToRad(90);
      spikeCenter.position.set(0, 4.2, 1.2);
      axe.add(spikeCenter);

      const spikeLeft = new THREE.Mesh(spikeGeom, spikeMat);
      spikeLeft.rotation.x = THREE.Math.degToRad(90);
      spikeLeft.position.set(-0.9, 4.0, 1.0);
      spikeLeft.rotation.z = THREE.Math.degToRad(20);
      axe.add(spikeLeft);

      const spikeRight = new THREE.Mesh(spikeGeom, spikeMat);
      spikeRight.rotation.x = THREE.Math.degToRad(90);
      spikeRight.position.set(0.9, 4.0, 1.0);
      spikeRight.rotation.z = THREE.Math.degToRad(-20);
      axe.add(spikeRight);

      axe.position.set(0, 11.5, 2);
      axe.rotation.x = THREE.Math.degToRad(-20);
      axe.rotation.y = THREE.Math.degToRad(95);

      return axe;
    }

    function buildStaff() {
      const staff = new THREE.Object3D();

      const shaftGeom = new THREE.CylinderGeometry(0.25, 0.25, 7, 8);
      const shaftMat = new THREE.MeshLambertMaterial({ color: 0x3a2a1a });
      const shaft = new THREE.Mesh(shaftGeom, shaftMat);
      shaft.position.set(0, 3.5, 0);
      staff.add(shaft);

      if (Game.Entities.SkullHead) {
        const topper = Game.Entities.SkullHead();
        topper.scale.set(0.4, 0.4, 0.4);
        topper.position.set(0, 7, 0);
        topper.rotation.y = THREE.Math.degToRad(180);
        staff.add(topper);
      } else {
        const orbGeom = new THREE.SphereGeometry(0.8, 12, 12);
        const orbMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const orb = new THREE.Mesh(orbGeom, orbMat);
        orb.position.set(0, 7, 0);
        staff.add(orb);
      }

      staff.position.set(-2.5, 12, 0);
      staff.rotation.z = THREE.Math.degToRad(20);
      staff.rotation.x = THREE.Math.degToRad(-10);

      return staff;
    }

    function buildRuneSword() {
      const sword = new THREE.Object3D();

      // Pommel group (red outer, gold inner)
      const pommelGroup = new THREE.Object3D();
      const pommelOuterGeom = new THREE.ConeGeometry(0.9, 1.2, 4);
      const pommelOuterMat = new THREE.MeshLambertMaterial({ color: 0xaa1c0a });
      const pommelOuter = new THREE.Mesh(pommelOuterGeom, pommelOuterMat);
      pommelOuter.rotation.x = THREE.Math.degToRad(90);
      pommelOuter.position.set(0, 0, 0);
      pommelGroup.add(pommelOuter);

      const pommelInnerGeom = new THREE.ConeGeometry(0.6, 0.8, 4);
      const pommelInnerMat = new THREE.MeshLambertMaterial({ color: 0xc9b46a });
      const pommelInner = new THREE.Mesh(pommelInnerGeom, pommelInnerMat);
      pommelInner.rotation.x = THREE.Math.degToRad(90);
      pommelInner.position.set(0, 0, 0.2);
      pommelGroup.add(pommelInner);

      pommelGroup.position.set(0, 0, 0);
      sword.add(pommelGroup);

      // Grip group (handle with red bands)
      const gripGroup = new THREE.Object3D();
      const gripGeom = new THREE.CylinderGeometry(0.35, 0.35, 2.2, 8);
      const gripMat = new THREE.MeshLambertMaterial({ color: 0xbfa57a });
      const grip = new THREE.Mesh(gripGeom, gripMat);
      grip.rotation.x = THREE.Math.degToRad(90);
      grip.position.set(0, 0, 1.6);
      gripGroup.add(grip);

      function ringAt(zPos) {
        const ringGeom = new THREE.CylinderGeometry(0.4, 0.4, 0.25, 6);
        const ringMat = new THREE.MeshLambertMaterial({ color: 0x8a0000 });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.rotation.x = THREE.Math.degToRad(90);
        ring.position.set(0, 0, zPos);
        return ring;
      }
      gripGroup.add(ringAt(0.8));
      gripGroup.add(ringAt(1.6));
      gripGroup.add(ringAt(2.4));
      sword.add(gripGroup);

      // Guard group (red + gold)
      const guardGroup = new THREE.Object3D();
      const guardRedMat = new THREE.MeshLambertMaterial({ color: 0xaa1c0a });
      const guardGoldMat = new THREE.MeshLambertMaterial({ color: 0xc9b46a });

      const guardMainGeom = new THREE.BoxGeometry(2.0, 1.8, 1.0);
      const guardMain = new THREE.Mesh(guardMainGeom, guardRedMat);
      guardMain.position.set(0, 0.3, 3.2);
      guardGroup.add(guardMain);

      const guardInsetGeom = new THREE.BoxGeometry(1.2, 1.2, 0.4);
      const guardInset = new THREE.Mesh(guardInsetGeom, guardGoldMat);
      guardInset.position.set(0, 0.3, 3.5);
      guardGroup.add(guardInset);

      const lowerHookGeom = new THREE.BoxGeometry(0.6, 1.2, 0.6);
      const lowerHook = new THREE.Mesh(lowerHookGeom, guardRedMat);
      lowerHook.position.set(-0.6, -0.6, 3.0);
      lowerHook.rotation.z = THREE.Math.degToRad(-20);
      guardGroup.add(lowerHook);

      const sideFangGeom = new THREE.ConeGeometry(0.4, 0.8, 4);
      const sideFang = new THREE.Mesh(sideFangGeom, guardRedMat);
      sideFang.rotation.z = THREE.Math.degToRad(90);
      sideFang.rotation.y = THREE.Math.degToRad(90);
      sideFang.position.set(1.0, -0.1, 3.2);
      guardGroup.add(sideFang);

      sword.add(guardGroup);

      // Blade group
      const bladeGroup = new THREE.Object3D();

      const bladeCoreGeom = new THREE.BoxGeometry(1.0, 0.5, 8.0);
      const bladeCoreMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
      const bladeCore = new THREE.Mesh(bladeCoreGeom, bladeCoreMat);
      bladeCore.position.set(0, 0.5, 7.0);
      bladeGroup.add(bladeCore);

      const bladeEdgeGeom = new THREE.BoxGeometry(1.2, 0.4, 8.0);
      const bladeEdgeMat = new THREE.MeshLambertMaterial({ color: 0xbfbfbf });
      const bladeEdge = new THREE.Mesh(bladeEdgeGeom, bladeEdgeMat);
      bladeEdge.position.set(0.1, 0.8, 7.0);
      bladeGroup.add(bladeEdge);

      const tipGeom = new THREE.ConeGeometry(0.6, 1.2, 6);
      const tipMat = new THREE.MeshLambertMaterial({ color: 0xbfbfbf });
      const tip = new THREE.Mesh(tipGeom, tipMat);
      tip.rotation.x = THREE.Math.degToRad(90);
      tip.position.set(0.15, 0.7, 11.0);
      bladeGroup.add(tip);

      const runeGeom = new THREE.BoxGeometry(0.6, 0.25, 3.0);
      const runeMat = new THREE.MeshLambertMaterial({ color: 0x00ff55 });
      const runeStrip = new THREE.Mesh(runeGeom, runeMat);
      runeStrip.position.set(0.0, 0.9, 6.0);
      bladeGroup.add(runeStrip);

      const skullNode = new THREE.Object3D();
      if (Game.Entities.SkullHead) {
        const skullInset = Game.Entities.SkullHead();
        skullInset.scale.set(0.3, 0.3, 0.3);
        skullInset.position.set(0.4, 1.1, 8.0);
        skullInset.rotation.y = THREE.Math.degToRad(180);
        skullNode.add(skullInset);
      }
      const runeGlow = new THREE.PointLight(0x00ff55, 1.4, 6);
      runeGlow.position.set(0.4, 1.1, 8.0);
      skullNode.add(runeGlow);

      bladeGroup.add(skullNode);
      sword.add(bladeGroup);

      // final pose of sword in rider hands
      sword.position.set(2.5, 11.5, 1.5);
      sword.rotation.x = THREE.Math.degToRad(-100);
      sword.rotation.y = THREE.Math.degToRad(20);
      sword.rotation.z = THREE.Math.degToRad(-30);

      return sword;
    }

    // attach weapon
    if (weaponType === "sword") {
      rider.add(buildSword());
    } else if (weaponType === "axe") {
      rider.add(buildAxe());
    } else if (weaponType === "staff") {
      rider.add(buildStaff());
    } else if (weaponType === "rune_sword") {
      rider.add(buildRuneSword());
    }

    // place rider on horse spine / saddle
    rider.position.set(0, -2, -2);
    group.add(rider);

    group.position.y = 0;

    group.addForwardRangeArc = function (colorHex) {
      const outerR = 75;
      const innerR = 74;
      const segments = 32;

      const thetaStart = C.RING_POSITION_START;
      const thetaLength = C.RING_POSITION_LEN;

      const ringGeom = new THREE.RingGeometry(
        innerR,
        outerR,
        segments,
        1,
        thetaStart,
        thetaLength
      );

      const ringMat = new THREE.MeshBasicMaterial({
        color: colorHex || 0x00ff00,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
      });

      const ring = new THREE.Mesh(ringGeom, ringMat);

      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.1;
      group.add(ring);
      group.rangeIndicator = ring;
    };

    function faceTowards(x, z) {
      const dx = x - group.position.x;
      const dz = z - group.position.z;
      group.rotation.y = Math.atan2(dx, dz) + Math.PI;
    }

    function getPosition() {
      return group.position;
    }

    function setY(y) {
      group.position.y = y;
    }

    return {
      root: group,
      addForwardRangeArc: group.addForwardRangeArc,
      faceTowards,
      getPosition,
      setY
    };
  };
})(window);
