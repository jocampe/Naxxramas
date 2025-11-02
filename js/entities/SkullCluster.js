(function (global) {
  const Game = global.Game || (global.Game = {});
  const C = Game.CONST;
  Game.Entities = Game.Entities || {};

  function buildSkull(scale, skullMat, darkMat, THREEref) {
    const skull = new THREEref.Object3D();

    // Head dome (cranium)
    const headGeom = new THREEref.SphereGeometry(1, 16, 16);
    const head = new THREEref.Mesh(headGeom, skullMat);
    head.scale.set(1.2 * scale, 1.0 * scale, 1.1 * scale);
    head.position.set(0, 0.6 * scale, 0);
    skull.add(head);

    // Brow / eyebrow ridge
    const browGeom = new THREEref.BoxGeometry(2.0 * scale, 0.5 * scale, 0.8 * scale);
    const brow = new THREEref.Mesh(browGeom, skullMat);
    brow.position.set(0, 0.4 * scale, 0.5 * scale);
    brow.rotation.x = THREEref.Math.degToRad(15);
    skull.add(brow);

    // Eye sockets
    const eyeGeom = new THREEref.BoxGeometry(0.6 * scale, 0.3 * scale, 0.2 * scale);
    const leftEye = new THREEref.Mesh(eyeGeom, darkMat);
    const rightEye = new THREEref.Mesh(eyeGeom, darkMat);
    leftEye.position.set(-0.5 * scale, 0.35 * scale, 0.9 * scale);
    rightEye.position.set(0.5 * scale, 0.35 * scale, 0.9 * scale);
    leftEye.rotation.y = THREEref.Math.degToRad(10);
    rightEye.rotation.y = THREEref.Math.degToRad(-10);
    skull.add(leftEye);
    skull.add(rightEye);

    // Jaw / teeth chunk (forward cone)
    const jawGeom = new THREEref.ConeGeometry(0.8 * scale, 1.2 * scale, 6);
    const jaw = new THREEref.Mesh(jawGeom, skullMat);
    jaw.rotation.x = THREEref.Math.degToRad(-90);
    jaw.position.set(0, -0.1 * scale, 0.6 * scale);
    jaw.scale.set(1.2, 0.6, 1.0);
    skull.add(jaw);

    // Dark mouth cavity
    const mouthGeom = new THREEref.CylinderGeometry(0.4 * scale, 0.7 * scale, 0.4 * scale, 6);
    const mouth = new THREEref.Mesh(mouthGeom, darkMat);
    mouth.rotation.x = THREEref.Math.degToRad(90);
    mouth.position.set(0, -0.15 * scale, 0.8 * scale);
    mouth.scale.set(1.0, 0.6, 1.0);
    skull.add(mouth);

    return skull;
  }

  // Full 3-skull cluster for pillars
  Game.Entities.SkullCluster = function () {
    const group = new THREE.Object3D();

    const skullMat = new THREE.MeshLambertMaterial({ color: 0x9a8f94 }); // bone
    const darkMat = new THREE.MeshLambertMaterial({ color: 0x2a1f24 }); // holes/eyes

    // main / large skull
    const bigSkull = buildSkull(1.0, skullMat, darkMat, THREE);
    bigSkull.position.set(0, 2.2, 0);
    group.add(bigSkull);

    // side skulls, smaller
    const leftSmall = buildSkull(0.5, skullMat, darkMat, THREE);
    const rightSmall = buildSkull(0.5, skullMat, darkMat, THREE);

    leftSmall.position.set(-1.5, 1.6, 0.4);
    leftSmall.rotation.y = THREE.Math.degToRad(15);

    rightSmall.position.set(1.5, 1.6, 0.4);
    rightSmall.rotation.y = THREE.Math.degToRad(-15);

    group.add(leftSmall);
    group.add(rightSmall);

    // collar ring
    const collarGeom = new THREE.CylinderGeometry(2.4, 2.4, 0.6, 12);
    const collarMat = new THREE.MeshLambertMaterial({ color: 0x5a4f56 });
    const collar = new THREE.Mesh(collarGeom, collarMat);
    collar.position.set(0, 1.2, 0);
    group.add(collar);

    return group;
  };

  Game.Entities.SkullHead = function () {
    const skullMat = new THREE.MeshLambertMaterial({ color: 0x9a8f94 });
    const darkMat = new THREE.MeshLambertMaterial({ color: 0x2a1f24 });

    const head = buildSkull(1.0, skullMat, darkMat, THREE);

    return head;
  };

})(window);
