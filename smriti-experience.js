// =============================================================================
// SMRITI — Visual Overhaul v3: Premium 3D Animated World & Interaction Polish
// Art Direction: High-end animated film / Pixar & Ghibli warmth
// Organic cinematic environment + natural character life + SMRITI smartphone interface
// Physical glasses placement & settling physics + PHANTOM spatial memory scan
// =============================================================================

(function() {
  'use strict';

  // 70 / 20 / 10 Master Palette Constants
  const PALETTE = {
    // 70% Architectural Warmth
    bg: 0xF7E7CF,             // Warm Peach/Cream Canvas (#F7E7CF)
    wallPlaster: 0xF5E6D3,     // Soft Plaster Wall
    floorWood: 0x966336,       // Rich Caramel Oak Floor
    floorPlankDark: 0x7E4F25,  // Dark Parquet Inlay
    rugBase: 0xECE1CE,         // Organic Sand Pebble Rug
    rugBorder: 0xD8C6AC,       // Soft Woven Rug Border
    
    // 20% Character & Furniture Anchors
    charSweater: 0x223212,     // Deep Rich Olive Knit (#59663B)
    charCollar: 0x18240D,      // Deep Olive Ribbed Trim
    charAccent: 0xB54E29,      // Warm Terracotta Neckerchief / Accent (#C96B45)
    charPants: 0xF5E9D3,       // Warm Cream Linen Trousers (#F6EBD7)
    charShoes: 0x180D07,       // Dark Chestnut Loafers (#3B2A22)
    charHair: 0x140B06,        // Rich Dark Espresso Sculpted Hair (#302119)
    charSkin: 0xF7CBB6,        // Warm Peach Skin with Subsurface Glow
    charBlush: 0xE06E50,       // Soft Coral Cheeks (#E4866D)
    charEyes: 0x16100E,        // Glossy Dark Pupils
    
    furnitureWood: 0x915B2D,   // Warm Caramel Oak
    furnitureDark: 0x5C381E,   // Roasted Walnut
    armchairFabric: 0xE8E0D0,  // Soft Bouclé Off-White
    blanketTerracotta: 0xBD4D28,// Warm Terracotta Throw (#C96B45)
    cushionMustard: 0xD9941E,  // Warm Velvet Mustard (#D6A83E)
    lampBrass: 0xC8A050,       // Brushed Warm Brass
    lampShade: 0xFDF6E8,       // Fluted Parchment Shade
    plantGreen: 0x324D22,      // Rich Monstera Foliage
    plantDeep: 0x1B2C16,       // Deep Olive Shadow Foliage
    plantPot: 0xB55730,        // Terracotta Planter
    
    // 10% PHANTOM Story Accents
    glassesFrame: 0x22160F,    // Tortoise Espresso Frame
    glassesBridge: 0xC29E52,   // Warm Gold Bridge
    phantomTeal: 0x4E9C91,     // SMRITI Memory Teal (#4E9C91)
    phantomTealGlow: 0x68BDB2, // Luminous Recall Shimmer
    movementAmber: 0xD9A83E,   // Spatial Trajectory Amber (#D9A83E)
    confirmGreen: 0x687A42     // Verified Memory Green (#687A42)
  };

  // World Anchors & Physical Surfaces
  // Table top surface is at y = 51.6; glasses rest on top at y = 53.8
  const GLASSES_ORIGIN = { x: -74, y: 53.8, z: 8 };
  // Bookshelf shelf 2 surface is at y = 83.5; glasses rest on top at y = 85.8
  const GLASSES_DEST = { x: 104, y: 85.8, z: -85 };
  const CHAR_ORIGIN = { x: 4, y: 0, z: 10 };

  // Cinematic 3/4 Perspective Camera States (Slow, intentional, film-grade choreography)
  const CAM_PRESETS = {
    HOME: { pos: { x: 50, y: 110, z: 275 }, target: { x: 4, y: 54, z: -10 }, fov: 31 },
    NOTICE: { pos: { x: 30, y: 94, z: 205 }, target: { x: -25, y: 52, z: 8 }, fov: 28 },
    TRANSIT: { pos: { x: 42, y: 102, z: 245 }, target: { x: 10, y: 58, z: -20 }, fov: 30 },
    SEARCH: { pos: { x: 22, y: 102, z: 220 }, target: { x: -35, y: 52, z: 5 }, fov: 29 },
    PHONE: { pos: { x: 22, y: 88, z: 180 }, target: { x: 2, y: 56, z: 10 }, fov: 27 },
    PHANTOM: { pos: { x: 62, y: 122, z: 285 }, target: { x: 14, y: 56, z: -25 }, fov: 32 },
    REVEAL: { pos: { x: 52, y: 106, z: 240 }, target: { x: 42, y: 64, z: -40 }, fov: 30 },
    DISCOVER: { pos: { x: 44, y: 98, z: 215 }, target: { x: 48, y: 62, z: -42 }, fov: 28 },
    RESOLVE: { pos: { x: 50, y: 110, z: 275 }, target: { x: 4, y: 54, z: -10 }, fov: 31 }
  };

  class SmritiExperience {
    constructor(containerId) {
      this.container = document.getElementById(containerId) || document.getElementById('spatialViewport') || document.getElementById('splineCanvas');
      if (!this.container) return;

      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.camTarget = new THREE.Vector3().copy(CAM_PRESETS.HOME.target);
      this.targetCamPos = new THREE.Vector3().copy(CAM_PRESETS.HOME.pos);
      this.targetCamLook = new THREE.Vector3().copy(CAM_PRESETS.HOME.target);
      this.targetFov = CAM_PRESETS.HOME.fov;

      // 3D Subject Handles (Hero Character: Dora the Explorer GLB)
      this.character = null;
      this.characterHead = null;
      this.doraEyes = null;
      this.doraLoaded = false;
      this.doraModel = null;
      this.doraBodyMesh = null;
      this.baseBodyPositions = null;
      this.rightHandWorldPos = new THREE.Vector3();
      this.leftHandWorldPos = new THREE.Vector3();

      // Smartphone Prop Handles
      this.phone = null;
      this.phoneCanvas = null;
      this.phoneCtx = null;
      this.phoneTexture = null;
      this.phoneScreenLight = null;

      // Props & Physics Handles
      this.glasses = null;
      this.ghostGlasses = null;
      this.tableContactShadow = null;
      this.shelfContactShadow = null;
      this.glassesPickedUp = false;

      // PHANTOM Spatial Scan Handles
      this.spatialScanPlane = null;
      this.highlightGhost = null;
      this.highlightMoved = null;
      this.spatialTrail = null;
      this.roomLights = {};

      // Dynamic Character Transforms
      this.charPos = new THREE.Vector3().copy(CHAR_ORIGIN);
      this.charRot = new THREE.Euler(0, 0.22, 0);
      this.headRot = new THREE.Euler(0, 0, 0);

      // Procedural Life & Natural Blinking Timer
      this.lastBlinkTime = 0;
      this.nextBlinkInterval = 3200;
      this.isBlinking = false;
      this.blinkDuration = 120;

      // Arm FK Pose State
      this.currentArmPose = {
        lShoulderRoll: -1.40,
        lShoulderPitch: -0.15,
        lShoulderYaw: 0.05,
        lElbowBend: 0.30,
        lWristFlex: 0.18,
        rShoulderRoll: -1.02,
        rShoulderPitch: -0.38,
        rShoulderYaw: -0.15,
        rElbowBend: 0.92,
        rWristFlex: 0.32
      };

      // Story Timeline Tracking
      this.isStoryActive = false;
      this.storyStartTime = 0;
      this.currentStoryPhase = 'IDLE';

      // UI Handles (Compatible with both index.html and phantom- layouts)
      this.ui = {
        overline: document.getElementById('storyStatusText') || document.getElementById('heroOverline'),
        narration: document.getElementById('heroCaptionWrap') || document.getElementById('heroNarration'),
        narrTitle: document.getElementById('heroCaptionText') || document.getElementById('narrationTitle'),
        narrDetail: document.getElementById('heroCaptionSub') || document.getElementById('narrationDetail'),
        note: document.getElementById('memoryReceiptToast') || document.getElementById('heroMemoryNote'),
        cta: document.getElementById('btnStartExperience') || document.getElementById('hero-cta'),
        progress: document.getElementById('heroProgress'),
        progressFill: document.getElementById('storyProgress') || document.getElementById('heroProgressFill'),
        replay: document.getElementById('btnResetExperience') || document.getElementById('heroReplay')
      };

      this.init();
    }

    init() {
      // 1. Scene with Warm Peach Atmosphere
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(PALETTE.bg);
      this.scene.fog = new THREE.FogExp2(PALETTE.bg, 0.0006);

      const isMobile = window.innerWidth < 640;
      const initialFov = isMobile ? 38 : CAM_PRESETS.HOME.fov;
      const aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera = new THREE.PerspectiveCamera(initialFov, aspect, 10, 3000);

      if (isMobile) {
        this.camera.position.set(10, 115, 340);
        this.camTarget.set(4, 58, -15);
        this.camera.fov = 36;
      } else {
        this.camera.position.copy(CAM_PRESETS.HOME.pos);
        this.camTarget.copy(CAM_PRESETS.HOME.target);
      }
      this.camera.lookAt(this.camTarget);

      // 2. High-Fidelity Renderer with Controlled Tone Mapping
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.02;

      this.container.appendChild(this.renderer.domElement);

      // 3. Assemble Organic Cinematic World
      this.setupCinematicLighting();
      this.buildOrganicEnvironment();
      this.buildStylizedFurniture();
      this.buildSmartphone();
      this.loadDoraCharacter();
      this.buildHeroProps();

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

    // =========================================================================
    // 1. CINEMATIC LIGHTING (Warm sunlight, soft fill, subtle rim, cool PHANTOM layer)
    // =========================================================================
    setupCinematicLighting() {
      const ambient = new THREE.AmbientLight(0xFFE2CB, 0.38);
      this.scene.add(ambient);
      this.roomLights.ambient = ambient;

      // Key Warm Sunlight
      const sun = new THREE.DirectionalLight(0xFFF0DE, 1.25);
      sun.position.set(110, 240, 160);
      sun.castShadow = true;
      sun.shadow.mapSize.width = 2048;
      sun.shadow.mapSize.height = 2048;
      sun.shadow.camera.near = 20;
      sun.shadow.camera.far = 700;
      const d = 160;
      sun.shadow.camera.left = -d;
      sun.shadow.camera.right = d;
      sun.shadow.camera.top = d;
      sun.shadow.camera.bottom = -d;
      sun.shadow.bias = -0.0004;
      sun.shadow.radius = 2.4;
      this.scene.add(sun);
      this.roomLights.sun = sun;

      // Soft Warm Window Bounce Fill
      const windowFill = new THREE.DirectionalLight(0xF4DCB8, 0.45);
      windowFill.position.set(-150, 130, 80);
      this.scene.add(windowFill);
      this.roomLights.fill = windowFill;

      // Character Rim Light (Backlight separating character from room)
      const rimLight = new THREE.DirectionalLight(0xFFE8D6, 0.55);
      rimLight.position.set(-30, 140, -180);
      this.scene.add(rimLight);
      this.roomLights.rim = rimLight;

      // PHANTOM Cool Teal Spatial Memory Light (starts off, gently blooms during scan)
      const phantomLight = new THREE.PointLight(PALETTE.phantomTealGlow, 0, 360);
      phantomLight.position.set(14, 110, -25);
      this.scene.add(phantomLight);
      this.roomLights.phantom = phantomLight;
    }

    // =========================================================================
    // 2. ORGANIC ENVIRONMENT (Curved walls, warm oak parquet floor, soft pebble rug)
    // =========================================================================
    buildOrganicEnvironment() {
      const matFloor = new THREE.MeshStandardMaterial({
        color: PALETTE.floorWood,
        roughness: 0.38,
        metalness: 0.08
      });

      // Warm Rounded Floor Disc
      const floor = new THREE.Mesh(new THREE.CylinderGeometry(185, 185, 4, 64), matFloor);
      floor.position.set(4, -2, -18);
      floor.receiveShadow = true;
      this.scene.add(floor);

      // Fine Inlaid Oak Parquet Lines
      const lineMat = new THREE.MeshBasicMaterial({ color: PALETTE.floorPlankDark, opacity: 0.35, transparent: true });
      for (let i = -140; i <= 140; i += 32) {
        const plank = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 260), lineMat);
        plank.rotation.x = -Math.PI * 0.5;
        plank.position.set(i + 4, 0.04, -18);
        this.scene.add(plank);
      }

      // Sculpted Soft Curved Background Wall
      const wallMat = new THREE.MeshStandardMaterial({
        color: PALETTE.wallPlaster,
        roughness: 0.88,
        metalness: 0.02,
        side: THREE.BackSide
      });
      const backWall = new THREE.Mesh(
        new THREE.CylinderGeometry(230, 230, 240, 48, 1, true, -Math.PI * 0.35, Math.PI * 0.95),
        wallMat
      );
      backWall.position.set(4, 118, -35);
      backWall.receiveShadow = true;
      this.scene.add(backWall);

      // Soft Asymmetrical Pebble Rug under hero area
      const rugShape = new THREE.Shape();
      rugShape.moveTo(-60, -38);
      rugShape.bezierCurveTo(-90, -18, -98, 38, -55, 62);
      rugShape.bezierCurveTo(-15, 82, 45, 78, 85, 48);
      rugShape.bezierCurveTo(115, 18, 105, -32, 55, -55);
      rugShape.bezierCurveTo(8, -68, -35, -52, -60, -38);

      const rugGeo = new THREE.ShapeGeometry(rugShape, 32);
      const rugMat = new THREE.MeshStandardMaterial({
        color: PALETTE.rugBase,
        roughness: 0.92,
        metalness: 0.02
      });
      const rug = new THREE.Mesh(rugGeo, rugMat);
      rug.rotation.x = -Math.PI * 0.5;
      rug.position.set(0, 0.12, -8);
      rug.receiveShadow = true;
      this.scene.add(rug);
    }

    // =========================================================================
    // 3. STYLIZED FURNITURE (Round Bouclé Armchair, Pedestal Side Table, Bookshelf)
    // =========================================================================
    buildStylizedFurniture() {
      // 1. SCULPTED ROUNDED BOUCLÉ ARMCHAIR
      const chairGroup = new THREE.Group();
      chairGroup.position.set(-52, 0, -35);
      chairGroup.rotation.y = 0.35;

      const matBoucle = new THREE.MeshStandardMaterial({ color: PALETTE.armchairFabric, roughness: 0.8 });
      const matWoodLeg = new THREE.MeshStandardMaterial({ color: PALETTE.furnitureDark, roughness: 0.5 });

      const seat = new THREE.Mesh(new THREE.CylinderGeometry(28, 30, 15, 32), matBoucle);
      seat.position.set(0, 15, 0);
      seat.scale.set(1.04, 1, 1);
      seat.castShadow = true;
      seat.receiveShadow = true;
      chairGroup.add(seat);

      const backrest = new THREE.Mesh(new THREE.CylinderGeometry(32, 32, 36, 28, 1, true, 0, Math.PI * 1.15), matBoucle);
      backrest.position.set(0, 31, -4);
      backrest.rotation.y = Math.PI * 0.92;
      backrest.scale.set(1, 1, 0.92);
      backrest.castShadow = true;
      chairGroup.add(backrest);

      const backCap = new THREE.Mesh(new THREE.TorusGeometry(32, 3.8, 16, 28, Math.PI * 1.15), matBoucle);
      backCap.position.set(0, 49, -4);
      backCap.rotation.set(Math.PI * 0.5, 0, Math.PI * 0.92);
      chairGroup.add(backCap);

      const legGeo = new THREE.CylinderGeometry(1.6, 1.1, 16, 16);
      [
        { x: -18, z: -15, rx: -0.14, rz: 0.14 },
        { x: 18, z: -15, rx: -0.14, rz: -0.14 },
        { x: -16, z: 15, rx: 0.14, rz: 0.14 },
        { x: 16, z: 15, rx: 0.14, rz: -0.14 }
      ].forEach(p => {
        const leg = new THREE.Mesh(legGeo, matWoodLeg);
        leg.position.set(p.x, 8, p.z);
        leg.rotation.set(p.rx, 0, p.rz);
        leg.castShadow = true;
        chairGroup.add(leg);
      });

      const blanket = new THREE.Mesh(new THREE.BoxGeometry(20, 32, 16), new THREE.MeshStandardMaterial({ color: PALETTE.blanketTerracotta, roughness: 0.82 }));
      blanket.position.set(15, 30, 2);
      blanket.rotation.set(0.14, 0.22, -0.18);
      blanket.castShadow = true;
      chairGroup.add(blanket);

      const cushion = new THREE.Mesh(new THREE.SphereGeometry(10, 24, 16), new THREE.MeshStandardMaterial({ color: PALETTE.cushionMustard, roughness: 0.68 }));
      cushion.scale.set(1, 0.65, 0.95);
      cushion.position.set(-6, 24, -9);
      cushion.rotation.set(-0.35, 0.15, 0.1);
      cushion.castShadow = true;
      chairGroup.add(cushion);

      this.scene.add(chairGroup);

      // 2. ORGANIC ROUND PEDESTAL SIDE TABLE (Top surface at y = 51.6)
      const tableGroup = new THREE.Group();
      tableGroup.position.set(-74, 0, 8);

      const matTable = new THREE.MeshStandardMaterial({ color: PALETTE.furnitureWood, roughness: 0.48 });
      const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(22, 22, 3.2, 32), matTable);
      tableTop.position.set(0, 50, 0);
      tableTop.castShadow = true;
      tableTop.receiveShadow = true;
      tableGroup.add(tableTop);

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(4, 5.5, 46, 24), matTable);
      stem.position.set(0, 25, 0);
      stem.castShadow = true;
      tableGroup.add(stem);

      const basePlate = new THREE.Mesh(new THREE.CylinderGeometry(16, 18, 3.8, 32), matTable);
      basePlate.position.set(0, 1.9, 0);
      basePlate.castShadow = true;
      tableGroup.add(basePlate);

      this.scene.add(tableGroup);

      // 3. ARCHED MODERN BOOKSHELF (Shelf 2 top surface at y = 83.5)
      const shelfGroup = new THREE.Group();
      shelfGroup.position.set(104, 0, -85);

      const matShelfWood = new THREE.MeshStandardMaterial({ color: PALETTE.furnitureWood, roughness: 0.52 });
      const uprightGeo = new THREE.BoxGeometry(3.5, 145, 30);
      const uprightL = new THREE.Mesh(uprightGeo, matShelfWood);
      uprightL.position.set(-30, 72.5, 0);
      uprightL.castShadow = true;
      shelfGroup.add(uprightL);

      const uprightR = new THREE.Mesh(uprightGeo, matShelfWood);
      uprightR.position.set(30, 72.5, 0);
      uprightR.castShadow = true;
      shelfGroup.add(uprightR);

      const shelfCrown = new THREE.Mesh(new THREE.CylinderGeometry(31.5, 31.5, 30, 24, 1, false, 0, Math.PI), matShelfWood);
      shelfCrown.position.set(0, 145, 0);
      shelfCrown.rotation.z = Math.PI * 0.5;
      shelfCrown.rotation.y = Math.PI * 0.5;
      shelfCrown.castShadow = true;
      shelfGroup.add(shelfCrown);

      [40, 82, 122].forEach((yPos) => {
        const shelfSlab = new THREE.Mesh(new THREE.BoxGeometry(58, 3, 28), matShelfWood);
        shelfSlab.position.set(0, yPos, 0);
        shelfSlab.receiveShadow = true;
        shelfGroup.add(shelfSlab);
      });

      // Books on Shelf 2
      const bookColors = [PALETTE.blanketTerracotta, PALETTE.phantomTeal, PALETTE.cushionMustard, PALETTE.charSweater, 0x8C567A];
      [
        { x: -22, h: 25, w: 5.5, d: 19, rotZ: 0, c: bookColors[0] },
        { x: -15, h: 21, w: 6.5, d: 20, rotZ: 0, c: bookColors[1] },
        { x: -7,  h: 23, w: 5,   d: 18, rotZ: 0.17, c: bookColors[2] },
        { x: 20,  h: 24, w: 5.5, d: 19, rotZ: 0, c: bookColors[3] },
        { x: 13,  h: 20, w: 6.5, d: 17, rotZ: -0.12, c: bookColors[4] }
      ].forEach((b) => {
        const bMesh = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), new THREE.MeshStandardMaterial({ color: b.c, roughness: 0.65 }));
        bMesh.position.set(b.x, 82 + b.h / 2, 0);
        bMesh.rotation.z = b.rotZ;
        bMesh.castShadow = true;
        shelfGroup.add(bMesh);
      });

      const vase = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 6.5, 17, 20), new THREE.MeshStandardMaterial({ color: PALETTE.rugBase, roughness: 0.42 }));
      vase.position.set(-13, 132, 0);
      vase.castShadow = true;
      shelfGroup.add(vase);

      this.scene.add(shelfGroup);

      // Potted Plant on floor
      const plantGroup = new THREE.Group();
      plantGroup.position.set(38, 0, -25);
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(8.5, 6.5, 14, 24), new THREE.MeshStandardMaterial({ color: PALETTE.plantPot, roughness: 0.7 }));
      pot.position.y = 7;
      pot.castShadow = true;
      plantGroup.add(pot);

      const leafMat = new THREE.MeshStandardMaterial({ color: PALETTE.plantGreen, roughness: 0.5, side: THREE.DoubleSide });
      for (let l = 0; l < 5; l++) {
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(7, 16, 8), leafMat);
        leaf.scale.set(0.7, 1.8, 0.15);
        leaf.position.set(Math.cos(l * 1.25) * 4.5, 16 + l * 2.2, Math.sin(l * 1.25) * 4.5);
        leaf.rotation.set(0.35 + l * 0.1, l * 1.25, 0.4);
        leaf.castShadow = true;
        plantGroup.add(leaf);
      }
      this.scene.add(plantGroup);
    }

    // =========================================================================
    // 4. SMARTPHONE PROP (Held in right hand, dynamic OLED canvas screen UI)
    // =========================================================================
    buildSmartphone() {
      this.phone = new THREE.Group();

      // Slim modern titanium chassis
      const phoneChassis = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 7.4, 0.48),
        new THREE.MeshStandardMaterial({ color: 0x1A1918, roughness: 0.28, metalness: 0.82 })
      );
      phoneChassis.castShadow = true;
      this.phone.add(phoneChassis);

      // Dynamic 256x512 CanvasTexture for SMRITI Screen UI
      this.phoneCanvas = document.createElement('canvas');
      this.phoneCanvas.width = 256;
      this.phoneCanvas.height = 512;
      this.phoneCtx = this.phoneCanvas.getContext('2d');
      this.phoneTexture = new THREE.CanvasTexture(this.phoneCanvas);
      this.phoneTexture.encoding = THREE.sRGBEncoding;

      const screenMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(3.3, 7.0),
        new THREE.MeshBasicMaterial({ map: this.phoneTexture })
      );
      screenMesh.position.z = 0.25;
      this.phone.add(screenMesh);

      // Subtle screen illumination glow casting light on Dora's face
      this.phoneScreenLight = new THREE.PointLight(0x5CE1D2, 0, 22);
      this.phoneScreenLight.position.set(0, 0, 1.2);
      this.phone.add(this.phoneScreenLight);

      this.scene.add(this.phone);
      this.drawPhoneScreen('IDLE', 'Anchored');
    }

    drawPhoneScreen(state, subtext) {
      if (!this.phoneCtx) return;
      const ctx = this.phoneCtx;
      const w = 256, h = 512;

      // Dark luxury OLED background
      ctx.fillStyle = '#0D0F14';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = '#222730';
      ctx.lineWidth = 4;
      ctx.strokeRect(6, 6, w - 12, h - 12);

      // Status Bar
      ctx.fillStyle = '#868B96';
      ctx.font = '600 13px -apple-system, sans-serif';
      ctx.fillText('2:10 PM', 24, 28);
      ctx.fillText('99%', 204, 28);

      // SMRITI Header
      ctx.fillStyle = '#D76B45';
      ctx.beginPath();
      ctx.arc(28, 62, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 19px Georgia, serif';
      ctx.fillText('SMRITI', 40, 68);

      ctx.fillStyle = '#6E7380';
      ctx.font = '600 9px -apple-system, sans-serif';
      ctx.fillText('SPATIAL MEMORY', 24, 90);

      // Content Card
      ctx.fillStyle = '#171B22';
      ctx.beginPath();
      ctx.roundRect(16, 108, w - 32, 284, 12);
      ctx.fill();
      ctx.strokeStyle = '#282F3C';
      ctx.lineWidth = 1;
      ctx.stroke();

      if (state === 'IDLE' || state === 'NOTICE') {
        ctx.fillStyle = 'rgba(104, 122, 66, 0.28)';
        ctx.beginPath();
        ctx.roundRect(30, 126, 86, 22, 6);
        ctx.fill();
        ctx.fillStyle = '#9ED86E';
        ctx.font = '700 10px sans-serif';
        ctx.fillText('ACTIVE', 48, 141);

        ctx.fillStyle = '#8E929B';
        ctx.font = '600 11px sans-serif';
        ctx.fillText('LAST SEEN OBJECT', 30, 180);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 20px Georgia, serif';
        ctx.fillText('Reading glasses', 30, 210);

        ctx.fillStyle = '#D76B45';
        ctx.font = '600 13px sans-serif';
        ctx.fillText('Side table', 30, 238);

        ctx.fillStyle = '#8E929B';
        ctx.font = '12px sans-serif';
        ctx.fillText('Anchored · 2:10 PM', 30, 264);
      } else if (state === 'SEARCH') {
        ctx.fillStyle = 'rgba(215, 107, 69, 0.28)';
        ctx.beginPath();
        ctx.roundRect(30, 126, 115, 22, 6);
        ctx.fill();
        ctx.fillStyle = '#D76B45';
        ctx.font = '700 10px sans-serif';
        ctx.fillText('DISPLACED', 45, 141);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 19px Georgia, serif';
        ctx.fillText('Reading glasses', 30, 182);

        ctx.fillStyle = '#E8A58D';
        ctx.font = '600 13px sans-serif';
        ctx.fillText('Missing from table', 30, 212);

        ctx.fillStyle = '#8E929B';
        ctx.font = '12px sans-serif';
        ctx.fillText('Checking room memory...', 30, 252);
      } else if (state === 'SCAN') {
        ctx.fillStyle = 'rgba(78, 156, 145, 0.3)';
        ctx.beginPath();
        ctx.roundRect(30, 126, 125, 22, 6);
        ctx.fill();
        ctx.fillStyle = '#5CE1D2';
        ctx.font = '700 10px sans-serif';
        ctx.fillText('SCANNING 84%', 40, 141);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 18px Georgia, serif';
        ctx.fillText('PHANTOM Recall', 30, 182);

        ctx.fillStyle = '#5CE1D2';
        ctx.font = '600 13px sans-serif';
        ctx.fillText('Comparing 3D diffs...', 30, 212);

        ctx.fillStyle = '#262C36';
        ctx.fillRect(30, 248, w - 60, 6);
        ctx.fillStyle = '#5CE1D2';
        ctx.fillRect(30, 248, (w - 60) * 0.84, 6);
      } else if (state === 'FOUND' || state === 'RESOLVE') {
        ctx.fillStyle = 'rgba(104, 122, 66, 0.35)';
        ctx.beginPath();
        ctx.roundRect(30, 126, 100, 22, 6);
        ctx.fill();
        ctx.fillStyle = '#9ED86E';
        ctx.font = '700 10px sans-serif';
        ctx.fillText('FOUND', 48, 141);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 19px Georgia, serif';
        ctx.fillText('Bookshelf Shelf 2', 30, 182);

        ctx.fillStyle = '#D76B45';
        ctx.font = '600 13px sans-serif';
        ctx.fillText('+240 cm displacement', 30, 212);

        ctx.fillStyle = '#5CE1D2';
        ctx.font = '12px sans-serif';
        ctx.fillText('Confidence 99.4%', 30, 250);
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect((w - 70) / 2, h - 20, 70, 4, 2);
      ctx.fill();

      if (this.phoneTexture) {
        this.phoneTexture.needsUpdate = true;
      }
    }

    // =========================================================================
    // 5. GLB HERO CHARACTER (Dora with Cleaned Nose UVs & FK Arm Rigging)
    // =========================================================================
    loadDoraCharacter() {
      this.character = new THREE.Group();
      this.character.position.copy(CHAR_ORIGIN);
      this.character.rotation.copy(this.charRot);
      this.scene.add(this.character);

      const loader = new THREE.GLTFLoader();
      const glbPath = 'dora_dora_the_explorer.glb';

      loader.load(
        glbPath,
        (gltf) => {
          const model = gltf.scene;
          this.doraModel = model;

          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                child.material.roughness = 0.52;
                child.material.metalness = 0.04;
                if (child.material.map) {
                  child.material.map.encoding = THREE.sRGBEncoding;
                }
                child.material.needsUpdate = true;
              }
            }
          });

          // 1. FIX THE NOSE BLACK SPOT ARTIFACT:
          // In Object_4 (Head), vertices 1034-1075 had UV coordinates pointing to black texture border.
          // Remap them directly to the smooth peach facial skin tone (0.3086, 0.6934) and nudge position.
          const objHead = model.getObjectByName('Object_4');
          if (objHead && objHead.geometry) {
            const headGeo = objHead.geometry;
            const uvAttr = headGeo.attributes.uv;
            const posAttr = headGeo.attributes.position;
            if (uvAttr) {
              for (let i = 0; i < uvAttr.count; i++) {
                const u = uvAttr.getX(i);
                const v = uvAttr.getY(i);
                if (u > 0.85 && v > 0.60) {
                  uvAttr.setXY(i, 0.3086, 0.6934);
                  if (posAttr) {
                    posAttr.setY(i, posAttr.getY(i) + 0.012);
                  }
                }
              }
              uvAttr.needsUpdate = true;
              if (posAttr) {
                posAttr.needsUpdate = true;
                headGeo.computeVertexNormals();
              }
            }
          }

          // 2. SETUP FORWARD KINEMATICS ARM ENGINE:
          const bodyMesh = model.getObjectByName('Object_2');
          if (bodyMesh && bodyMesh.geometry) {
            this.setupDoraBodyRig(bodyMesh);
          }

          // 3. SCALE & GROUND DORA:
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          // Scale Dora to ~96 units height (~30% of visible hero frame)
          const targetHeight = 96;
          const scale = targetHeight / (size.y || 3.81);
          model.scale.set(scale, scale, scale);
          model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);

          // 4. ARTICULATED HEAD & EYES RIG:
          const node1 = model.getObjectByName('Dora_fix.obj.cleaner.materialmerger.gles') || model.children[0]?.children[0];
          const objEyes = model.getObjectByName('Object_3');
          const objMouth = model.getObjectByName('Object_5');

          if (node1 && objHead && objEyes && objMouth) {
            const headPivot = new THREE.Group();
            headPivot.name = 'doraHeadPivot';
            headPivot.position.set(0, 0, 2.38);
            node1.add(headPivot);

            [objHead, objEyes, objMouth].forEach((part) => {
              node1.remove(part);
              part.position.set(0, 0, -2.38);
              headPivot.add(part);
            });

            this.characterHead = headPivot;
            this.doraEyes = objEyes;
          }

          this.character.add(model);
          this.doraLoaded = true;
        },
        undefined,
        (err) => {
          console.error('Error loading Dora GLB:', err);
        }
      );
    }

    // Forward Kinematics Arm Rigging & Vertex Deformation
    setupDoraBodyRig(bodyMesh) {
      this.doraBodyMesh = bodyMesh;
      const geo = bodyMesh.geometry;
      const pos = geo.attributes.position;
      if (!pos) return;

      this.baseBodyPositions = new Float32Array(pos.array);
      this.updateDoraArms(this.currentArmPose);
    }

    updateDoraArms(config) {
      if (!this.doraBodyMesh || !this.baseBodyPositions) return;
      const geo = this.doraBodyMesh.geometry;
      const posAttr = geo.attributes.position;
      const base = this.baseBodyPositions;
      const count = posAttr.count;

      const smoothstep = (e0, e1, x) => {
        const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
        return t * t * (3 - 2 * t);
      };

      const sxL = 0.48, syL = -0.02, szL = 2.08;
      const sxR = -0.48, syR = -0.02, szR = 2.08;

      const lSR = config.lShoulderRoll ?? -1.40;
      const lSP = config.lShoulderPitch ?? -0.15;
      const lSY = config.lShoulderYaw ?? 0.05;
      const lEB = config.lElbowBend ?? 0.30;
      const lWF = config.lWristFlex ?? 0.18;

      const rSR = config.rShoulderRoll ?? -1.02;
      const rSP = config.rShoulderPitch ?? -0.38;
      const rSY = config.rShoulderYaw ?? -0.15;
      const rEB = config.rElbowBend ?? 0.92;
      const rWF = config.rWristFlex ?? 0.32;

      const cosRollL = Math.cos(lSR), sinRollL = Math.sin(lSR);
      const cosPitchL = Math.cos(lSP), sinPitchL = Math.sin(lSP);
      const cosYawL = Math.cos(lSY), sinYawL = Math.sin(lSY);
      const sinEbL = Math.sin(lEB), cosEbL = Math.cos(lEB);
      const sinWfL = Math.sin(lWF);

      const cosRollR = Math.cos(-rSR), sinRollR = Math.sin(-rSR);
      const cosPitchR = Math.cos(rSP), sinPitchR = Math.sin(rSP);
      const cosYawR = Math.cos(-rSY), sinYawR = Math.sin(-rSY);
      const sinEbR = Math.sin(rEB), cosEbR = Math.cos(rEB);
      const sinWfR = Math.sin(rWF);

      let rHandX = -0.40, rHandY = -0.45, rHandZ = 1.45;
      let lHandX = 0.45, lHandY = -0.20, lHandZ = 1.15;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const ox = base[i3];
        const oy = base[i3 + 1];
        const oz = base[i3 + 2];

        // Left arm
        if (ox > 0.40 && oz > 0.70) {
          const wSh = smoothstep(0.42, 0.58, ox);
          const wEl = smoothstep(0.88, 1.06, ox);
          const wWr = smoothstep(1.30, 1.48, ox);

          const dx = ox - sxL;
          const dy = oy - syL;
          const dz = oz - szL;

          const rx = dx * cosRollL - dz * sinRollL;
          let rz = dx * sinRollL + dz * cosRollL;
          const ry = dy * cosPitchL - rz * sinPitchL;
          rz = dy * sinPitchL + rz * cosPitchL;
          const rx2 = rx * cosYawL - ry * sinYawL;
          const ry2 = rx * sinYawL + ry * cosYawL;

          let px = sxL + rx2;
          let py = syL + ry2;
          let pz = szL + rz;

          if (wEl > 0) {
            const distEl = ox - 0.96;
            py -= distEl * sinEbL * 0.92 * wEl;
            pz += distEl * (1.0 - cosEbL) * 0.42 * wEl;
            px -= distEl * sinEbL * 0.22 * wEl;
          }

          if (wWr > 0) {
            const distWr = ox - 1.36;
            py -= distWr * sinWfL * 0.55 * wWr;
            px -= distWr * 0.15 * wWr;
          }

          const fx = ox * (1 - wSh) + px * wSh;
          const fy = oy * (1 - wSh) + py * wSh;
          const fz = oz * (1 - wSh) + pz * wSh;
          posAttr.setXYZ(i, fx, fy, fz);

          if (ox > 1.50) {
            lHandX = fx;
            lHandY = fy;
            lHandZ = fz;
          }
        }
        // Right arm
        else if (ox < -0.40 && oz > 0.70) {
          const absX = -ox;
          const wSh = smoothstep(0.42, 0.58, absX);
          const wEl = smoothstep(0.88, 1.06, absX);
          const wWr = smoothstep(1.30, 1.48, absX);

          const dx = ox - sxR;
          const dy = oy - syR;
          const dz = oz - szR;

          const rx = dx * cosRollR - dz * sinRollR;
          let rz = dx * sinRollR + dz * cosRollR;
          const ry = dy * cosPitchR - rz * sinPitchR;
          rz = dy * sinPitchR + rz * cosPitchR;
          const rx2 = rx * cosYawR - ry * sinYawR;
          const ry2 = rx * sinYawR + ry * cosYawR;

          let px = sxR + rx2;
          let py = syR + ry2;
          let pz = szR + rz;

          if (wEl > 0) {
            const distEl = absX - 0.96;
            py -= distEl * sinEbR * 0.92 * wEl;
            pz += distEl * (1.0 - cosEbR) * 0.42 * wEl;
            px += distEl * sinEbR * 0.22 * wEl;
          }

          if (wWr > 0) {
            const distWr = absX - 1.36;
            py -= distWr * sinWfR * 0.55 * wWr;
            px += distWr * 0.15 * wWr;
          }

          const fx = ox * (1 - wSh) + px * wSh;
          const fy = oy * (1 - wSh) + py * wSh;
          const fz = oz * (1 - wSh) + pz * wSh;
          posAttr.setXYZ(i, fx, fy, fz);

          if (ox < -1.50) {
            rHandX = fx;
            rHandY = fy;
            rHandZ = fz;
          }
        }
      }

      posAttr.needsUpdate = true;
      geo.computeVertexNormals();

      // Transform hand coordinates to world space for phone/glasses attachment
      if (this.doraModel) {
        // Dora GLTF has a 90 deg rotation on Node 0; convert model coordinates (X, Y, Z) to world
        const scale = this.doraModel.scale.x;
        const charWorld = this.character.position;
        const charRotY = this.character.rotation.y;

        // Model space to character group local space
        const lx = rHandX * scale + this.doraModel.position.x;
        const ly = rHandZ * scale + this.doraModel.position.y; // Z is up in model space
        const lz = -rHandY * scale + this.doraModel.position.z;

        const cosY = Math.cos(charRotY);
        const sinY = Math.sin(charRotY);
        const wx = charWorld.x + lx * cosY + lz * sinY;
        const wy = charWorld.y + ly;
        const wz = charWorld.z - lx * sinY + lz * cosY;

        this.rightHandWorldPos.set(wx, wy, wz);
      }
    }

    // =========================================================================
    // 6. HERO PROPS (Reading Glasses, Contact Shadows, Spatial Trail, Ghost)
    // =========================================================================
    buildHeroProps() {
      // 1. Reading Glasses
      this.glasses = new THREE.Group();
      const matFrame = new THREE.MeshStandardMaterial({
        color: PALETTE.glassesFrame,
        roughness: 0.32,
        metalness: 0.25
      });
      const matBridge = new THREE.MeshStandardMaterial({
        color: PALETTE.glassesBridge,
        roughness: 0.2,
        metalness: 0.85
      });
      const matLens = new THREE.MeshPhysicalMaterial({
        color: 0xEEF8FC,
        roughness: 0.05,
        transmission: 0.88,
        transparent: true,
        opacity: 0.75,
        reflectivity: 0.8
      });

      const rimGeo = new THREE.TorusGeometry(3.6, 0.65, 16, 28);
      const rimL = new THREE.Mesh(rimGeo, matFrame);
      rimL.position.set(-4.8, 0, 0);
      this.glasses.add(rimL);

      const lensL = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 0.4, 24), matLens);
      lensL.position.set(-4.8, 0, 0);
      lensL.rotation.x = Math.PI * 0.5;
      this.glasses.add(lensL);

      const rimR = new THREE.Mesh(rimGeo, matFrame);
      rimR.position.set(4.8, 0, 0);
      this.glasses.add(rimR);

      const lensR = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 0.4, 24), matLens);
      lensR.position.set(4.8, 0, 0);
      lensR.rotation.x = Math.PI * 0.5;
      this.glasses.add(lensR);

      const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 3.2, 12), matBridge);
      bridge.rotation.z = Math.PI * 0.5;
      bridge.position.y = 0.5;
      this.glasses.add(bridge);

      const templeGeo = new THREE.CylinderGeometry(0.45, 0.45, 10.5, 12);
      const templeL = new THREE.Mesh(templeGeo, matFrame);
      templeL.position.set(-8.4, 0, -5.2);
      templeL.rotation.x = Math.PI * 0.5;
      this.glasses.add(templeL);

      const templeR = new THREE.Mesh(templeGeo, matFrame);
      templeR.position.set(8.4, 0, -5.2);
      templeR.rotation.x = Math.PI * 0.5;
      this.glasses.add(templeR);

      this.glasses.scale.set(1.25, 1.25, 1.25);
      this.glasses.position.set(GLASSES_ORIGIN.x, GLASSES_ORIGIN.y, GLASSES_ORIGIN.z);
      this.glasses.rotation.set(0, 0.28, 0);
      this.scene.add(this.glasses);

      // 2. Physical Soft Contact Shadows (Zero Penetration, Zero Floating)
      const shadowMatTable = new THREE.MeshBasicMaterial({
        color: 0x241710,
        transparent: true,
        opacity: 0.42,
        depthWrite: false
      });
      this.tableContactShadow = new THREE.Mesh(new THREE.PlaneGeometry(16, 11), shadowMatTable);
      this.tableContactShadow.rotation.x = -Math.PI * 0.5;
      this.tableContactShadow.position.set(GLASSES_ORIGIN.x, 51.65, GLASSES_ORIGIN.z);
      this.scene.add(this.tableContactShadow);

      const shadowMatShelf = new THREE.MeshBasicMaterial({
        color: 0x241710,
        transparent: true,
        opacity: 0.0,
        depthWrite: false
      });
      this.shelfContactShadow = new THREE.Mesh(new THREE.PlaneGeometry(16, 11), shadowMatShelf);
      this.shelfContactShadow.rotation.x = -Math.PI * 0.5;
      this.shelfContactShadow.position.set(GLASSES_DEST.x, 83.55, GLASSES_DEST.z);
      this.scene.add(this.shelfContactShadow);

      // 3. Side Table Personal Objects
      const mug = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 2.8, 6.5, 24), new THREE.MeshStandardMaterial({ color: PALETTE.blanketTerracotta, roughness: 0.62 }));
      mug.position.set(-84, 55, -2);
      mug.castShadow = true;
      this.scene.add(mug);

      const medBox = new THREE.Mesh(new THREE.BoxGeometry(9, 4.5, 6), new THREE.MeshStandardMaterial({ color: 0xFDFBEE, roughness: 0.55 }));
      medBox.position.set(-64, 54, -4);
      medBox.rotation.y = -0.22;
      medBox.castShadow = true;
      this.scene.add(medBox);

      // 4. PHANTOM GHOST GLASSES (26% Translucent Memory Imprint at Exact Origin)
      this.ghostGlasses = new THREE.Group();
      const matGhost = new THREE.MeshPhysicalMaterial({
        color: PALETTE.phantomTeal,
        roughness: 0.15,
        transmission: 0.78,
        transparent: true,
        opacity: 0.28,
        emissive: PALETTE.phantomTeal,
        emissiveIntensity: 0.35,
        depthWrite: false
      });

      const gRimL = new THREE.Mesh(rimGeo, matGhost);
      gRimL.position.set(-4.8, 0, 0);
      this.ghostGlasses.add(gRimL);

      const gRimR = new THREE.Mesh(rimGeo, matGhost);
      gRimR.position.set(4.8, 0, 0);
      this.ghostGlasses.add(gRimR);

      const gBridge = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 3.2, 12), matGhost);
      gBridge.rotation.z = Math.PI * 0.5;
      gBridge.position.y = 0.5;
      this.ghostGlasses.add(gBridge);

      const gTempL = new THREE.Mesh(templeGeo, matGhost);
      gTempL.position.set(-8.4, 0, -5.2);
      gTempL.rotation.x = Math.PI * 0.5;
      this.ghostGlasses.add(gTempL);

      const gTempR = new THREE.Mesh(templeGeo, matGhost);
      gTempR.position.set(8.4, 0, -5.2);
      gTempR.rotation.x = Math.PI * 0.5;
      this.ghostGlasses.add(gTempR);

      this.ghostGlasses.scale.set(1.25, 1.25, 1.25);
      this.ghostGlasses.position.set(GLASSES_ORIGIN.x, GLASSES_ORIGIN.y, GLASSES_ORIGIN.z);
      this.ghostGlasses.rotation.set(0, 0.28, 0);
      this.ghostGlasses.visible = false;
      this.scene.add(this.ghostGlasses);

      // 5. SPATIAL SCAN PLANE & ANCHOR RINGS
      this.spatialScanPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(240, 160),
        new THREE.MeshBasicMaterial({
          color: PALETTE.phantomTeal,
          transparent: true,
          opacity: 0.18,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      this.spatialScanPlane.rotation.y = Math.PI * 0.15;
      this.spatialScanPlane.position.set(-80, 80, -20);
      this.spatialScanPlane.visible = false;
      this.scene.add(this.spatialScanPlane);

      const ringGeo = new THREE.RingGeometry(11, 13.5, 32);
      const ringMatGhost = new THREE.MeshBasicMaterial({ color: PALETTE.phantomTeal, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
      this.highlightGhost = new THREE.Mesh(ringGeo, ringMatGhost);
      this.highlightGhost.rotation.x = -Math.PI * 0.5;
      this.highlightGhost.position.set(GLASSES_ORIGIN.x, 51.7, GLASSES_ORIGIN.z);
      this.highlightGhost.visible = false;
      this.scene.add(this.highlightGhost);

      const ringMatMoved = new THREE.MeshBasicMaterial({ color: PALETTE.confirmGreen, transparent: true, opacity: 0.65, side: THREE.DoubleSide });
      this.highlightMoved = new THREE.Mesh(ringGeo, ringMatMoved);
      this.highlightMoved.rotation.x = -Math.PI * 0.5;
      this.highlightMoved.position.set(GLASSES_DEST.x, 83.6, GLASSES_DEST.z);
      this.highlightMoved.visible = false;
      this.scene.add(this.highlightMoved);

      // 6. LUMINOUS SPATIAL TRAIL (Side Table -> Bookshelf)
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(GLASSES_ORIGIN.x, GLASSES_ORIGIN.y + 2, GLASSES_ORIGIN.z),
        new THREE.Vector3(-25, 96, -20),
        new THREE.Vector3(35, 112, -45),
        new THREE.Vector3(GLASSES_DEST.x, GLASSES_DEST.y + 2, GLASSES_DEST.z)
      ]);
      const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.7, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: PALETTE.movementAmber,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending
      });
      this.spatialTrail = new THREE.Mesh(tubeGeo, tubeMat);
      this.spatialTrail.visible = false;
      this.scene.add(this.spatialTrail);
    }

    // =========================================================================
    // 7. STORY ENGINE & INTERACTIONS
    // =========================================================================
    setupUIListeners() {
      if (this.ui.cta) {
        this.ui.cta.addEventListener('click', () => this.startStory());
      }
      if (this.ui.replay) {
        this.ui.replay.addEventListener('click', () => this.resetStory());
      }
    }

    startStory() {
      if (this.isStoryActive) return;
      this.isStoryActive = true;
      this.storyStartTime = performance.now();
      this.glassesPickedUp = false;

      if (this.ui.cta) {
        this.ui.cta.classList.add('playing');
        this.ui.cta.innerHTML = 'Story playing... <span class="action-arrow">→</span>';
      }
      if (this.ui.progress) this.ui.progress.classList.add('visible');
      if (this.ui.replay) this.ui.replay.classList.remove('visible');
    }

    resetStory() {
      this.isStoryActive = false;
      this.glassesPickedUp = false;

      this.ghostGlasses.visible = false;
      this.highlightGhost.visible = false;
      this.highlightMoved.visible = false;
      this.spatialTrail.visible = false;
      this.spatialScanPlane.visible = false;

      this.glasses.position.set(GLASSES_ORIGIN.x, GLASSES_ORIGIN.y, GLASSES_ORIGIN.z);
      this.glasses.rotation.set(0, 0.28, 0);
      this.tableContactShadow.material.opacity = 0.42;
      this.shelfContactShadow.material.opacity = 0.0;

      this.charPos.copy(CHAR_ORIGIN);
      this.charRot.set(0, 0.22, 0);
      this.headRot.set(0, 0, 0);

      if (this.roomLights.phantom) this.roomLights.phantom.intensity = 0;
      if (this.phoneScreenLight) this.phoneScreenLight.intensity = 0.2;

      this.drawPhoneScreen('IDLE', 'Anchored');

      if (this.ui.cta) {
        this.ui.cta.classList.remove('playing');
        this.ui.cta.innerHTML = 'See how it works <span class="action-arrow">→</span>';
      }
      if (this.ui.narration) this.ui.narration.classList.remove('visible');
      if (this.ui.note) this.ui.note.classList.remove('visible');
      if (this.ui.progress) this.ui.progress.classList.remove('visible');
      if (this.ui.replay) this.ui.replay.classList.remove('visible');
    }

    easeInOutCubic(x) {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    // =========================================================================
    // 8. RENDER LOOP & REAL-TIME ANIMATION CONTROLLER
    // =========================================================================
    animate(timestamp) {
      requestAnimationFrame(this.animate);
      const now = timestamp || performance.now();

      // Mouse Parallax Easing
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

      // 1. NATURAL RANDOMIZED BLINKING (Cartoon eyelid animation)
      if (this.doraEyes) {
        if (!this.isBlinking && now - this.lastBlinkTime > this.nextBlinkInterval) {
          this.isBlinking = true;
          this.lastBlinkTime = now;
          this.nextBlinkInterval = 2800 + Math.random() * 2600;
        }

        if (this.isBlinking) {
          const blinkProgress = (now - this.lastBlinkTime) / this.blinkDuration;
          if (blinkProgress >= 1.0) {
            this.isBlinking = false;
            this.doraEyes.scale.y = 1.0;
          } else {
            const blinkFactor = Math.sin(blinkProgress * Math.PI);
            this.doraEyes.scale.y = Math.max(0.06, 1.0 - blinkFactor * 0.94);
          }
        }
      }

      const isMobile = window.innerWidth < 640;

      // ================= IDLE STATE =================
      if (!this.isStoryActive) {
        this.currentStoryPhase = 'IDLE';
        const t = (now % 16000) / 1000;

        // Diaphragm breathing & slight weight shifts
        const breath = Math.sin(now * 0.0022) * 0.42;
        this.charPos.y = breath;

        // Poses: natural casual posture (left arm down beside hip, right arm holding phone)
        const armPose = {
          lShoulderRoll: -1.40,
          lShoulderPitch: -0.15 + Math.sin(now * 0.0018) * 0.03,
          lShoulderYaw: 0.05,
          lElbowBend: 0.28,
          lWristFlex: 0.18,
          rShoulderRoll: -1.02,
          rShoulderPitch: -0.38 + Math.cos(now * 0.0016) * 0.03,
          rShoulderYaw: -0.15,
          rElbowBend: 0.92,
          rWristFlex: 0.32
        };

        if (t < 4.5) {
          // Relaxed forward gaze
          this.headRot.set(0.02, 0.04 + Math.sin(now * 0.001) * 0.03, 0);
          this.charRot.y = 0.22 + Math.sin(now * 0.0008) * 0.02;
        } else if (t < 8.0) {
          // Glance at reading glasses on side table
          const f = this.easeInOutCubic(Math.min((t - 4.5) / 1.2, 1));
          this.headRot.set(0.12 * f, -0.42 * f, -0.04 * f);
          this.charRot.y = 0.22 - 0.22 * f;
        } else if (t < 11.5) {
          // Glance back forward
          const f = this.easeInOutCubic(Math.min((t - 8.0) / 1.2, 1));
          this.headRot.set(0.12 * (1 - f), -0.42 * (1 - f) + 0.04 * f, 0);
          this.charRot.y = 0.0 + 0.22 * f;
        } else {
          // Gentle posture pause
          this.headRot.set(0.04, 0.12, 0);
          this.charRot.y = 0.22;
        }

        this.updateDoraArms(armPose);

        // Position phone casually in right hand
        if (this.phone) {
          this.phone.position.set(this.rightHandWorldPos.x - 0.5, this.rightHandWorldPos.y + 1.2, this.rightHandWorldPos.z + 1.4);
          this.phone.rotation.set(-0.35, 0.22, -0.15);
          if (this.phoneScreenLight) this.phoneScreenLight.intensity = 0.25;
        }

        if (isMobile) {
          this.targetCamPos.set(10, 115, 340);
          this.targetCamLook.set(4, 58, -15);
          this.targetFov = 36;
        } else {
          this.targetCamPos.copy(CAM_PRESETS.HOME.pos);
          this.targetCamLook.copy(CAM_PRESETS.HOME.target);
          this.targetFov = CAM_PRESETS.HOME.fov;
        }
      }

      // ================= CINEMATIC STORY ARC =================
      else {
        const elapsed = (now - this.storyStartTime) / 1000;
        const totalStoryDuration = 24.0;
        const progressPct = Math.min((elapsed / totalStoryDuration) * 100, 100);
        if (this.ui.progressFill) this.ui.progressFill.style.width = `${progressPct}%`;

        // -------------------------------------------------------------
        // STEP 1 — NOTICES GLASSES (0.0s to 2.8s)
        // Camera moves closer; Dora notices glasses on side table
        // -------------------------------------------------------------
        if (elapsed < 2.8) {
          this.currentStoryPhase = 'NOTICE';
          const p = this.easeInOutCubic(Math.min(elapsed / 1.8, 1));

          if (!isMobile) {
            this.targetCamPos.copy(CAM_PRESETS.NOTICE.pos);
            this.targetCamLook.copy(CAM_PRESETS.NOTICE.target);
            this.targetFov = CAM_PRESETS.NOTICE.fov;
          }

          this.headRot.set(0.14 * p, -0.48 * p, -0.05 * p);
          this.charRot.y = 0.22 - 0.32 * p;

          this.updateDoraArms({
            lShoulderRoll: -1.35,
            lShoulderPitch: -0.22 * p,
            lElbowBend: 0.35,
            rShoulderRoll: -1.02,
            rShoulderPitch: -0.38,
            rElbowBend: 0.92
          });

          if (this.phone) {
            this.phone.position.set(this.rightHandWorldPos.x - 0.5, this.rightHandWorldPos.y + 1.2, this.rightHandWorldPos.z + 1.4);
            this.phone.rotation.set(-0.35, 0.22, -0.15);
          }

          if (this.ui.narration && p > 0.3) {
            this.ui.narration.classList.add('visible');
            this.ui.narrTitle.textContent = 'Reading glasses anchored.';
            this.ui.narrDetail.textContent = 'Side table · 2:10 PM';
          }
        }

        // -------------------------------------------------------------
        // STEP 2 — LOOKS AWAY & GLASSES PHYSICAL FLIGHT (2.8s to 6.2s)
        // Dora looks away; glasses physically arc to bookshelf with settling
        // -------------------------------------------------------------
        else if (elapsed < 6.2) {
          this.currentStoryPhase = 'TRANSIT';
          this.headRot.set(-0.04, 0.35, 0); // Looks away toward right window
          this.charRot.y = 0.15;

          if (!isMobile) {
            this.targetCamPos.copy(CAM_PRESETS.TRANSIT.pos);
            this.targetCamLook.copy(CAM_PRESETS.TRANSIT.target);
            this.targetFov = CAM_PRESETS.TRANSIT.fov;
          }

          const flight = (elapsed - 3.2) / 2.2;
          if (flight >= 0 && flight <= 1.0) {
            const p = this.easeInOutCubic(flight);
            const arcY = Math.sin(p * Math.PI) * 36;

            this.glasses.position.set(
              GLASSES_ORIGIN.x + (GLASSES_DEST.x - GLASSES_ORIGIN.x) * p,
              GLASSES_ORIGIN.y + (GLASSES_DEST.y - GLASSES_ORIGIN.y) * p + arcY,
              GLASSES_ORIGIN.z + (GLASSES_DEST.z - GLASSES_ORIGIN.z) * p
            );
            this.glasses.rotation.set(0.15 * Math.sin(p * Math.PI), 0.28 + p * Math.PI * 0.85, 0.1 * Math.sin(p * Math.PI));

            // Crossfade contact shadows
            this.tableContactShadow.material.opacity = Math.max(0, 0.42 * (1 - p * 2));
            this.shelfContactShadow.material.opacity = Math.max(0, 0.42 * ((p - 0.5) * 2));
          } else if (flight > 1.0) {
            // Damped harmonic settling bounce on shelf
            const settleT = (flight - 1.0) / 0.25;
            const bounce = Math.sin(settleT * Math.PI * 3) * Math.exp(-settleT * 4) * 0.8;
            this.glasses.position.set(GLASSES_DEST.x, GLASSES_DEST.y + Math.max(0, bounce), GLASSES_DEST.z);
            this.tableContactShadow.material.opacity = 0;
            this.shelfContactShadow.material.opacity = 0.42;
          }

          this.updateDoraArms({
            lShoulderRoll: -1.40,
            lShoulderPitch: -0.15,
            lElbowBend: 0.28,
            rShoulderRoll: -1.02,
            rShoulderPitch: -0.38,
            rElbowBend: 0.92
          });

          if (this.phone) {
            this.phone.position.set(this.rightHandWorldPos.x - 0.5, this.rightHandWorldPos.y + 1.2, this.rightHandWorldPos.z + 1.4);
            this.phone.rotation.set(-0.35, 0.22, -0.15);
          }
        }

        // -------------------------------------------------------------
        // STEP 3 — RETURN & PUZZLED SEARCH (6.2s to 9.8s)
        // Dora turns back to side table, finds glasses gone, puzzles
        // -------------------------------------------------------------
        else if (elapsed < 9.8) {
          this.currentStoryPhase = 'SEARCH';
          this.glasses.position.set(GLASSES_DEST.x, GLASSES_DEST.y, GLASSES_DEST.z);

          if (!isMobile) {
            this.targetCamPos.copy(CAM_PRESETS.SEARCH.pos);
            this.targetCamLook.copy(CAM_PRESETS.SEARCH.target);
            this.targetFov = CAM_PRESETS.SEARCH.fov;
          }

          if (elapsed < 7.6) {
            // Realizes glasses missing from table
            const p = this.easeInOutCubic(Math.min((elapsed - 6.2) / 1.0, 1));
            this.headRot.set(0.24 * p, -0.55 * p, -0.22 * p);
            this.charRot.y = -0.18 * p;

            this.updateDoraArms({
              lShoulderRoll: -1.15,
              lShoulderPitch: -0.28,
              lElbowBend: 0.65,
              rShoulderRoll: -0.92,
              rShoulderPitch: -0.42,
              rElbowBend: 0.95
            });
          } else {
            // Questioning searching shrug (arms gesture slightly outward)
            const scanW = Math.sin((elapsed - 7.6) * 3.8);
            this.headRot.set(0.20, -0.30 + scanW * 0.35, -0.15);

            this.updateDoraArms({
              lShoulderRoll: -1.05 + scanW * 0.08,
              lShoulderPitch: -0.35,
              lElbowBend: 0.75,
              rShoulderRoll: -0.85 - scanW * 0.08,
              rShoulderPitch: -0.45,
              rElbowBend: 0.98
            });
          }

          if (this.phone) {
            this.phone.position.set(this.rightHandWorldPos.x - 0.4, this.rightHandWorldPos.y + 1.2, this.rightHandWorldPos.z + 1.4);
            this.phone.rotation.set(-0.4, 0.2, -0.15);
          }

          this.drawPhoneScreen('SEARCH', 'Missing');

          if (this.ui.narration) {
            this.ui.narrTitle.textContent = 'Object displaced.';
            this.ui.narrDetail.textContent = 'Side table is empty. Consulting SMRITI...';
          }
        }

        // -------------------------------------------------------------
        // STEP 4 — SMRITI PHONE INTERACTION (9.8s to 13.5s)
        // Dora raises phone, tilts head down, eyes look at screen, face illuminates
        // -------------------------------------------------------------
        else if (elapsed < 13.5) {
          this.currentStoryPhase = 'PHONE';
          const p = this.easeInOutCubic(Math.min((elapsed - 9.8) / 1.2, 1));

          if (!isMobile) {
            this.targetCamPos.copy(CAM_PRESETS.PHONE.pos);
            this.targetCamLook.copy(CAM_PRESETS.PHONE.target);
            this.targetFov = CAM_PRESETS.PHONE.fov;
          }

          // Dora tilts head downward directly toward phone screen
          this.headRot.set(0.38 * p, -0.15 * p, 0);
          this.charRot.y = 0.05 * p;

          // Right arm raises phone to chest/chin level; left arm supports or relaxes
          this.updateDoraArms({
            lShoulderRoll: -1.35,
            lShoulderPitch: -0.18,
            lElbowBend: 0.38,
            rShoulderRoll: -0.55 * p + -1.02 * (1 - p),
            rShoulderPitch: -0.78 * p + -0.38 * (1 - p),
            rShoulderYaw: -0.25 * p,
            rElbowBend: 1.38 * p + 0.92 * (1 - p),
            rWristFlex: 0.45 * p
          });

          // Phone screen faces Dora's face
          if (this.phone) {
            this.phone.position.set(this.rightHandWorldPos.x, this.rightHandWorldPos.y + 1.5, this.rightHandWorldPos.z + 1.0);
            this.phone.rotation.set(-0.75 * p, 0.25, -0.1);
          }

          // Screen light illuminates Dora's face
          if (this.phoneScreenLight) {
            this.phoneScreenLight.intensity = 0.85 * p;
          }

          this.drawPhoneScreen('SCAN', '84%');

          if (this.ui.narration) {
            this.ui.narrTitle.textContent = 'SMRITI scanning room memory...';
            this.ui.narrDetail.textContent = 'Comparing spatial points with past reality';
          }
        }

        // -------------------------------------------------------------
        // STEP 5 — PHANTOM SPATIAL SCAN & GHOST REVEAL (13.5s to 17.0s)
        // Translucent scan plane sweeps; ghost glasses appear on side table
        // -------------------------------------------------------------
        else if (elapsed < 17.0) {
          this.currentStoryPhase = 'PHANTOM';
          const p = (elapsed - 13.5) / 3.5;

          if (!isMobile) {
            this.targetCamPos.copy(CAM_PRESETS.PHANTOM.pos);
            this.targetCamLook.copy(CAM_PRESETS.PHANTOM.target);
            this.targetFov = CAM_PRESETS.PHANTOM.fov;
          }

          // Environment lighting cools subtly
          if (this.roomLights.phantom) this.roomLights.phantom.intensity = 1.15;

          // Translucent scan plane sweeps across room
          this.spatialScanPlane.visible = true;
          this.spatialScanPlane.position.x = -90 + p * 210;

          // Ghost of glasses fades in at original side table position
          this.ghostGlasses.visible = true;
          this.highlightGhost.visible = true;
          this.highlightMoved.visible = true;
          this.spatialTrail.visible = true;

          const pulse = 1 + Math.sin(now * 0.007) * 0.08;
          this.highlightGhost.scale.set(pulse, pulse, pulse);
          this.highlightMoved.scale.set(pulse, pulse, pulse);

          // Dora looks at side table ghost imprint
          this.headRot.set(0.18, -0.45, 0);

          this.updateDoraArms({
            lShoulderRoll: -1.35,
            lShoulderPitch: -0.18,
            lElbowBend: 0.38,
            rShoulderRoll: -0.75,
            rShoulderPitch: -0.55,
            rElbowBend: 1.15
          });

          if (this.phone) {
            this.phone.position.set(this.rightHandWorldPos.x, this.rightHandWorldPos.y + 1.4, this.rightHandWorldPos.z + 1.2);
            this.phone.rotation.set(-0.6, 0.25, -0.1);
          }

          this.drawPhoneScreen('FOUND', 'Bookshelf');

          if (this.ui.narration) {
            this.ui.narrTitle.textContent = 'Memory revealed.';
            this.ui.narrDetail.textContent = 'Glasses moved: Side table → Bookshelf Shelf 2';
          }
        }

        // -------------------------------------------------------------
        // STEP 6 — FOLLOW MEMORY & WALK TO BOOKSHELF (17.0s to 20.5s)
        // Dora walks across oak floor with weight shifting & arm swing
        // -------------------------------------------------------------
        else if (elapsed < 20.5) {
          this.currentStoryPhase = 'WALK';
          const p = this.easeInOutCubic(Math.min((elapsed - 17.0) / 3.0, 1));

          if (!isMobile) {
            this.targetCamPos.copy(CAM_PRESETS.REVEAL.pos);
            this.targetCamLook.copy(CAM_PRESETS.REVEAL.target);
            this.targetFov = CAM_PRESETS.REVEAL.fov;
          }

          // Dora turns and steps toward bookshelf
          this.charRot.y = 0.52;
          this.headRot.set(0.06, 0.52, 0); // Looking at bookshelf

          this.charPos.x = CHAR_ORIGIN.x + 48 * p;
          this.charPos.z = CHAR_ORIGIN.z - 38 * p;

          // Walking cadence & weight transfer
          const walkPhase = (elapsed - 17.0) * 7.5;
          const isWalking = p < 0.95;
          this.charPos.y = isWalking ? Math.abs(Math.sin(walkPhase)) * 1.6 : 0;
          this.charRot.z = isWalking ? Math.sin(walkPhase) * 0.035 : 0;

          // Natural arm swing during walking
          const swing = isWalking ? Math.sin(walkPhase) * 0.22 : 0;
          this.updateDoraArms({
            lShoulderRoll: -1.35,
            lShoulderPitch: -0.15 + swing,
            lElbowBend: 0.32,
            rShoulderRoll: -0.95,
            rShoulderPitch: -0.35 - swing,
            rElbowBend: 0.85
          });

          if (this.phone) {
            this.phone.position.set(this.rightHandWorldPos.x, this.rightHandWorldPos.y + 1.2, this.rightHandWorldPos.z + 1.2);
            this.phone.rotation.set(-0.35, 0.45, -0.1);
          }
        }

        // -------------------------------------------------------------
        // STEP 7 — DISCOVER & PICK UP GLASSES (20.5s to 23.5s)
        // Hand extends, reaches shelf, picks up glasses, lifts with smile
        // -------------------------------------------------------------
        else if (elapsed < 23.5) {
          this.currentStoryPhase = 'DISCOVER';
          const p = (elapsed - 20.5) / 3.0;

          if (!isMobile) {
            this.targetCamPos.copy(CAM_PRESETS.DISCOVER.pos);
            this.targetCamLook.copy(CAM_PRESETS.DISCOVER.target);
            this.targetFov = CAM_PRESETS.DISCOVER.fov;
          }

          if (p < 0.45) {
            // Reaching hand out to shelf 2
            const reachF = this.easeInOutCubic(p / 0.45);
            this.updateDoraArms({
              lShoulderRoll: -1.40,
              lShoulderPitch: -0.15,
              lElbowBend: 0.25,
              rShoulderRoll: -0.22 * reachF + -0.95 * (1 - reachF),
              rShoulderPitch: -0.92 * reachF + -0.35 * (1 - reachF),
              rElbowBend: 0.45 * reachF + 0.85 * (1 - reachF),
              rWristFlex: 0.20
            });
            this.headRot.set(0.14, 0.48, 0);
          } else {
            // Glasses picked up and brought toward chest/face
            this.glassesPickedUp = true;
            this.shelfContactShadow.material.opacity = 0;

            const liftF = this.easeInOutCubic((p - 0.45) / 0.55);
            this.updateDoraArms({
              lShoulderRoll: -1.40,
              lShoulderPitch: -0.15,
              lElbowBend: 0.25,
              rShoulderRoll: -0.65 * liftF + -0.22 * (1 - liftF),
              rShoulderPitch: -0.72 * liftF + -0.92 * (1 - liftF),
              rElbowBend: 1.25 * liftF + 0.45 * (1 - liftF),
              rWristFlex: 0.40
            });

            // Glasses attached to right hand!
            this.glasses.position.set(this.rightHandWorldPos.x, this.rightHandWorldPos.y + 2.0, this.rightHandWorldPos.z + 1.0);
            this.glasses.rotation.set(-0.25, 0.4, 0.1);

            // Relieved happy smile & head tilt
            this.headRot.set(-0.06, 0.32, 0.12 * liftF);
          }

          this.drawPhoneScreen('RESOLVE', 'Retrieved');

          if (this.ui.narration) {
            this.ui.narrTitle.textContent = 'Relief restored.';
            this.ui.narrDetail.textContent = 'Displaced 240 cm · 99.4% confidence';
          }
          if (this.ui.note) this.ui.note.classList.add('visible');
        }

        // -------------------------------------------------------------
        // STEP 8 — PEACEFUL RESOLUTION & RETURN (23.5s+)
        // Calm idle with glasses in hand; warm sunlight restored
        // -------------------------------------------------------------
        else {
          this.currentStoryPhase = 'RESOLVE';

          if (!isMobile) {
            this.targetCamPos.copy(CAM_PRESETS.RESOLVE.pos);
            this.targetCamLook.copy(CAM_PRESETS.RESOLVE.target);
            this.targetFov = CAM_PRESETS.RESOLVE.fov;
          }

          if (this.roomLights.phantom) this.roomLights.phantom.intensity = Math.max(0, 1.15 - (elapsed - 23.5) * 0.4);

          // Holds glasses happily in hand
          this.glasses.position.set(this.rightHandWorldPos.x, this.rightHandWorldPos.y + 2.0, this.rightHandWorldPos.z + 1.0);
          this.glasses.rotation.set(-0.25, 0.4, 0.1);

          const happyBob = Math.sin(now * 0.0025) * 0.35;
          this.charPos.y = happyBob;
          this.headRot.set(-0.04, 0.28 + Math.sin(now * 0.001) * 0.04, 0.08);

          this.updateDoraArms({
            lShoulderRoll: -1.40,
            lShoulderPitch: -0.15,
            lElbowBend: 0.28,
            rShoulderRoll: -0.72,
            rShoulderPitch: -0.65,
            rElbowBend: 1.25
          });

          if (this.ui.replay) this.ui.replay.classList.add('visible');
        }
      }

      // Apply animated transforms to Character & Rigged Head
      if (this.character) {
        this.character.position.copy(this.charPos);
        this.character.rotation.copy(this.charRot);
      }
      if (this.characterHead) {
        if (this.characterHead.name === 'doraHeadPivot') {
          this.characterHead.rotation.x = this.headRot.x;
          this.characterHead.rotation.z = -this.headRot.y;
          this.characterHead.rotation.y = -this.headRot.z;
        } else {
          this.characterHead.rotation.copy(this.headRot);
        }
      }

      // Smooth Cinematic Camera Lerp
      const camLerp = 0.045;
      this.camera.position.x += (this.targetCamPos.x + this.mouse.x * 14 - this.camera.position.x) * camLerp;
      this.camera.position.y += (this.targetCamPos.y - this.mouse.y * 8 - this.camera.position.y) * camLerp;
      this.camera.position.z += (this.targetCamPos.z - this.camera.position.z) * camLerp;

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
    }
  }

  const initApp = () => {
    const cid = document.getElementById('spatialViewport') ? 'spatialViewport' : 'splineCanvas';
    window.smritiApp = new SmritiExperience(cid);
  };
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
