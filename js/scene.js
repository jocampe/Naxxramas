(function (global) {
  const Game = global.Game || (global.Game = {});
  const C = Game.CONST;

  let scene, renderer;
  let perspCam, orthoCam, camera; // persistent cams + current
  let viewMode = 'ball';          // 'ball' | 'top' | 'rot45'
  let targetBall = null;
  let lookTarget = null;

  Game.Scene = {
    create() {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0b0e13);

      // lights
      const hemi = new THREE.HemisphereLight(0xffffff, 0x404040, 1.0);
      scene.add(hemi);
      const dir = new THREE.DirectionalLight(0xffffff, 0.9);
      dir.position.set(20, 25, 10);
      scene.add(dir);

      // --- cameras ---
      // Perspective camera (used for ball + rot45)
      perspCam = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
      const INIT_DIST = C.BOARD_SIZE * 0.20;
      const INIT_HEIGHT = C.BOARD_SIZE * 0.08;
      perspCam.position.set(0, INIT_HEIGHT, INIT_DIST);
      perspCam.up.set(0, 1, 0);
      perspCam.lookAt(new THREE.Vector3(0, 0.5, 0));

      // Orthographic camera (used for top)
      orthoCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 4000);
      orthoCam.up.set(0, 1, 0);

      // current camera = perspective by default
      camera = perspCam;

      // renderer
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);

      // resize: update both cams so switching later is seamless
      window.addEventListener('resize', onResize);
      onResize();

      // view switching
      window.addEventListener('keydown', (e) => {
        switch (e.key.toLowerCase()) {
          case 'z': viewMode = 'ball'; camera = perspCam; perspCam.up.set(0, 1, 0); break;
          case 'x': viewMode = 'top'; camera = orthoCam; orthoCam.up.set(0, 1, 0); break;
          case 'c': viewMode = 'rot45'; camera = perspCam; perspCam.up.set(0, 1, 0); break;
        }
      });

      return { scene, camera: () => camera, renderer };
    },

    attachBall(ball) {
      targetBall = ball;
      lookTarget = (ball && ball.getLookTarget) ? ball.getLookTarget() : null;
    },

    updateCamera(dt) {
      if (!targetBall) return;

      // ----- BALL (chase) VIEW — instant, scaled -----
      if (viewMode === 'ball') {
        camera = perspCam; // ensure correct cam
        perspCam.up.set(0, 1, 0);

        const yaw = (targetBall.getYaw) ? targetBall.getYaw() : 0;
        const CAM_DISTANCE = C.BOARD_SIZE * 0.20;
        const CAM_HEIGHT = C.BOARD_SIZE * 0.08;

        const behind = new THREE.Vector3(-Math.sin(yaw), 0, Math.cos(yaw)).setLength(CAM_DISTANCE);
        const desired = new THREE.Vector3().copy(targetBall.position).add(behind);
        desired.y = targetBall.position.y + CAM_HEIGHT;

        perspCam.position.copy(desired);
        perspCam.lookAt(lookTarget ? lookTarget.position : targetBall.position);
        return;
      }

      // ----- TOP VIEW (orthographic) — scaled frustum, static camera -----
      if (viewMode === 'top') {
        camera = orthoCam;
        orthoCam.up.set(0, 1, 0);

        const MARGIN = 1.15;
        const boardSpan = C.BOARD_SIZE * MARGIN;
        const aspect = window.innerWidth / window.innerHeight;

        const halfH = boardSpan * 0.5;
        const halfW = halfH * aspect;

        // set ortho bounds to show the full board
        orthoCam.left = -halfW;
        orthoCam.right = halfW;
        orthoCam.top = halfH;
        orthoCam.bottom = -halfH;
        orthoCam.near = 0.1;
        orthoCam.far = 4000;
        orthoCam.updateProjectionMatrix();

        const TOP_HEIGHT = C.BOARD_SIZE * 1.2;

        // --- static position centered over the board ---
        orthoCam.position.set(0, TOP_HEIGHT, 0);
        // Always look at the board’s center, not the ball
        orthoCam.lookAt(new THREE.Vector3(0, 0, 0));

        return;
      }


      // ----- ROTATED 45° VIEW — scaled distance -----
      if (viewMode === 'rot45') {
        camera = perspCam; // ensure correct cam
        perspCam.up.set(0, 1, 0);

        const DIAG_DIST = C.BOARD_SIZE * 0.9;
        perspCam.position.set(DIAG_DIST, DIAG_DIST, DIAG_DIST);
        perspCam.lookAt(lookTarget ? lookTarget.position : targetBall.position);
        return;
      }
    },

    render() { renderer.render(scene, camera); }
  };

  function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);

    // perspective
    perspCam.aspect = window.innerWidth / window.innerHeight;
    perspCam.updateProjectionMatrix();

    // orthographic: keep a reasonable default; updateCamera will refine per view
    const aspect = window.innerWidth / window.innerHeight;
    const halfH = (C.BOARD_SIZE * 0.5);
    const halfW = halfH * aspect;
    orthoCam.left = -halfW;
    orthoCam.right = halfW;
    orthoCam.top = halfH;
    orthoCam.bottom = -halfH;
    orthoCam.updateProjectionMatrix();
  }
})(window);
