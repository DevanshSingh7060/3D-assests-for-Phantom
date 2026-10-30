# PHANTOM — Multi-Domain Spatial Intelligence Platform

This repository implements the **PHANTOM Spatial Intelligence Platform** and its seven domain-specific modules: **SMRITI**, **AEGIS**, **LUMEN**, **FORGE**, **MERIDIAN**, **SENTINEL**, and **SENSE**, built upon the design discipline and typographic craftsmanship of the original SMRITI system.

---

## 1. Architectural Overview

```
                                  +------------------------------------+
                                  |       PHYSICAL ENVIRONMENT         |
                                  | (Desk, Table, Surgical Tray, Bay)  |
                                  +------------------------------------+
                                                    |
                                          [Photons / USB-C / Cam]
                                                    v
                                  +------------------------------------+
                                  |         1. THE EYE (Capture)       |
                                  |    navigator.mediaDevices / WebRTC |
                                  |   (Continuity / Android UVC / Vid) |
                                  +------------------------------------+
                                                    | (Continuous Canvas Stream)
                                                    v
                                  +------------------------------------+
                                  |        2. THE GATE (Detector)      |
                                  |    160x120 Grayscale Frame Diff    |
                                  |    Threshold 4% -> Settling 1.5s   |
                                  +------------------------------------+
                                                    | (Stable Candidate Frame)
                                                    v
                                  +------------------------------------+
                                  |        3. THE BRAIN (Vision)       |
                                  |     Coco-SSD / Taxonomic Mapping   |
                                  |   Bounding Boxes [ymin, xmin, ...] |
                                  +------------------------------------+
                                                    | (Raw Observations)
                                                    v
                                  +------------------------------------+
                                  |     4. SPATIAL MEMORY RESOLUTION   |
                                  |   Centroid Tracking & Landmarks    |
                                  |  ("Left of Laptop", "Near Keys")   |
                                  +------------------------------------+
                                                    | (Validated Events)
                                                    v
                                  +------------------------------------+
                                  |  5. CONTINUOUS KEY-VALUE STORE     |
                                  |    IndexedDB (6 Normalized Stores) |
                                  |   Environments, Objects, Events... |
                                  +------------------------------------+
                                                    |
                       +----------------------------+----------------------------+
                       |                                                         |
                       v                                                         v
        +-----------------------------+                           +-----------------------------+
        |   6. DETERMINISTIC SEARCH   |                           |    7. DOMAIN MODULE APPS    |
        |  Natural Language Parser    |                           |  SMRITI, AEGIS, LUMEN,      |
        |  "Where are my glasses?"    |                           |  FORGE, MERIDIAN, SENTINEL, |
        |  Evidence-Backed Reveal     |                           |  SENSE (Workspace Monitor)  |
        +-----------------------------+                           +-----------------------------+
```

---

## 2. Core Directory Structure

```
.
├── engine/                       # Shared Spatial Memory Engine Core
│   ├── index.js                  # Master Coordinator (PhantomEngine)
│   ├── capture.js                # WebRTC, Device Enumeration & Video Ingestion (PhantomCapture)
│   ├── change-detection.js       # Low-cost Frame Differencing & Settling Gate (PhantomChangeDetector)
│   ├── vision.js                 # Object Detection & Desk Taxonomy (PhantomVision)
│   ├── spatial-memory.js         # Relative Landmark Reasoning & Events (PhantomSpatialMemory)
│   ├── storage.js                # IndexedDB Persistent Key-Value Store (PhantomStorage)
│   └── search.js                 # Deterministic Search & Evidence Extraction (PhantomSearch)
├── workspace.html                # Operational Table Monitoring Workspace (7 Tabs)
├── workspace.css                 # SMRITI Design Tokens for Workspace
├── workspace.js                  # Workspace UI Controller & Camera Pipeline Binding
├── module-shared.css             # SMRITI-standard Design System for Specialized Modules
├── smriti.html                   # Residential & Memory Support Intelligence (Orange #CF4500)
├── aegis.html                    # Clinical Intelligence & OR Trays (Cyan #0284C7)
├── lumen.html                    # Laboratory Intelligence & Specimen Custody (Violet #7C3AED)
├── forge.html                    # Industrial, Logistics & Tool Cribs (Teal #0D9488)
├── meridian.html                 # Retail, Commercial & Archival Shelves (Amber #D97706)
├── sentinel.html                 # Safety, Security & Evidence Custody (Coral #DC2626)
├── sense.html                    # Accessibility & Cognitive Routine Scaffolding (Mint #059669)
├── phantom.html                  # Global Architecture Overview & Module Navigator
├── index.html                    # Preserved Original SMRITI Experience (3D Room & Reality Diff)
└── vercel.json                   # Clean URL Rewrites for Vercel Deployment
```

