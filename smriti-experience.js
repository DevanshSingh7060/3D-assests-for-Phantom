/**
 * SMRITI — Spatial Memory Web Experience Engine (v4.1 Final Polish)
 * ----------------------------------------------------------------------------
 * Integrates:
 * - 3D Assets: Dora (GLB), small_table.glb, sofa.glb, plant_with_pot.glb
 * - Exact physical surface contact calculations (Zero penetration, zero floating)
 * - Soft radial-gradient contact shadows (Zero harsh bounding boxes)
 * - Harmonized warm palette (Terracotta-caramel sofa, oak table, organic green plant)
 * - Authoritative single-source-of-truth glasses state machine
 * - Smartphone prop facing Dora's face with live OLED canvas UI & soft facial glow
 * - Real character root motion translation & directional walking to bookshelf
 * - Physical hand-object reach and pickup synchronization
 * - Translucent PHANTOM spatial scan & 26% memory ghost imprint at exact table origin
 * - Multi-state CTA button: See how it works -> Playing… -> Story complete ✓ -> Replay story ↻
 * - High-contrast warm editorial color palette
 */

(function() {
  'use strict';

  // 70 / 20 / 10 Master Palette Constants (High-Contrast Warm Editorial)
  const PALETTE = {
    // 70% Architectural Warmth
    bg: 0xFAEBD5,              // Light cream canvas (#FAEBD5)
    wallPlaster: 0xF2D7B5,     // Warm plaster wall (#F2D7B5)
    floorWood: 0x8B6042,       // Rich walnut/caramel oak floor (#8B6042)
    floorPlankDark: 0x5C381E,  // Dark parquet inlay (#5C381E)
    rugBase: 0xFAEBD5,         // Organic pebble rug (#FAEBD5)
    rugBorder: 0xDECAB0,       // Woven border

    // 20% Character & Furniture Anchors
    charSweater: 0x53613B,     // Deep Olive Knit (#53613B)
    charCollar: 0x3B4628,      // Deep Olive Ribbed Trim
    charAccent: 0xC95F3D,      // Terracotta Accent (#C95F3D)
    charPants: 0xFAEBD5,       // Warm Cream Linen Trousers (#FAEBD5)
    charShoes: 0x34251F,       // Dark Brown Loafers (#34251F)
    charHair: 0x2A1C16,        // Deep Espresso Hair
    charSkin: 0xF7CBB6,        // Warm Peach Skin with Subsurface Glow
    charBlush: 0xE06E50,       // Soft Coral Cheeks

    furnitureWood: 0x8B6042,   // Rich warm wood (#8B6042)
    furnitureDark: 0x34251F,   // Dark brown (#34251F)
    armchairFabric: 0xA65F38,  // Warm Terracotta/Caramel Armchair (#A65F38)
    blanketTerracotta: 0xC95F3D,// Terracotta Throw (#C95F3D)
    cushionMustard: 0xD5A63C,  // Warm Velvet Mustard (#D5A63C)
    lampBrass: 0xC8A050,       // Brushed Warm Brass
    lampShade: 0xFDF6E8,       // Fluted Parchment Shade
    plantGreen: 0x53613B,      // Deep Olive Foliage (#53613B)
    plantDeep: 0x364024,       // Deep Olive Shadow Foliage
    plantPot: 0xC95F3D,        // Warm Terracotta Planter (#C95F3D)

    // 10% PHANTOM Story Accents
    glassesFrame: 0x34251F,    // Dark Espresso Frame (#34251F)
    glassesBridge: 0xD5A63C,   // Warm Gold Bridge (#D5A63C)
    phantomTeal: 0x4D9D91,     // SMRITI Memory Teal (#4D9D91)
    phantomTealGlow: 0x65B5A9, // Luminous Recall Shimmer
    movementAmber: 0xD5A63C,   // Spatial Trajectory Mustard/Amber (#D5A63C)
    confirmGreen: 0x53613B     // Verified Memory Green (#53613B)
  };

  // World Anchors & Physical Surfaces
  const CHAR_ORIGIN = { x: 4, y: 0, z: 10 };
  const DORA_SHELF_POS = { x: 78, y: 0, z: -66 }; // Destination in front of bookshelf shelf 2

  // Cinematic Camera Choreography
  const CAM_PRESETS = {
    HOME:          { pos: { x: 50, y: 110, z: 275 }, target: { x: 4, y: 54, z: -10 }, fov: 31 },
    NOTICE:        { pos: { x: 30, y: 94, z: 205 },  target: { x: -25, y: 52, z: 8 },  fov: 28 },
    GLASSES_MOVE:  { pos: { x: 42, y: 102, z: 245 }, target: { x: 10, y: 58, z: -20 }, fov: 30 },
    SEARCH:        { pos: { x: 22, y: 102, z: 220 }, target: { x: -35, y: 52, z: 5 },  fov: 29 },
    PHONE_CHECK:   { pos: { x: 22, y: 88, z: 175 },  target: { x: 6, y: 56, z: 12 },   fov: 26 },
    PHANTOM_SCAN:  { pos: { x: 32, y: 118, z: 295 }, target: { x: 16, y: 56, z: -35 }, fov: 38 },
    MEMORY_REVEAL: { pos: { x: 32, y: 118, z: 295 }, target: { x: 16, y: 56, z: -35 }, fov: 38 },
    NOTICE_SHELF:  { pos: { x: 65, y: 108, z: 245 }, target: { x: 55, y: 60, z: -55 }, fov: 30 },
    WALK_TO_SHELF: { pos: { x: 80, y: 104, z: 215 }, target: { x: 65, y: 60, z: -55 }, fov: 29 },
    APPROACH:      { pos: { x: 74, y: 96, z: 185 },  target: { x: 78, y: 64, z: -68 }, fov: 27 },
    PICKUP:        { pos: { x: 74, y: 96, z: 185 },  target: { x: 78, y: 64, z: -68 }, fov: 27 },
    RELIEF:        { pos: { x: 60, y: 106, z: 250 }, target: { x: 44, y: 58, z: -40 }, fov: 30 }
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

      // Shared Radial Shadow Texture for Soft Realistic Contact Shadows
      this.shadowTexture = null;

      // 3D Subject Handles (Hero Character: Dora GLB)
      this.character = null;
      this.characterHead = null;
      this.doraEyes = null;
      this.doraLoaded = false;
      this.doraModel = null;
      this.doraBodyMesh = null;
      this.baseBodyPositions = null;
      this.rightHandWorldPos = new THREE.Vector3();
      this.leftHandWorldPos = new THREE.Vector3();

      // Explicit Look & Destination Spatial Targets
      this.PHONE_LOOK_TARGET = new THREE.Vector3();
      this.TABLE_LOOK_TARGET = new THREE.Vector3(-78, 48.0, 8);
      this.SHELF_LOOK_TARGET = new THREE.Vector3(104, 83.5, -85);
      this.SHELF_INTERACTION_POINT = new THREE.Vector3(76, 0, -64);

      // Environment 3D GLB Handles
      this.tableGroup = null;
      this.tableTopSurfaceY = 48.0;
      this.sofaGroup = null;
      this.plantGroup = null;
      this.shelfGroup = null;

      // Smartphone Prop Handles
      this.phone = null;
      this.phoneCanvas = null;
      this.phoneCtx = null;
      this.phoneTexture = null;
      this.phoneScreenLight = null;

      // Authoritative Glasses State Machine & Physics Handles
      // States: 'GLASSES_TABLE' | 'GLASSES_MOVING' | 'GLASSES_SHELF' | 'GLASSES_HELD'
      this.glassesState = 'GLASSES_TABLE';
      this.glasses = null;
      this.ghostGlasses = null;
      this.glassesTablePos = new THREE.Vector3(-78, 51.5, 8);
      this.glassesTableRot = new THREE.Euler(-0.12, 0.32, -0.05);
      this.glassesShelfPos = new THREE.Vector3(104, 85.2, -85);
      this.glassesShelfRot = new THREE.Euler(-0.12, 0.28, 0);
      this.tableContactShadow = null;
      this.shelfContactShadow = null;
      this.glassesPickedUp = false;

      // PHANTOM Spatial Scan Climax Handles
      this.spatialScanPlane = null;
      this.scanSweepLight = null;
      this.tableSpatialPoints = null;
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

      // Arm FK Pose State (Default natural relaxed asymmetric idle)
      this.currentArmPose = {
        lShoulderRoll: -1.40,
        lShoulderPitch: -0.15,
        lShoulderYaw: 0.05,
        lElbowBend: 0.28,
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

      // UI Handles
      this.ui = {
        overline: document.getElementById('storyStatusText') || document.getElementById('heroOverline'),
        narration: document.getElementById('heroCaptionWrap') || document.getElementById('heroNarration'),
        narrTitle: document.getElementById('heroCaptionText') || document.getElementById('narrationTitle'),
        narrDetail: document.getElementById('heroCaptionSub') || document.getElementById('narrationDetail'),
        note: document.getElementById('memoryReceiptToast') || document.getElementById('heroMemoryNote'),
        cta: document.getElementById('btnStartExperience') || document.getElementById('hero-cta'),
        ctaLabel: document.getElementById('btnExperienceLabel'),
        progress: document.getElementById('heroProgress'),
        progressFill: document.getElementById('storyProgress') || document.getElementById('heroProgressFill'),
        replay: document.getElementById('btnResetExperience') || document.getElementById('heroReplay')
      };

      this.init();
    }

    createRadialShadowTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(36, 23, 16, 0.75)');
      gradient.addColorStop(0.35, 'rgba(36, 23, 16, 0.45)');
      gradient.addColorStop(0.70, 'rgba(36, 23, 16, 0.15)');
      gradient.addColorStop(1.0, 'rgba(36, 23, 16, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    }

    init() {
      // 1. Scene with Warm Canvas Atmosphere
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(PALETTE.bg);
      this.scene.fog = new THREE.FogExp2(PALETTE.bg, 0.0006);

      this.shadowTexture = this.createRadialShadowTexture();

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
      this.renderer.toneMappingExposure = 1.05;

      this.container.appendChild(this.renderer.domElement);

      // 3. Assemble Organic Environment & Import 3D Assets
      this.setupCinematicLighting();
      this.buildOrganicEnvironment();
      this.loadSmallTable();
      this.loadSofa();
      this.loadPlant();
      this.buildBookshelf();
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

      // Auto-start if requested in URL
      if (window.location.search.includes('story=true') || window.location.hash === '#story') {
        setTimeout(() => this.startStory(), 1400);
      }

      this.animate = this.animate.bind(this);
      requestAnimationFrame(this.animate);
    }

    // =========================================================================
    // 1. CINEMATIC LIGHTING (Warm sunlight, soft bounce, rim light, PHANTOM layer)
    // =========================================================================
    setupCinematicLighting() {
      const ambient = new THREE.AmbientLight(0xFFE5D0, 0.42);
      this.scene.add(ambient);
      this.roomLights.ambient = ambient;

      // Key Warm Sunlight
      const sun = new THREE.DirectionalLight(0xFFF2E2, 1.35);
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
      const windowFill = new THREE.DirectionalLight(0xF5DEC0, 0.50);
      windowFill.position.set(-150, 130, 80);
      this.scene.add(windowFill);
      this.roomLights.fill = windowFill;

      // Character Backlight / Rim
      const rimLight = new THREE.DirectionalLight(0xFFE8D6, 0.60);
      rimLight.position.set(-30, 140, -180);
      this.scene.add(rimLight);
      this.roomLights.rim = rimLight;

      // PHANTOM Teal Spatial Memory Light
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
      const lineMat = new THREE.MeshBasicMaterial({ color: PALETTE.floorPlankDark, opacity: 0.40, transparent: true });
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
    // 3. IMPORTED 3D GLB ASSETS (small_table.glb, sofa.glb, plant_with_pot.glb)
    // =========================================================================

    // 1. SMALL TABLE (small_table.glb) — Exact surface height calculated dynamically
    loadSmallTable() {
      this.tableGroup = new THREE.Group();
      this.tableGroup.position.set(-78, 0, 8);
      this.scene.add(this.tableGroup);

      const loader = new THREE.GLTFLoader();
      loader.load(
        'small_table.glb',
        (gltf) => {
          const model = gltf.scene;
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          // Table height: ~48 units (waist height relative to Dora's 96)
          const targetHeight = 48.0;
          const scale = targetHeight / (size.y || 0.273);
          model.scale.set(scale, scale, scale);
          model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);

          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                child.material.roughness = 0.46;
                child.material.metalness = 0.04;
                if (child.material.name && child.material.name.toLowerCase().includes('metall')) {
                  child.material.metalness = 0.82;
                  child.material.roughness = 0.32;
                }
                child.material.needsUpdate = true;
              }
            }
          });

          this.tableGroup.add(model);
          this.tableTopSurfaceY = targetHeight; // Top tabletop surface height in world

          // Soft Radial Contact Shadow under table base
          const tableFloorShadow = new THREE.Mesh(
            new THREE.PlaneGeometry(42, 42),
            new THREE.MeshBasicMaterial({ map: this.shadowTexture, transparent: true, opacity: 0.55, depthWrite: false })
          );
          tableFloorShadow.rotation.x = -Math.PI * 0.5;
          tableFloorShadow.position.set(0, 0.04, 0);
          this.tableGroup.add(tableFloorShadow);

          // Recalculate glasses placement with exact table dimensions
          this.updateGlassesPlacement();
        },
        undefined,
        (err) => console.error('Error loading small_table.glb:', err)
      );
    }

    // 2. SOFA (sofa.glb) — Sits on floor with warm terracotta/caramel upholstery
    loadSofa() {
      this.sofaGroup = new THREE.Group();
      this.sofaGroup.position.set(-48, 0, -38);
      this.sofaGroup.rotation.y = 0.40;
      this.scene.add(this.sofaGroup);

      const loader = new THREE.GLTFLoader();
      loader.load(
        'sofa.glb',
        (gltf) => {
          const model = gltf.scene;
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          // Sofa height: ~58 units (hip/backrest scale relative to Dora's 96)
          const targetHeight = 58.0;
          const scale = targetHeight / (size.y || 0.793);
          model.scale.set(scale, scale, scale);
          model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);

          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                // Harmonized warm caramel/terracotta upholstery (Unbind dark green GLB base texture)
                child.material.map = null;
                child.material.color = new THREE.Color(PALETTE.armchairFabric);
                child.material.roughness = 0.76;
                child.material.metalness = 0.02;
                child.material.needsUpdate = true;
              }
            }
          });

          this.sofaGroup.add(model);

          // Soft Radial Contact Shadow under sofa
          const sofaShadow = new THREE.Mesh(
            new THREE.PlaneGeometry(size.x * scale * 1.15, size.z * scale * 1.15),
            new THREE.MeshBasicMaterial({ map: this.shadowTexture, transparent: true, opacity: 0.58, depthWrite: false })
          );
          sofaShadow.rotation.x = -Math.PI * 0.5;
          sofaShadow.position.set(0, 0.04, 0);
          this.sofaGroup.add(sofaShadow);
        },
        undefined,
        (err) => console.error('Error loading sofa.glb:', err)
      );
    }

    // 3. PLANT WITH POT (plant_with_pot.glb) — Sits on floor, rich foliage
    loadPlant() {
      this.plantGroup = new THREE.Group();
      // Positioned at z = -52 (safely behind Dora's walk path from (4,10) to (78,-66))
      this.plantGroup.position.set(32, 0, -52);
      this.scene.add(this.plantGroup);

      const loader = new THREE.GLTFLoader();
      loader.load(
        'plant_with_pot.glb',
        (gltf) => {
          const model = gltf.scene;
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          // Plant height: ~54 units (natural midground foliage)
          const targetHeight = 54.0;
          const scale = targetHeight / (size.y || 4.46);
          model.scale.set(scale, scale, scale);
          model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);

          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                if (child.name.toLowerCase().includes('pot') || (child.material.name && child.material.name.includes('Material.002'))) {
                  child.material.color = new THREE.Color(PALETTE.plantPot);
                  child.material.roughness = 0.65;
                } else {
                  child.material.color = new THREE.Color(PALETTE.plantGreen);
                  child.material.roughness = 0.52;
                }
                child.material.needsUpdate = true;
              }
            }
          });

          this.plantGroup.add(model);

          // Soft Radial Contact Shadow under pot
          const potShadow = new THREE.Mesh(
            new THREE.PlaneGeometry(28, 28),
            new THREE.MeshBasicMaterial({ map: this.shadowTexture, transparent: true, opacity: 0.55, depthWrite: false })
          );
          potShadow.rotation.x = -Math.PI * 0.5;
          potShadow.position.set(0, 0.04, 0);
          this.plantGroup.add(potShadow);
        },
        undefined,
        (err) => console.error('Error loading plant_with_pot.glb:', err)
      );
    }

    // 4. ARCHED MODERN BOOKSHELF (Shelf 2 top surface at y = 83.5)
    buildBookshelf() {
      this.shelfGroup = new THREE.Group();
      this.shelfGroup.position.set(104, 0, -85);

      const matShelfWood = new THREE.MeshStandardMaterial({ color: PALETTE.furnitureWood, roughness: 0.52 });
      const uprightGeo = new THREE.BoxGeometry(3.5, 145, 30);
      const uprightL = new THREE.Mesh(uprightGeo, matShelfWood);
      uprightL.position.set(-30, 72.5, 0);
      uprightL.castShadow = true;
      this.shelfGroup.add(uprightL);

      const uprightR = new THREE.Mesh(uprightGeo, matShelfWood);
      uprightR.position.set(30, 72.5, 0);
      uprightR.castShadow = true;
      this.shelfGroup.add(uprightR);

      const shelfCrown = new THREE.Mesh(new THREE.CylinderGeometry(31.5, 31.5, 30, 24, 1, false, 0, Math.PI), matShelfWood);
      shelfCrown.position.set(0, 145, 0);
      shelfCrown.rotation.z = Math.PI * 0.5;
      shelfCrown.rotation.y = Math.PI * 0.5;
      shelfCrown.castShadow = true;
      this.shelfGroup.add(shelfCrown);

      [40, 82, 122].forEach((yPos) => {
        const shelfSlab = new THREE.Mesh(new THREE.BoxGeometry(58, 3, 28), matShelfWood);
        shelfSlab.position.set(0, yPos, 0);
        shelfSlab.receiveShadow = true;
        this.shelfGroup.add(shelfSlab);
      });

      // Books on Shelf 2 (Leaving open landing space for glasses at x = 0, z = 0)
      const bookColors = [PALETTE.blanketTerracotta, PALETTE.phantomTeal, PALETTE.cushionMustard, PALETTE.charSweater, 0x8C567A];
      [
        { x: -22, h: 25, w: 5.5, d: 19, rotZ: 0, c: bookColors[0] },
        { x: -16, h: 21, w: 5.5, d: 20, rotZ: 0, c: bookColors[1] },
        { x: 16,  h: 24, w: 5.5, d: 19, rotZ: 0, c: bookColors[3] },
        { x: 22,  h: 20, w: 5.5, d: 17, rotZ: -0.12, c: bookColors[4] }
      ].forEach((b) => {
        const bMesh = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), new THREE.MeshStandardMaterial({ color: b.c, roughness: 0.65 }));
        bMesh.position.set(b.x, 82 + b.h / 2, 0);
        bMesh.rotation.z = b.rotZ;
        bMesh.castShadow = true;
        this.shelfGroup.add(bMesh);
      });

      const vase = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 6.5, 17, 20), new THREE.MeshStandardMaterial({ color: PALETTE.rugBase, roughness: 0.42 }));
      vase.position.set(-13, 132, 0);
      vase.castShadow = true;
      this.shelfGroup.add(vase);

      // Soft Radial Contact Shadow under bookshelf
      const shelfShadow = new THREE.Mesh(
        new THREE.PlaneGeometry(74, 38),
        new THREE.MeshBasicMaterial({ map: this.shadowTexture, transparent: true, opacity: 0.58, depthWrite: false })
      );
      shelfShadow.rotation.x = -Math.PI * 0.5;
      shelfShadow.position.set(0, 0.04, 0);
      this.shelfGroup.add(shelfShadow);

      this.scene.add(this.shelfGroup);
    }

    // =========================================================================
    // 4. SMARTPHONE PROP (Held in hand, screen facing Dora, live OLED UI & glow)
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

      // Screen mesh facing -Z (Three.js lookAt points local -Z at target, so screen faces Dora's face directly!)
      const screenMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(3.3, 7.0),
        new THREE.MeshBasicMaterial({ map: this.phoneTexture })
      );
      screenMesh.position.z = -0.25;
      screenMesh.rotation.y = Math.PI;
      this.phone.add(screenMesh);

      // Cyan screen light illuminating Dora's face from the screen surface
      this.phoneScreenLight = new THREE.PointLight(0x5CE1D2, 0.55, 35);
      this.phoneScreenLight.position.set(0, 0, -1.5);
      this.phone.add(this.phoneScreenLight);

      this.scene.add(this.phone);
      this.drawPhoneScreen('IDLE', 'Anchored');
    }

    drawPhoneScreen(state, subtext, progress = 0.84) {
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
      ctx.fillStyle = '#C95F3D';
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
        ctx.fillStyle = 'rgba(83, 97, 59, 0.35)';
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

        ctx.fillStyle = '#C95F3D';
        ctx.font = '600 13px sans-serif';
        ctx.fillText('Side table', 30, 238);

        ctx.fillStyle = '#8E929B';
        ctx.font = '12px sans-serif';
        ctx.fillText('Anchored · 2:10 PM', 30, 264);
      } else if (state === 'SEARCH') {
        ctx.fillStyle = 'rgba(201, 95, 61, 0.35)';
        ctx.beginPath();
        ctx.roundRect(30, 126, 115, 22, 6);
        ctx.fill();
        ctx.fillStyle = '#C95F3D';
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
        ctx.fillText('Scanning room memory...', 30, 252);
      } else if (state === 'SCAN') {
        const isDetect = progress >= 0.96;
        ctx.fillStyle = isDetect ? 'rgba(92, 225, 210, 0.35)' : 'rgba(77, 157, 145, 0.35)';
        ctx.beginPath();
        ctx.roundRect(30, 126, isDetect ? 148 : 130, 22, 6);
        ctx.fill();
        ctx.fillStyle = '#5CE1D2';
        ctx.font = '700 10px sans-serif';
        const pctStr = Math.min(100, Math.round(progress * 100));
        ctx.fillText(isDetect ? 'CHANGE DETECTED' : `SCANNING ${pctStr}%`, 40, 141);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 18px Georgia, serif';
        ctx.fillText(isDetect ? 'Object Relocated' : 'PHANTOM Recall', 30, 182);

        ctx.fillStyle = '#5CE1D2';
        ctx.font = '600 13px sans-serif';
        ctx.fillText(isDetect ? 'New anchor found' : 'Comparing 3D diffs...', 30, 212);

        ctx.fillStyle = '#262C36';
        ctx.fillRect(30, 248, w - 60, 6);
        ctx.fillStyle = '#5CE1D2';
        ctx.fillRect(30, 248, (w - 60) * Math.min(progress, 1.0), 6);
      } else if (state === 'FOUND' || state === 'RESOLVE') {
        ctx.fillStyle = 'rgba(83, 97, 59, 0.40)';
        ctx.beginPath();
        ctx.roundRect(30, 126, 100, 22, 6);
        ctx.fill();
        ctx.fillStyle = '#9ED86E';
        ctx.font = '700 10px sans-serif';
        ctx.fillText('FOUND', 48, 141);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 19px Georgia, serif';
        ctx.fillText('Bookshelf Shelf 2', 30, 182);

        ctx.fillStyle = '#C95F3D';
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
                child.material.side = THREE.DoubleSide; // Fix hair/head backface culling when turning around
                if (child.material.map) {
                  child.material.map.encoding = THREE.sRGBEncoding;
                }
                child.material.needsUpdate = true;
              }
            }
          });

          // 1. FIX NOSE BLACK SPOT ARTIFACT:
          // Remap vertices 1034-1075 on Object_4 to smooth peach facial skin tone (0.3086, 0.6934)
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

          // 2. SETUP FORWARD KINEMATICS ARM RIGGING:
          const bodyMesh = model.getObjectByName('Object_2');
          if (bodyMesh && bodyMesh.geometry) {
            this.setupDoraBodyRig(bodyMesh);
          }

          // 3. SCALE & GROUND DORA:
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          const targetHeight = 96; // 96 units tall
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

          // Soft Radial Contact Shadow under Dora's feet
          const feetShadow = new THREE.Mesh(
            new THREE.PlaneGeometry(32, 24),
            new THREE.MeshBasicMaterial({ map: this.shadowTexture, transparent: true, opacity: 0.52, depthWrite: false })
          );
          feetShadow.rotation.x = -Math.PI * 0.5;
          feetShadow.position.set(0, 0.04, 0);
          this.character.add(feetShadow);

          this.character.add(model);
          this.doraLoaded = true;
        },
        undefined,
        (err) => console.error('Error loading Dora GLB:', err)
      );
    }

    setupDoraBodyRig(bodyMesh) {
      this.doraBodyMesh = bodyMesh;
      const geo = bodyMesh.geometry;
      const pos = geo.attributes.position;
      if (!pos) return;

      this.baseBodyPositions = new Float32Array(pos.array);
      this.updateDoraArms(this.currentArmPose);
    }

    updateDoraArms(config, walkPhase = 0, walkWeight = 0) {
      if (!this.doraBodyMesh || !this.baseBodyPositions) return;
      const geo = this.doraBodyMesh.geometry;
      const posAttr = geo.attributes.position;
      const base = this.baseBodyPositions;
      const count = posAttr.count;

      const pCfg = {
        lShoulderRoll: -1.40,
        lShoulderPitch: -0.15,
        lShoulderYaw: 0.05,
        lElbowBend: 0.28,
        lWristFlex: 0.18,
        rShoulderRoll: -1.02,
        rShoulderPitch: -0.38,
        rShoulderYaw: -0.15,
        rElbowBend: 0.92,
        rWristFlex: 0.32,
        ...config
      };

      const sRollL = pCfg.lShoulderRoll, sPitchL = pCfg.lShoulderPitch, sYawL = pCfg.lShoulderYaw, eBendL = pCfg.lElbowBend, wFlexL = pCfg.lWristFlex;
      const sRollR = pCfg.rShoulderRoll, sPitchR = pCfg.rShoulderPitch, sYawR = pCfg.rShoulderYaw, eBendR = pCfg.rElbowBend, wFlexR = pCfg.rWristFlex;

      const cosRollL = Math.cos(-sRollL), sinRollL = Math.sin(-sRollL);
      const cosPitchL = Math.cos(sPitchL), sinPitchL = Math.sin(sPitchL);
      const cosYawL = Math.cos(sYawL), sinYawL = Math.sin(sYawL);
      const cosEbL = Math.cos(eBendL), sinEbL = Math.sin(eBendL);
      const sinWfL = Math.sin(wFlexL);

      const cosRollR = Math.cos(-sRollR), sinRollR = Math.sin(-sRollR);
      const cosPitchR = Math.cos(sPitchR), sinPitchR = Math.sin(sPitchR);
      const cosYawR = Math.cos(sYawR), sinYawR = Math.sin(sYawR);
      const cosEbR = Math.cos(eBendR), sinEbR = Math.sin(eBendR);
      const sinWfR = Math.sin(wFlexR);

      const sxL = 0.48, syL = -0.02, szL = 2.08;
      const sxR = -0.48, syR = -0.02, szR = 2.08;

      let rHandX = -1.60, rHandY = 0, rHandZ = 2.08;
      let lHandX = 1.60, lHandY = 0, lHandZ = 2.08;

      for (let i = 0; i < count; i++) {
        const ox = base[i * 3];
        const oy = base[i * 3 + 1];
        const oz = base[i * 3 + 2];
        const absX = Math.abs(ox);

        // Bipedal Leg Stride & Step-Lift Kinematics (eliminates sliding!)
        if (absX < 0.38) {
          if (walkWeight > 0.01 && oz < 1.15) {
            const isLeft = ox > 0.04;
            const isRight = ox < -0.04;
            if (isLeft || isRight) {
              const wLeg = Math.min(Math.max((1.15 - oz) / 0.95, 0), 1);
              const smoothW = wLeg * wLeg * (3 - 2 * wLeg);
              // Left & right legs alternate phase by PI (180 deg)
              const stridePhase = isLeft ? walkPhase : walkPhase + Math.PI;
              const sinS = Math.sin(stridePhase);

              // Forward/backward stride: in Dora's GLB negative Y is forward
              const legPitch = sinS * 0.32 * walkWeight * smoothW;
              const newY = oy - legPitch;

              // Ground clearance: swinging foot lifts off floor, stance foot stays firmly grounded
              const lift = Math.max(0, sinS) * 0.16 * walkWeight * smoothW;
              const newZ = oz + lift;

              posAttr.setXYZ(i, ox, newY, newZ);
              continue;
            }
          }
          posAttr.setXYZ(i, ox, oy, oz);
          continue;
        }

        const tArm = Math.min(Math.max((absX - 0.40) / 0.28, 0), 1);
        const wSh = tArm * tArm * (3 - 2 * tArm);
        const wEl = Math.min(Math.max((absX - 0.96) / 0.25, 0), 1);
        const wWr = Math.min(Math.max((absX - 1.36) / 0.18, 0), 1);

        if (ox > 0) {
          // Left Arm (Holding smartphone prop) — Mirrored FK Rigging
          const mox = -ox;
          const dx = mox - sxR;
          const dy = oy - syR;
          const dz = oz - szR;

          const rx = dx * cosRollL - dz * sinRollL;
          let rz = dx * sinRollL + dz * cosRollL;
          const ry = dy * cosPitchL - rz * sinPitchL;
          rz = dy * sinPitchL + rz * cosPitchL;
          const rx2 = rx * cosYawL - ry * sinYawL;
          const ry2 = rx * sinYawL + ry * cosYawL;

          let px = sxR + rx2;
          let py = syR + ry2;
          let pz = szR + rz;

          if (wEl > 0) {
            const distEl = absX - 0.96;
            py -= distEl * sinEbL * 0.95 * wEl;
            pz += distEl * (sinEbL * 0.95 + (1.0 - cosEbL) * 0.35) * wEl;
            px += distEl * sinEbL * 0.28 * wEl;
          }

          if (wWr > 0) {
            const distWr = absX - 1.36;
            py -= distWr * sinWfL * 0.45 * wWr;
            pz += distWr * sinWfL * 0.35 * wWr;
            px += distWr * 0.15 * wWr;
          }

          const finalPx = -px;
          const fx = ox * (1 - wSh) + finalPx * wSh;
          const fy = oy * (1 - wSh) + py * wSh;
          const fz = oz * (1 - wSh) + pz * wSh;
          posAttr.setXYZ(i, fx, fy, fz);

          if (ox > 1.50) {
            lHandX = fx;
            lHandY = fy;
            lHandZ = fz;
          }
        } else {
          // Right Arm (Reaching for & holding reading glasses)
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
            py -= distEl * sinEbR * 0.95 * wEl;
            pz += distEl * (sinEbR * 0.95 + (1.0 - cosEbR) * 0.35) * wEl;
            px += distEl * sinEbR * 0.28 * wEl;
          }

          if (wWr > 0) {
            const distWr = absX - 1.36;
            py -= distWr * sinWfR * 0.45 * wWr;
            pz += distWr * sinWfR * 0.35 * wWr;
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
        const scale = this.doraModel.scale.x;
        const charWorld = this.character.position;
        const charRotY = this.character.rotation.y;
        const cosY = Math.cos(charRotY);
        const sinY = Math.sin(charRotY);

        // Right Hand (Glasses pickup & hold)
        const rx = rHandX * scale + this.doraModel.position.x;
        const ry = rHandZ * scale + this.doraModel.position.y;
        const rz = -rHandY * scale + this.doraModel.position.z;
        const rwx = charWorld.x + rx * cosY + rz * sinY;
        const rwy = charWorld.y + ry;
        const rwz = charWorld.z - rx * sinY + rz * cosY;
        this.rightHandWorldPos.set(rwx, rwy, rwz);

        // Left Hand (Smartphone prop)
        const lx = lHandX * scale + this.doraModel.position.x;
        const ly = lHandZ * scale + this.doraModel.position.y;
        const lz = -lHandY * scale + this.doraModel.position.z;
        const lwx = charWorld.x + lx * cosY + lz * sinY;
        const lwy = charWorld.y + ly;
        const lwz = charWorld.z - lx * sinY + lz * cosY;
        this.leftHandWorldPos.set(lwx, lwy, lwz);
      }
    }

    // =========================================================================
    // 6. HERO PROPS & ZERO-CLIPPING PHYSICAL PLACEMENT ENGINE
    // =========================================================================
    buildHeroProps() {
      // 1. Reading Glasses (Realistic spectacles scale ~0.85)
      this.glasses = new THREE.Group();
      const matFrame = new THREE.MeshStandardMaterial({
        color: PALETTE.glassesFrame,
        roughness: 0.35,
        metalness: 0.20
      });
      const matBridge = new THREE.MeshStandardMaterial({
        color: PALETTE.glassesBridge,
        roughness: 0.25,
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

      // Human-scale proportions: 0.85 scale fits realistically on table and in hand
      this.glasses.scale.set(0.85, 0.85, 0.85);
      this.scene.add(this.glasses);

      // 2. Physical Soft Contact Shadows (Zero Penetration, Zero Floating)
      const shadowMatTable = new THREE.MeshBasicMaterial({
        map: this.shadowTexture,
        transparent: true,
        opacity: 0.55,
        depthWrite: false
      });
      this.tableContactShadow = new THREE.Mesh(new THREE.PlaneGeometry(16, 12), shadowMatTable);
      this.tableContactShadow.rotation.x = -Math.PI * 0.5;
      this.scene.add(this.tableContactShadow);

      const shadowMatShelf = new THREE.MeshBasicMaterial({
        map: this.shadowTexture,
        transparent: true,
        opacity: 0.0,
        depthWrite: false
      });
      this.shelfContactShadow = new THREE.Mesh(new THREE.PlaneGeometry(16, 12), shadowMatShelf);
      this.shelfContactShadow.rotation.x = -Math.PI * 0.5;
      this.scene.add(this.shelfContactShadow);

      // 3. PHANTOM GHOST GLASSES (Translucent Memory Imprint with Living Shimmer)
      this.ghostGlasses = new THREE.Group();
      const matGhost = new THREE.MeshPhysicalMaterial({
        color: 0x6EE7DF,
        roughness: 0.14,
        metalness: 0.08,
        transmission: 0.80,
        transparent: true,
        opacity: 0.32,
        emissive: 0x48CAB2,
        emissiveIntensity: 0.55,
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

      const gTempleL = new THREE.Mesh(templeGeo, matGhost);
      gTempleL.position.set(-8.4, 0, -5.2);
      gTempleL.rotation.x = Math.PI * 0.5;
      this.ghostGlasses.add(gTempleL);

      const gTempleR = new THREE.Mesh(templeGeo, matGhost);
      gTempleR.position.set(8.4, 0, -5.2);
      gTempleR.rotation.x = Math.PI * 0.5;
      this.ghostGlasses.add(gTempleR);

      this.ghostGlasses.scale.set(0.85, 0.85, 0.85);
      this.ghostGlasses.visible = false;
      this.scene.add(this.ghostGlasses);

      // 4. Spatial Highlight Rings & Crosshairs
      this.highlightGhost = this.createSpatialRing(PALETTE.phantomTeal);
      this.highlightGhost.visible = false;
      this.scene.add(this.highlightGhost);

      this.highlightMoved = this.createSpatialRing(PALETTE.movementAmber);
      this.highlightMoved.visible = false;
      this.scene.add(this.highlightMoved);

      // 5. Translucent Full-Room Sweeping Scan Plane (Apple-Grade Spatial Scan)
      const scanCanvas = document.createElement('canvas');
      scanCanvas.width = 256;
      scanCanvas.height = 256;
      const sctx = scanCanvas.getContext('2d');
      const grad = sctx.createLinearGradient(0, 0, 256, 0);
      grad.addColorStop(0.0, 'rgba(92, 225, 210, 0.0)');
      grad.addColorStop(0.70, 'rgba(92, 225, 210, 0.08)');
      grad.addColorStop(0.90, 'rgba(92, 225, 210, 0.32)');
      grad.addColorStop(0.97, 'rgba(168, 248, 240, 0.75)');
      grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.95)');
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, 256, 256);
      sctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      sctx.lineWidth = 1;
      for (let y = 0; y < 256; y += 16) {
        sctx.beginPath();
        sctx.moveTo(0, y);
        sctx.lineTo(256, y);
        sctx.stroke();
      }
      const scanTex = new THREE.CanvasTexture(scanCanvas);
      scanTex.wrapS = THREE.ClampToEdgeWrapping;
      scanTex.wrapT = THREE.ClampToEdgeWrapping;

      const scanMat = new THREE.MeshBasicMaterial({
        map: scanTex,
        transparent: true,
        opacity: 0.42,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      this.spatialScanPlane = new THREE.Mesh(new THREE.PlaneGeometry(160, 140), scanMat);
      this.spatialScanPlane.rotation.y = Math.PI * 0.5;
      this.spatialScanPlane.position.set(0, 60, 0);
      this.spatialScanPlane.visible = false;
      this.scene.add(this.spatialScanPlane);

      // Dynamic Cyan Sweep Light (Moves across room with scan plane, illuminating objects)
      this.scanSweepLight = new THREE.PointLight(0x5CE1D2, 0.0, 120);
      this.scanSweepLight.position.set(0, 60, 0);
      this.scene.add(this.scanSweepLight);

      // 6. Floating Spatial Markers on Side Table
      this.tableSpatialPoints = new THREE.Group();
      const ptGeo = new THREE.SphereGeometry(0.42, 8, 8);
      const ptMat = new THREE.MeshBasicMaterial({ color: 0x5CE1D2, transparent: true, opacity: 0.85 });
      for (let i = 0; i < 24; i++) {
        const pt = new THREE.Mesh(ptGeo, ptMat);
        const angle = (i / 24) * Math.PI * 2;
        const r = 3.5 + Math.random() * 8.5;
        pt.position.set(
          -78 + Math.cos(angle) * r,
          50.5 + Math.random() * 4.0,
          8 + Math.sin(angle) * r
        );
        pt.userData = {
          baseY: pt.position.y,
          speed: 1.5 + Math.random() * 2.0,
          phase: Math.random() * Math.PI * 2
        };
        this.tableSpatialPoints.add(pt);
      }
      this.tableSpatialPoints.visible = false;
      this.scene.add(this.tableSpatialPoints);

      // 7. Spatial Memory Trajectory Trail (Smooth 3D Catmull-Rom Tube)
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-78, 51.5, 8),
        new THREE.Vector3(-45, 96.0, -15),
        new THREE.Vector3(15, 112.0, -45),
        new THREE.Vector3(75, 98.0, -72),
        new THREE.Vector3(104, 85.2, -85)
      ]);
      const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.42, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: PALETTE.movementAmber,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending
      });
      this.spatialTrail = new THREE.Mesh(tubeGeo, tubeMat);
      this.spatialTrail.visible = false;
      this.scene.add(this.spatialTrail);

      this.updateGlassesPlacement();
    }

    createSpatialRing(color) {
      const g = new THREE.Group();
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(8, 9.2, 32),
        new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.72 })
      );
      ring.rotation.x = -Math.PI * 0.5;
      g.add(ring);

      const crossGeo = new THREE.PlaneGeometry(1.2, 19);
      const crossMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.45 });
      const barH = new THREE.Mesh(crossGeo, crossMat);
      barH.rotation.x = -Math.PI * 0.5;
      g.add(barH);
      const barV = new THREE.Mesh(crossGeo, crossMat);
      barV.rotation.x = -Math.PI * 0.5;
      barV.rotation.z = Math.PI * 0.5;
      g.add(barV);

      return g;
    }

    // Helper: Exact surface height calculation (Zero-penetration logic)
    calculateContactY(object, surfaceY, offset = 0.05) {
      object.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(object);
      const bottomRel = box.min.y - object.position.y;
      return surfaceY - bottomRel + offset;
    }

    updateGlassesPlacement() {
      if (!this.glasses) return;

      const tableSurfaceY = this.tableTopSurfaceY || 48.0;
      const shelf2SurfaceY = 83.5;

      // Calculate contact with natural resting orientation
      this.glasses.rotation.copy(this.glassesTableRot);
      const tableContactY = this.calculateContactY(this.glasses, tableSurfaceY);

      this.glasses.rotation.copy(this.glassesShelfRot);
      const shelfContactY = this.calculateContactY(this.glasses, shelf2SurfaceY);

      this.glassesTablePos.set(-78, tableContactY, 8);
      this.glassesShelfPos.set(104, shelfContactY, -85);

      if (this.tableContactShadow) {
        this.tableContactShadow.position.set(this.glassesTablePos.x, tableSurfaceY + 0.08, this.glassesTablePos.z);
      }
      if (this.shelfContactShadow) {
        this.shelfContactShadow.position.set(this.glassesShelfPos.x, shelf2SurfaceY + 0.08, this.glassesShelfPos.z);
      }

      if (this.ghostGlasses) {
        this.ghostGlasses.position.copy(this.glassesTablePos);
        this.ghostGlasses.rotation.copy(this.glassesTableRot);
        this.ghostGlasses.scale.copy(this.glasses.scale);
      }

      if (this.highlightGhost) {
        this.highlightGhost.position.set(this.glassesTablePos.x, tableSurfaceY + 0.15, this.glassesTablePos.z);
      }
      if (this.highlightMoved) {
        this.highlightMoved.position.set(this.glassesShelfPos.x, shelf2SurfaceY + 0.15, this.glassesShelfPos.z);
      }

      // Rebuild curved spatial trajectory
      if (this.spatialTrail) {
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(this.glassesTablePos.x, this.glassesTablePos.y + 1, this.glassesTablePos.z),
          new THREE.Vector3((this.glassesTablePos.x + this.glassesShelfPos.x) * 0.45, 115, (this.glassesTablePos.z + this.glassesShelfPos.z) * 0.5),
          new THREE.Vector3(this.glassesShelfPos.x, this.glassesShelfPos.y + 1, this.glassesShelfPos.z)
        ]);
        if (this.spatialTrail.geometry) this.spatialTrail.geometry.dispose();
        this.spatialTrail.geometry = new THREE.TubeGeometry(curve, 64, 0.7, 8, false);
      }

      if (!this.isStoryActive || this.glassesState === 'GLASSES_TABLE') {
        this.glasses.position.copy(this.glassesTablePos);
        this.glasses.rotation.copy(this.glassesTableRot);
      }
    }

    // =========================================================================
    // 7. STORY ENGINE & INTERACTIONS
    // =========================================================================
    setupUIListeners() {
      if (this.ui.cta) {
        this.ui.cta.addEventListener('click', () => {
          if (this.ui.cta.classList.contains('replay') || this.ui.cta.classList.contains('complete') || this.currentStoryPhase === 'RESOLVE' || this.currentStoryPhase === 'RELIEF') {
            this.resetStory();
            this.startStory();
          } else if (!this.isStoryActive) {
            this.startStory();
          }
        });
      }
      if (this.ui.replay) {
        this.ui.replay.addEventListener('click', () => {
          this.resetStory();
          this.startStory();
        });
      }
      window.addEventListener('keydown', (e) => {
        if (e.key === 'r' || e.key === 'R') {
          this.resetStory();
          this.startStory();
        }
      });
    }

    startStory() {
      if (this.isStoryActive) return;
      this.isStoryActive = true;
      this.storyStartTime = performance.now();
      this.glassesState = 'GLASSES_TABLE';
      this.glassesPickedUp = false;

      if (this.ui.cta) {
        this.ui.cta.classList.remove('complete', 'replay');
        this.ui.cta.classList.add('playing');
        if (this.ui.ctaLabel) {
          this.ui.ctaLabel.textContent = 'Playing…';
        } else {
          this.ui.cta.innerHTML = 'Playing… <span class="action-arrow">→</span>';
        }
      }
      if (this.ui.progress) this.ui.progress.classList.add('visible');
      if (this.ui.replay) {
        this.ui.replay.classList.remove('visible');
        this.ui.replay.hidden = true;
      }
    }

    resetStory() {
      this.isStoryActive = false;
      this.glassesState = 'GLASSES_TABLE';
      this.glassesPickedUp = false;
      this.currentStoryPhase = 'IDLE';

      this.ghostGlasses.visible = false;
      this.highlightGhost.visible = false;
      this.highlightMoved.visible = false;
      this.spatialTrail.visible = false;
      this.spatialScanPlane.visible = false;
      if (this.tableSpatialPoints) this.tableSpatialPoints.visible = false;
      if (this.scanSweepLight) this.scanSweepLight.intensity = 0;

      this.glasses.position.copy(this.glassesTablePos);
      this.glasses.rotation.copy(this.glassesTableRot);
      if (this.tableContactShadow) this.tableContactShadow.material.opacity = 0.55;
      if (this.shelfContactShadow) this.shelfContactShadow.material.opacity = 0.0;

      this.charPos.copy(CHAR_ORIGIN);
      this.charRot.set(0, 0.22, 0);
      this.headRot.set(0, 0, 0);

      if (this.camera) {
        this.targetCamPos.copy(CAM_PRESETS.HOME.pos);
        this.targetCamLook.copy(CAM_PRESETS.HOME.target);
        this.targetFov = CAM_PRESETS.HOME.fov;
      }

      if (this.roomLights.phantom) this.roomLights.phantom.intensity = 0;
      if (this.phoneScreenLight) this.phoneScreenLight.intensity = 0.2;

      this.drawPhoneScreen('IDLE', 'Anchored');

      if (this.ui.cta) {
        this.ui.cta.classList.remove('playing', 'complete', 'replay');
        if (this.ui.ctaLabel) {
          this.ui.ctaLabel.textContent = 'See how it works';
        } else {
          this.ui.cta.innerHTML = 'See how it works <span class="action-arrow">→</span>';
        }
      }
      if (this.ui.narration) this.ui.narration.classList.remove('visible');
      if (this.ui.narrTitle) this.ui.narrTitle.textContent = '';
      if (this.ui.narrDetail) this.ui.narrDetail.textContent = '';
      if (this.ui.note) this.ui.note.classList.remove('visible');
      if (this.ui.progress) this.ui.progress.classList.remove('visible');
      if (this.ui.replay) {
        this.ui.replay.classList.remove('visible');
        this.ui.replay.hidden = true;
      }
    }

    setHeadLookAt(targetWorldPos, weight = 1.0) {
      if (!this.characterHead) return;
      const headPos = new THREE.Vector3(this.charPos.x, this.charPos.y + 68, this.charPos.z);
      const dx = targetWorldPos.x - headPos.x;
      const dy = targetWorldPos.y - headPos.y;
      const dz = targetWorldPos.z - headPos.z;

      const cosY = Math.cos(-this.charRot.y);
      const sinY = Math.sin(-this.charRot.y);
      const localX = dx * cosY - dz * sinY;
      const localZ = dx * sinY + dz * cosY;

      // In Dora's local frame:
      // localX > 0 is her LEFT (phone hand, bookshelf)
      // localX < 0 is her RIGHT (side table)
      // dy < 0 is DOWN (phone screen, table surface)
      // dy > 0 is UP (shelf 2)
      const targetYaw = Math.atan2(localX, Math.max(localZ, 2.0));
      const horizDist = Math.hypot(localX, localZ);
      const targetPitch = -Math.atan2(dy, Math.max(horizDist, 2.0));

      const clampedYaw = THREE.MathUtils.clamp(targetYaw, -1.15, 1.15);
      const clampedPitch = THREE.MathUtils.clamp(targetPitch, -0.45, 0.65);

      this.headRot.y = this.headRot.y * (1 - weight) + clampedYaw * weight;
      this.headRot.x = this.headRot.x * (1 - weight) + clampedPitch * weight;
      this.headRot.z = 0;

      if (this.doraEyes) {
        this.doraEyes.position.x = THREE.MathUtils.clamp(clampedYaw * 0.045, -0.05, 0.05);
        this.doraEyes.position.z = -2.38 + THREE.MathUtils.clamp(-clampedPitch * 0.035, -0.03, 0.03);
      }
    }

    easeInOutCubic(x) {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    animate(timestamp) {
      requestAnimationFrame(this.animate);
      const now = timestamp || performance.now();

      // Telemetry in document title for reliable headless QA inspection
      if (this.isStoryActive) {
        const el = (now - this.storyStartTime) / 1000;
        document.title = `[SMRITI] t=${el.toFixed(1)}s | ${this.currentStoryPhase} | Dora=(${this.charPos.x.toFixed(0)},${this.charPos.y.toFixed(0)},${this.charPos.z.toFixed(0)}) | G=${this.glassesState}`;
      } else {
        document.title = `[SMRITI] IDLE | G=${this.glassesState}`;
      }

      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.045;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.045;

      // Natural Irregular Blinking Loop
      if (this.doraEyes) {
        if (!this.isBlinking && now - this.lastBlinkTime > this.nextBlinkInterval) {
          this.isBlinking = true;
          this.lastBlinkTime = now;
          this.nextBlinkInterval = 2400 + Math.random() * 3800;
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
        this.glassesState = 'GLASSES_TABLE';
        const t = (now % 16000) / 1000;

        // Subtle breathing & weight shifts
        const breath = Math.sin(now * 0.0022) * 0.42;
        this.charPos.set(CHAR_ORIGIN.x, breath, CHAR_ORIGIN.z);

        // Relaxed natural bilateral arm posture (both arms resting naturally beside hips)
        const armPose = {
          lShoulderRoll: -1.35,
          lShoulderPitch: -0.15 + Math.sin(now * 0.0018) * 0.03,
          lShoulderYaw: 0.05,
          lElbowBend: 0.32,
          lWristFlex: 0.22,
          rShoulderRoll: -1.35,
          rShoulderPitch: -0.15 + Math.cos(now * 0.0016) * 0.03,
          rShoulderYaw: -0.05,
          rElbowBend: 0.28,
          rWristFlex: 0.18
        };

        if (t < 4.5) {
          this.headRot.set(0.02, 0.04 + Math.sin(now * 0.001) * 0.03, 0);
          this.charRot.y = 0.22 + Math.sin(now * 0.0008) * 0.02;
        } else if (t < 8.0) {
          const f = this.easeInOutCubic(Math.min((t - 4.5) / 1.2, 1));
          this.headRot.set(0.12 * f, -0.42 * f, -0.04 * f);
          this.charRot.y = 0.22 - 0.22 * f;
        } else if (t < 11.5) {
          const f = this.easeInOutCubic(Math.min((t - 8.0) / 1.2, 1));
          this.headRot.set(0.12 * (1 - f), -0.42 * (1 - f) + 0.04 * f, 0);
          this.charRot.y = 0.0 + 0.22 * f;
        } else {
          this.headRot.set(0.04, 0.12, 0);
          this.charRot.y = 0.22;
        }

        this.updateDoraArms(armPose);

        // Position phone casually inside left hand at hip
        if (this.phone) {
          this.phone.position.set(this.leftHandWorldPos.x + 0.25, this.leftHandWorldPos.y + 0.85, this.leftHandWorldPos.z + 0.55);
          this.phone.rotation.set(-0.25, -0.15, 0.1);
          if (this.phoneScreenLight) this.phoneScreenLight.intensity = 0.2;
        }

        // Camera HOME
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
        const totalStoryDuration = 29.0;
        const progressPct = Math.min((elapsed / totalStoryDuration) * 100, 100);
        if (this.ui.progressFill) this.ui.progressFill.style.width = `${progressPct}%`;

        // Living shimmer for Ghost Glasses when visible
        if (this.ghostGlasses && this.ghostGlasses.visible) {
          const ghostMat = this.ghostGlasses.children[0]?.material;
          if (ghostMat) {
            ghostMat.emissiveIntensity = 0.45 + Math.sin(now * 0.006) * 0.20;
          }
        }

        // Animate floating spatial points around table
        if (this.tableSpatialPoints && this.tableSpatialPoints.visible) {
          for (let i = 0; i < this.tableSpatialPoints.children.length; i++) {
            const pt = this.tableSpatialPoints.children[i];
            const u = pt.userData;
            pt.position.y = u.baseY + Math.sin(now * 0.003 * u.speed + u.phase) * 1.2;
          }
        }

        // -------------------------------------------------------------
        // STEP 1 — NOTICE GLASSES (0.0s to 2.8s)
        // Camera moves closer; Dora glances at glasses on side table
        // -------------------------------------------------------------
        if (elapsed < 2.8) {
          this.currentStoryPhase = 'NOTICE';
          this.glassesState = 'GLASSES_TABLE';
          const p = this.easeInOutCubic(Math.min(elapsed / 1.8, 1));

          if (!isMobile) {
            this.targetCamPos.copy(CAM_PRESETS.NOTICE.pos);
            this.targetCamLook.copy(CAM_PRESETS.NOTICE.target);
            this.targetFov = CAM_PRESETS.NOTICE.fov;
          }

          // Dora turns head to look at glasses on side table
          this.charRot.y = 0.22 - 0.20 * p;
          this.charPos.set(CHAR_ORIGIN.x, 0, CHAR_ORIGIN.z);
          this.setHeadLookAt(this.TABLE_LOOK_TARGET, p);

          this.updateDoraArms({
            lShoulderRoll: -1.35,
            lShoulderPitch: -0.15,
            lElbowBend: 0.32,
            rShoulderRoll: -1.25,
            rShoulderPitch: -0.22 * p,
            rElbowBend: 0.35
          });

          if (this.phone) {
            this.phone.position.set(this.leftHandWorldPos.x + 0.25, this.leftHandWorldPos.y + 0.85, this.leftHandWorldPos.z + 0.55);
            this.phone.rotation.set(-0.25, -0.15, 0.1);
          }

          if (this.ui.narration && p > 0.3) {
            this.ui.narration.classList.add('visible');
            this.ui.narrTitle.textContent = 'Reading glasses anchored.';
            this.ui.narrDetail.textContent = 'Side table · 2:10 PM';
          }
        }

        // -------------------------------------------------------------
        // STEP 2 — LOOKS AWAY & GLASSES PHYSICAL FLIGHT (2.8s to 6.0s)
        // Dora looks away towards sofa; glasses physically travel to Bookshelf Shelf 2
        // -------------------------------------------------------------
        else if (elapsed < 6.0) {
          this.currentStoryPhase = 'GLASSES_MOVE';
          const pLookAway = this.easeInOutCubic(Math.min((elapsed - 2.8) / 1.2, 1));
          this.charRot.y = 0.02 + 0.25 * pLookAway;
          this.charPos.set(CHAR_ORIGIN.x, 0, CHAR_ORIGIN.z);

          // Head looks away towards living room center
          const lookAwayTarget = new THREE.Vector3(10, 55, 50);
          this.setHeadLookAt(lookAwayTarget, pLookAway);

          if (!isMobile) {
            this.targetCamPos.copy(CAM_PRESETS.GLASSES_MOVE.pos);
            this.targetCamLook.copy(CAM_PRESETS.GLASSES_MOVE.target);
            this.targetFov = CAM_PRESETS.GLASSES_MOVE.fov;
          }

          const flight = (elapsed - 3.1) / 2.2;
          if (flight >= 0 && flight <= 1.0) {
            this.glassesState = 'GLASSES_MOVING';
            const p = this.easeInOutCubic(flight);
            const arcY = Math.sin(p * Math.PI) * 36;

            this.glasses.position.set(
              this.glassesTablePos.x + (this.glassesShelfPos.x - this.glassesTablePos.x) * p,
              this.glassesTablePos.y + (this.glassesShelfPos.y - this.glassesTablePos.y) * p + arcY,
              this.glassesTablePos.z + (this.glassesShelfPos.z - this.glassesTablePos.z) * p
            );
            this.glasses.rotation.set(
              this.glassesTableRot.x + (this.glassesShelfRot.x - this.glassesTableRot.x) * p + 0.15 * Math.sin(p * Math.PI),
              this.glassesTableRot.y + p * Math.PI * 0.85,
              this.glassesTableRot.z + 0.1 * Math.sin(p * Math.PI)
            );

            // Crossfade contact shadows
            this.tableContactShadow.material.opacity = Math.max(0, 0.55 * (1 - p * 2));
            this.shelfContactShadow.material.opacity = Math.max(0, 0.55 * ((p - 0.5) * 2));
          } else if (flight > 1.0) {
            // Damped harmonic settling bounce on shelf
            this.glassesState = 'GLASSES_SHELF';
            const settleT = (flight - 1.0) / 0.25;
            const bounce = Math.sin(settleT * Math.PI * 3) * Math.exp(-settleT * 4) * 0.8;
            this.glasses.position.set(this.glassesShelfPos.x, this.glassesShelfPos.y + Math.max(0, bounce), this.glassesShelfPos.z);
            this.glasses.rotation.copy(this.glassesShelfRot);
            this.tableContactShadow.material.opacity = 0;
            this.shelfContactShadow.material.opacity = 0.55;
          }

          this.updateDoraArms({
            lShoulderRoll: -1.35,
            lShoulderPitch: -0.15,
            lElbowBend: 0.32,
            rShoulderRoll: -1.35,
            rShoulderPitch: -0.15,
            rElbowBend: 0.28
          });

          if (this.phone) {
            this.phone.position.set(this.leftHandWorldPos.x + 0.25, this.leftHandWorldPos.y + 0.85, this.leftHandWorldPos.z + 0.55);
            this.phone.rotation.set(-0.25, -0.15, 0.1);
          }
        }

        // -------------------------------------------------------------
        // STEP 3 — RETURN & PUZZLED SEARCH (6.0s to 9.5s)
        // Dora turns back to side table, finds glasses gone, puzzled search
        // -------------------------------------------------------------
        else if (elapsed < 9.5) {
          this.currentStoryPhase = 'SEARCH';
          this.glassesState = 'GLASSES_SHELF';
          this.charPos.set(CHAR_ORIGIN.x, 0, CHAR_ORIGIN.z);

          if (!isMobile) {
            this.targetCamPos.copy(CAM_PRESETS.SEARCH.pos);
            this.targetCamLook.copy(CAM_PRESETS.SEARCH.target);
            this.targetFov = CAM_PRESETS.SEARCH.fov;
          }

          if (elapsed < 7.4) {
            const p = this.easeInOutCubic((elapsed - 6.0) / 1.4);
            this.charRot.y = 0.27 - 0.42 * p; // turns body towards side table
            this.setHeadLookAt(this.TABLE_LOOK_TARGET, 1.0);

            this.updateDoraArms({
              lShoulderRoll: -1.25,
              lShoulderPitch: -0.22,
              lElbowBend: 0.45,
              rShoulderRoll: -1.15,
              rShoulderPitch: -0.25,
              rElbowBend: 0.35
            });
          } else {
            // Puzzled search scan: head searches around empty table
            const scanW = Math.sin((elapsed - 7.4) * 3.5);
            const searchTarget = new THREE.Vector3(-78 + scanW * 14, 48, 8 + Math.cos(scanW) * 8);
            this.setHeadLookAt(searchTarget, 1.0);

            this.updateDoraArms({
              lShoulderRoll: -1.15,
              lShoulderPitch: -0.32,
              lElbowBend: 0.65,
              rShoulderRoll: -1.15,
              rShoulderPitch: -0.25,
              rElbowBend: 0.35
            });
          }

          if (this.phone) {
            this.phone.position.set(this.leftHandWorldPos.x + 0.2, this.leftHandWorldPos.y + 0.9, this.leftHandWorldPos.z + 0.6);
            this.phone.rotation.set(-0.35, -0.2, 0.15);
          }

          this.drawPhoneScreen('SEARCH', 'Missing');

          if (this.ui.narration) {
            this.ui.narrTitle.textContent = 'Object displaced.';
            this.ui.narrDetail.textContent = 'Side table is empty. Consulting SMRITI...';
          }
        }

        // -------------------------------------------------------------
        // STEP 4 — PHONE CHECK (9.5s to 13.0s)
        // Dedicated PHONE_CHECK state:
        // Torso turns slightly toward phone hand.
        // Left arm bends at elbow, raises phone to chest/chin level.
        // Phone rotates vertically with screen facing Dora at 3/4 angle.
        // Head & eyes dynamically track PHONE_LOOK_TARGET.
        // Subtle cyan facial glow illuminates chin, cheek, and shirt.
        // Progress increments 0% -> 84%.
        // -------------------------------------------------------------
        else if (elapsed < 13.0) {
          this.currentStoryPhase = 'PHONE_CHECK';
          this.glassesState = 'GLASSES_SHELF';
          this.charPos.set(CHAR_ORIGIN.x, 0, CHAR_ORIGIN.z);
          const p = this.easeInOutCubic(Math.min((elapsed - 9.5) / 1.4, 1.0));

          if (!isMobile) {
            this.targetCamPos.copy(CAM_PRESETS.PHONE_CHECK.pos);
            this.targetCamLook.copy(CAM_PRESETS.PHONE_CHECK.target);
            this.targetFov = CAM_PRESETS.PHONE_CHECK.fov;
          }

          // Step 1: Torso turns slightly toward the phone hand
          this.charRot.y = -0.15 * (1 - p) + 0.10 * p;

          // Steps 2 & 3: Phone hand bends at elbow and raises phone to chest level
          this.updateDoraArms({
            lShoulderRoll: -1.22 * p + -1.35 * (1 - p),
            lShoulderPitch: -0.55 * p + -0.18 * (1 - p),
            lShoulderYaw: 0.35 * p,
            lElbowBend: 1.70 * p + 0.38 * (1 - p),
            lWristFlex: 0.32 * p,
            rShoulderRoll: -1.35,
            rShoulderPitch: -0.15,
            rElbowBend: 0.28
          });

          // Step 4 & 5: Phone held vertically, screen on -Z faces Dora at 3/4 angle
          if (this.phone) {
            this.phone.position.set(
              this.leftHandWorldPos.x - 0.25,
              this.leftHandWorldPos.y + 1.2,
              this.leftHandWorldPos.z + 0.8
            );
            const headTarget = new THREE.Vector3(this.charPos.x, this.charPos.y + 68, this.charPos.z);
            this.phone.lookAt(headTarget);
            this.phone.rotateY(0.32); // 3/4 angle so viewer also clearly sees SMRITI OLED UI!

            // Step 6 & 7: Explicit PHONE_LOOK_TARGET positioned slightly above phone screen center
            this.PHONE_LOOK_TARGET.set(
              this.phone.position.x,
              this.phone.position.y + 1.5,
              this.phone.position.z
            );
            this.setHeadLookAt(this.PHONE_LOOK_TARGET, p);
          }

          // Step 9: Subtle phone screen light illuminates lower face, hands, shirt
          if (this.phoneScreenLight) {
            this.phoneScreenLight.intensity = 0.95 * p;
            this.phoneScreenLight.color.setHex(0x5CE1D2);
          }

          // Step 8: Live OLED progress bar rising from 0% to 84%
          const scanProgress = p * 0.84;
          this.drawPhoneScreen('SCAN', `${Math.round(scanProgress * 100)}%`, scanProgress);

          if (this.ui.narration) {
            this.ui.narrTitle.textContent = 'SMRITI scanning room memory...';
            this.ui.narrDetail.textContent = 'Comparing spatial points with past reality';
          }
        }

        // -------------------------------------------------------------
        // STEP 5 — PHANTOM SPATIAL SCAN (13.0s to 16.5s)
        // Visual Climax Moment:
        // Phone hits 100% -> CHANGE DETECTED.
        // Room lighting subtly shifts with controlled teal layer.
        // Translucent wide scan plane sweeps across the entire room (-115 to +115).
        // Dynamic sweep light illuminates table, sofa, Dora, plant, bookshelf.
        // Floating spatial point cloud twinkles around side table.
        // Camera widens to show full panorama.
        // -------------------------------------------------------------
        else if (elapsed < 16.5) {
          this.currentStoryPhase = 'PHANTOM_SCAN';
          this.glassesState = 'GLASSES_SHELF';
          this.charPos.set(CHAR_ORIGIN.x, 0, CHAR_ORIGIN.z);
          const scanP = (elapsed - 13.0) / 3.5;

          if (!isMobile) {
            this.targetCamPos.copy(CAM_PRESETS.PHANTOM_SCAN.pos);
            this.targetCamLook.copy(CAM_PRESETS.PHANTOM_SCAN.target);
            this.targetFov = CAM_PRESETS.PHANTOM_SCAN.fov;
          }

          // Controlled teal layer over warm room lighting
          if (this.roomLights.phantom) this.roomLights.phantom.intensity = 1.35;

          // Wide translucent scan plane sweeps across entire room (-115 to +115)
          this.spatialScanPlane.visible = true;
          this.spatialScanPlane.position.x = -115 + scanP * 230;

          // Dynamic sweep light travels with the scan plane
          if (this.scanSweepLight) {
            this.scanSweepLight.visible = true;
            this.scanSweepLight.position.x = this.spatialScanPlane.position.x;
            this.scanSweepLight.intensity = 2.8 * Math.sin(scanP * Math.PI);
          }

          // Floating spatial markers on side table activate
          if (this.tableSpatialPoints) {
            this.tableSpatialPoints.visible = true;
          }

          // Phone updates to 100% -> CHANGE DETECTED
          const scanProgress = 0.84 + scanP * 0.16;
          this.drawPhoneScreen('SCAN', '100%', scanProgress);

          // Dora's attention transitions from phone towards the side table as scan sweeps
          if (this.phone) {
            this.phone.position.set(
              this.leftHandWorldPos.x - 0.25,
              this.leftHandWorldPos.y + 1.2,
              this.leftHandWorldPos.z + 0.8
            );
            const headTarget = new THREE.Vector3(this.charPos.x, this.charPos.y + 68, this.charPos.z);
            this.phone.lookAt(headTarget);
            this.phone.rotateY(0.32);

            this.PHONE_LOOK_TARGET.set(this.phone.position.x, this.phone.position.y + 1.5, this.phone.position.z);
          }

          if (elapsed < 14.8) {
            this.setHeadLookAt(this.PHONE_LOOK_TARGET, 1.0);
          } else {
            // Head turns to side table as ghost begins to reconstruct
            const turnToTable = this.easeInOutCubic((elapsed - 14.8) / 1.7);
            const blendTarget = this.PHONE_LOOK_TARGET.clone().lerp(this.TABLE_LOOK_TARGET, turnToTable);
            this.setHeadLookAt(blendTarget, 1.0);
          }

          this.updateDoraArms({
            lShoulderRoll: -1.22,
            lShoulderPitch: -0.55,
            lElbowBend: 1.65,
            rShoulderRoll: -1.35,
            rShoulderPitch: -0.15,
            rElbowBend: 0.28
          });

          if (this.ui.narration) {
            this.ui.narrTitle.textContent = 'PHANTOM scan sweep...';
            this.ui.narrDetail.textContent = 'Room geometry registered · Detecting past anchor';
          }
        }

        // -------------------------------------------------------------
        // STEP 6 — MEMORY REVEAL & SIMULTANEOUS OLD + NEW (16.5s to 20.0s)
        // Visual Climax Climax:
        // OLD: Ghost glasses reconstruct on SIDE TABLE at exact origin with shimmer.
        // NEW: Physical glasses visible on BOOKSHELF SHELF 2 simultaneously.
        // Glowing 3D memory trajectory connects OLD -> NEW.
        // Dora's gaze chain of attention: ghost on table -> trail -> shelf!
        // -------------------------------------------------------------
        else if (elapsed < 20.0) {
          this.currentStoryPhase = 'MEMORY_REVEAL';
          this.glassesState = 'GLASSES_SHELF';
          this.charPos.set(CHAR_ORIGIN.x, 0, CHAR_ORIGIN.z);

          if (!isMobile) {
            this.targetCamPos.copy(CAM_PRESETS.MEMORY_REVEAL.pos);
            this.targetCamLook.copy(CAM_PRESETS.MEMORY_REVEAL.target);
            this.targetFov = CAM_PRESETS.MEMORY_REVEAL.fov;
          }

          // Scan plane fades at far side of room
          if (this.spatialScanPlane) this.spatialScanPlane.visible = false;
          if (this.scanSweepLight) this.scanSweepLight.intensity = Math.max(0, 2.0 - (elapsed - 16.5) * 1.5);

          // BOTH OLD AND CURRENT LOCATIONS VISIBLE SIMULTANEOUSLY:
          // 1. Ghost on side table
          this.ghostGlasses.position.copy(this.glassesTablePos);
          this.ghostGlasses.rotation.copy(this.glassesTableRot);
          this.ghostGlasses.visible = true;
          this.highlightGhost.visible = true;

          // 2. Physical glasses on shelf 2
          this.glasses.position.copy(this.glassesShelfPos);
          this.glasses.rotation.copy(this.glassesShelfRot);
          this.glasses.visible = true;
          this.highlightMoved.visible = true;

          // 3. Glowing memory trajectory tube connecting them
          this.spatialTrail.visible = true;

          const pulse = 1 + Math.sin(now * 0.007) * 0.08;
          this.highlightGhost.scale.set(pulse, pulse, pulse);
          this.highlightMoved.scale.set(pulse, pulse, pulse);

          // Dora's chain of attention:
          // 16.5s - 18.0s: looks at ghost on side table
          // 18.0s - 19.2s: gaze follows trajectory across room
          // 19.2s - 20.0s: locks onto shelf 2
          if (elapsed < 18.0) {
            this.setHeadLookAt(this.TABLE_LOOK_TARGET, 1.0);
          } else if (elapsed < 19.2) {
            const trailP = (elapsed - 18.0) / 1.2;
            const trailLook = new THREE.Vector3(
              this.TABLE_LOOK_TARGET.x + (this.SHELF_LOOK_TARGET.x - this.TABLE_LOOK_TARGET.x) * trailP,
              this.TABLE_LOOK_TARGET.y + (this.SHELF_LOOK_TARGET.y - this.TABLE_LOOK_TARGET.y) * trailP + 25 * Math.sin(trailP * Math.PI),
              this.TABLE_LOOK_TARGET.z + (this.SHELF_LOOK_TARGET.z - this.TABLE_LOOK_TARGET.z) * trailP
            );
            this.setHeadLookAt(trailLook, 1.0);
          } else {
            this.setHeadLookAt(this.SHELF_LOOK_TARGET, 1.0);
          }

          // Relax left arm slightly to lower phone toward waist
          const lowerP = Math.min((elapsed - 16.5) / 1.5, 1.0);
          this.updateDoraArms({
            lShoulderRoll: -1.22 * (1 - lowerP) + -1.20 * lowerP,
            lShoulderPitch: -0.55 * (1 - lowerP) + -0.28 * lowerP,
            lElbowBend: 1.65 * (1 - lowerP) + 0.60 * lowerP,
            rShoulderRoll: -1.35,
            rShoulderPitch: -0.15,
            rElbowBend: 0.28
          });

          if (this.phone) {
            this.phone.position.set(this.leftHandWorldPos.x + 0.2, this.leftHandWorldPos.y + 0.8, this.leftHandWorldPos.z + 0.5);
            this.phone.rotation.set(-0.25, 0.20, 0);
          }

          this.drawPhoneScreen('FOUND', 'Bookshelf');

          if (this.ui.narration) {
            this.ui.narrTitle.textContent = 'Memory revealed.';
            this.ui.narrDetail.textContent = 'Glasses moved: Side table → Bookshelf Shelf 2';
          }
        }

        // -------------------------------------------------------------
        // STEP 7 — NOTICE SHELF & TURN BODY (20.0s to 21.5s)
        // Dora locks onto shelf, turns torso toward bookshelf heading (2.45 rad)
        // -------------------------------------------------------------
        else if (elapsed < 21.5) {
          this.currentStoryPhase = 'NOTICE_SHELF';
          this.glassesState = 'GLASSES_SHELF';
          this.charPos.set(CHAR_ORIGIN.x, 0, CHAR_ORIGIN.z);

          if (!isMobile) {
            this.targetCamPos.copy(CAM_PRESETS.NOTICE_SHELF.pos);
            this.targetCamLook.copy(CAM_PRESETS.NOTICE_SHELF.target);
            this.targetFov = CAM_PRESETS.NOTICE_SHELF.fov;
          }

          const turnP = this.easeInOutCubic((elapsed - 20.0) / 1.5);
          // Turn body from 0.22 to walk heading 2.45 rad
          this.charRot.y = 0.22 + (2.45 - 0.22) * turnP;

          this.setHeadLookAt(this.SHELF_LOOK_TARGET, 1.0);

          this.updateDoraArms({
            lShoulderRoll: -1.20,
            lShoulderPitch: -0.28,
            lElbowBend: 0.55,
            rShoulderRoll: -1.35,
            rShoulderPitch: -0.15,
            rElbowBend: 0.30
          });

          if (this.phone) {
            this.phone.position.set(this.leftHandWorldPos.x + 0.2, this.leftHandWorldPos.y + 0.8, this.leftHandWorldPos.z + 0.5);
            this.phone.rotation.set(-0.25, 0.25, 0);
          }
        }

        // -------------------------------------------------------------
        // STEP 8 — REAL CASUAL WALK TO BOOKSHELF (21.5s to 25.2s)
        // Bipedal articulated stride & step-lift (NO SLIDING!).
        // Casual natural walking speed: accelerates, walks, decelerates.
        // Faces walk heading (2.45 rad).
        // Destination: SHELF_INTERACTION_POINT (76, 0, -64).
        // -------------------------------------------------------------
        else if (elapsed < 25.2) {
          this.currentStoryPhase = 'WALK_TO_SHELF';
          this.glassesState = 'GLASSES_SHELF';

          const walkDuration = 3.7;
          const p = this.easeInOutCubic(Math.min((elapsed - 21.5) / walkDuration, 1.0));

          if (!isMobile) {
            this.targetCamPos.copy(CAM_PRESETS.WALK_TO_SHELF.pos);
            this.targetCamLook.copy(CAM_PRESETS.WALK_TO_SHELF.target);
            this.targetFov = CAM_PRESETS.WALK_TO_SHELF.fov;
          }

          // Dora faces walk direction (2.45 rad)
          this.charRot.y = 2.45;

          // Physical root translation from CHAR_ORIGIN to SHELF_INTERACTION_POINT
          this.charPos.x = CHAR_ORIGIN.x + (this.SHELF_INTERACTION_POINT.x - CHAR_ORIGIN.x) * p;
          this.charPos.z = CHAR_ORIGIN.z + (this.SHELF_INTERACTION_POINT.z - CHAR_ORIGIN.z) * p;

          // Bipedal stride frequency & weight
          const walkPhase = (elapsed - 21.5) * 8.0;
          const walkWeight = p < 0.90 ? 1.0 : (1.0 - (p - 0.90) / 0.10);

          // Center of mass vertical bobbing & pelvic roll
          this.charPos.y = walkWeight > 0.05 ? Math.abs(Math.sin(walkPhase)) * 1.3 * walkWeight : 0;
          this.charRot.z = walkWeight > 0.05 ? Math.sin(walkPhase) * 0.025 * walkWeight : 0;

          // Head looks ahead at bookshelf destination
          this.setHeadLookAt(this.SHELF_LOOK_TARGET, 1.0);

          // Alternating arm swing in opposition to stride
          const swing = Math.sin(walkPhase) * 0.32 * walkWeight;
          this.updateDoraArms({
            lShoulderRoll: -1.20,
            lShoulderPitch: -0.28 + Math.sin(walkPhase) * 0.10 * walkWeight,
            lElbowBend: 0.55,
            rShoulderRoll: -1.35,
            rShoulderPitch: -0.15 - swing,
            rElbowBend: 0.32
          }, walkPhase, walkWeight);

          if (this.phone) {
            this.phone.position.set(this.leftHandWorldPos.x + 0.2, this.leftHandWorldPos.y + 0.8, this.leftHandWorldPos.z + 0.5);
            this.phone.rotation.set(-0.25, 0.25, 0);
          }
        }

        // -------------------------------------------------------------
        // STEP 9 — APPROACH & BODY SETTLE (25.2s to 26.2s)
        // Dora arrives at SHELF_INTERACTION_POINT (76, 0, -64).
        // Weight settles harmonically. Torso rotates to face bookshelf (0.35 rad).
        // Head locks onto glasses on shelf 2.
        // -------------------------------------------------------------
        else if (elapsed < 26.2) {
          this.currentStoryPhase = 'APPROACH';
          this.glassesState = 'GLASSES_SHELF';

          if (!isMobile) {
            this.targetCamPos.copy(CAM_PRESETS.APPROACH.pos);
            this.targetCamLook.copy(CAM_PRESETS.APPROACH.target);
            this.targetFov = CAM_PRESETS.APPROACH.fov;
          }

          const settleT = Math.min((elapsed - 25.2) / 1.0, 1.0);
          this.charPos.set(
            this.SHELF_INTERACTION_POINT.x,
            Math.sin(settleT * Math.PI * 2) * Math.exp(-settleT * 4) * 0.35,
            this.SHELF_INTERACTION_POINT.z
          );

          // Torso smoothly turns to face bookshelf (0.35 rad)
          this.charRot.y = 2.45 * (1 - settleT) + 0.35 * settleT;

          this.setHeadLookAt(this.SHELF_LOOK_TARGET, 1.0);

          this.updateDoraArms({
            lShoulderRoll: -1.35,
            lShoulderPitch: -0.15,
            lElbowBend: 0.28,
            rShoulderRoll: -1.35,
            rShoulderPitch: -0.15,
            rElbowBend: 0.28
          }, 0, 0);

          if (this.phone) {
            this.phone.position.set(this.leftHandWorldPos.x + 0.2, this.leftHandWorldPos.y + 0.8, this.leftHandWorldPos.z + 0.5);
            this.phone.rotation.set(-0.25, 0.15, 0);
          }
        }

        // -------------------------------------------------------------
        // STEP 10 — REACH & PICKUP (26.2s to 28.2s)
        // Right hand extends onto shelf 2.
        // Contact moment at 27.2s -> glasses detach from shelf, attach to hand!
        // Dora lifts hand to chest with relieved smile.
        // -------------------------------------------------------------
        else if (elapsed < 28.2) {
          this.currentStoryPhase = 'PICKUP';

          if (!isMobile) {
            this.targetCamPos.copy(CAM_PRESETS.PICKUP.pos);
            this.targetCamLook.copy(CAM_PRESETS.PICKUP.target);
            this.targetFov = CAM_PRESETS.PICKUP.fov;
          }

          this.charPos.set(this.SHELF_INTERACTION_POINT.x, 0, this.SHELF_INTERACTION_POINT.z);
          this.charRot.set(0, 0.35, 0);

          if (elapsed < 27.2) {
            // Reaching phase: right arm extends forward toward shelf 2
            this.glassesState = 'GLASSES_SHELF';
            const reachF = this.easeInOutCubic((elapsed - 26.2) / 1.0);

            this.updateDoraArms({
              lShoulderRoll: -1.35,
              lShoulderPitch: -0.15,
              lElbowBend: 0.28,
              rShoulderRoll: -0.22 * reachF + -1.35 * (1 - reachF),
              rShoulderPitch: -0.92 * reachF + -0.15 * (1 - reachF),
              rElbowBend: 0.42 * reachF + 0.28 * (1 - reachF),
              rWristFlex: 0.20
            });
            this.setHeadLookAt(this.SHELF_LOOK_TARGET, 1.0);
          } else {
            // CONTACT & PICKUP: glasses attach to right hand!
            this.glassesState = 'GLASSES_HELD';
            this.shelfContactShadow.material.opacity = 0;

            const liftF = this.easeInOutCubic((elapsed - 27.2) / 1.0);
            this.updateDoraArms({
              lShoulderRoll: -1.35,
              lShoulderPitch: -0.15,
              lElbowBend: 0.28,
              rShoulderRoll: -0.68 * liftF + -0.22 * (1 - liftF),
              rShoulderPitch: -0.68 * liftF + -0.92 * (1 - liftF),
              rElbowBend: 1.30 * liftF + 0.42 * (1 - liftF),
              rWristFlex: 0.35
            });

            // Relieved happy smile & head tilt
            this.headRot.set(-0.06, 0.28, 0.12 * liftF);
          }

          if (this.phone) {
            this.phone.position.set(this.leftHandWorldPos.x + 0.2, this.leftHandWorldPos.y + 0.8, this.leftHandWorldPos.z + 0.5);
            this.phone.rotation.set(-0.25, 0.15, 0);
          }

          this.drawPhoneScreen('RESOLVE', 'Retrieved');

          if (this.ui.narration) {
            this.ui.narrTitle.textContent = 'Relief restored.';
            this.ui.narrDetail.textContent = 'Displaced 240 cm · 99.4% confidence';
          }
          if (this.ui.note) this.ui.note.classList.add('visible');
        }

        // -------------------------------------------------------------
        // STEP 11 — PEACEFUL RELIEF & MULTI-STATE REPLAY (28.2s+)
        // Calm idle with glasses in hand; warm sunlight restored.
        // Button transitions: "Story complete ✓" -> "Replay story ↻".
        // -------------------------------------------------------------
        else {
          this.currentStoryPhase = 'RELIEF';
          this.glassesState = 'GLASSES_HELD';

          if (!isMobile) {
            this.targetCamPos.copy(CAM_PRESETS.RELIEF.pos);
            this.targetCamLook.copy(CAM_PRESETS.RELIEF.target);
            this.targetFov = CAM_PRESETS.RELIEF.fov;
          }

          if (this.roomLights.phantom) this.roomLights.phantom.intensity = Math.max(0, 1.35 - (elapsed - 28.2) * 0.4);

          const happyBob = Math.sin(now * 0.0025) * 0.35;
          this.charPos.set(this.SHELF_INTERACTION_POINT.x, happyBob, this.SHELF_INTERACTION_POINT.z);
          this.charRot.set(0, 0.35, 0);
          this.headRot.set(-0.04, 0.28 + Math.sin(now * 0.001) * 0.04, 0.08);

          this.updateDoraArms({
            lShoulderRoll: -1.35,
            lShoulderPitch: -0.15,
            lElbowBend: 0.28,
            rShoulderRoll: -0.68,
            rShoulderPitch: -0.68,
            rElbowBend: 1.30
          });

          if (this.phone) {
            this.phone.position.set(this.leftHandWorldPos.x + 0.2, this.leftHandWorldPos.y + 0.8, this.leftHandWorldPos.z + 0.5);
            this.phone.rotation.set(-0.25, 0.15, 0);
          }

          // Multi-state button logic:
          // 28.2s - 30.2s: "Story complete ✓"
          // 30.2s+: "Replay story ↻"
          if (elapsed < 30.2) {
            if (this.ui.cta) {
              this.ui.cta.classList.remove('playing');
              this.ui.cta.classList.add('complete');
              if (this.ui.ctaLabel) {
                this.ui.ctaLabel.textContent = 'Story complete ✓';
              } else {
                this.ui.cta.innerHTML = 'Story complete ✓';
              }
            }
          } else {
            if (this.ui.cta) {
              this.ui.cta.classList.remove('complete');
              this.ui.cta.classList.add('replay');
              if (this.ui.ctaLabel) {
                this.ui.ctaLabel.textContent = 'Replay story ↻';
              } else {
                this.ui.cta.innerHTML = 'Replay story ↻';
              }
            }
            if (this.ui.replay) {
              this.ui.replay.classList.add('visible');
              this.ui.replay.hidden = false;
            }
          }
        }

        // ================= GLASSES STATE MACHINE ENFORCEMENT =================
        if (this.glassesState === 'GLASSES_TABLE') {
          this.glasses.position.copy(this.glassesTablePos);
          this.glasses.rotation.copy(this.glassesTableRot);
        } else if (this.glassesState === 'GLASSES_SHELF') {
          this.glasses.position.copy(this.glassesShelfPos);
          this.glasses.rotation.copy(this.glassesShelfRot);
        } else if (this.glassesState === 'GLASSES_HELD') {
          this.glasses.position.set(this.rightHandWorldPos.x, this.rightHandWorldPos.y + 1.8, this.rightHandWorldPos.z + 1.0);
          this.glasses.rotation.set(-0.25, 0.4, 0.1);
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
          this.characterHead.rotation.z = this.headRot.y; // Positive turns to her LEFT toward phone/shelf!
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

    findGlasses() {
      if (this.currentStoryPhase === 'RESOLVE') {
        this.resetStory();
      }
      this.startStory();
    }

    scrubRealityDiff(ratio) {
      if (this.isStoryActive) return;
      // Gently adjust camera and ghost visibility based on reality diff scrub
      if (this.ghostGlasses) {
        this.ghostGlasses.visible = ratio > 0.45;
      }
      if (this.highlightGhost) {
        this.highlightGhost.visible = ratio > 0.45;
      }
    }
  }

  // Mount on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.smritiApp = new SmritiExperience('spatialViewport');
    });
  } else {
    window.smritiApp = new SmritiExperience('spatialViewport');
  }

  window.SmritiExperience = SmritiExperience;
  window.triggerSmritiStory = () => {
    if (window.smritiApp) {
      window.smritiApp.startStory();
    }
  };
})();
