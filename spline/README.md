# Spline 3D Scene Integration for PHANTOM

This directory contains the core 3D scene definition and interactive motion layer for **SMRITI / PHANTOM**.

---

## Files

1. **`spline-motion-document.html`**:
   - The complete HTML motion document injected over the Spline 3D canvas via `3d_set_html_content`.
   - Contains the 60fps rAF loop, character breathing animation, and the full interactive story flow:
     - **Phase 1**: Baseline routine (reading glasses resting on side table).
     - **Phase 2**: Parabolic arc transit of glasses across the room to Bookshelf Shelf 2.
     - **Phase 3**: Character head turn & arm raise in search.
     - **Phase 4**: PHANTOM Spatial Reveal with pulsing cyan ghost glasses and golden destination ring.
     - **Phase 5**: Resolved memory confirmation toast with replay controls.

2. **`spline-dsl-setup.js`**:
   - Reproducible Spline DSL script.
   - Run this script inside the Spline editor (Code panel or MCP `3d_run_code`) to reset or rebuild all object positions, orthogonal alignments, and the front-stage camera preset (`Camera_Home`).

3. **`scene-structure.txt`**:
   - Complete digest snapshot of the 90 objects in the scene, including geometry types, object IDs, hierarchy, positions, and rotations.

---

## How to Edit in Spline

1. Open your scene in Spline.
2. If you need to re-align furniture or camera, execute `spline-dsl-setup.js`.
3. In the **Code / HTML Content** panel, attach `spline-motion-document.html`.
4. Switch to **Preview** mode (`▶ Play`) to interact with the story.