---

## 3. Core Engine Specifications

| Stage | Class | Implementation Details |
|---|---|---|
| **Capture** | [`PhantomCapture`](file:///Users/devanshsingh/Documents/Projects/3D-assets-for-Phantom/engine/capture.js) | Enumerate video input devices via `navigator.mediaDevices.enumerateDevices()`, classifies inputs into MacBook Built-in, iPhone Continuity Camera, Android USB / UVC webcam, or External USB. Fallback support for drag-and-drop video files. |
| **Change Detection** | [`PhantomChangeDetector`](file:///Users/devanshsingh/Documents/Projects/3D-assets-for-Phantom/engine/change-detection.js) | Runs a 160×120 downsampled canvas differencing loop at 10 FPS. Only triggers when pixel delta exceeds 4.0%. When movement ceases, enforces a 1,500ms settling countdown before promoting the frame to the semantic layer. |
| **Vision** | [`PhantomVision`](file:///Users/devanshsingh/Documents/Projects/3D-assets-for-Phantom/engine/vision.js) | TensorFlow.js Coco-SSD model running locally in WebGL/WASM in the client browser. Maps everyday objects (`glasses`, `bottle`, `cup`, `laptop`, `book`, `cell phone`, `keys`, `watch`) into normalized bounding boxes. Heuristic desk fallback ensures zero crashes offline. |
| **Spatial Memory** | [`PhantomSpatialMemory`](file:///Users/devanshsingh/Documents/Projects/3D-assets-for-Phantom/engine/spatial-memory.js) | Resolves centroids against fixed reference landmarks (e.g., `laptop`, `keyboard`, `monitor`, `desk_left_boundary`). Evaluates coordinate drift (>0.09) to confirm real physical movement vs camera jitter. Produces strict semantic change events (`moved`, `appeared`, `removed`, `reappeared`, `occluded`). |
| **Storage** | [`PhantomStorage`](file:///Users/devanshsingh/Documents/Projects/3D-assets-for-Phantom/engine/storage.js) | Continuous physical key-value store backed by client-side browser IndexedDB (`phantom_spatial_memory_v1`). Six distinct object stores: `environments`, `objects`, `observations`, `spatial_relationships`, `events`, `evidence_frames`. |
| **Search** | [`PhantomSearch`](file:///Users/devanshsingh/Documents/Projects/3D-assets-for-Phantom/engine/search.js) | Natural language query engine supporting exact names, colloquial aliases (`spectacles` -> `glasses`, `hydro` -> `bottle`), spatial preposition queries (`"behind laptop"`, `"near keys"`), and returns evidence highlights and movement timelines. |

---

## 4. Local Development & Testing

To run locally:
```bash
python3 server_nocache.py
```
Open your browser to:
- Workspace Monitor: `http://localhost:8080/workspace`
- Architecture Overview: `http://localhost:8080/phantom`
- Original SMRITI: `http://localhost:8080/`
- Clinical Intelligence: `http://localhost:8080/aegis`
- Laboratory Intelligence: `http://localhost:8080/lumen`
- Industrial Intelligence: `http://localhost:8080/forge`
- Retail Intelligence: `http://localhost:8080/meridian`
- Forensics Intelligence: `http://localhost:8080/sentinel`
- Cognitive Support: `http://localhost:8080/sense`
