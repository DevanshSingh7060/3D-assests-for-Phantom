// ==========================================================================
// SMRITI — Premium Interactive 3D Product Experience
// Architecture: Pure 3D World (Character + Home + Props + Camera + Animation)
// Strictly separated from Website HTML UI (Branding + Typography + Evidence)
// ==========================================================================

(function() {
  'use strict';

  // Coordinate Constants exactly matching Spline Scene
  const GLASSES_ORIGIN = { x: -115, y: 53.5, z: -35 };
  const GLASSES_DEST = { x: 125, y: 92, z: -218 };
  const CHAR_ORIGIN = { x: 15, y: 0, z: 20 };

  // Cinematic Camera States (Front-stage architectural perspective matching Spline)
  const CAM_PRESETS = {
    HOME: { pos: { x: 10, y: 155, z: 420 }, target: { x: 10, y: 75, z: -50 }, fov: 32 },
    CHARACTER: { pos: { x: 15, y: 115, z: 250 }, target: { x: 15, y: 72, z: 10 }, fov: 28 },
    SEARCH: { pos: { x: -40, y: 125, z: 270 }, target: { x: -85, y: 60, z: -35 }, fov: 29 },
    PHANTOM: { pos: { x: 10, y: 165, z: 430 }, target: { x: 10, y: 80, z: -80 }, fov: 33 },
    REVEAL: { pos: { x: 75, y: 120, z: 190 }, target: { x: 125, y: 92, z: -218 }, fov: 28 },
    RESOLUTION: { pos: { x: 10, y: 155, z: 420 }, target: { x: 10, y: 75, z: -50 }, fov: 32 }
  };

  class SmritiExperience {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      if (!this.container) return;

      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.camTarget = new THREE.Vector3(10, 75, -50);
      this.targetCamPos = new THREE.Vector3().copy(CAM_PRESETS.HOME.pos);
      this.targetCamLook = new THREE.Vector3().copy(CAM_PRESETS.HOME.target);
      this.targetFov = CAM_PRESETS.HOME.fov;

      // 3D Objects
      this.character = null;
      this.characterHead = null;
      this.characterEyes = [];
      this.glasses = null;
      this.ghostGlasses = null;
      this.highlightGhost = null;
      this.highlightMoved = null;
      this.spatialTrail = null;
      this.roomLights = {};

      // Animation State
      this.isStoryActive = false;
      this.diffProgress = 1;
      this.storyStartTime = 0;
      this.lastBlinkTime = 0;
      this.charPos = new THREE.Vector3().copy(CHAR_ORIGIN);
      this.charRot = new THREE.Euler(0, -0.1, 0);
      this.headRot = new THREE.Euler(0, 0, 0);

      // External Website UI References (Isolated in HTML)
      this.ui = {
        statusDot: document.getElementById('storyStatusDot'),
        statusText: document.getElementById('storyStatusText'),
        receiptToast: document.getElementById('memoryReceiptToast'),
        captionWrap: document.getElementById('heroCaptionWrap'),
        captionText: document.getElementById('heroCaptionText'),
        captionSub: document.getElementById('heroCaptionSub'),
        btnStart: document.getElementById('btnStartExperience'),
        btnReset: document.getElementById('btnResetExperience'),
        btnLabel: document.getElementById('btnExperienceLabel')
      };

      this.init();
    }

    init() {
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xf4f0e8);
      this.scene.fog = new THREE.Fog(0xf4f0e8, 900, 2400);

      const isMobile = window.innerWidth < 640;
      const initialFov = isMobile ? 38 : CAM_PRESETS.HOME.fov;
      const aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera = new THREE.PerspectiveCamera(initialFov, aspect, 10, 3500);

      if (isMobile) {
        this.camera.position.set(10, 185, 600);
        this.camTarget.set(10, 95, -50);
        this.camera.fov = 35;
        this.camera.updateProjectionMatrix();
      } else {
        this.camera.position.copy(CAM_PRESETS.HOME.pos);
        this.camTarget.copy(CAM_PRESETS.HOME.target);
      }
      this.camera.lookAt(this.camTarget);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.35 : 1.7));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.02;

      this.container.appendChild(this.renderer.domElement);

      this.setupLights();
      this.buildRoom();
      this.buildFurniture();
      this.buildCharacter();
      this.buildProps();

      window.addEventListener('resize', () => this.onResize());
      this.setupUIListeners();

      this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
      window.addEventListener('mousemove', (e) => {
        this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
        this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
      });

      this.animate = this.animate.bind(this);
      requestAnimationFrame(this.animate);
    }

    setupLights() {
      // Warm, balanced lighting with filmic exposure — avoiding blown-out ambient wash
      const ambient = new THREE.AmbientLight(0xfdf2e2, 0.58);
      this.scene.add(ambient);
      this.roomLights.ambient = ambient;

      const sun = new THREE.DirectionalLight(0xfff0db, 0.98);
      sun.position.set(320, 480, 360);
      sun.castShadow = true;
      sun.shadow.mapSize.width = 1024;
      sun.shadow.mapSize.height = 1024;
      sun.shadow.camera.near = 100;
      sun.shadow.camera.far = 1300;
      const d = 360;
      sun.shadow.camera.left = -d;
      sun.shadow.camera.right = d;
      sun.shadow.camera.top = d;
      sun.shadow.camera.bottom = -d;
      sun.shadow.bias = -0.0004;
      this.scene.add(sun);
      this.roomLights.sun = sun;

      const lampLight = new THREE.PointLight(0xffdeaa, 2.2, 260, 1.6);
      lampLight.position.set(-55, 68, -175);
      this.scene.add(lampLight);
      this.roomLights.lamp = lampLight;

      const windowFill = new THREE.DirectionalLight(0xfffaed, 0.35);
      windowFill.position.set(-280, 300, 100);
      this.scene.add(windowFill);
    }

    buildRoom() {
      // 1. Warm Hardwood Oak/Parquet Floor
      const matFloor = new THREE.MeshStandardMaterial({ color: 0xb58d67, roughness: 0.65, metalness: 0.05 });
      const floor = new THREE.Mesh(new THREE.BoxGeometry(900, 8, 900), matFloor);
      floor.position.set(0, -4, 0);
      floor.receiveShadow = true;
      this.scene.add(floor);

      // 2. Warm Architectural Plaster Walls
      const matWallBack = new THREE.MeshStandardMaterial({ color: 0xf0e9dc, roughness: 0.88 });
      const wallBack = new THREE.Mesh(new THREE.BoxGeometry(700, 340, 16), matWallBack);
      wallBack.position.set(20, 170, -250);
      wallBack.receiveShadow = true;
      this.scene.add(wallBack);

      const matWallLeft = new THREE.MeshStandardMaterial({ color: 0xe8dfce, roughness: 0.88 });
      // Four plaster returns leave a real opening for the window. A single
      // opaque slab behind the frame made the glazing read as a wall sticker.
      const wallLeftSegments = [
        { size: [16, 105, 700], at: [-250, 52.5, 20] },
        { size: [16, 103, 700], at: [-250, 286.5, 20] },
        { size: [16, 130, 270], at: [-250, 170, -195] },
        { size: [16, 130, 270], at: [-250, 170, 235] }
      ];
      wallLeftSegments.forEach(({ size, at }) => {
        const panel = new THREE.Mesh(new THREE.BoxGeometry(...size), matWallLeft);
        panel.position.set(...at);
        panel.receiveShadow = true;
        this.scene.add(panel);
      });

      // 3. Architectural Baseboard Molding (grounds walls to floor)
      const matBaseboard = new THREE.MeshStandardMaterial({ color: 0x8c6b48, roughness: 0.7 });
      const baseboardBack = new THREE.Mesh(new THREE.BoxGeometry(680, 12, 6), matBaseboard);
      baseboardBack.position.set(10, 6, -241);
      baseboardBack.castShadow = true;
      baseboardBack.receiveShadow = true;
      this.scene.add(baseboardBack);

      const baseboardLeft = new THREE.Mesh(new THREE.BoxGeometry(6, 12.5, 480), matBaseboard);
      baseboardLeft.position.set(-241, 6.25, 0);
      baseboardLeft.castShadow = true;
      baseboardLeft.receiveShadow = true;
      this.scene.add(baseboardLeft);

      // 4. Window Frame & Glass
      const matWoodFrame = new THREE.MeshStandardMaterial({ color: 0x9e7549, roughness: 0.65 });
      const matGlass = new THREE.MeshPhysicalMaterial({ color: 0xe6f3fa, roughness: 0.1, transmission: 0.7, transparent: true, opacity: 0.65 });

      const winGroup = new THREE.Group();
      winGroup.position.set(-246, 170, 20);

      const frameRailTop = new THREE.Mesh(new THREE.BoxGeometry(6, 6, 152), matWoodFrame);
      frameRailTop.position.y = 62;
      winGroup.add(frameRailTop);
      const frameRailBottom = new THREE.Mesh(new THREE.BoxGeometry(6, 6, 152), matWoodFrame);
      frameRailBottom.position.y = -62;
      winGroup.add(frameRailBottom);
      const frameRailLeft = new THREE.Mesh(new THREE.BoxGeometry(6, 118, 6), matWoodFrame);
      frameRailLeft.position.z = -77;
      winGroup.add(frameRailLeft);
      const frameRailRight = new THREE.Mesh(new THREE.BoxGeometry(6, 118, 6), matWoodFrame);
      frameRailRight.position.z = 77;
      winGroup.add(frameRailRight);

      const hBar = new THREE.Mesh(new THREE.BoxGeometry(3, 4, 152), matWoodFrame);
      winGroup.add(hBar);

      const vBar = new THREE.Mesh(new THREE.BoxGeometry(3, 122, 4), matWoodFrame);
      vBar.position.x = 0.6;
      winGroup.add(vBar);

      const glass = new THREE.Mesh(new THREE.BoxGeometry(2, 122, 152), matGlass);
      glass.position.x = -1.5;
      winGroup.add(glass);

      this.scene.add(winGroup);

      // 5. Warm Woven Wool Rug with border
      const matRug = new THREE.MeshStandardMaterial({ color: 0xd2c6b2, roughness: 0.9 });
      const rug = new THREE.Mesh(new THREE.BoxGeometry(396, 2, 316), matRug);
      rug.position.set(0, 3, -30);
      rug.receiveShadow = true;
      this.scene.add(rug);

      const matRugBorder = new THREE.MeshStandardMaterial({ color: 0xb5a794, roughness: 0.9 });
      const rugBorder = new THREE.Mesh(new THREE.BoxGeometry(408, 2.5, 328), matRugBorder);
      rugBorder.position.set(0, 1, -30);
      rugBorder.receiveShadow = true;
      this.scene.add(rugBorder);
    }

    buildFurniture() {
      const matWoodWarm = new THREE.MeshStandardMaterial({ color: 0x987148, roughness: 0.65 });
      const matWoodDark = new THREE.MeshStandardMaterial({ color: 0x7c5833, roughness: 0.72 });
      const matTableWood = new THREE.MeshStandardMaterial({ color: 0xba9570, roughness: 0.6 });
      const matChairFabric = new THREE.MeshStandardMaterial({ color: 0xddd5c4, roughness: 0.88 });
      const matCushionOlive = new THREE.MeshStandardMaterial({ color: 0x5b6641, roughness: 0.8 });

      // 1. SIDE TABLE
      const sideTableGroup = new THREE.Group();
      const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(28, 28, 4, 32), matTableWood);
      tableTop.position.set(-115, 50, -40);
      tableTop.castShadow = true;
      tableTop.receiveShadow = true;
      sideTableGroup.add(tableTop);

      const legGeo = new THREE.CylinderGeometry(2, 2, 50, 16);
      const leg1 = new THREE.Mesh(legGeo, matWoodDark);
      leg1.position.set(-128, 25, -48);
      leg1.rotation.set(-0.09, 0, 0.14);
      leg1.castShadow = true;
      sideTableGroup.add(leg1);

      const leg2 = new THREE.Mesh(legGeo, matWoodDark);
      leg2.position.set(-102, 25, -48);
      leg2.rotation.set(-0.09, 0, -0.14);
      leg2.castShadow = true;
      sideTableGroup.add(leg2);

      const leg3 = new THREE.Mesh(legGeo, matWoodDark);
      leg3.position.set(-115, 25, -28);
      leg3.rotation.set(0.16, 0, 0);
      leg3.castShadow = true;
      sideTableGroup.add(leg3);

      this.scene.add(sideTableGroup);

      // 2. OPEN BOOKSHELF
      const bookshelfGroup = new THREE.Group();
      const uprightGeo = new THREE.BoxGeometry(4, 160, 36);
      const uprightL = new THREE.Mesh(uprightGeo, matWoodWarm);
      uprightL.position.set(95, 80, -218);
      uprightL.castShadow = true;
      bookshelfGroup.add(uprightL);

      const uprightR = new THREE.Mesh(uprightGeo, matWoodWarm);
      uprightR.position.set(165, 80, -218);
      uprightR.castShadow = true;
      bookshelfGroup.add(uprightR);

      const shelfTop = new THREE.Mesh(new THREE.BoxGeometry(74, 4, 36), matWoodWarm);
      shelfTop.position.set(130, 160, -218);
      bookshelfGroup.add(shelfTop);

      const shelfBack = new THREE.Mesh(new THREE.BoxGeometry(70, 160, 2), matWoodDark);
      shelfBack.position.set(130, 80, -235);
      bookshelfGroup.add(shelfBack);

      const shelfGeo = new THREE.BoxGeometry(66, 3, 34);
      const shelf1 = new THREE.Mesh(shelfGeo, matWoodWarm);
      shelf1.position.set(130, 50, -218);
      shelf1.receiveShadow = true;
      bookshelfGroup.add(shelf1);

      const shelf2 = new THREE.Mesh(shelfGeo, matWoodWarm);
      shelf2.position.set(130, 90, -218);
      shelf2.receiveShadow = true;
      bookshelfGroup.add(shelf2);

      const shelf3 = new THREE.Mesh(shelfGeo, matWoodWarm);
      shelf3.position.set(130, 130, -218);
      shelf3.receiveShadow = true;
      bookshelfGroup.add(shelf3);

      // Books on Shelf 2
      const bookMatRose = new THREE.MeshStandardMaterial({ color: 0xdc728e, roughness: 0.8 });
      const bookMatBlue = new THREE.MeshStandardMaterial({ color: 0x3d78a8, roughness: 0.8 });
      const bookMatAmber = new THREE.MeshStandardMaterial({ color: 0xd59a45, roughness: 0.8 });
      const bookMatOlive = new THREE.MeshStandardMaterial({ color: 0x6f7655, roughness: 0.8 });

      const book1 = new THREE.Mesh(new THREE.BoxGeometry(8, 26, 18), bookMatRose);
      book1.position.set(106, 103, -218);
      book1.castShadow = true;
      bookshelfGroup.add(book1);

      const book2 = new THREE.Mesh(new THREE.BoxGeometry(10, 22, 19), bookMatBlue);
      book2.position.set(114, 104, -218);
      book2.castShadow = true;
      bookshelfGroup.add(book2);

      const book3 = new THREE.Mesh(new THREE.BoxGeometry(9, 28, 17), bookMatAmber);
      book3.position.set(148, 105, -218);
      book3.castShadow = true;
      bookshelfGroup.add(book3);

      const book4 = new THREE.Mesh(new THREE.BoxGeometry(8, 24, 18), bookMatOlive);
      book4.position.set(156, 102, -218);
      book4.castShadow = true;
      bookshelfGroup.add(book4);

      const vase = new THREE.Mesh(new THREE.CylinderGeometry(5, 7, 18, 16), new THREE.MeshStandardMaterial({ color: 0xebdcc7, roughness: 0.5 }));
      vase.position.set(130, 140, -218);
      bookshelfGroup.add(vase);

      this.scene.add(bookshelfGroup);

      // 3. ARMCHAIR IN MIDGROUND
      const chairGroup = new THREE.Group();
      const seat = new THREE.Mesh(new THREE.BoxGeometry(64, 14, 64), matChairFabric);
      seat.position.set(-55, 15, -40);
      seat.castShadow = true;
      seat.receiveShadow = true;
      chairGroup.add(seat);

      const backrest = new THREE.Mesh(new THREE.BoxGeometry(64, 48, 14), matChairFabric);
      backrest.position.set(-55, 44, -65);
      backrest.castShadow = true;
      chairGroup.add(backrest);

      const armL = new THREE.Mesh(new THREE.BoxGeometry(12, 26, 60), matChairFabric);
      armL.position.set(-85, 28, -40);
      armL.castShadow = true;
      chairGroup.add(armL);

      const armR = new THREE.Mesh(new THREE.BoxGeometry(12, 26, 60), matChairFabric);
      armR.position.set(-25, 28, -40);
      armR.castShadow = true;
      chairGroup.add(armR);

      const cushion = new THREE.Mesh(new THREE.BoxGeometry(28, 22, 10), matCushionOlive);
      cushion.position.set(-55, 28, -58);
      cushion.rotation.set(-0.17, 0, 0);
      cushion.castShadow = true;
      chairGroup.add(cushion);

      this.scene.add(chairGroup);

      // 4. CABINET & LAMP
      const cabinet = new THREE.Mesh(new THREE.BoxGeometry(80, 40, 30), matTableWood);
      cabinet.position.set(-125, 25, -225);
      cabinet.castShadow = true;
      this.scene.add(cabinet);

      const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 2, 16), new THREE.MeshStandardMaterial({ color: 0x333 }));
      lampBase.position.set(-150, 46, -225);
      this.scene.add(lampBase);

      const lampRod = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 22, 12), new THREE.MeshStandardMaterial({ color: 0x333 }));
      lampRod.position.set(-150, 57, -225);
      this.scene.add(lampRod);

      const lampShade = new THREE.Mesh(new THREE.ConeGeometry(10, 14, 24), new THREE.MeshStandardMaterial({ color: 0xfcf7ea, roughness: 0.4, emissive: 0xffeed0, emissiveIntensity: 0.65 }));
      lampShade.position.set(-150, 68, -225);
      this.scene.add(lampShade);

      // 5. POTTED PLANT
      const plantPot = new THREE.Mesh(new THREE.CylinderGeometry(15, 12, 22, 24), new THREE.MeshStandardMaterial({ color: 0xc49673, roughness: 0.8 }));
      plantPot.position.set(195, 14, -200);
      plantPot.castShadow = true;
      this.scene.add(plantPot);

      const plantLeaves = new THREE.Mesh(new THREE.SphereGeometry(18, 24, 24), new THREE.MeshStandardMaterial({ color: 0x5b7b52, roughness: 0.85 }));
      plantLeaves.position.set(195, 36, -200);
      plantLeaves.castShadow = true;
      this.scene.add(plantLeaves);

      // 6. FRAMED WALL ART
      const frameBorder = new THREE.Mesh(new THREE.BoxGeometry(44, 56, 2), matWoodWarm);
      frameBorder.position.set(-125, 160, -241);
      this.scene.add(frameBorder);

      const frameCanvas = new THREE.Mesh(new THREE.BoxGeometry(38, 50, 1), new THREE.MeshStandardMaterial({ color: 0xede4d3 }));
      frameCanvas.position.set(-125, 160, -239);
      this.scene.add(frameCanvas);

      const frameSun = new THREE.Mesh(new THREE.SphereGeometry(9, 20, 20), new THREE.MeshStandardMaterial({ color: 0xb99a79 }));
      frameSun.position.set(-125, 160, -238);
      frameSun.scale.set(1, 1, 0.1);
      this.scene.add(frameSun);
    }

    buildCharacter() {
      // Signature Outfit: Olive Knit Sweater + Cream Trousers + Chestnut Shoes
      const matSkin = new THREE.MeshStandardMaterial({ color: 0xe9bda5, roughness: 0.7 });
      const matHair = new THREE.MeshStandardMaterial({ color: 0x30221d, roughness: 0.76 });
      const matSweater = new THREE.MeshStandardMaterial({ color: 0x59634b, roughness: 0.9 });
      const matSeam = new THREE.MeshStandardMaterial({ color: 0x424b39, roughness: 0.92 });
      const matPants = new THREE.MeshStandardMaterial({ color: 0xd8cdbb, roughness: 0.92 });
      const matShoes = new THREE.MeshStandardMaterial({ color: 0x47382d, roughness: 0.72 });
      const matEyes = new THREE.MeshStandardMaterial({ color: 0x30231f, roughness: 0.42 });
      const matEyeLight = new THREE.MeshBasicMaterial({ color: 0xfff8ed });
      const matBlush = new THREE.MeshBasicMaterial({ color: 0xd88e79, transparent: true, opacity: 0.28, depthWrite: false });
      const matMouth = new THREE.MeshBasicMaterial({ color: 0x9a5f51 });
      const smoothSphere = new THREE.SphereGeometry(1, 32, 24);
      const addEllipsoid = (parent, material, position, scale, castShadow = true) => {
        const mesh = new THREE.Mesh(smoothSphere, material);
        mesh.position.set(...position);
        mesh.scale.set(...scale);
        mesh.castShadow = castShadow;
        parent.add(mesh);
        return mesh;
      };

      this.character = new THREE.Group();
      this.character.position.copy(CHAR_ORIGIN);
      this.character.scale.set(1.28, 1.28, 1.28);
      this.character.rotation.set(0, -0.21, 0); // naturally facing viewer and room

      // Shoes
      [-6, 6].forEach(x => {
        addEllipsoid(this.character, matShoes, [x, 4, 2], [4.5, 3.4, 8.2]);
        addEllipsoid(this.character, matSeam, [x, 1.4, 2.2], [4.4, 1.05, 7.9]);
      });

      // Legs (Cream Linen Trousers)
      const legGeo = new THREE.CylinderGeometry(3.7, 4.5, 35, 24, 1);
      const legL = new THREE.Mesh(legGeo, matPants);
      legL.position.set(-6, 24, 0);
      legL.castShadow = true;
      this.character.add(legL);

      const legR = new THREE.Mesh(legGeo, matPants);
      legR.position.set(6, 24, 0);
      legR.castShadow = true;
      this.character.add(legR);

      // Hips
      addEllipsoid(this.character, matPants, [0, 43, 0], [9.3, 5.3, 6.5]);
      [-6, 6].forEach(x => addEllipsoid(this.character, matPants, [x, 8, 0], [3.7, 5, 4]));

      // Torso / Sweater (Warm Olive Knit)
      addEllipsoid(this.character, matSweater, [0, 60, 0], [11.8, 15.5, 8.7]);
      const placket = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 19, 10), matSeam);
      placket.position.set(0, 59, 9.15);
      this.character.add(placket);
      [68, 63, 58].forEach(y => addEllipsoid(this.character, matSeam, [0, y, 9.2], [0.48, 0.48, 0.22], false));

      const collar = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.8, 10, 28), matSeam);
      collar.position.set(0, 72.5, 0);
      collar.rotation.x = Math.PI / 2;
      this.character.add(collar);

      const neck = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 7, 16), matSkin);
      neck.position.set(0, 78, 0);
      this.character.add(neck);

      // Arms & Hands
      const armGeo = new THREE.CylinderGeometry(3.1, 2.5, 20, 24, 1);
      const armL = new THREE.Mesh(armGeo, matSweater);
      armL.position.set(-12.5, 60, 0);
      armL.rotation.set(0, 0, -0.14);
      armL.castShadow = true;
      this.character.add(armL);

      const handL = new THREE.Mesh(new THREE.SphereGeometry(2.8, 24, 20), matSkin);
      handL.position.set(-14.5, 47, 0);
      handL.castShadow = true;
      this.character.add(handL);

      const armR = new THREE.Mesh(armGeo, matSweater);
      armR.position.set(12.5, 60, 0);
      armR.rotation.set(0, 0, 0.14);
      armR.castShadow = true;
      this.character.add(armR);

      const handR = new THREE.Mesh(new THREE.SphereGeometry(2.8, 24, 20), matSkin);
      handR.position.set(14.5, 47, 0);
      handR.castShadow = true;
      this.character.add(handR);

      // Head Pivot Group
      this.characterHead = new THREE.Group();
      this.characterHead.position.set(0, 80, 0);

      // Head
      const head = new THREE.Mesh(new THREE.SphereGeometry(10.5, 40, 32), matSkin);
      head.position.set(0, 12, 0);
      head.scale.set(1, 1.05, 0.96);
      head.castShadow = true;
      this.characterHead.add(head);

      // Hair
      addEllipsoid(this.characterHead, matHair, [0, 17, -1.5], [11.4, 8.2, 10.7]);
      addEllipsoid(this.characterHead, matHair, [-3.7, 18.5, 6.1], [5.6, 3.1, 4.2]);
      addEllipsoid(this.characterHead, matHair, [-8.8, 9.5, 0], [2.1, 8.2, 3.1]);
      addEllipsoid(this.characterHead, matHair, [8.8, 9.5, 0], [2.1, 8.2, 3.1]);
      addEllipsoid(this.characterHead, matSkin, [-10.2, 10.5, 0], [1.4, 2.1, 1.3], false);
      addEllipsoid(this.characterHead, matSkin, [10.2, 10.5, 0], [1.4, 2.1, 1.3], false);

      // Expressive Eyes with specular highlight
      const eyeGeo = new THREE.SphereGeometry(0.82, 20, 16);
      const eyeL = new THREE.Mesh(eyeGeo, matEyes);
      eyeL.position.set(-3.7, 12, 10.05);
      this.characterHead.add(eyeL);
      this.characterEyes.push(eyeL);

      const eyeR = new THREE.Mesh(eyeGeo, matEyes);
      eyeR.position.set(3.7, 12, 10.05);
      this.characterHead.add(eyeR);
      this.characterEyes.push(eyeR);

      [-3.7, 3.7].forEach(x => addEllipsoid(this.characterHead, matEyeLight, [x + 0.22, 12.28, 10.72], [0.2, 0.2, 0.12], false));
      [-3.7, 3.7].forEach(x => {
        const brow = addEllipsoid(this.characterHead, matHair, [x, 14.2, 10.15], [1.5, 0.32, 0.3], false);
        brow.rotation.z = x < 0 ? 0.08 : -0.08;
      });
      addEllipsoid(this.characterHead, matSkin, [0, 9.5, 10.35], [0.85, 1.35, 0.95], false);
      addEllipsoid(this.characterHead, matMouth, [0, 6.3, 10.12], [1.05, 0.24, 0.18], false);

      // Cheeks (Rosy Blush)
      const blushGeo = new THREE.SphereGeometry(1.8, 16, 16);
      const blushL = new THREE.Mesh(blushGeo, matBlush);
      blushL.position.set(-6.5, 8.5, 9.5);
      blushL.scale.set(1, 0.55, 0.4);
      this.characterHead.add(blushL);

      const blushR = new THREE.Mesh(blushGeo, matBlush);
      blushR.position.set(6.5, 8.5, 9.5);
      blushR.scale.set(1, 0.55, 0.4);
      this.characterHead.add(blushR);

      this.character.add(this.characterHead);
      this.scene.add(this.character);
    }

    buildProps() {
      // 1. Reading Glasses (The Hero Object)
      this.glasses = new THREE.Group();
      const matFrame = new THREE.MeshStandardMaterial({ color: 0x2b2623, roughness: 0.45, metalness: 0.2 });
      const matBridge = new THREE.MeshStandardMaterial({ color: 0xb99a79, roughness: 0.3, metalness: 0.8 });

      const rimGeo = new THREE.TorusGeometry(3.8, 0.7, 16, 28);
      const rimL = new THREE.Mesh(rimGeo, matFrame);
      rimL.position.set(-5, 0, 0);
      this.glasses.add(rimL);

      const rimR = new THREE.Mesh(rimGeo, matFrame);
      rimR.position.set(5, 0, 0);
      this.glasses.add(rimR);

      const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 3.5, 12), matBridge);
      bridge.rotation.set(0, 0, Math.PI / 2);
      this.glasses.add(bridge);

      const templeGeo = new THREE.CylinderGeometry(0.5, 0.5, 11, 12);
      const templeL = new THREE.Mesh(templeGeo, matFrame);
      templeL.position.set(-8.8, 0, -5.5);
      templeL.rotation.set(Math.PI / 2, 0, 0);
      this.glasses.add(templeL);

      const templeR = new THREE.Mesh(templeGeo, matFrame);
      templeR.position.set(8.8, 0, -5.5);
      templeR.rotation.set(Math.PI / 2, 0, 0);
      this.glasses.add(templeR);

      this.glasses.scale.set(1.4, 1.4, 1.4);
      this.glasses.position.set(GLASSES_ORIGIN.x, GLASSES_ORIGIN.y, GLASSES_ORIGIN.z);
      this.glasses.rotation.set(0, 0, 0);
      this.scene.add(this.glasses);

      // 2. Terracotta Ceramic Mug & Medicine Box
      const mug = new THREE.Mesh(
        new THREE.CylinderGeometry(3.5, 3.5, 7, 24),
        new THREE.MeshStandardMaterial({ color: 0xc47a58, roughness: 0.7 })
      );
      mug.position.set(-125, 55.5, -45);
      mug.castShadow = true;
      this.scene.add(mug);

      const medBox = new THREE.Mesh(
        new THREE.BoxGeometry(10, 5, 7),
        new THREE.MeshStandardMaterial({ color: 0xf7f4ed, roughness: 0.6 })
      );
      medBox.position.set(-105, 54.5, -48);
      medBox.castShadow = true;
      this.scene.add(medBox);

      const medLabel = new THREE.Mesh(
        new THREE.BoxGeometry(4, 0.8, 6),
        new THREE.MeshStandardMaterial({ color: 0x6f7655 })
      );
      medLabel.position.set(-105, 57.2, -48);
      this.scene.add(medLabel);

      // 3. Ghost Glasses (Translucent Cyan Silhouette at Origin)
      this.ghostGlasses = new THREE.Group();
      const matGhost = new THREE.MeshBasicMaterial({ color: 0x8de4f0, transparent: true, opacity: 0.44 });

      const gRimL = new THREE.Mesh(rimGeo, matGhost);
      gRimL.position.set(-5, 0, 0);
      this.ghostGlasses.add(gRimL);

      const gRimR = new THREE.Mesh(rimGeo, matGhost);
      gRimR.position.set(5, 0, 0);
      this.ghostGlasses.add(gRimR);

      const gBridge = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 3.5, 12), matGhost);
      gBridge.rotation.set(0, 0, Math.PI / 2);
      this.ghostGlasses.add(gBridge);

      this.ghostGlasses.scale.set(1.4, 1.4, 1.4);
      this.ghostGlasses.position.set(GLASSES_ORIGIN.x, GLASSES_ORIGIN.y, GLASSES_ORIGIN.z);
      this.ghostGlasses.rotation.set(0, 0, 0);
      this.ghostGlasses.visible = false;
      this.scene.add(this.ghostGlasses);

      // 4. Highlight Rings
      const ringGeo = new THREE.TorusGeometry(18, 0.9, 16, 36);
      this.highlightGhost = new THREE.Mesh(
        ringGeo,
        new THREE.MeshBasicMaterial({ color: 0x78d8ea, transparent: true, opacity: 0.7 })
      );
      this.highlightGhost.rotation.set(Math.PI / 2, 0, 0);
      this.highlightGhost.position.set(GLASSES_ORIGIN.x, 51.5, GLASSES_ORIGIN.z);
      this.highlightGhost.visible = false;
      this.scene.add(this.highlightGhost);

      this.highlightMoved = new THREE.Mesh(
        ringGeo,
        new THREE.MeshBasicMaterial({ color: 0xd59a45, transparent: true, opacity: 0.85 })
      );
      this.highlightMoved.rotation.set(Math.PI / 2, 0, 0);
      this.highlightMoved.position.set(125, 92, -218);
      this.highlightMoved.visible = false;
      this.scene.add(this.highlightMoved);

      // 5. Parabolic Spatial Trail
      this.spatialTrail = new THREE.Group();
      const trailPoints = 8;
      const ptGeo = new THREE.SphereGeometry(2.2, 12, 12);
      const matPt = new THREE.MeshBasicMaterial({ color: 0xd59a45, transparent: true, opacity: 0.75 });

      for (let i = 0; i < trailPoints; i++) {
        const p = (i + 1) / (trailPoints + 1);
        const arcY = Math.sin(p * Math.PI) * 48;
        const pt = new THREE.Mesh(ptGeo, matPt);
        pt.position.set(
          GLASSES_ORIGIN.x + (GLASSES_DEST.x - GLASSES_ORIGIN.x) * p,
          GLASSES_ORIGIN.y + (GLASSES_DEST.y - GLASSES_ORIGIN.y) * p + arcY,
          GLASSES_ORIGIN.z + (GLASSES_DEST.z - GLASSES_ORIGIN.z) * p
        );
        this.spatialTrail.add(pt);
      }
      this.spatialTrail.visible = false;
      this.scene.add(this.spatialTrail);
    }

    setupUIListeners() {
      if (this.ui.btnStart) {
        this.ui.btnStart.addEventListener('click', () => {
          if (!this.isStoryActive) {
            this.startStory();
          } else {
            this.resetStory();
            setTimeout(() => this.startStory(), 250);
          }
        });
      }

      if (this.ui.btnReset) {
        this.ui.btnReset.addEventListener('click', () => this.resetStory());
      }
    }

    startStory() {
      this.isStoryActive = true;
      this.storyStartTime = performance.now();
      this.resetSceneForStory();
      const progress = document.querySelector('.hero-progress');
      if (progress) progress.classList.add('active');
      if (this.ui.btnLabel) this.ui.btnLabel.textContent = 'Story playing...';
      if (this.ui.btnStart) {
        this.ui.btnStart.style.pointerEvents = 'none';
        this.ui.btnStart.style.opacity = '0.75';
      }
      if (this.ui.captionWrap) this.ui.captionWrap.classList.add('visible');
      this.updateStoryUI(this.storyStartTime);
    }

    resetStory() {
      this.isStoryActive = false;
      this.charPos.copy(CHAR_ORIGIN);
      this.charRot.set(0, -0.1, 0);
      this.headRot.set(0, 0, 0);

      this.glasses.position.set(GLASSES_ORIGIN.x, GLASSES_ORIGIN.y, GLASSES_ORIGIN.z);
      this.ghostGlasses.visible = false;
      this.highlightGhost.visible = false;
      this.highlightMoved.visible = false;
      this.spatialTrail.visible = false;

      const isMobile = window.innerWidth < 640;
      if (isMobile) {
        this.targetCamPos.set(10, 185, 600);
        this.targetCamLook.set(10, 95, -50);
        this.targetFov = 35;
      } else {
        this.targetCamPos.copy(CAM_PRESETS.HOME.pos);
        this.targetCamLook.copy(CAM_PRESETS.HOME.target);
        this.targetFov = CAM_PRESETS.HOME.fov;
      }

      if (this.ui.receiptToast) this.ui.receiptToast.classList.remove('visible');
      if (this.ui.captionWrap) this.ui.captionWrap.classList.remove('visible');
      if (this.ui.statusDot) this.ui.statusDot.className = 'status-dot';
      if (this.ui.statusText) this.ui.statusText.textContent = 'A living room at peace';
      if (this.ui.captionText) this.ui.captionText.textContent = '';
      if (this.ui.captionSub) this.ui.captionSub.textContent = '';
      if (this.ui.btnLabel) this.ui.btnLabel.textContent = 'See how it works';
      if (this.ui.btnStart) {
        this.ui.btnStart.style.pointerEvents = 'auto';
        this.ui.btnStart.style.opacity = '1';
      }
      if (this.ui.btnReset) { this.ui.btnReset.style.display = 'none'; this.ui.btnReset.hidden = true; }
      const progress = document.querySelector('.hero-progress');
      if (progress) progress.classList.remove('active');
      if (this.ui.receiptToast) this.ui.receiptToast.setAttribute('aria-hidden', 'true');
      this.diffProgress = 1;
    }

    resetSceneForStory() {
      this.charPos.copy(CHAR_ORIGIN);
      this.glasses.position.set(GLASSES_ORIGIN.x, GLASSES_ORIGIN.y, GLASSES_ORIGIN.z);
      this.ghostGlasses.visible = false;
      this.highlightGhost.visible = false;
      this.highlightMoved.visible = false;
      this.spatialTrail.visible = false;
    }

    findGlasses() {
      this.resetSceneForStory();
      this.isStoryActive = false;
      this.charRot.set(0, -0.1, 0);
      this.headRot.set(0, 0, 0);
      this.glasses.position.set(GLASSES_DEST.x, GLASSES_DEST.y, GLASSES_DEST.z);
      this.highlightMoved.visible = true;
      this.targetCamPos.copy(CAM_PRESETS.REVEAL.pos);
      this.targetCamLook.copy(CAM_PRESETS.REVEAL.target);
      this.targetFov = CAM_PRESETS.REVEAL.fov;
      if (this.ui.statusText) this.ui.statusText.textContent = 'Last seen on the bookshelf · 4:40 pm';
      if (this.ui.captionWrap) this.ui.captionWrap.classList.add('visible');
      if (this.ui.captionText) this.ui.captionText.textContent = 'Your glasses are on the bookshelf.';
      if (this.ui.captionSub) this.ui.captionSub.textContent = 'Last seen at 4:40 pm · Confirmed';
      if (this.ui.receiptToast) {
        this.ui.receiptToast.classList.add('visible');
        this.ui.receiptToast.setAttribute('aria-hidden', 'false');
      }
    }

    scrubRealityDiff(progress) {
      this.diffProgress = Math.max(0, Math.min(1, progress));
      if (this.isStoryActive && performance.now() - this.storyStartTime < 16000) return;
      const p = this.easeInOutCubic(this.diffProgress);
      this.glasses.position.set(
        GLASSES_ORIGIN.x + (GLASSES_DEST.x - GLASSES_ORIGIN.x) * p,
        GLASSES_ORIGIN.y + (GLASSES_DEST.y - GLASSES_ORIGIN.y) * p + Math.sin(p * Math.PI) * 44,
        GLASSES_ORIGIN.z + (GLASSES_DEST.z - GLASSES_ORIGIN.z) * p
      );
      this.ghostGlasses.position.set(GLASSES_ORIGIN.x, GLASSES_ORIGIN.y, GLASSES_ORIGIN.z);
      this.ghostGlasses.visible = this.diffProgress > 0.68;
      this.highlightGhost.visible = this.diffProgress > 0.68;
      this.highlightMoved.visible = this.diffProgress > 0.88;
      this.spatialTrail.visible = this.diffProgress > 0.7;
    }

    easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    updateStoryUI(now) {
      if (!this.isStoryActive) return;
      const s = (now - this.storyStartTime) / 1000;

      if (s < 1.8) {
        if (this.ui.statusDot) this.ui.statusDot.className = 'status-dot';
        if (this.ui.statusText) this.ui.statusText.textContent = 'A quiet afternoon at home';
        if (this.ui.captionText) this.ui.captionText.textContent = 'A quiet afternoon.';
        if (this.ui.captionSub) this.ui.captionSub.textContent = 'The glasses are right where they belong.';
      } else if (s < 4.0) {
        if (this.ui.statusDot) this.ui.statusDot.className = 'status-dot active';
        if (this.ui.statusText) this.ui.statusText.textContent = 'Something has changed';
        if (this.ui.captionText) this.ui.captionText.textContent = 'While no one was looking…';
        if (this.ui.captionSub) this.ui.captionSub.textContent = 'The glasses have moved across the room.';
      } else if (s < 7.2) {
        if (this.ui.statusDot) this.ui.statusDot.className = 'status-dot active';
        if (this.ui.statusText) this.ui.statusText.textContent = 'Looking for the glasses';
        if (this.ui.captionText) this.ui.captionText.textContent = 'Where did they go?';
        if (this.ui.captionSub) this.ui.captionSub.textContent = 'The side table is empty. Where could they be?';
      } else if (s < 9.8) {
        if (this.ui.statusDot) this.ui.statusDot.className = 'status-dot revealed';
        if (this.ui.statusText) this.ui.statusText.textContent = 'SMRITI remembers';
        if (this.ui.captionText) this.ui.captionText.textContent = 'Wait. The room remembers.';
        if (this.ui.captionSub) this.ui.captionSub.textContent = 'They were here. Now they are on the bookshelf.';
        if (this.ui.receiptToast) {
          this.ui.receiptToast.classList.add('visible');
          this.ui.receiptToast.setAttribute('aria-hidden', 'false');
        }
      } else if (s < 13.0) {
        if (this.ui.statusDot) this.ui.statusDot.className = 'status-dot revealed';
        if (this.ui.statusText) this.ui.statusText.textContent = 'The glasses are on the bookshelf';
        if (this.ui.captionText) this.ui.captionText.textContent = 'There they are.';
        if (this.ui.captionSub) this.ui.captionSub.textContent = 'Side table → bookshelf · 4:40 pm';
      } else {
        if (this.ui.statusDot) this.ui.statusDot.className = 'status-dot revealed';
        if (this.ui.statusText) this.ui.statusText.textContent = 'SMRITI — Memory Restored';
        if (this.ui.captionText) this.ui.captionText.textContent = 'A little help, right on time.';
        if (this.ui.captionSub) this.ui.captionSub.textContent = 'SMRITI remembers where everyday things were.';
        if (this.ui.btnReset) { this.ui.btnReset.hidden = false; this.ui.btnReset.style.display = 'inline-flex'; }
        if (this.ui.btnLabel) this.ui.btnLabel.textContent = 'Play again';
        if (this.ui.btnStart) {
          this.ui.btnStart.style.pointerEvents = 'auto';
          this.ui.btnStart.style.opacity = '1';
        }
      }

      setTimeout(() => this.updateStoryUI(performance.now()), 250);
    }

    animate(now) {
      requestAnimationFrame(this.animate);

      const storyProgress = document.getElementById('storyProgress');
      if (storyProgress && this.isStoryActive) {
        storyProgress.style.width = `${Math.min(100, (now - this.storyStartTime) / 160)}%`;
      }

      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

      if (now - this.lastBlinkTime > 4200) {
        this.lastBlinkTime = now;
        this.characterEyes.forEach(eye => {
          eye.scale.y = 0.15;
          setTimeout(() => { if (eye) eye.scale.y = 1; }, 140);
        });
      }

      const isMobile = window.innerWidth < 640;

      if (!this.isStoryActive) {
        // ================= IDLE BEHAVIOR (14s Loop) =================
        const t = (now % 14000) / 1000;
        const breath = Math.sin(now * 0.0022) * 0.45;
        this.charPos.y = breath;

        if (t < 3.5) {
          this.headRot.y = 0.06 + Math.sin(now * 0.001) * 0.04;
          this.headRot.x = 0.02;
          this.headRot.z = 0;
          this.charRot.y = 0.26;
        } else if (t < 7.0) {
          // Glances toward side table glasses
          const f = this.easeInOutCubic(Math.min((t - 3.5) / 1.0, 1));
          this.headRot.y = -0.62 * f;
          this.headRot.x = 0.14 * f;
          this.headRot.z = -0.04 * f;
          this.charRot.y = 0.26 - 0.2 * f;
        } else if (t < 9.5) {
          // Returns to center
          const f = this.easeInOutCubic(Math.min((t - 7.0) / 1.0, 1));
          this.headRot.y = -0.62 * (1 - f) + 0.06 * f;
          this.headRot.x = 0.14 * (1 - f) + 0.02 * f;
          this.charRot.y = 0.06 + 0.2 * f;
        } else if (t < 13.0) {
          // Glances toward bookshelf
          const f = this.easeInOutCubic(Math.min((t - 9.5) / 1.0, 1));
          this.headRot.y = 0.52 * f;
          this.headRot.x = 0.07 * f;
          this.charRot.y = 0.26 + 0.15 * f;
        } else {
          // Returns to center
          const f = this.easeInOutCubic(Math.min((t - 13.0) / 1.0, 1));
          this.headRot.y = 0.52 * (1 - f);
          this.headRot.x = 0.07 * (1 - f);
          this.charRot.y = 0.41 - 0.15 * f;
        }

        if (isMobile) {
          this.targetCamPos.set(10, 185, 600);
          this.targetCamLook.set(10, 95, -50);
          this.targetFov = 35;
        } else {
          this.targetCamPos.copy(CAM_PRESETS.HOME.pos);
          this.targetCamLook.copy(CAM_PRESETS.HOME.target);
          this.targetFov = CAM_PRESETS.HOME.fov;
        }

      } else {
        // ================= CINEMATIC STORY SEQUENCE =================
        const elapsed = (now - this.storyStartTime) / 1000;

        // Phase 1: Camera Glides In & Notice Glasses (0 to 1.8s)
        if (elapsed < 1.8) {
          const p = this.easeInOutCubic(Math.min(elapsed / 1.4, 1));
          if (!isMobile) {
            this.targetCamPos.copy(CAM_PRESETS.CHARACTER.pos);
            this.targetCamLook.copy(CAM_PRESETS.CHARACTER.target);
          }
          this.headRot.y = -0.72 * p;
          this.headRot.x = 0.18 * p;
          this.charRot.y = 0.26 - 0.3 * p;
        }

        // Phase 2: Glasses Move to Bookshelf (1.8 to 4.0s)
        else if (elapsed < 4.0) {
          this.headRot.y = 0.35; // looks away
          this.headRot.x = -0.04;

          const transit = (elapsed - 2.0) / 1.5;
          if (transit >= 0 && transit <= 1) {
            const p = this.easeInOutCubic(transit);
            const arcY = Math.sin(p * Math.PI) * 50;
            this.glasses.position.set(
              GLASSES_ORIGIN.x + (GLASSES_DEST.x - GLASSES_ORIGIN.x) * p,
              GLASSES_ORIGIN.y + (GLASSES_DEST.y - GLASSES_ORIGIN.y) * p + arcY,
              GLASSES_ORIGIN.z + (GLASSES_DEST.z - GLASSES_ORIGIN.z) * p
            );
            this.glasses.rotation.y = 0.35 + p * Math.PI;
          }
        }

        // Phase 3: Character Returns, Confused Search (4.0 to 7.2s)
        else if (elapsed < 7.2) {
          this.glasses.position.set(GLASSES_DEST.x, GLASSES_DEST.y, GLASSES_DEST.z);
          if (!isMobile) {
            this.targetCamPos.copy(CAM_PRESETS.SEARCH.pos);
            this.targetCamLook.copy(CAM_PRESETS.SEARCH.target);
          }

          if (elapsed < 5.2) {
            const p = this.easeInOutCubic(Math.min((elapsed - 4.0) / 0.8, 1));
            this.headRot.y = -0.72 * p;
            this.headRot.x = 0.38 * p;
            this.headRot.z = -0.25 * p; // puzzled tilt
            this.charRot.y = -0.15 * p;
          } else if (elapsed < 6.2) {
            this.headRot.y = -0.17 + Math.sin(elapsed * 4) * 0.26;
            this.headRot.x = 0.31;
            this.headRot.z = -0.17;
          } else {
            this.headRot.y = 0.26;
            this.headRot.x = 0.09;
            this.headRot.z = 0.21;
          }
        }

        // Phase 4: PHANTOM Spatial Reveal (7.2 to 9.8s)
        else if (elapsed < 9.8) {
          if (!isMobile) {
            this.targetCamPos.copy(CAM_PRESETS.PHANTOM.pos);
            this.targetCamLook.copy(CAM_PRESETS.PHANTOM.target);
          }

          this.ghostGlasses.visible = true;
          this.highlightGhost.visible = true;
          this.highlightMoved.visible = true;
          this.spatialTrail.visible = true;

          const pulse = 1 + Math.sin(now * 0.006) * 0.08;
          this.highlightMoved.scale.set(pulse, pulse, pulse);
          this.highlightGhost.scale.set(pulse, pulse, pulse);

          this.headRot.y = -0.61;
          this.headRot.x = 0.28;
          this.headRot.z = 0;
        }

        // Phase 5: Spotting & Walking to Bookshelf (9.8 to 13.0s)
        else if (elapsed < 13.0) {
          if (!isMobile) {
            this.targetCamPos.copy(CAM_PRESETS.REVEAL.pos);
            this.targetCamLook.copy(CAM_PRESETS.REVEAL.target);
          }

          const p = this.easeInOutCubic(Math.min((elapsed - 9.8) / 1.3, 1));
          this.headRot.y = -0.61 * (1 - p) + 0.84 * p;
          this.headRot.x = 0.28 * (1 - p) + 0.14 * p;
          this.headRot.z = 0;
          this.charRot.y = -0.15 * (1 - p) + 0.61 * p;

          this.charPos.x = CHAR_ORIGIN.x + 24 * p;
          this.charPos.z = CHAR_ORIGIN.z - 14 * p;
          this.charPos.y = Math.sin(p * Math.PI * 4) * 1.8;
        }

        // Phase 6: Resolution & Happy Relief (13.0s+)
        else {
          if (!isMobile) {
            this.targetCamPos.copy(CAM_PRESETS.RESOLUTION.pos);
            this.targetCamLook.copy(CAM_PRESETS.RESOLUTION.target);
          } else {
            this.targetCamPos.set(10, 185, 600);
            this.targetCamLook.set(10, 95, -50);
            this.targetFov = 35;
          }

          const happyBob = Math.sin(now * 0.003) * 0.6;
          this.charPos.y = happyBob;
          this.headRot.y = 0.66 + Math.sin(now * 0.001) * 0.07;
          this.headRot.x = -0.07;
        }
      }

      if (this.character) {
        this.character.position.copy(this.charPos);
        this.character.rotation.copy(this.charRot);
      }
      if (this.characterHead) {
        this.characterHead.rotation.copy(this.headRot);
      }

      const camLerp = 0.035;
      this.camera.position.x += (this.targetCamPos.x + this.mouse.x * 7 - this.camera.position.x) * camLerp;
      this.camera.position.y += (this.targetCamPos.y - this.mouse.y * 4 - this.camera.position.y) * camLerp;
      this.camera.position.z += (this.targetCamPos.z - this.camera.position.z) * camLerp;
      if (Math.abs(this.targetFov - this.camera.fov) > 0.01) {
        this.camera.fov += (this.targetFov - this.camera.fov) * camLerp;
        this.camera.updateProjectionMatrix();
      }

      this.camTarget.x += (this.targetCamLook.x - this.camTarget.x) * camLerp;
      this.camTarget.y += (this.targetCamLook.y - this.camTarget.y) * camLerp;
      this.camTarget.z += (this.targetCamLook.z - this.camTarget.z) * camLerp;

      this.camera.lookAt(this.camTarget);

      this.renderer.render(this.scene, this.camera);
    }

    onResize() {
      if (!this.container || !this.renderer || !this.camera) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);

      const isMobile = window.innerWidth < 640;
      if (isMobile) {
        this.targetCamPos.set(10, 185, 600);
        this.targetCamLook.set(10, 95, -50);
        this.targetFov = 35;
      } else {
        this.targetCamPos.copy(CAM_PRESETS.HOME.pos);
        this.targetCamLook.copy(CAM_PRESETS.HOME.target);
        this.targetFov = CAM_PRESETS.HOME.fov;
      }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.smritiApp = new SmritiExperience('spatialViewport');
  });

  window.triggerSmritiStory = () => {
    if (window.smritiApp) window.smritiApp.startStory();
  };
})();
