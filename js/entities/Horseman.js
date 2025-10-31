(function (global) {
  const Game = global.Game || (global.Game = {});
  const C = Game.CONST;

  Game.Entities = Game.Entities || {};

  // helper to create a horse body + rider as a THREE.Object3D
  Game.Entities.Horseman = function (colorMain, colorTrim, weaponType) {
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

    // Chest plate / front armor (like that vertical glowing gem plate)
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

    // Side flares / wing-like shoulder plates on horse armor
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
    // LEGS / HOOF ARMOR (fixed)
    // -----------------------

    function makeLeg(hipX, hipZ) {
      const legRoot = new THREE.Object3D();

      // upper leg / thigh
      const upperGeom = new THREE.BoxGeometry(2, 3, 2);
      const upperMat = new THREE.MeshLambertMaterial({ color: colorMain });
      const upper = new THREE.Mesh(upperGeom, upperMat);

      // we want the hip joint at the TOP of the upper leg.
      // upper leg height = 3, so its center should sit at y = -3/2 = -1.5 below hip.
      upper.position.set(0, -1.5, 0);
      legRoot.add(upper);

      // lower leg
      const lowerGeom = new THREE.BoxGeometry(1.5, 2.5, 1.5);
      const lowerMat = new THREE.MeshLambertMaterial({ color: colorMain });
      const lower = new THREE.Mesh(lowerGeom, lowerMat);

      // lower leg height = 2.5, so center goes another 2.5/2 (=1.25) below bottom of upper,
      // bottom of upper is at y = -3, so center = -3 -1.25 = -4.25
      lower.position.set(0, -4.25, 0);
      legRoot.add(lower);

      // hoof
      const hoofGeom = new THREE.CylinderGeometry(0.8, 1.2, 1, 6);
      const hoofMat = new THREE.MeshLambertMaterial({ color: 0x000000 });
      const hoof = new THREE.Mesh(hoofGeom, hoofMat);
      hoof.rotation.x = THREE.Math.degToRad(90);

      // hoof height ≈1, place center just under lower leg bottom.
      // bottom of lower leg ≈ (-4.25 - 1.25) = -5.5
      // so hoof center ~ -5.5 - 0.5 = -6
      hoof.position.set(0, -6, 0);
      legRoot.add(hoof);

      // now place the root under the horse body:
      // horse body is at y ~ 3, and visually we wanted legs reaching ground (y ~ 0).
      // So hip height should be around body bottom.
      // body box is height 4 and centered at y=3 → body bottom is y=1.
      // We'll put hips at y=1.
      legRoot.position.set(hipX, 1, hipZ);

      return legRoot;
    }

    // front legs (more forward: z ~ -5)
    group.add(makeLeg(2.5, -5));
    group.add(makeLeg(-2.5, -5));

    // back legs (further back: z ~ 5)
    group.add(makeLeg(2.5, 5));
    group.add(makeLeg(-2.5, 5));


    // -----------------------
    // RIDER
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

    // shoulders (big spiky pauldrons)
    function makePauldron(sideSign) {
      const p = new THREE.Object3D();

      const padGeom = new THREE.BoxGeometry(2.5, 2, 3);
      const padMat = new THREE.MeshLambertMaterial({ color: colorTrim });
      const pad = new THREE.Mesh(padGeom, padMat);
      pad.position.set(2 * sideSign, 11, 0.5);
      pad.rotation.z = THREE.Math.degToRad(15 * -sideSign);
      p.add(pad);

      // little horn spike
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

    // skull head instead of normal helmet
    if (Game.Entities.SkullHead) {
      const skullHead = Game.Entities.SkullHead();

      // scale it down so it sits like a "helm"
      skullHead.scale.set(0.9, 0.9, 0.9);

      // position relative to rider torso:
      // torso center is around y=10
      // old helm used position y=13
      // so we keep it near 13 so it still reads as a head on shoulders
      skullHead.position.set(0, 13, 0);

      // rotate so the jaw/teeth face forward (our skull faces +Z by default)
      // Your horse "forward" is towards -Z, so we want the skull to look -Z.
      // Facing -Z from +Z is a 180° turn around Y.
      skullHead.rotation.y = THREE.Math.degToRad(180);

      rider.add(skullHead);
    }

    // Build a sword (long blade)
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

      // pose in right hand-ish
      sword.position.set(2.5, 12, -1.5);
      sword.rotation.z = THREE.Math.degToRad(-20);

      return sword;
    }

    // Build a brutal 3-spike axe
    function buildAxe() {
      const axe = new THREE.Object3D();

      // handle
      const handleGeom = new THREE.CylinderGeometry(0.3, 0.3, 5, 6);
      const handleMat = new THREE.MeshLambertMaterial({ color: 0x4a3a2a });
      const handle = new THREE.Mesh(handleGeom, handleMat);
      handle.position.set(0, 2.5, 0);
      axe.add(handle);

      // central blade block
      const headBlockGeom = new THREE.BoxGeometry(2, 1, 1);
      const headBlockMat = new THREE.MeshLambertMaterial({ color: 0x777777 });
      const headBlock = new THREE.Mesh(headBlockGeom, headBlockMat);
      headBlock.position.set(0, 4.2, 0);
      axe.add(headBlock);

      // 3 forward spikes (think: brutal war axe with jagged head)
      const spikeGeom = new THREE.ConeGeometry(0.5, 1.5, 6);
      const spikeMat = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });

      const spikeCenter = new THREE.Mesh(spikeGeom, spikeMat);
      spikeCenter.rotation.x = THREE.Math.degToRad(90); // point forward (+Z in axe local)
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

      // pose in both hands / heavy carry more forward
      axe.position.set(0, 11.5, 2);
      axe.rotation.x = THREE.Math.degToRad(-20);
      axe.rotation.y = THREE.Math.degToRad(95);

      return axe;
    }

    // Build a staff with a skull on top
    function buildStaff() {
      const staff = new THREE.Object3D();

      // long shaft
      const shaftGeom = new THREE.CylinderGeometry(0.25, 0.25, 7, 8);
      const shaftMat = new THREE.MeshLambertMaterial({ color: 0x3a2a1a });
      const shaft = new THREE.Mesh(shaftGeom, shaftMat);
      shaft.position.set(0, 3.5, 0);
      staff.add(shaft);

      // skull topper: reuse the SkullHead builder, but scaled down
      if (Game.Entities.SkullHead) {
        const topper = Game.Entities.SkullHead();
        topper.scale.set(0.4, 0.4, 0.4);
        topper.position.set(0, 7, 0); // sit at tip of staff
        // face forward (-Z)
        topper.rotation.y = THREE.Math.degToRad(180);
        staff.add(topper);
      } else {
        // fallback if SkullHead not loaded for some reason
        const orbGeom = new THREE.SphereGeometry(0.8, 12, 12);
        const orbMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const orb = new THREE.Mesh(orbGeom, orbMat);
        orb.position.set(0, 7, 0);
        staff.add(orb);
      }

      // pose it like it's being held up / channeling
      staff.position.set(-2.5, 12, 0);
      staff.rotation.z = THREE.Math.degToRad(20);
      staff.rotation.x = THREE.Math.degToRad(-10);

      return staff;
    }

    function buildRuneSword() {
      const sword = new THREE.Object3D();

      //
      // ORIENTATION NOTE:
      // We'll build the sword so it points forward along +Z in its own local space.
      // That means:
      //   pommel at low Z,
      //   guard near middle,
      //   blade extending toward higher Z.
      // Then at the end we'll rotate/position the total sword in the rider's hands.
      //

      //
      // 1. POMMEL (red outer triangle w/ gold inner)
      //
      const pommelGroup = new THREE.Object3D();

      // outer red triangle
      const pommelOuterGeom = new THREE.ConeGeometry(0.9, 1.2, 4);
      const pommelOuterMat = new THREE.MeshLambertMaterial({ color: 0xaa1c0a }); // saturated red
      const pommelOuter = new THREE.Mesh(pommelOuterGeom, pommelOuterMat);
      // Aim the cone tip backwards along -Z
      pommelOuter.rotation.x = THREE.Math.degToRad(90);
      pommelOuter.position.set(0, 0, 0);
      pommelGroup.add(pommelOuter);

      // gold inner fill (slightly smaller cone sitting inside)
      const pommelInnerGeom = new THREE.ConeGeometry(0.6, 0.8, 4);
      const pommelInnerMat = new THREE.MeshLambertMaterial({ color: 0xc9b46a }); // pale gold
      const pommelInner = new THREE.Mesh(pommelInnerGeom, pommelInnerMat);
      pommelInner.rotation.x = THREE.Math.degToRad(90);
      // push slightly forward so it "insets"
      pommelInner.position.set(0, 0, 0.2);
      pommelGroup.add(pommelInner);

      // place pommelGroup at start of weapon
      pommelGroup.position.set(0, 0, 0);
      sword.add(pommelGroup);


      //
      // 2. GRIP (beige handle with red bands)
      //
      const gripGroup = new THREE.Object3D();

      // beige shaft
      const gripGeom = new THREE.CylinderGeometry(0.35, 0.35, 2.2, 8);
      const gripMat = new THREE.MeshLambertMaterial({ color: 0xbfa57a }); // bone/beige
      const grip = new THREE.Mesh(gripGeom, gripMat);
      // Cylinder grows along Y. We'll rotate so it's along +Z instead.
      grip.rotation.x = THREE.Math.degToRad(90);
      grip.position.set(0, 0, 1.6); // put just after pommel
      gripGroup.add(grip);

      // red bands around the handle (slightly larger radius so they visually wrap)
      function ringAt(zPos) {
        const ringGeom = new THREE.CylinderGeometry(0.4, 0.4, 0.25, 6);
        const ringMat = new THREE.MeshLambertMaterial({ color: 0x8a0000 }); // deeper red
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.rotation.x = THREE.Math.degToRad(90);
        ring.position.set(0, 0, zPos);
        return ring;
      }
      gripGroup.add(ringAt(0.8));
      gripGroup.add(ringAt(1.6));
      gripGroup.add(ringAt(2.4));

      gripGroup.position.set(0, 0, 0); // continues forward from pommel
      sword.add(gripGroup);


      //
      // 3. GUARD (iconic red frame w/ gold inlay)
      //
      // Visually in the reference: it's like a thick red angular "C" / claw hugging the base of the blade,
      // with an inner gold/beige surface.
      //
      const guardGroup = new THREE.Object3D();

      // We'll approximate the red frame with two chunky boxes and a connector:
      const guardRedMat = new THREE.MeshLambertMaterial({ color: 0xaa1c0a }); // same crimson as pommelOuter
      const guardGoldMat = new THREE.MeshLambertMaterial({ color: 0xc9b46a }); // same gold

      // main red block (the part that hugs the blade root from below and behind)
      const guardMainGeom = new THREE.BoxGeometry(2.0, 1.8, 1.0);
      const guardMain = new THREE.Mesh(guardMainGeom, guardRedMat);
      guardMain.position.set(0, 0.3, 3.2); // sits after grip, slightly up
      guardGroup.add(guardMain);

      // gold inset panel inside that red frame
      const guardInsetGeom = new THREE.BoxGeometry(1.2, 1.2, 0.4);
      const guardInset = new THREE.Mesh(guardInsetGeom, guardGoldMat);
      guardInset.position.set(0, 0.3, 3.2 + 0.3); // bias forward a hair so you see it
      guardGroup.add(guardInset);

      // lower red hook / spike that points downward-ish in the ref
      const lowerHookGeom = new THREE.BoxGeometry(0.6, 1.2, 0.6);
      const lowerHook = new THREE.Mesh(lowerHookGeom, guardRedMat);
      lowerHook.position.set(-0.6, -0.6, 3.0);
      // slight tilt to give that jagged silhouette
      lowerHook.rotation.z = THREE.Math.degToRad(-20);
      guardGroup.add(lowerHook);

      // side fang / flare
      const sideFangGeom = new THREE.ConeGeometry(0.4, 0.8, 4);
      const sideFang = new THREE.Mesh(sideFangGeom, guardRedMat);
      // aim this fang down/left-ish
      sideFang.rotation.z = THREE.Math.degToRad(90);
      sideFang.rotation.y = THREE.Math.degToRad(90);
      sideFang.position.set(1.0, -0.1, 3.2);
      guardGroup.add(sideFang);

      sword.add(guardGroup);


      //
      // 4. BLADE (straight, no bend!)
      //
      // We'll build:
      //  - dark inner metal bar
      //  - silver/gray outer edge plating
      //  - green rune strip (small rectangle)
      //  - skull + glow anchored near rune strip
      //

      const bladeGroup = new THREE.Object3D();

      // dark inner metal
      const bladeCoreGeom = new THREE.BoxGeometry(1.0, 0.5, 8.0);
      const bladeCoreMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a }); // deep metal
      const bladeCore = new THREE.Mesh(bladeCoreGeom, bladeCoreMat);
      // Put root just after guard, continue forward in +Z
      bladeCore.position.set(0, 0.5, 7.0);
      bladeGroup.add(bladeCore);

      // bright/steel outer edge layer (sits *slightly* offset up/right so it reads as the sharpened, jagged edge)
      const bladeEdgeGeom = new THREE.BoxGeometry(1.2, 0.4, 8.0);
      const bladeEdgeMat = new THREE.MeshLambertMaterial({ color: 0xbfbfbf }); // bright worn steel
      const bladeEdge = new THREE.Mesh(bladeEdgeGeom, bladeEdgeMat);
      bladeEdge.position.set(0.1, 0.8, 7.0);
      bladeGroup.add(bladeEdge);

      // front tip spike (taper)
      const tipGeom = new THREE.ConeGeometry(0.6, 1.2, 6);
      const tipMat = new THREE.MeshLambertMaterial({ color: 0xbfbfbf });
      const tip = new THREE.Mesh(tipGeom, tipMat);
      // point it along +Z
      tip.rotation.x = THREE.Math.degToRad(90);
      tip.position.set(0.15, 0.7, 11.0);
      bladeGroup.add(tip);

      // small neon rune strip (that glowing green scribble area)
      const runeGeom = new THREE.BoxGeometry(0.6, 0.25, 3.0);
      const runeMat = new THREE.MeshLambertMaterial({ color: 0x00ff55 }); // toxic green
      const runeStrip = new THREE.Mesh(runeGeom, runeMat);
      runeStrip.position.set(0.0, 0.9, 6.0); // sits on top/side of the inner blade
      bladeGroup.add(runeStrip);

      // skull socket + localized glow
      const skullNode = new THREE.Object3D();
      if (Game.Entities.SkullHead) {
        const skullInset = Game.Entities.SkullHead();
        skullInset.scale.set(0.3, 0.3, 0.3);
        // mount slightly above the rune strip, like in the reference
        skullInset.position.set(0.4, 1.1, 8.0);
        skullInset.rotation.y = THREE.Math.degToRad(180);
        skullNode.add(skullInset);
      }

      // green light only near skull
      const runeGlow = new THREE.PointLight(0x00ff55, 1.4, 6);
      runeGlow.position.set(0.4, 1.1, 8.0);
      skullNode.add(runeGlow);

      bladeGroup.add(skullNode);

      sword.add(bladeGroup);


      //
      // 5. FINAL POSE IN RIDER HANDS
      //
      // Up to now, everything was built straight down +Z with no bends.
      // Now we just put the whole sword into rider space with a single rotation.
      //
      sword.position.set(2.5, 11.5, 1.5);
      sword.rotation.x = THREE.Math.degToRad(-100);
      sword.rotation.y = THREE.Math.degToRad(20);
      sword.rotation.z = THREE.Math.degToRad(-30);

      return sword;
    }



    if (weaponType === 'sword') {
      rider.add(buildSword());
    } else if (weaponType === 'axe') {
      rider.add(buildAxe());
    } else if (weaponType === 'staff') {
      rider.add(buildStaff());
    } else if (weaponType === 'rune_sword') {
      rider.add(buildRuneSword());
    }


    rider.position.set(
      0,   // X: centered on horse spine
      -2, // Y: drop closer to horse (tweak 3.0 - 4.5 if needed)
      -2  // Z: move backward along the horse body toward the saddle
    );
    group.add(rider);

    // raise the whole thing so the hooves sit on y=0
    // front hooves positioned around y ≈ 0 now? Let's ensure base is grounded:
    group.position.y = 0;

    // -----------------------
    // ADD 90° FORWARD ARC (LOCAL TO HORSEMAN)
    // -----------------------
    //
    // Horse faces -Z in local space.
    // We want a 90° ring slice centered on that -Z direction.
    // In RingGeometry local space (before we rotate it flat):
    //   angle 0   = +X
    //   angle π/2 = +Y
    //   angle π   = -X
    //   angle 3π/2= -Y
    //
    // After we rotate the ring to lie on XZ, local +X maps to world +X,
    // local +Y maps to world +Z, and -Z (horse forward) corresponds to local -Y,
    // which is angle 3π/2 (270°).
    //
    // A 90° slice centered at 270° means we want [225°, 315°].
    // 225° = 225 * π/180 = 5π/4
    // 315° = 315 * π/180 = 7π/4
    // So thetaStart = 5π/4, thetaLength = π/2.
    //

    group.addForwardRangeArc = function (colorHex) {
      const outerR = 75;  // make it reach farther
      const innerR = 74;
      const segments = 32;

      // We keep thetaStart anchored so the middle of the wedge points "forward"
      // for a horse whose forward is local -Z.
      // 225° = 5π/4 is diagonally "down-left" in ring local space,
      // and with the -PI/2 X-rotation it lines up forward-ish.
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

      // IMPORTANT: use -Math.PI / 2, not +Math.PI / 2
      // This orients the wedge consistently so that when the whole horseman
      // is rotated toward the center in HorsemenGroup, the arc visually
      // sits in front of the horse, not mirrored weirdly.
      ring.rotation.x = Math.PI / 2;

      // tiny lift to avoid z-fighting
      ring.position.y = 0.1;

      group.add(ring);
      group.rangeIndicator = ring;
    };



    return group;
  };
})(window);
