// =============================================================================
// SMRITI — Visual Overhaul v3: Premium 3D Animated World
// Art Direction: High-end animated film / Pixar & Ghibli warmth
// Organic cinematic environment + stylized expressive character + rich 70/20/10 palette
// =============================================================================

(function() {
  'use strict';

  // 70 / 20 / 10 Master Palette Constants (Deepened to retain rich saturation under 3D lighting)
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

  // World Anchors
  const GLASSES_ORIGIN = { x: -74, y: 53.5, z: 8 };
  const GLASSES_DEST = { x: 104, y: 86.5, z: -85 };
  const CHAR_ORIGIN = { x: 4, y: 0, z: 10 };

  // Cinematic 3/4 Perspective Camera States (Smooth easing, hero character commands 25–35% height)
  const CAM_PRESETS = {
    HOME: { pos: { x: 50, y: 110, z: 275 }, target: { x: 4, y: 54, z: -10 }, fov: 31 },
    NOTICE: { pos: { x: 30, y: 94, z: 205 }, target: { x: -25, y: 52, z: 8 }, fov: 28 },
    SEARCH: { pos: { x: 20, y: 104, z: 225 }, target: { x: -35, y: 52, z: 5 }, fov: 29 },
    PHANTOM: { pos: { x: 62, y: 122, z: 285 }, target: { x: 14, y: 56, z: -25 }, fov: 32 },
    REVEAL: { pos: { x: 52, y: 106, z: 240 }, target: { x: 42, y: 64, z: -40 }, fov: 30 },
    DISCOVER: { pos: { x: 45, y: 100, z: 225 }, target: { x: 38, y: 60, z: -35 }, fov: 29 },
    RESOLVE: { pos: { x: 50, y: 110, z: 275 }, target: { x: 4, y: 54, z: -10 }, fov: 31 }
  };

  class SmritiExperience {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
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
      this.characterEyelids = [];
      this.characterEyebrows = [];
      this.characterMouth = null;
      this.characterArmR = null;
      this.characterArmL = null;
      this.glasses = null;
      this.ghostGlasses = null;
      this.highlightGhost = null;
      this.highlightMoved = null;
      this.spatialTrail = null;
      this.roomLights = {};

      // Dynamic Animation State Machine
      this.isStoryActive = false;
      this.storyStartTime = 0;
      this.lastBlinkTime = 0;
      this.nextBlinkInterval = 3200;
      this.charPos = new THREE.Vector3().copy(CHAR_ORIGIN);
      this.charRot = new THREE.Euler(0, 0.22, 0); // Warmly oriented towards camera & viewer
      this.headRot = new THREE.Euler(0, 0, 0);

      // DOM UI Elements
      this.ui = {
        statusDot: document.getElementById('storyStatusDot') || document.querySelector('.live-indicator'),
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
      this.renderer.toneMappingExposure = 0.98;

      this.container.appendChild(this.renderer.domElement);

      // 3. Assemble Organic Cinematic World
      this.setupCinematicLighting();
      this.buildOrganicEnvironment();
      this.buildStylizedFurniture();
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
    // 1. CINEMATIC LIGHTING (Controlled Contrast, Rich Warmth, Punchy Colors)
    // =========================================================================
    setupCinematicLighting() {
      // Warm ambient base - soft and gentle, keeping deep saturated tones
      const ambient = new THREE.AmbientLight(0xFFE2CB, 0.35);
      this.scene.add(ambient);
      this.roomLights.ambient = ambient;

      // Primary Key Light — Warm golden sunlight from upper left
      const sunKey = new THREE.DirectionalLight(0xFFD8AF, 0.88);
      sunKey.position.set(-220, 360, 200);
      sunKey.castShadow = true;
      sunKey.shadow.mapSize.width = 2048;
      sunKey.shadow.mapSize.height = 2048;
      sunKey.shadow.camera.near = 50;
      sunKey.shadow.camera.far = 950;
      const d = 280;
      sunKey.shadow.camera.left = -d;
      sunKey.shadow.camera.right = d;
      sunKey.shadow.camera.top = d;
      sunKey.shadow.camera.bottom = -d;
      sunKey.shadow.bias = -0.0004;
      this.scene.add(sunKey);
      this.roomLights.sun = sunKey;

      // Soft Back/Rim Light — Defines hair silhouette and sweater volume
      const rimLight = new THREE.DirectionalLight(0xFFEBC7, 0.36);
      rimLight.position.set(150, 200, -240);
      this.scene.add(rimLight);
      this.roomLights.rim = rimLight;

      // Cozy Floor Lamp Warm Glow
      const lampPoint = new THREE.PointLight(0xFFA55A, 1.3, 200, 1.7);
      lampPoint.position.set(-110, 85, -95);
      this.scene.add(lampPoint);
      this.roomLights.lamp = lampPoint;

      // PHANTOM Atmospheric Accent Light (Activated in story phase 4)
      const phantomFill = new THREE.PointLight(PALETTE.phantomTeal, 0, 320, 1.5);
      phantomFill.position.set(15, 85, -35);
      this.scene.add(phantomFill);
      this.roomLights.phantom = phantomFill;
    }

    // =========================================================================
    // 2. ORGANIC ENVIRONMENT (Seamless Floor, Soft Backdrop, Layered Foreground)
    // =========================================================================
    buildOrganicEnvironment() {
      // 1. Seamless Warm Oak Floor extending naturally
      const matFloor = new THREE.MeshStandardMaterial({
        color: PALETTE.floorWood,
        roughness: 0.52,
        metalness: 0.04
      });
      const floorDisc = new THREE.Mesh(new THREE.CylinderGeometry(440, 460, 8, 48), matFloor);
      floorDisc.position.set(0, -4, -30);
      floorDisc.receiveShadow = true;
      this.scene.add(floorDisc);

      // Parquet floor plank accents
      const matPlankDark = new THREE.MeshStandardMaterial({ color: PALETTE.floorPlankDark, roughness: 0.58 });
      for (let i = -4; i <= 4; i++) {
        const strip = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.35, 600), matPlankDark);
        strip.position.set(i * 68, 0.2, -30);
        strip.receiveShadow = true;
        this.scene.add(strip);
      }

      // 2. Soft Architectural Curved Backdrop Wall
      const wallMat = new THREE.MeshStandardMaterial({ color: PALETTE.wallPlaster, roughness: 0.88 });
      const wallCurve = new THREE.Mesh(
        new THREE.CylinderGeometry(380, 380, 320, 36, 1, true, Math.PI * 0.72, Math.PI * 0.85),
        wallMat
      );
      wallCurve.position.set(0, 155, -95);
      wallCurve.rotation.y = -Math.PI * 0.55;
      wallCurve.receiveShadow = true;
      this.scene.add(wallCurve);

      // 3. Large Organic Pebble / Rounded Oval Rug
      const rugGroup = new THREE.Group();
      rugGroup.position.set(6, 0.5, 0);

      const rugMat = new THREE.MeshStandardMaterial({ color: PALETTE.rugBase, roughness: 0.9 });
      const rugBorderMat = new THREE.MeshStandardMaterial({ color: PALETTE.rugBorder, roughness: 0.9 });

      // Sculpted Pebble Rug shape
      const rugMesh = new THREE.Mesh(new THREE.CylinderGeometry(140, 150, 2.5, 36), rugMat);
      rugMesh.scale.set(1.32, 1, 0.96);
      rugMesh.receiveShadow = true;
      rugGroup.add(rugMesh);

      const rugRim = new THREE.Mesh(new THREE.CylinderGeometry(144, 154, 1.8, 36), rugBorderMat);
      rugRim.scale.set(1.32, 1, 0.96);
      rugRim.position.y = -0.4;
      rugRim.receiveShadow = true;
      rugGroup.add(rugRim);

      this.scene.add(rugGroup);

      // 4. Cinematic Foreground Layer: Organic Monstera Leaf gracefully framing bottom-right
      const fgPlantGroup = new THREE.Group();
      fgPlantGroup.position.set(92, 32, 145); // Closer to camera, partially cropping lower right frame

      const leafMat = new THREE.MeshStandardMaterial({ color: PALETTE.plantGreen, roughness: 0.45 });
      const leafMatDeep = new THREE.MeshStandardMaterial({ color: PALETTE.plantDeep, roughness: 0.55 });

      const leaf1 = new THREE.Mesh(new THREE.SphereGeometry(30, 16, 16), leafMat);
      leaf1.scale.set(0.18, 1.45, 0.9);
      leaf1.rotation.set(0.42, 0.3, -0.65);
      leaf1.castShadow = true;
      fgPlantGroup.add(leaf1);

      const leaf2 = new THREE.Mesh(new THREE.SphereGeometry(22, 16, 16), leafMatDeep);
      leaf2.scale.set(0.15, 1.35, 0.85);
      leaf2.position.set(-16, -14, 12);
      leaf2.rotation.set(0.25, 0.5, -0.45);
      leaf2.castShadow = true;
      fgPlantGroup.add(leaf2);

      this.scene.add(fgPlantGroup);
    }

    // =========================================================================
    // 3. STYLIZED FURNITURE (Curved Armchair, Pedestal Table, Arched Bookshelf)
    // =========================================================================
    buildStylizedFurniture() {
      // 1. SCULPTED ROUNDED BOUCLÉ ARMCHAIR
      const chairGroup = new THREE.Group();
      chairGroup.position.set(-52, 0, -35);
      chairGroup.rotation.y = 0.35;

      const matBoucle = new THREE.MeshStandardMaterial({ color: PALETTE.armchairFabric, roughness: 0.8 });
      const matWoodLeg = new THREE.MeshStandardMaterial({ color: PALETTE.furnitureDark, roughness: 0.5 });

      // Curved Round Seat Cushion
      const seat = new THREE.Mesh(new THREE.CylinderGeometry(28, 30, 15, 32), matBoucle);
      seat.position.set(0, 15, 0);
      seat.scale.set(1.04, 1, 1);
      seat.castShadow = true;
      seat.receiveShadow = true;
      chairGroup.add(seat);

      // Rounded Wrap-around Barrel Backrest
      const backrest = new THREE.Mesh(new THREE.CylinderGeometry(32, 32, 36, 28, 1, true, 0, Math.PI * 1.15), matBoucle);
      backrest.position.set(0, 31, -4);
      backrest.rotation.y = Math.PI * 0.92;
      backrest.scale.set(1, 1, 0.92);
      backrest.castShadow = true;
      chairGroup.add(backrest);

      // Backrest Soft Cap
      const backCap = new THREE.Mesh(new THREE.TorusGeometry(32, 3.8, 16, 28, Math.PI * 1.15), matBoucle);
      backCap.position.set(0, 49, -4);
      backCap.rotation.set(Math.PI * 0.5, 0, Math.PI * 0.92);
      chairGroup.add(backCap);

      // Angled Rounded Wooden Legs
      const legGeo = new THREE.CylinderGeometry(1.6, 1.1, 16, 16);
      const legPositions = [
        { x: -18, z: -15, rx: -0.14, rz: 0.14 },
        { x: 18, z: -15, rx: -0.14, rz: -0.14 },
        { x: -16, z: 15, rx: 0.14, rz: 0.14 },
        { x: 16, z: 15, rx: 0.14, rz: -0.14 }
      ];
      legPositions.forEach(p => {
        const leg = new THREE.Mesh(legGeo, matWoodLeg);
        leg.position.set(p.x, 8, p.z);
        leg.rotation.set(p.rx, 0, p.rz);
        leg.castShadow = true;
        chairGroup.add(leg);
      });

      // Casually Draped Warm Terracotta Throw Blanket
      const matBlanket = new THREE.MeshStandardMaterial({ color: PALETTE.blanketTerracotta, roughness: 0.82 });
      const blanket = new THREE.Mesh(new THREE.BoxGeometry(20, 32, 16), matBlanket);
      blanket.position.set(15, 30, 2);
      blanket.rotation.set(0.14, 0.22, -0.18);
      blanket.castShadow = true;
      chairGroup.add(blanket);

      // Mustard Velvet Round Cushion
      const matCushion = new THREE.MeshStandardMaterial({ color: PALETTE.cushionMustard, roughness: 0.68 });
      const cushion = new THREE.Mesh(new THREE.SphereGeometry(10, 24, 16), matCushion);
      cushion.scale.set(1, 0.65, 0.95);
      cushion.position.set(-6, 24, -9);
      cushion.rotation.set(-0.35, 0.15, 0.1);
      cushion.castShadow = true;
      chairGroup.add(cushion);

      this.scene.add(chairGroup);

      // 2. ORGANIC ROUND PEDESTAL SIDE TABLE
      const tableGroup = new THREE.Group();
      tableGroup.position.set(-74, 0, 8);

      const matTable = new THREE.MeshStandardMaterial({ color: PALETTE.furnitureWood, roughness: 0.48 });

      // Sculpted Table Top with soft chamfered edge
      const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(22, 22, 3.2, 32), matTable);
      tableTop.position.set(0, 50, 0);
      tableTop.castShadow = true;
      tableTop.receiveShadow = true;
      tableGroup.add(tableTop);

      // Fluted Central Pedestal Stem
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(4, 5.5, 46, 24), matTable);
      stem.position.set(0, 25, 0);
      stem.castShadow = true;
      tableGroup.add(stem);

      const basePlate = new THREE.Mesh(new THREE.CylinderGeometry(16, 18, 3.8, 32), matTable);
      basePlate.position.set(0, 1.9, 0);
      basePlate.castShadow = true;
      tableGroup.add(basePlate);

      this.scene.add(tableGroup);

      // 3. ARCHED MODERN BOOKSHELF (Hero secondary anchor on right)
      const shelfGroup = new THREE.Group();
      shelfGroup.position.set(104, 0, -85);

      const matShelfWood = new THREE.MeshStandardMaterial({ color: PALETTE.furnitureWood, roughness: 0.52 });

      // Frame Sides
      const uprightGeo = new THREE.BoxGeometry(3.5, 145, 30);
      const uprightL = new THREE.Mesh(uprightGeo, matShelfWood);
      uprightL.position.set(-30, 72.5, 0);
      uprightL.castShadow = true;
      shelfGroup.add(uprightL);

      const uprightR = new THREE.Mesh(uprightGeo, matShelfWood);
      uprightR.position.set(30, 72.5, 0);
      uprightR.castShadow = true;
      shelfGroup.add(uprightR);

      // Arched Top Crown
      const shelfCrown = new THREE.Mesh(new THREE.CylinderGeometry(31.5, 31.5, 30, 24, 1, false, 0, Math.PI), matShelfWood);
      shelfCrown.position.set(0, 145, 0);
      shelfCrown.rotation.z = Math.PI * 0.5;
      shelfCrown.rotation.y = Math.PI * 0.5;
      shelfCrown.castShadow = true;
      shelfGroup.add(shelfCrown);

      // 3 Horizontal Shelves
      [40, 82, 122].forEach((yPos) => {
        const shelfSlab = new THREE.Mesh(new THREE.BoxGeometry(58, 3, 28), matShelfWood);
        shelfSlab.position.set(0, yPos, 0);
        shelfSlab.receiveShadow = true;
        shelfGroup.add(shelfSlab);
      });

      // Lived-in, Tilted & Leaning Books on Shelf 2
      const bookColors = [PALETTE.blanketTerracotta, PALETTE.phantomTeal, PALETTE.cushionMustard, PALETTE.charSweater, 0x8C567A];
      const booksData = [
        { x: -22, h: 25, w: 5.5, d: 19, rotZ: 0, c: bookColors[0] },
        { x: -15, h: 21, w: 6.5, d: 20, rotZ: 0, c: bookColors[1] },
        { x: -7,  h: 23, w: 5,   d: 18, rotZ: 0.17, c: bookColors[2] }, // Leaning book
        { x: 20,  h: 24, w: 5.5, d: 19, rotZ: 0, c: bookColors[3] },
        { x: 13,  h: 20, w: 6.5, d: 17, rotZ: -0.12, c: bookColors[4] }
      ];

      booksData.forEach((b) => {
        const bMat = new THREE.MeshStandardMaterial({ color: b.c, roughness: 0.65 });
        const bMesh = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), bMat);
        bMesh.position.set(b.x, 82 + b.h / 2, 0);
        bMesh.rotation.z = b.rotZ;
        bMesh.castShadow = true;
        shelfGroup.add(bMesh);
      });

      // Minimalist Ceramic Vases on Shelf 3
      const matCeramicVase = new THREE.MeshStandardMaterial({ color: PALETTE.rugBase, roughness: 0.42 });
      const vase = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 6.5, 17, 20), matCeramicVase);
      vase.position.set(-13, 132, 0);
      vase.castShadow = true;
      shelfGroup.add(vase);

      const vaseSmall = new THREE.Mesh(
        new THREE.SphereGeometry(5.5, 16, 16),
        new THREE.MeshStandardMaterial({ color: PALETTE.cushionMustard, roughness: 0.5 })
      );
      vaseSmall.position.set(11, 128, 0);
      vaseSmall.castShadow = true;
      shelfGroup.add(vaseSmall);

      this.scene.add(shelfGroup);

      // 4. CURVED BRASS GOOSENECK FLOOR LAMP (Left corner)
      const lampGroup = new THREE.Group();
      lampGroup.position.set(-110, 0, -90);

      const matBrass = new THREE.MeshStandardMaterial({ color: PALETTE.lampBrass, roughness: 0.28, metalness: 0.85 });
      const matShade = new THREE.MeshStandardMaterial({
        color: PALETTE.lampShade,
        roughness: 0.35,
        emissive: 0xFFDC99,
        emissiveIntensity: 0.8
      });

      const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(13, 15, 2.8, 24), matBrass);
      lampBase.position.y = 1.4;
      lampBase.castShadow = true;
      lampGroup.add(lampBase);

      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 105, 0),
        new THREE.Vector3(12, 145, 0),
        new THREE.Vector3(26, 160, 0),
        new THREE.Vector3(36, 150, 0)
      ]);
      const tubeGeo = new THREE.TubeGeometry(curve, 24, 1.3, 12, false);
      const stemMesh = new THREE.Mesh(tubeGeo, matBrass);
      lampGroup.add(stemMesh);

      const shade = new THREE.Mesh(new THREE.ConeGeometry(11, 13, 24), matShade);
      shade.position.set(36, 146, 0);
      shade.castShadow = true;
      lampGroup.add(shade);

      this.scene.add(lampGroup);

      // 5. POTTED FIG PLANT (Between Armchair and Shelf)
      const plantGroup = new THREE.Group();
      plantGroup.position.set(45, 0, -115);

      const potMat = new THREE.MeshStandardMaterial({ color: PALETTE.plantPot, roughness: 0.72 });
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(13, 10, 22, 24), potMat);
      pot.position.y = 11;
      pot.castShadow = true;
      plantGroup.add(pot);

      const pLeafMat = new THREE.MeshStandardMaterial({ color: PALETTE.plantGreen, roughness: 0.52 });
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(11, 16, 16), pLeafMat);
        leaf.scale.set(0.2, 1.35, 0.75);
        leaf.position.set(Math.cos(angle) * 9, 24 + i * 3.8, Math.sin(angle) * 9);
        leaf.rotation.set(0.38, angle, 0.38);
        leaf.castShadow = true;
        plantGroup.add(leaf);
      }

      this.scene.add(plantGroup);

      // 6. FRAMED BAUHAUS SUN ART (On Curved Wall)
      const frameGroup = new THREE.Group();
      frameGroup.position.set(-25, 150, -155);
      frameGroup.rotation.y = 0.18;

      const frameMat = new THREE.MeshStandardMaterial({ color: PALETTE.furnitureDark, roughness: 0.5 });
      const frameBorder = new THREE.Mesh(new THREE.BoxGeometry(38, 48, 2.2), frameMat);
      frameGroup.add(frameBorder);

      const canvasMat = new THREE.MeshStandardMaterial({ color: PALETTE.rugBase, roughness: 0.85 });
      const canvas = new THREE.Mesh(new THREE.BoxGeometry(33, 43, 1), canvasMat);
      canvas.position.z = 1.1;
      frameGroup.add(canvas);

      const sunArt = new THREE.Mesh(
        new THREE.SphereGeometry(9, 20, 20),
        new THREE.MeshStandardMaterial({ color: PALETTE.blanketTerracotta, roughness: 0.58 })
      );
      sunArt.position.set(0, 3.5, 1.7);
      sunArt.scale.set(1, 1, 0.1);
      frameGroup.add(sunArt);

      this.scene.add(frameGroup);
    }

    // =========================================================================
    // 4. HERO CHARACTER: DORA THE EXPLORER (Uploaded GLB Integration)
    // Model: dora_dora_the_explorer.glb (and /mnt/data/dora_dora_the_explorer.glb)
    // Proportions: 25–35% of visual hero scene height, grounded on oak floor
    // Articulated: Head & eyes & mouth grouped on neck pivot for expressive animation
    // =========================================================================
    loadDoraCharacter() {
      this.character = new THREE.Group();
      this.character.position.copy(CHAR_ORIGIN);
      this.character.rotation.copy(this.charRot);
      this.scene.add(this.character);

      this.characterHead = null;
      this.doraEyes = null;
      this.doraLoaded = false;

      const loader = new THREE.GLTFLoader();
      const glbPath = 'dora_dora_the_explorer.glb';

      loader.load(
        glbPath,
        (gltf) => {
          const model = gltf.scene;

          // Shadow and material enhancements for rich 3D cartoon pop
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

          // Procedurally relax arms from stiff T-pose into natural idle resting pose
          const bodyMesh = model.getObjectByName('Object_2');
          if (bodyMesh && bodyMesh.geometry) {
            this.relaxDoraArms(bodyMesh);
          }

          // Measure raw model dimensions
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          // Scale Dora so she commands 25–35% of the visual hero area (~96 units tall)
          const targetHeight = 96;
          const scale = targetHeight / (size.y || 3.81);
          model.scale.set(scale, scale, scale);

          // Ground feet cleanly at y = 0 and center horizontally
          model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);

          // Articulated Head Rigging for Dora
          // In dora_dora_the_explorer.glb:
          // Node 1 (Dora_fix.obj.cleaner.materialmerger.gles) contains:
          // Object_2 = Body, Object_3 = Eyes, Object_4 = Head, Object_5 = Mouth
          const node1 = model.getObjectByName('Dora_fix.obj.cleaner.materialmerger.gles') || model.children[0]?.children[0];
          const objEyes = model.getObjectByName('Object_3');
          const objHead = model.getObjectByName('Object_4');
          const objMouth = model.getObjectByName('Object_5');

          if (node1 && objHead && objEyes && objMouth) {
            const headPivot = new THREE.Group();
            headPivot.name = 'doraHeadPivot';
            // Neck junction in node1 local coordinates: (0, 0, 2.38)
            headPivot.position.set(0, 0, 2.38);
            node1.add(headPivot);

            // Re-parent head, eyes, mouth into headPivot
            [objHead, objEyes, objMouth].forEach((part) => {
              node1.remove(part);
              part.position.set(0, 0, -2.38);
              headPivot.add(part);
            });

            this.characterHead = headPivot;
            this.doraEyes = objEyes;
          } else {
            this.characterHead = new THREE.Group();
            this.character.add(this.characterHead);
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

    // Procedural arm relaxation from raw static T-pose into natural animated short posture
    relaxDoraArms(bodyMesh) {
      const geo = bodyMesh.geometry;
      const pos = geo.attributes.position;
      if (!pos) return;

      const shoulderZ = 1.70;
      const shoulderX = 0.44;

      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);

        // Only affect arm vertices (above legs z > 0.65)
        if (z > 0.65) {
          if (x > shoulderX) {
            // Left arm: rotate downward
            const dist = x - shoulderX;
            const w = Math.min(Math.max(dist / 0.22, 0), 1);
            const theta = -1.12 * w; // ~64 degrees down
            const dx = x - shoulderX;
            const dz = z - shoulderZ;
            const cosT = Math.cos(theta);
            const sinT = Math.sin(theta);
            pos.setX(i, shoulderX + dx * cosT - dz * sinT);
            pos.setZ(i, shoulderZ + dx * sinT + dz * cosT);
            pos.setY(i, y - 0.08 * w); // slightly forward into natural resting posture
          } else if (x < -shoulderX) {
            // Right arm: rotate downward
            const dist = -x - shoulderX;
            const w = Math.min(Math.max(dist / 0.22, 0), 1);
            const theta = 1.12 * w; // ~64 degrees down
            const dx = x - (-shoulderX);
            const dz = z - shoulderZ;
            const cosT = Math.cos(theta);
            const sinT = Math.sin(theta);
            pos.setX(i, -shoulderX + dx * cosT - dz * sinT);
            pos.setZ(i, shoulderZ + dx * sinT + dz * cosT);
            pos.setY(i, y - 0.08 * w); // slightly forward
          }
        }
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
    }

    // =========================================================================
    // 5. HERO PROPS (Reading Glasses, Ghost Imprint, Glowing Spatial Trail)
    // =========================================================================
    buildHeroProps() {
      // 1. Reading Glasses (The Hero Prop — recognizable, reflective, tactile)
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

      // Temples / Arms
      const templeGeo = new THREE.CylinderGeometry(0.45, 0.45, 10.5, 12);
      const templeL = new THREE.Mesh(templeGeo, matFrame);
      templeL.position.set(-8.4, 0, -5.2);
      templeL.rotation.x = Math.PI * 0.5;
      this.glasses.add(templeL);

      const templeR = new THREE.Mesh(templeGeo, matFrame);
      templeR.position.set(8.4, 0, -5.2);
      templeR.rotation.x = Math.PI * 0.5;
      this.glasses.add(templeR);

      this.glasses.scale.set(1.35, 1.35, 1.35);
      this.glasses.position.set(GLASSES_ORIGIN.x, GLASSES_ORIGIN.y, GLASSES_ORIGIN.z);
      this.glasses.rotation.set(0, 0.28, 0);
      this.scene.add(this.glasses);

      // 2. Personal Lived-in Objects on Side Table (Warm Ceramic Mug + Medicine Box)
      const mugMat = new THREE.MeshStandardMaterial({ color: PALETTE.blanketTerracotta, roughness: 0.62 });
      const mug = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 2.8, 6.5, 24), mugMat);
      mug.position.set(-84, 55, -2);
      mug.castShadow = true;
      this.scene.add(mug);

      const medBox = new THREE.Mesh(new THREE.BoxGeometry(9, 4.5, 6), new THREE.MeshStandardMaterial({ color: 0xFDFBEE, roughness: 0.55 }));
      medBox.position.set(-64, 54, -4);
      medBox.rotation.y = -0.22;
      medBox.castShadow = true;
      this.scene.add(medBox);

      // 3. Ghost Glasses (Translucent Cyan Memory Imprint — 26% opacity)
      this.ghostGlasses = new THREE.Group();
      const matGhost = new THREE.MeshStandardMaterial({
        color: PALETTE.phantomTeal,
        emissive: PALETTE.phantomTealGlow,
        emissiveIntensity: 0.45,
        transparent: true,
        opacity: 0.28,
        roughness: 0.3
      });

      const gRimL = new THREE.Mesh(rimGeo, matGhost);
      gRimL.position.set(-4.8, 0, 0);
      this.ghostGlasses.add(gRimL);

      const gRimR = new THREE.Mesh(rimGeo, matGhost);
      gRimR.position.set(4.8, 0, 0);
      this.ghostGlasses.add(gRimR);

      const gBridge = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 3.2, 12), matGhost);
      gBridge.rotation.z = Math.PI * 0.5;
      this.ghostGlasses.add(gBridge);

      this.ghostGlasses.scale.set(1.35, 1.35, 1.35);
      this.ghostGlasses.position.set(GLASSES_ORIGIN.x, GLASSES_ORIGIN.y, GLASSES_ORIGIN.z);
      this.ghostGlasses.rotation.set(0, 0.28, 0);
      this.ghostGlasses.visible = false;
      this.scene.add(this.ghostGlasses);

      // 4. Highlight Rings (Subtle pulse at origin & destination)
      const ringGeo = new THREE.TorusGeometry(14, 0.75, 16, 36);
      this.highlightGhost = new THREE.Mesh(
        ringGeo,
        new THREE.MeshBasicMaterial({ color: PALETTE.phantomTeal, transparent: true, opacity: 0.65 })
      );
      this.highlightGhost.rotation.x = Math.PI * 0.5;
      this.highlightGhost.position.set(GLASSES_ORIGIN.x, 52, GLASSES_ORIGIN.z);
      this.highlightGhost.visible = false;
      this.scene.add(this.highlightGhost);

      this.highlightMoved = new THREE.Mesh(
        ringGeo,
        new THREE.MeshBasicMaterial({ color: PALETTE.movementAmber, transparent: true, opacity: 0.85 })
      );
      this.highlightMoved.rotation.x = Math.PI * 0.5;
      this.highlightMoved.position.set(GLASSES_DEST.x, GLASSES_DEST.y - 1, GLASSES_DEST.z);
      this.highlightMoved.visible = false;
      this.scene.add(this.highlightMoved);

      // 5. Parabolic Spatial Trail (Luminous golden amber trajectory points)
      this.spatialTrail = new THREE.Group();
      const trailPointsCount = 9;
      const ptGeo = new THREE.SphereGeometry(1.8, 12, 12);
      const ptMat = new THREE.MeshBasicMaterial({ color: PALETTE.movementAmber, transparent: true, opacity: 0.85 });

      for (let i = 0; i < trailPointsCount; i++) {
        const p = (i + 1) / (trailPointsCount + 1);
        const arcY = Math.sin(p * Math.PI) * 44;
        const pt = new THREE.Mesh(ptGeo, ptMat);
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

    // =========================================================================
    // 6. INTERACTIVE STORY & TIMELINE MACHINE
    // =========================================================================
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
      this.charRot.set(0, 0.22, 0);
      this.headRot.set(0, 0, 0);

      this.glasses.position.set(GLASSES_ORIGIN.x, GLASSES_ORIGIN.y, GLASSES_ORIGIN.z);
      this.ghostGlasses.visible = false;
      this.highlightGhost.visible = false;
      this.highlightMoved.visible = false;
      this.spatialTrail.visible = false;

      if (this.roomLights.phantom) this.roomLights.phantom.intensity = 0;
      if (this.characterArmR) this.characterArmR.rotation.set(0, 0, 0);
      if (this.characterMouth) this.characterMouth.rotation.set(0.15, 0, Math.PI * 1.08);

      const isMobile = window.innerWidth < 640;
      if (isMobile) {
        this.targetCamPos.set(10, 115, 340);
        this.targetCamLook.set(4, 58, -15);
        this.targetFov = 36;
      } else {
        this.targetCamPos.copy(CAM_PRESETS.HOME.pos);
        this.targetCamLook.copy(CAM_PRESETS.HOME.target);
        this.targetFov = CAM_PRESETS.HOME.fov;
      }

      if (this.ui.receiptToast) this.ui.receiptToast.classList.remove('visible');
      if (this.ui.captionWrap) this.ui.captionWrap.classList.remove('visible');
      if (this.ui.statusDot) this.ui.statusDot.className = 'live-indicator';
      if (this.ui.statusText) this.ui.statusText.textContent = 'A quiet afternoon at home';
      if (this.ui.captionText) this.ui.captionText.textContent = '';
      if (this.ui.captionSub) this.ui.captionSub.textContent = '';
      if (this.ui.btnLabel) this.ui.btnLabel.textContent = 'See how it works';
      if (this.ui.btnStart) {
        this.ui.btnStart.style.pointerEvents = 'auto';
        this.ui.btnStart.style.opacity = '1';
      }
      if (this.ui.btnReset) this.ui.btnReset.hidden = true;
    }

    easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    updateStoryUI(now) {
      if (!this.isStoryActive) return;
      const s = (now - this.storyStartTime) / 1000;

      if (s < 1.8) {
        if (this.ui.statusText) this.ui.statusText.textContent = 'Peaceful afternoon · Reading glasses on side table';
        if (this.ui.captionText) this.ui.captionText.textContent = 'A home at rest.';
        if (this.ui.captionSub) this.ui.captionSub.textContent = 'Everyday things resting in their familiar places.';
      } else if (s < 4.2) {
        if (this.ui.statusText) this.ui.statusText.textContent = 'Object moved unnoticed';
        if (this.ui.captionText) this.ui.captionText.textContent = 'An everyday displacement occurs.';
        if (this.ui.captionSub) this.ui.captionSub.textContent = 'Glasses shift across the room without conscious memory.';
      } else if (s < 7.5) {
        if (this.ui.statusText) this.ui.statusText.textContent = 'Searching for glasses...';
        if (this.ui.captionText) this.ui.captionText.textContent = '“Where did I leave my glasses?”';
        if (this.ui.captionSub) this.ui.captionSub.textContent = 'Checking the side table, armchair, and floor.';
      } else if (s < 10.5) {
        if (this.ui.statusText) this.ui.statusText.textContent = 'PHANTOM Spatial Memory Activated';
        if (this.ui.captionText) this.ui.captionText.textContent = 'Your home remembers.';
        if (this.ui.captionSub) this.ui.captionSub.textContent = 'Translucent imprint marks origin. Golden trajectory points to bookshelf.';
        if (this.ui.receiptToast) this.ui.receiptToast.classList.add('visible');
      } else if (s < 13.5) {
        if (this.ui.statusText) this.ui.statusText.textContent = 'Found on Bookshelf Shelf 2';
        if (this.ui.captionText) this.ui.captionText.textContent = 'Relief restored.';
        if (this.ui.captionSub) this.ui.captionSub.textContent = 'Displaced 240 cm · 99.4% confidence';
      } else {
        if (this.ui.statusText) this.ui.statusText.textContent = 'SMRITI — Memory Restored';
        if (this.ui.captionText) this.ui.captionText.textContent = '“Sometimes you don’t need a search. You need a memory.”';
        if (this.ui.captionSub) this.ui.captionSub.textContent = 'SMRITI · Spatial memory for everyday life';
        if (this.ui.btnReset) this.ui.btnReset.hidden = false;
        if (this.ui.btnLabel) this.ui.btnLabel.textContent = 'Replay Story';
        if (this.ui.btnStart) {
          this.ui.btnStart.style.pointerEvents = 'auto';
          this.ui.btnStart.style.opacity = '1';
        }
      }

      setTimeout(() => this.updateStoryUI(performance.now()), 250);
    }

    // =========================================================================
    // 7. MULTI-PHASE ORGANIC IDLE & STORY ANIMATION LOOP
    // =========================================================================
    animate(now) {
      requestAnimationFrame(this.animate);

      // Smooth Mouse Parallax
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

      // Realistic Natural Eyelid Blinking for Dora
      if (now - this.lastBlinkTime > this.nextBlinkInterval) {
        this.lastBlinkTime = now;
        this.nextBlinkInterval = 2800 + Math.random() * 2400; // Unpredictable natural blinking
        if (this.doraEyes) {
          this.doraEyes.scale.y = 0.08;
          setTimeout(() => {
            if (this.doraEyes) this.doraEyes.scale.y = 1.0;
          }, 120);
        }
      }

      const isMobile = window.innerWidth < 640;

      if (!this.isStoryActive) {
        // ================= MULTI-STEP 16s IDLE CYCLE =================
        const t = (now % 16000) / 1000;
        
        // Gentle diaphragm breathing
        const breath = Math.sin(now * 0.0024) * 0.45;
        this.charPos.y = breath;

        if (t < 4.0) {
          // Relaxed forward gaze with subtle weight sway
          this.headRot.set(0.02, 0.04 + Math.sin(now * 0.001) * 0.03, 0);
          this.charRot.y = 0.22 + Math.sin(now * 0.0008) * 0.02;
        } else if (t < 7.5) {
          // Glances over at reading glasses on side table
          const f = this.easeInOutCubic(Math.min((t - 4.0) / 1.0, 1));
          this.headRot.set(0.12 * f, -0.42 * f, -0.04 * f);
          this.charRot.y = 0.22 - 0.25 * f;
        } else if (t < 10.5) {
          // Returns gently to center
          const f = this.easeInOutCubic(Math.min((t - 7.5) / 1.0, 1));
          this.headRot.set(0.12 * (1 - f), -0.42 * (1 - f) + 0.04 * f, 0);
          this.charRot.y = -0.03 + 0.25 * f;
        } else if (t < 14.0) {
          // Curious glance toward bookshelf
          const f = this.easeInOutCubic(Math.min((t - 10.5) / 1.0, 1));
          this.headRot.set(0.06 * f, 0.35 * f, 0.03 * f);
          this.charRot.y = 0.22 + 0.15 * f;
        } else {
          // Settles back to resting breath
          const f = this.easeInOutCubic(Math.min((t - 14.0) / 1.0, 1));
          this.headRot.set(0.06 * (1 - f), 0.35 * (1 - f), 0);
          this.charRot.y = 0.37 - 0.15 * f;
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

      } else {
        // ================= CINEMATIC STORY ARC =================
        const elapsed = (now - this.storyStartTime) / 1000;

        // Phase 1: Camera pushes in & character notices glasses (0 to 1.8s)
        if (elapsed < 1.8) {
          const p = this.easeInOutCubic(Math.min(elapsed / 1.4, 1));
          if (!isMobile) {
            this.targetCamPos.copy(CAM_PRESETS.NOTICE.pos);
            this.targetCamLook.copy(CAM_PRESETS.NOTICE.target);
            this.targetFov = CAM_PRESETS.NOTICE.fov;
          }
          this.headRot.set(0.14 * p, -0.48 * p, -0.05 * p);
          this.charRot.y = 0.22 - 0.35 * p;
        }

        // Phase 2: Glasses transit in parabolic arc to Bookshelf (1.8 to 4.2s)
        else if (elapsed < 4.2) {
          this.headRot.set(-0.04, 0.25, 0); // Character looks away

          const transit = (elapsed - 2.0) / 1.6;
          if (transit >= 0 && transit <= 1) {
            const p = this.easeInOutCubic(transit);
            const arcY = Math.sin(p * Math.PI) * 44;
            this.glasses.position.set(
              GLASSES_ORIGIN.x + (GLASSES_DEST.x - GLASSES_ORIGIN.x) * p,
              GLASSES_ORIGIN.y + (GLASSES_DEST.y - GLASSES_ORIGIN.y) * p + arcY,
              GLASSES_ORIGIN.z + (GLASSES_DEST.z - GLASSES_ORIGIN.z) * p
            );
            this.glasses.rotation.y = 0.28 + p * Math.PI * 0.8;
          }
        }

        // Phase 3: The Confused Search (4.2 to 7.5s)
        else if (elapsed < 7.5) {
          this.glasses.position.set(GLASSES_DEST.x, GLASSES_DEST.y, GLASSES_DEST.z);
          if (!isMobile) {
            this.targetCamPos.copy(CAM_PRESETS.SEARCH.pos);
            this.targetCamLook.copy(CAM_PRESETS.SEARCH.target);
            this.targetFov = CAM_PRESETS.SEARCH.fov;
          }

          if (elapsed < 5.6) {
            // Turns to table, realizes glasses are gone!
            const p = this.easeInOutCubic(Math.min((elapsed - 4.2) / 0.9, 1));
            this.headRot.set(0.28 * p, -0.58 * p, -0.2 * p); // Puzzled head tilt
            this.charRot.y = -0.28 * p;
          } else if (elapsed < 6.8) {
            // Scans side to side looking around
            this.headRot.set(0.22, -0.25 + Math.sin(elapsed * 4.5) * 0.3, -0.14);
          } else {
            this.headRot.set(0.12, 0.16, 0.14);
          }
        }

        // Phase 4: SMRITI PHANTOM Spatial Reveal (7.5 to 10.5s)
        else if (elapsed < 10.5) {
          if (!isMobile) {
            this.targetCamPos.copy(CAM_PRESETS.PHANTOM.pos);
            this.targetCamLook.copy(CAM_PRESETS.PHANTOM.target);
            this.targetFov = CAM_PRESETS.PHANTOM.fov;
          }

          // Activate memory imprint & glowing spatial trail
          this.ghostGlasses.visible = true;
          this.highlightGhost.visible = true;
          this.highlightMoved.visible = true;
          this.spatialTrail.visible = true;

          if (this.roomLights.phantom) this.roomLights.phantom.intensity = 1.1;

          const pulse = 1 + Math.sin(now * 0.006) * 0.08;
          this.highlightMoved.scale.set(pulse, pulse, pulse);
          this.highlightGhost.scale.set(pulse, pulse, pulse);

          this.headRot.set(0.18, -0.45, 0); // Looking at the ghost origin
        }

        // Phase 5: Spotting Bookshelf & Relief (10.5 to 13.5s)
        else if (elapsed < 13.5) {
          const p = this.easeInOutCubic(Math.min((elapsed - 10.5) / 1.4, 1));
          if (!isMobile) {
            if (p < 0.55) {
              this.targetCamPos.copy(CAM_PRESETS.REVEAL.pos);
              this.targetCamLook.copy(CAM_PRESETS.REVEAL.target);
              this.targetFov = CAM_PRESETS.REVEAL.fov;
            } else {
              this.targetCamPos.copy(CAM_PRESETS.DISCOVER.pos);
              this.targetCamLook.copy(CAM_PRESETS.DISCOVER.target);
              this.targetFov = CAM_PRESETS.DISCOVER.fov;
            }
          }

          this.headRot.set(0.18 * (1 - p) + 0.05 * p, -0.45 * (1 - p) + 0.55 * p, 0);
          this.charRot.y = -0.28 * (1 - p) + 0.38 * p;

          this.charPos.x = CHAR_ORIGIN.x + 16 * p;
          this.charPos.z = CHAR_ORIGIN.z - 10 * p;
          this.charPos.y = Math.sin(p * Math.PI * 3) * 1.3; // Happy little stepping bounce
        }

        // Phase 6: Resolution & Peace (13.5s+)
        else {
          if (!isMobile) {
            this.targetCamPos.copy(CAM_PRESETS.RESOLVE.pos);
            this.targetCamLook.copy(CAM_PRESETS.RESOLVE.target);
            this.targetFov = CAM_PRESETS.RESOLVE.fov;
          } else {
            this.targetCamPos.set(10, 115, 340);
            this.targetCamLook.set(4, 58, -15);
          }

          const happyBob = Math.sin(now * 0.003) * 0.5;
          this.charPos.y = happyBob;
          this.headRot.set(-0.04, 0.38 + Math.sin(now * 0.001) * 0.05, 0);
        }
      }

      // Apply animated transforms
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
      this.camera.position.x += (this.targetCamPos.x + this.mouse.x * 16 - this.camera.position.x) * camLerp;
      this.camera.position.y += (this.targetCamPos.y - this.mouse.y * 10 - this.camera.position.y) * camLerp;
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

      const isMobile = window.innerWidth < 640;
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

    findGlasses() {
      if (!this.isStoryActive) {
        this.startStory();
      }
    }

    scrubRealityDiff(progress) {
      if (this.isStoryActive) return;
      const p = this.easeInOutCubic(Math.max(0, Math.min(progress, 1)));
      const arcY = Math.sin(p * Math.PI) * 44;
      this.glasses.position.set(
        GLASSES_ORIGIN.x + (GLASSES_DEST.x - GLASSES_ORIGIN.x) * p,
        GLASSES_ORIGIN.y + (GLASSES_DEST.y - GLASSES_ORIGIN.y) * p + arcY,
        GLASSES_ORIGIN.z + (GLASSES_DEST.z - GLASSES_ORIGIN.z) * p
      );
      this.glasses.rotation.y = 0.28 + p * Math.PI * 0.8;

      if (p > 0.05) {
        this.ghostGlasses.visible = true;
        this.highlightGhost.visible = true;
        this.highlightMoved.visible = p > 0.85;
        this.spatialTrail.visible = true;
        if (this.roomLights.phantom) this.roomLights.phantom.intensity = p * 0.9;
      } else {
        this.ghostGlasses.visible = false;
        this.highlightGhost.visible = false;
        this.highlightMoved.visible = false;
        this.spatialTrail.visible = false;
        if (this.roomLights.phantom) this.roomLights.phantom.intensity = 0;
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
