/**
 * ==============================================================================
 * PHANTOM CORE — THE INTELLIGENCE REVEAL
 * Spatial Intelligence Layer & Ecosystem Architecture
 * ==============================================================================
 */

(function () {
  'use strict';

  // ----------------------------------------------------------------------------
  // 1. SIMPLEX NOISE GLSL SHADER DEFINITION
  // Ashima Arts 3D Simplex Noise for smooth, organic procedural fluid deformation
  // ----------------------------------------------------------------------------
  const SimplexNoiseGLSL = `
    vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);

      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);

      vec3 x1 = x0 - i1 + 1.0 * C.xxx;
      vec3 x2 = x0 - i2 + 2.0 * C.xxx;
      vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

      i = mod(i, 289.0);
      vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));

      float n_ = 0.142857142857;
      vec3  ns = n_ * D.wyz - D.xzx;

      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);

      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);

      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);

      vec4 s0 = floor(b0) * 2.0 + 1.0;
      vec4 s1 = floor(b1) * 2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));

      vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);

      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;

      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
  `;

  // ----------------------------------------------------------------------------
  // 2. PHANTOM CORE EXPERIENCE CLASS
  // ----------------------------------------------------------------------------
  class PhantomCoreExperience {
    constructor() {
      this.isOpen = false;
      this.isStabilized = false;
      this.currentPhase = 0; // 0: closed, 1: Attention Shift, 2: Spatial Collapse, 3: Black-Hole, 4: Emergence, 5: Stabilized
      this.activeNodeId = null;
      this.rafId = null;

      // Interaction coordinates
      this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
      this.isDragging = false;
      this.previousMousePosition = { x: 0, y: 0 };

      // Three.js instances
      this.renderer = null;
      this.scene = null;
      this.camera = null;
      this.blobMesh = null;
      this.blobMaterial = null;
      const THREE = window.THREE;
      this.clock = new THREE.Clock();

      // DOM Elements cache
      this.dom = {};

      this.init();
    }

    init() {
      this.buildDOM();
      this.initThreeScene();
      this.initDustCanvas();
      this.bindEvents();
      this.checkReducedMotion();
    }

    // --------------------------------------------------------------------------
    // DOM CONSTRUCTION (Additive Overlay Layer)
    // --------------------------------------------------------------------------
    buildDOM() {
      // Check if already injected
      if (document.getElementById('phantomExperienceRoot')) {
        this.dom.root = document.getElementById('phantomExperienceRoot');
        return;
      }

      const root = document.createElement('div');
      root.id = 'phantomExperienceRoot';
      root.className = 'phantom-experience-root';
      root.setAttribute('role', 'dialog');
      root.setAttribute('aria-modal', 'true');
      root.setAttribute('aria-label', 'PHANTOM Core Intelligence System');

      root.innerHTML = `
        <div class="phantom-transition-backdrop" id="phantomBackdrop"></div>
        <div class="phantom-collapse-warp" id="phantomWarp"></div>
        <canvas class="phantom-dust-canvas" id="phantomDustCanvas"></canvas>

        <div class="phantom-canvas-container" id="phantomCanvasContainer">
          <canvas class="phantom-webgl-canvas" id="phantomWebglCanvas"></canvas>
        </div>

        <svg class="phantom-constellation-svg" id="phantomConstellationSvg" aria-hidden="true">
          <defs>
            <filter id="glowSmriti" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glowAegis" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glowLumen" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <line id="lineSmriti" class="phantom-connector-line smriti-connector" />
          <line id="lineAegis" class="phantom-connector-line aegis-connector" />
          <line id="lineLumen" class="phantom-connector-line lumen-connector" />
          <line id="lineOrbit" class="phantom-connector-line" />
          <line id="lineNova" class="phantom-connector-line" />
          <circle id="pulseSmriti" class="phantom-pulse-dot" r="3" />
          <circle id="pulseAegis" class="phantom-pulse-dot" r="3" />
          <circle id="pulseLumen" class="phantom-pulse-dot" r="3" />
        </svg>

        <div class="phantom-center-anchor" id="phantomCenterAnchor">
          <div class="phantom-core-eyebrow">Spatial Intelligence Layer</div>
          <h1 class="phantom-core-title">PHANTOM</h1>
          <p class="phantom-core-desc">Core Intelligence Architecture</p>
        </div>

        <div class="phantom-nodes-container" id="phantomNodesContainer">
          <!-- MODULE 01: SMRITI (Home Intelligence) -->
          <div class="phantom-module-node phantom-node-smriti" id="nodeSmriti" data-module="smriti" role="button" tabindex="0" aria-label="SMRITI - Home Intelligence">
            <div class="phantom-node-pill">
              <span class="phantom-node-beacon" aria-hidden="true"></span>
              <div class="phantom-node-meta">
                <span class="phantom-node-title">SMRITI</span>
                <span class="phantom-node-subtitle">Home Intelligence</span>
              </div>
            </div>
            <div class="phantom-module-card">
              <div class="phantom-card-header">
                <span class="phantom-card-tag">Specialized Module · 01</span>
                <span class="phantom-card-env">Home Environment</span>
              </div>
              <h2 class="phantom-card-role">Spatial memory & human reassurance</h2>
              <p class="phantom-card-desc">Understands quiet routines, object displacement, and lived spaces. Built to feel gentle, unobtrusive, and emotionally grounded.</p>
              <div class="phantom-card-personality">
                <span class="phantom-trait-pill">Soft</span>
                <span class="phantom-trait-pill">Warm</span>
                <span class="phantom-trait-pill">Empathetic</span>
                <span class="phantom-trait-pill">Calm</span>
              </div>
              <button class="phantom-card-action-btn smriti-btn" id="btnReturnToSmritiSite" type="button">
                <span>Return to SMRITI Home</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>

          <!-- MODULE 02: AEGIS (Clinical Intelligence) -->
          <div class="phantom-module-node phantom-node-aegis align-right" id="nodeAegis" data-module="aegis" role="button" tabindex="0" aria-label="AEGIS - Clinical Intelligence">
            <div class="phantom-node-pill">
              <span class="phantom-node-beacon" aria-hidden="true"></span>
              <div class="phantom-node-meta">
                <span class="phantom-node-title">AEGIS</span>
                <span class="phantom-node-subtitle">Clinical Intelligence</span>
              </div>
            </div>
            <div class="phantom-module-card">
              <div class="phantom-card-header">
                <span class="phantom-card-tag">Specialized Module · 02</span>
                <span class="phantom-card-env">Hospital & Clinic</span>
              </div>
              <h2 class="phantom-card-role">Sterile workflow & patient context</h2>
              <p class="phantom-card-desc">Maintains high-fidelity awareness of clinical environments, tracking medical assets, hygienic boundaries, and critical procedures with structured precision.</p>
              <div class="phantom-card-personality">
                <span class="phantom-trait-pill">Precise</span>
                <span class="phantom-trait-pill">Protective</span>
                <span class="phantom-trait-pill">Structured</span>
                <span class="phantom-trait-pill">Reliable</span>
              </div>
            </div>
          </div>

          <!-- MODULE 03: LUMEN (Laboratory Intelligence) -->
          <div class="phantom-module-node phantom-node-lumen" id="nodeLumen" data-module="lumen" role="button" tabindex="0" aria-label="LUMEN - Laboratory Intelligence">
            <div class="phantom-node-pill">
              <span class="phantom-node-beacon" aria-hidden="true"></span>
              <div class="phantom-node-meta">
                <span class="phantom-node-title">LUMEN</span>
                <span class="phantom-node-subtitle">Laboratory Intelligence</span>
              </div>
            </div>
            <div class="phantom-module-card">
              <div class="phantom-card-header">
                <span class="phantom-card-tag">Specialized Module · 03</span>
                <span class="phantom-card-env">Research & Lab</span>
              </div>
              <h2 class="phantom-card-role">Instrument state & experiment tracking</h2>
              <p class="phantom-card-desc">Tracks complex experimental apparatus, reagent positions, and protocol milestones in laboratory cleanrooms with curious, analytical awareness.</p>
              <div class="phantom-card-personality">
                <span class="phantom-trait-pill">Curious</span>
                <span class="phantom-trait-pill">Analytical</span>
                <span class="phantom-trait-pill">Observant</span>
                <span class="phantom-trait-pill">Scientific</span>
              </div>
            </div>
          </div>

          <!-- FUTURE MODULE: ORBIT (Industrial Intelligence) -->
          <div class="phantom-module-node phantom-node-future is-future align-right" id="nodeOrbit" data-module="orbit" aria-label="ORBIT - Industrial Intelligence (Future)">
            <div class="phantom-node-pill">
              <span class="phantom-node-beacon" aria-hidden="true"></span>
              <div class="phantom-node-meta">
                <span class="phantom-node-title">ORBIT</span>
                <span class="phantom-node-subtitle">Industrial · Planned</span>
              </div>
            </div>
          </div>

          <!-- FUTURE MODULE: NOVA (Mobility Intelligence) -->
          <div class="phantom-module-node phantom-node-future is-future" id="nodeNova" data-module="nova" aria-label="NOVA - Mobility Intelligence (Future)">
            <div class="phantom-node-pill">
              <span class="phantom-node-beacon" aria-hidden="true"></span>
              <div class="phantom-node-meta">
                <span class="phantom-node-title">NOVA</span>
                <span class="phantom-node-subtitle">Mobility · Planned</span>
              </div>
            </div>
          </div>
        </div>

        <div class="phantom-ui-layer" id="phantomUiLayer">
          <div class="phantom-header-bar">
            <button class="phantom-return-btn" id="btnPhantomReturn" type="button" aria-label="Return to SMRITI website">
              <span class="phantom-return-arrow" aria-hidden="true">←</span>
              <span>Return to SMRITI</span>
              <span class="phantom-return-tag">[ESC]</span>
            </button>
            <div class="phantom-telemetry-badge">
              <span class="phantom-live-indicator" aria-hidden="true"></span>
              <span class="phantom-status-text">CORE ONLINE</span>
              <span class="phantom-telemetry-divider" aria-hidden="true"></span>
              <span>3 ACTIVE MODULES</span>
            </div>
          </div>

          <div class="phantom-bottom-bar">
            <span class="phantom-esc-hint">Press <kbd>ESC</kbd> or click Return to exit</span>
            <span class="phantom-active-count">PHANTOM <strong>KERNEL 2.0</strong> · SPATIAL MATRIX</span>
          </div>
        </div>
      `;

      document.body.appendChild(root);

      // Cache DOM references
      this.dom.root = root;
      this.dom.backdrop = root.querySelector('#phantomBackdrop');
      this.dom.warp = root.querySelector('#phantomWarp');
      this.dom.canvasContainer = root.querySelector('#phantomCanvasContainer');
      this.dom.webglCanvas = root.querySelector('#phantomWebglCanvas');
      this.dom.dustCanvas = root.querySelector('#phantomDustCanvas');
      this.dom.svg = root.querySelector('#phantomConstellationSvg');
      this.dom.returnBtn = root.querySelector('#btnPhantomReturn');
      this.dom.returnSmritiBtn = root.querySelector('#btnReturnToSmritiSite');
      this.dom.centerAnchor = root.querySelector('#phantomCenterAnchor');

      this.dom.nodes = {
        smriti: root.querySelector('#nodeSmriti'),
        aegis: root.querySelector('#nodeAegis'),
        lumen: root.querySelector('#nodeLumen'),
        orbit: root.querySelector('#nodeOrbit'),
        nova: root.querySelector('#nodeNova')
      };

      this.dom.lines = {
        smriti: root.querySelector('#lineSmriti'),
        aegis: root.querySelector('#lineAegis'),
        lumen: root.querySelector('#lineLumen'),
        orbit: root.querySelector('#lineOrbit'),
        nova: root.querySelector('#lineNova')
      };

      this.dom.pulses = {
        smriti: root.querySelector('#pulseSmriti'),
        aegis: root.querySelector('#pulseAegis'),
        lumen: root.querySelector('#pulseLumen')
      };
    }

    // --------------------------------------------------------------------------
    // THREE.JS PROCEDURAL FLUID ORGANIC SHADER ("Black Animated AI Blobs")
    // Replicating Spline community asset visual language with 60fps performance
    // --------------------------------------------------------------------------
    initThreeScene() {
      const THREE = window.THREE;
      const canvas = this.dom.webglCanvas;
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Renderer
      this.renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Scene & Camera
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      this.camera.position.set(0, 0, 7.2);

      // Organic Fluid Blob Geometry (Subdivided Sphere)
      const geometry = new THREE.IcosahedronGeometry(1.7, 52);

      // Custom Shader Material mimicking Spline "Black Animated AI Blobs"
      this.blobMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uDeformSpeed: { value: 0.30 },
          uDeformIntensity: { value: 0.35 },
          uExpansion: { value: 0.01 }, // Starts tiny during emergence
          uRimAlpha: { value: 0.0 },   // Starts 0, rims in first
          uHighlightColor: { value: new THREE.Color(0xf0f5fa) },
          uCoreColor: { value: new THREE.Color(0x060709) },
          uEnergyPulse: { value: 0.0 }
        },
        vertexShader: `
          uniform float uTime;
          uniform float uDeformSpeed;
          uniform float uDeformIntensity;
          uniform float uExpansion;
          uniform float uEnergyPulse;

          varying vec3 vNormal;
          varying vec3 vViewPosition;
          varying vec3 vWorldPosition;
          varying float vDisplacement;

          ${SimplexNoiseGLSL}

          float getDisplacement(vec3 p) {
            float t = uTime * uDeformSpeed;
            float n1 = snoise(p * 0.95 + vec3(t * 0.45, t * 0.35, t * 0.25));
            float n2 = snoise(p * 1.9 - vec3(t * 0.25, t * 0.5, t * 0.35)) * 0.42;
            float n3 = snoise(p * 3.4 + vec3(t * 0.7, -t * 0.4, t * 0.5)) * 0.16;
            return (n1 + n2 + n3) * (uDeformIntensity + uEnergyPulse * 0.2);
          }

          void main() {
            vec3 p = position;
            float totalNoise = getDisplacement(p);
            vDisplacement = totalNoise;

            // Displace vertex outward along normal
            vec3 displacedPosition = p * uExpansion + normal * (totalNoise * uExpansion);

            // True surface normal via spatial displacement gradient (never inverts)
            float eps = 0.02;
            vec3 grad = vec3(
              getDisplacement(p + vec3(eps, 0.0, 0.0)) - getDisplacement(p - vec3(eps, 0.0, 0.0)),
              getDisplacement(p + vec3(0.0, eps, 0.0)) - getDisplacement(p - vec3(0.0, eps, 0.0)),
              getDisplacement(p + vec3(0.0, 0.0, eps)) - getDisplacement(p - vec3(0.0, 0.0, eps))
            ) / (2.0 * eps);

            vec3 displacedNormal = normalize(normal - grad * 0.6);
            vNormal = normalize(normalMatrix * displacedNormal);

            vec4 mvPosition = modelViewMatrix * vec4(displacedPosition, 1.0);
            vViewPosition = -mvPosition.xyz;
            vWorldPosition = (modelMatrix * vec4(displacedPosition, 1.0)).xyz;

            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform float uRimAlpha;
          uniform vec3 uHighlightColor;
          uniform vec3 uCoreColor;
          uniform float uEnergyPulse;

          varying vec3 vNormal;
          varying vec3 vViewPosition;
          varying vec3 vWorldPosition;
          varying float vDisplacement;

          void main() {
            vec3 norm = normalize(vNormal);
            vec3 viewDir = normalize(vViewPosition);

            // 1. Deep glossy obsidian body (Spline "Black Animated AI Blobs")
            vec3 baseColor = uCoreColor;

            // 2. Specular Blinn-Phong highlights on liquid ripples
            vec3 lightDir1 = normalize(vec3(0.4, 0.7, 0.75));
            vec3 halfDir1 = normalize(lightDir1 + viewDir);
            float spec1 = pow(max(dot(norm, halfDir1), 0.0), 38.0) * 0.48;

            vec3 lightDir2 = normalize(vec3(-0.6, -0.4, 0.5));
            vec3 halfDir2 = normalize(lightDir2 + viewDir);
            float spec2 = pow(max(dot(norm, halfDir2), 0.0), 22.0) * 0.22;

            // 3. Razor-thin luminous Fresnel edge rim (matching visual reference)
            float NdotV = clamp(dot(norm, viewDir), 0.0, 1.0);
            float fresnelFactor = pow(1.0 - NdotV, 4.4);
            vec3 rimColor = uHighlightColor * (fresnelFactor * uRimAlpha * 1.35);

            // 4. Subtle fluid depth sheen
            float rippleSheen = clamp(vDisplacement * 0.5 + 0.5, 0.0, 1.0) * 0.025;
            baseColor += vec3(0.03, 0.04, 0.06) * rippleSheen;

            // 5. Compose full material
            vec3 finalColor = baseColor + (vec3(0.9, 0.95, 1.0) * (spec1 + spec2)) + rimColor;

            // Energetic pulse glow when user hovers nodes
            finalColor += uHighlightColor * (uEnergyPulse * fresnelFactor * 0.9);

            gl_FragColor = vec4(finalColor, 1.0);
          }
        `,
        transparent: true
      });

      this.blobMesh = new THREE.Mesh(geometry, this.blobMaterial);
      this.blobMesh.position.set(0, -0.22, 0);
      this.scene.add(this.blobMesh);

      // Initial state
      this.blobMaterial.uniforms.uExpansion.value = 0.0;
      this.blobMaterial.uniforms.uRimAlpha.value = 0.0;
    }

    // --------------------------------------------------------------------------
    // ATMOSPHERIC BACKGROUND PARTICLES (Slow-drifting void stardust)
    // --------------------------------------------------------------------------
    initDustCanvas() {
      const canvas = this.dom.dustCanvas;
      const ctx = canvas.getContext('2d');
      let width = (canvas.width = window.innerWidth);
      let height = (canvas.height = window.innerHeight);

      const particles = [];
      const particleCount = 42;

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.4 + 0.6,
          speedX: (Math.random() - 0.5) * 0.18,
          speedY: (Math.random() - 0.5) * 0.18,
          alpha: Math.random() * 0.5 + 0.2,
          pulse: Math.random() * Math.PI * 2
        });
      }

      this.drawDust = () => {
        if (!this.isOpen) return;
        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = '#ffffff';
        particles.forEach((p) => {
          p.x += p.speedX;
          p.y += p.speedY;
          p.pulse += 0.015;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          const currentAlpha = p.alpha * (0.6 + Math.sin(p.pulse) * 0.4);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha * 0.4})`;
          ctx.fill();
        });
      };

      window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      });
    }

    // --------------------------------------------------------------------------
    // SPATIAL CONSTELLATION NODE POSITIONING & SVG DYNAMICS
    // --------------------------------------------------------------------------
    layoutConstellation() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isMobile = w < 640;
      const isTablet = w >= 640 && w < 1024;

      // Center singularity coordinates
      const centerX = w * 0.5;
      const centerY = isMobile ? h * 0.42 : h * 0.5;

      // Node relative layout positions
      let positions;
      if (isMobile) {
        positions = {
          smriti: { x: w * 0.32, y: h * 0.22 },
          aegis: { x: w * 0.72, y: h * 0.62 },
          lumen: { x: w * 0.3, y: h * 0.72 },
          orbit: { x: w * 0.76, y: h * 0.25 },
          nova: { x: w * 0.18, y: h * 0.52 }
        };
      } else if (isTablet) {
        positions = {
          smriti: { x: w * 0.22, y: h * 0.38 },
          aegis: { x: w * 0.78, y: h * 0.36 },
          lumen: { x: w * 0.48, y: h * 0.78 },
          orbit: { x: w * 0.84, y: h * 0.72 },
          nova: { x: w * 0.16, y: h * 0.7 }
        };
      } else {
        positions = {
          smriti: { x: w * 0.24, y: h * 0.4 },
          aegis: { x: w * 0.76, y: h * 0.38 },
          lumen: { x: w * 0.36, y: h * 0.74 },
          orbit: { x: w * 0.82, y: h * 0.68 },
          nova: { x: w * 0.17, y: h * 0.66 }
        };
      }

      // Position DOM nodes
      Object.keys(positions).forEach((key) => {
        const node = this.dom.nodes[key];
        const pos = positions[key];
        if (node) {
          node.style.left = `${pos.x}px`;
          node.style.top = `${pos.y}px`;
        }
      });

      // Update SVG connector lines
      Object.keys(positions).forEach((key) => {
        const line = this.dom.lines[key];
        const pos = positions[key];
        if (line) {
          line.setAttribute('x1', centerX);
          line.setAttribute('y1', centerY);
          line.setAttribute('x2', pos.x);
          line.setAttribute('y2', pos.y);
        }
      });

      this.nodePositions = positions;
      this.centerCoords = { x: centerX, y: centerY };
    }

    // --------------------------------------------------------------------------
    // THE 6-STEP BLACK-HOLE TRANSITION SEQUENCE
    // --------------------------------------------------------------------------
    open() {
      if (this.isOpen) return;
      this.isOpen = true;
      this.isStabilized = false;
      this.currentPhase = 1;

      // Lock body scroll and dim SMRITI website
      document.body.classList.add('phantom-experience-open');
      this.dom.root.classList.add('is-active');

      // Update constellation coordinates
      this.layoutConstellation();

      // Start render loop
      this.clock.start();
      this.render();

      if (this.prefersReducedMotion) {
        // Reduced motion shortcut: instant fade in
        this.dom.root.classList.add('is-stabilized');
        this.blobMaterial.uniforms.uExpansion.value = 1.0;
        this.blobMaterial.uniforms.uRimAlpha.value = 0.95;
        this.isStabilized = true;
        this.currentPhase = 5;
        return;
      }

      // ------------------------------------------------------------------------
      // STEP 01 — SMRITI STATE (0ms)
      // Page visible, background starts to absorb light
      // ------------------------------------------------------------------------
      this.blobMaterial.uniforms.uExpansion.value = 0.05;
      this.blobMaterial.uniforms.uRimAlpha.value = 0.0;

      // ------------------------------------------------------------------------
      // STEP 02 — ATTENTION SHIFT (200ms - 800ms)
      // UI quiets down, background darkens, peripheral elements dissolve
      // ------------------------------------------------------------------------
      setTimeout(() => {
        if (!this.isOpen) return;
        this.currentPhase = 2;
      }, 400);

      // ------------------------------------------------------------------------
      // STEP 03 — SPATIAL COLLAPSE (800ms - 1800ms)
      // Gravitational inward pull, subtle radial distortion
      // ------------------------------------------------------------------------
      setTimeout(() => {
        if (!this.isOpen) return;
        this.currentPhase = 3;
      }, 900);

      // ------------------------------------------------------------------------
      // STEP 04 — BLACK-HOLE MOMENT (1800ms - 2600ms)
      // Deep void black, quiet suspension
      // ------------------------------------------------------------------------
      setTimeout(() => {
        if (!this.isOpen) return;
        this.currentPhase = 4;
      }, 1800);

      // ------------------------------------------------------------------------
      // STEP 05 — PHANTOM EMERGENCE (2600ms - 4000ms)
      // Faint rim catch appears first, then fluid expansion & reflective edges
      // ------------------------------------------------------------------------
      setTimeout(() => {
        if (!this.isOpen) return;
        const startTime = performance.now();
        const duration = 1600;

        const animateEmergence = (now) => {
          if (!this.isOpen) return;
          const progress = Math.min((now - startTime) / duration, 1.0);
          const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic

          // Reveal rim first, then expand organic volume
          this.blobMaterial.uniforms.uRimAlpha.value = Math.min(progress * 1.5, 0.95);
          this.blobMaterial.uniforms.uExpansion.value = 0.05 + ease * 0.95;

          if (progress < 1.0) {
            requestAnimationFrame(animateEmergence);
          } else {
            // ------------------------------------------------------------------
            // STEP 06 — STABILIZATION (4000ms+)
            // Blob settles into idle breathing, UI & constellation nodes fade in
            // ------------------------------------------------------------------
            this.dom.root.classList.add('is-stabilized');
            this.isStabilized = true;
            this.currentPhase = 5;
          }
        };

        requestAnimationFrame(animateEmergence);
      }, 2600);
    }

    // --------------------------------------------------------------------------
    // REVERSE TRANSITION (EXIT / RETURN TO SMRITI)
    // --------------------------------------------------------------------------
    close() {
      if (!this.isOpen) return;
      this.isOpen = false;
      this.isStabilized = false;
      this.currentPhase = 0;

      // 1. Instantly fade out chrome & constellation nodes
      this.dom.root.classList.remove('is-stabilized');

      // 2. Shrink blob smoothly into the void
      const startTime = performance.now();
      const duration = 650;
      const initialExpansion = this.blobMaterial.uniforms.uExpansion.value;
      const initialRim = this.blobMaterial.uniforms.uRimAlpha.value;

      const animateCollapse = (now) => {
        const progress = Math.min((now - startTime) / duration, 1.0);
        const ease = progress * progress; // ease-in quadratic

        this.blobMaterial.uniforms.uExpansion.value = initialExpansion * (1 - ease);
        this.blobMaterial.uniforms.uRimAlpha.value = initialRim * (1 - ease);

        if (progress < 1.0) {
          requestAnimationFrame(animateCollapse);
        } else {
          // 3. Complete exit, lift backdrop, restore SMRITI site
          this.dom.root.classList.remove('is-active');
          document.body.classList.remove('phantom-experience-open');
          if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
          }
        }
      };

      requestAnimationFrame(animateCollapse);
    }

    // --------------------------------------------------------------------------
    // 60FPS THREE.JS RENDER & IDLE MOTION LOOP
    // --------------------------------------------------------------------------
    render() {
      if (!this.isOpen) return;

      const delta = this.clock.getDelta();
      const elapsedTime = this.clock.getElapsedTime();

      // Update shader uniform time for fluid wave deformation
      if (this.blobMaterial) {
        this.blobMaterial.uniforms.uTime.value = elapsedTime;

        // Subtle organic breathing idle
        if (this.isStabilized) {
          const breath = Math.sin(elapsedTime * 0.9) * 0.035;
          this.blobMaterial.uniforms.uExpansion.value = 1.0 + breath;
        }
      }

      // Smooth pointer parallax / drag rotation lerp
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;

      if (this.blobMesh) {
        // Slow continuous organic yaw
        this.blobMesh.rotation.y = elapsedTime * 0.08 + this.mouse.x * 0.6;
        this.blobMesh.rotation.x = Math.sin(elapsedTime * 0.06) * 0.12 + this.mouse.y * 0.4;
      }

      // Render Three.js scene
      this.renderer.render(this.scene, this.camera);

      // Render dust particle loop
      if (this.drawDust) {
        this.drawDust();
      }

      // Animate active energy pulse dot along connector if active
      if (this.activeNodeId && this.nodePositions) {
        const pulse = this.dom.pulses[this.activeNodeId];
        const target = this.nodePositions[this.activeNodeId];
        if (pulse && target) {
          const t = (elapsedTime * 1.4) % 1.0;
          const curX = this.centerCoords.x + (target.x - this.centerCoords.x) * t;
          const curY = this.centerCoords.y + (target.y - this.centerCoords.y) * t;
          pulse.setAttribute('cx', curX);
          pulse.setAttribute('cy', curY);
          pulse.classList.add('is-pulsing');
        }
      } else {
        Object.values(this.dom.pulses).forEach((p) => p.classList.remove('is-pulsing'));
      }

      this.rafId = requestAnimationFrame(() => this.render());
    }

    // --------------------------------------------------------------------------
    // EVENT BINDINGS & INTERACTIONS
    // --------------------------------------------------------------------------
    bindEvents() {
      // 1. Navigation Hook: Intercept existing SMRITI navbar "PHANTOM" link
      const phantomNavLinks = document.querySelectorAll('#navPhantomLink, a[href="#phantom"], [data-phantom-trigger]');
      phantomNavLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.open();
        });
      });

      // 2. Return Controls
      this.dom.returnBtn?.addEventListener('click', () => this.close());
      this.dom.returnSmritiBtn?.addEventListener('click', () => this.close());

      // 3. Escape key to exit
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });

      // 4. Window Resize
      window.addEventListener('resize', () => {
        if (!this.renderer || !this.camera) return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
        this.layoutConstellation();
      });

      // 5. Pointer Parallax / Blob drag
      window.addEventListener('pointermove', (e) => {
        if (!this.isOpen) return;
        const ndcX = (e.clientX / window.innerWidth) * 2 - 1;
        const ndcY = -(e.clientY / window.innerHeight) * 2 + 1;
        this.mouse.targetX = ndcX * 0.4;
        this.mouse.targetY = ndcY * 0.3;
      });

      // 6. Interactive Node Hover & Focus States
      Object.keys(this.dom.nodes).forEach((key) => {
        const node = this.dom.nodes[key];
        const line = this.dom.lines[key];
        if (!node) return;

        const onEnter = () => {
          this.activeNodeId = key;
          node.classList.add('is-active');
          line?.classList.add('is-active');

          // Send energy pulse into blob shader
          if (this.blobMaterial) {
            this.blobMaterial.uniforms.uEnergyPulse.value = 0.45;
          }
        };

        const onLeave = () => {
          if (this.activeNodeId === key) {
            this.activeNodeId = null;
          }
          node.classList.remove('is-active');
          line?.classList.remove('is-active');

          if (this.blobMaterial) {
            this.blobMaterial.uniforms.uEnergyPulse.value = 0.0;
          }
        };

        node.addEventListener('mouseenter', onEnter);
        node.addEventListener('mouseleave', onLeave);
        node.addEventListener('focus', onEnter);
        node.addEventListener('blur', onLeave);
      });
    }

    checkReducedMotion() {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.prefersReducedMotion = mediaQuery.matches;
      mediaQuery.addEventListener('change', (e) => {
        this.prefersReducedMotion = e.matches;
      });
    }
  }

  // ----------------------------------------------------------------------------
  // 3. INITIALIZATION ON DOM READY
  // ----------------------------------------------------------------------------
  const initPhantomCore = () => {
    if (window.PhantomCoreExperience) return;
    if (!window.THREE) {
      setTimeout(initPhantomCore, 50);
      return;
    }
    try {
      window.PhantomCoreExperience = new PhantomCoreExperience();
    } catch (e) {
      console.error('Failed to init PhantomCoreExperience:', e);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPhantomCore);
  } else {
    initPhantomCore();
  }
})();
