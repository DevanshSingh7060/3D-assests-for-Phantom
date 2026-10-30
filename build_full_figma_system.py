import json
import os

screens_dir = 'figma-design-system/screens'
library_dir = 'figma-design-system/library'

# Read screens
screens = {}
for fname in sorted(os.listdir(screens_dir)):
    if fname.endswith('.svg'):
        with open(os.path.join(screens_dir, fname), 'r', encoding='utf-8') as f:
            screens[fname] = f.read()

# Read library
library = {}
for fname in sorted(os.listdir(library_dir)):
    if fname.endswith('.svg'):
        with open(os.path.join(library_dir, fname), 'r', encoding='utf-8') as f:
            library[fname] = f.read()

# Read tokens
with open('figma-design-system/tokens/tokens.json', 'r', encoding='utf-8') as f:
    tokens = json.load(f)

print(f"Loaded {len(screens)} screen SVGs and {len(library)} library SVGs.")

js_code = f"""
// ============================================================================
// SMRITI × PHANTOM — Complete Product Design System Figma Generator
// ============================================================================

const screens = {json.dumps(screens)};
const library = {json.dumps(library)};

const pageNames = [
  "00 — Cover & Overview",
  "01 — Foundations & Design Tokens",
  "02 — Master Components",
  "03 — SMRITI Desktop",
  "04 — SMRITI Tablet & Mobile",
  "05 — PHANTOM Core Experience",
  "06 — Interaction States",
  "07 — Prototype & User Flows",
  "08 — Handoff & Documentation"
];

// Helper: Ensure all 9 pages exist and clear old content
const pages = {{}};
for (let i = 0; i < pageNames.length; i++) {{
  const name = pageNames[i];
  let p = figma.root.children.find(child => child.name === name || child.name.startsWith(name.slice(0, 2)));
  if (!p) {{
    p = figma.createPage();
    p.name = name;
  }} else {{
    p.name = name;
  }}
  // Clear previous children
  for (const child of [...p.children]) {{
    child.remove();
  }}
  pages[name] = p;
}}

// Helper: Convert SVG string to ComponentNode
function createComponentFromSvg(svgString, name, x, y) {{
  const tempFrame = figma.createNodeFromSvg(svgString);
  const comp = figma.createComponent();
  comp.name = name;
  comp.resize(tempFrame.width, tempFrame.height);
  comp.x = x;
  comp.y = y;
  comp.fills = tempFrame.fills;
  comp.strokes = tempFrame.strokes;
  comp.strokeWeight = tempFrame.strokeWeight;
  comp.cornerRadius = tempFrame.cornerRadius || 0;
  for (const child of [...tempFrame.children]) {{
    comp.appendChild(child);
  }}
  tempFrame.remove();
  return comp;
}}

// ----------------------------------------------------------------------------
// PAGE 00: Cover & Overview
// ----------------------------------------------------------------------------
const p0 = pages["00 — Cover & Overview"];
const coverNode = figma.createNodeFromSvg(screens["00_cover.svg"]);
coverNode.name = "00 — Cover & Overview (1920×1080)";
coverNode.x = 0;
coverNode.y = 0;
p0.appendChild(coverNode);

// ----------------------------------------------------------------------------
// PAGE 01: Foundations & Design Tokens
// ----------------------------------------------------------------------------
const p1 = pages["01 — Foundations & Design Tokens"];
const foundNode = figma.createNodeFromSvg(screens["01_foundations_tokens.svg"]);
foundNode.name = "01 — Foundations & Design Tokens (1920×1200)";
foundNode.x = 0;
foundNode.y = 0;
p1.appendChild(foundNode);

// Create Figma Native Paint Styles
const colorPalette = [
  {{ name: "Brand / Deep Onyx", hex: "#050505", r: 5/255, g: 5/255, b: 5/255 }},
  {{ name: "Brand / Phantom Green", hex: "#10B981", r: 16/255, g: 185/255, b: 129/255 }},
  {{ name: "Brand / Warm Alabaster", hex: "#F8FAFC", r: 248/255, g: 250/255, b: 252/255 }},
  {{ name: "Brand / Crimson Alert", hex: "#E11D48", r: 225/255, g: 29/255, b: 72/255 }},
  {{ name: "Brand / Muted Slate", hex: "#94A3B8", r: 148/255, g: 163/255, b: 184/255 }},
  {{ name: "Brand / Surface Carbon", hex: "#0B0F17", r: 11/255, g: 15/255, b: 23/255 }},
  {{ name: "Brand / Surface Card", hex: "#111827", r: 17/255, g: 24/255, b: 39/255 }},
  {{ name: "Brand / Border Subtle", hex: "#1E293B", r: 30/255, g: 41/255, b: 59/255 }},
  {{ name: "Brand / Border Active", hex: "#334155", r: 51/255, g: 65/255, b: 85/255 }},
  {{ name: "Brand / Cyan Data", hex: "#06B6D4", r: 6/255, g: 182/255, b: 212/255 }},
  {{ name: "Brand / Amber Warning", hex: "#F59E0B", r: 245/255, g: 158/255, b: 11/255 }}
];

const existingStyles = figma.getLocalPaintStyles();
for (const col of colorPalette) {{
  let style = existingStyles.find(s => s.name === col.name);
  if (!style) {{
    style = figma.createPaintStyle();
    style.name = col.name;
  }}
  style.paints = [{{ type: 'SOLID', color: {{ r: col.r, g: col.g, b: col.b }} }}];
}}

// Create Figma Variables if supported
try {{
  if (figma.variables && figma.variables.createVariableCollection) {{
    const collections = figma.variables.getLocalVariableCollections();
    let col = collections.find(c => c.name === "SMRITI Design System");
    if (!col) {{
      col = figma.variables.createVariableCollection("SMRITI Design System");
    }}
    const modeId = col.modes[0].modeId;
    const existingVars = figma.variables.getLocalVariables().filter(v => v.variableCollectionId === col.id);
    
    // Add color variables
    for (const c of colorPalette.slice(0, 5)) {{
      const varName = "color/" + c.name.split("/")[1].trim().toLowerCase().replace(/\\s+/g, "-");
      let v = existingVars.find(item => item.name === varName);
      if (!v) {{
        v = figma.variables.createVariable(varName, col.id, "COLOR");
      }}
      v.setValueForMode(modeId, {{ r: c.r, g: c.g, b: c.b, a: 1 }});
    }}
    
    // Add radius variables
    const radii = [{{ name: "radius/sm", val: 8 }}, {{ name: "radius/md", val: 12 }}, {{ name: "radius/lg", val: 24 }}, {{ name: "radius/full", val: 999 }}];
    for (const r of radii) {{
      let v = existingVars.find(item => item.name === r.name);
      if (!v) {{
        v = figma.variables.createVariable(r.name, col.id, "FLOAT");
      }}
      v.setValueForMode(modeId, r.val);
    }}
  }}
}} catch (e) {{
  console.log("Variables creation skipped/not available:", e);
}}

// ----------------------------------------------------------------------------
// PAGE 02: Master Components & Component Sets (Variants)
// ----------------------------------------------------------------------------
const p2 = pages["02 — Master Components"];

// Reference layout sheet
const compSheetNode = figma.createNodeFromSvg(screens["02_components_library.svg"]);
compSheetNode.name = "02 — Component Library Architecture Sheet (1920×1400)";
compSheetNode.x = 0;
compSheetNode.y = 0;
p2.appendChild(compSheetNode);

// Component Section Frame for live interactive Master Components
const masterSection = figma.createFrame();
masterSection.name = "❖ LIVE MASTER COMPONENTS & VARIANT SETS";
masterSection.x = 2020;
masterSection.y = 0;
masterSection.resize(1600, 1400);
masterSection.fills = [{{ type: 'SOLID', color: {{ r: 11/255, g: 15/255, b: 23/255 }} }}];
masterSection.cornerRadius = 16;
p2.appendChild(masterSection);

// Master dictionary to reference components for instantiating
const masterCatalog = {{}};

// 1. Button / Primary Ink Variants
const btnPrimDef = createComponentFromSvg(library["button_primary_ink.svg"], "State=Default, Type=Primary Ink", 60, 80);
const btnPrimHov = createComponentFromSvg(library["button_primary_ink.svg"], "State=Hover, Type=Primary Ink", 280, 80);
btnPrimHov.fills = [{{ type: 'SOLID', color: {{ r: 52/255, g: 211/255, b: 153/255 }} }}]; // emerald hover
const btnPrimAct = createComponentFromSvg(library["button_primary_ink.svg"], "State=Active, Type=Primary Ink", 500, 80);
const btnPrimDis = createComponentFromSvg(library["button_primary_ink.svg"], "State=Disabled, Type=Primary Ink", 720, 80);
btnPrimDis.opacity = 0.4;
masterSection.appendChild(btnPrimDef);
masterSection.appendChild(btnPrimHov);
masterSection.appendChild(btnPrimAct);
masterSection.appendChild(btnPrimDis);
const btnPrimarySet = figma.combineAsVariants([btnPrimDef, btnPrimHov, btnPrimAct, btnPrimDis], masterSection);
btnPrimarySet.name = "❖ Button / Primary Ink";
btnPrimarySet.x = 60;
btnPrimarySet.y = 60;
masterCatalog["button_primary"] = btnPrimDef;

// 2. Button / Secondary Glass Pill Variants
const btnSecDef = createComponentFromSvg(library["button_secondary_pill.svg"], "State=Default, Type=Secondary Glass", 60, 220);
const btnSecHov = createComponentFromSvg(library["button_secondary_pill.svg"], "State=Hover, Type=Secondary Glass", 280, 220);
btnSecHov.fills = [{{ type: 'SOLID', color: {{ r: 30/255, g: 41/255, b: 59/255 }} }}];
const btnSecAct = createComponentFromSvg(library["button_secondary_pill.svg"], "State=Active, Type=Secondary Glass", 500, 220);
masterSection.appendChild(btnSecDef);
masterSection.appendChild(btnSecHov);
masterSection.appendChild(btnSecAct);
const btnSecondarySet = figma.combineAsVariants([btnSecDef, btnSecHov, btnSecAct], masterSection);
btnSecondarySet.name = "❖ Button / Secondary Glass Pill";
btnSecondarySet.x = 60;
btnSecondarySet.y = 220;
masterCatalog["button_secondary"] = btnSecDef;

// 3. Button / Ghost Quiet Mono Variants
const btnQuietDef = createComponentFromSvg(library["button_quiet.svg"], "State=Default, Type=Ghost Mono", 60, 380);
const btnQuietHov = createComponentFromSvg(library["button_quiet.svg"], "State=Hover, Type=Ghost Mono", 280, 380);
const btnQuietAct = createComponentFromSvg(library["button_quiet.svg"], "State=Active, Type=Ghost Mono", 500, 380);
masterSection.appendChild(btnQuietDef);
masterSection.appendChild(btnQuietHov);
masterSection.appendChild(btnQuietAct);
const btnQuietSet = figma.combineAsVariants([btnQuietDef, btnQuietHov, btnQuietAct], masterSection);
btnQuietSet.name = "❖ Button / Ghost Quiet Mono";
btnQuietSet.x = 60;
btnQuietSet.y = 380;
masterCatalog["button_quiet"] = btnQuietDef;

// 4. Nav / Floating Pill Variants
const navDef = createComponentFromSvg(library["nav_floating_pill.svg"], "State=Default", 60, 540);
const navScrolled = createComponentFromSvg(library["nav_floating_pill.svg"], "State=Scrolled", 600, 540);
navScrolled.fills = [{{ type: 'SOLID', color: {{ r: 5/255, g: 5/255, b: 5/255 }} }}];
navScrolled.strokes = [{{ type: 'SOLID', color: {{ r: 16/255, g: 185/255, b: 129/255 }} }}];
masterSection.appendChild(navDef);
masterSection.appendChild(navScrolled);
const navSet = figma.combineAsVariants([navDef, navScrolled], masterSection);
navSet.name = "❖ Nav / Floating System Pill";
navSet.x = 60;
navSet.y = 540;
masterCatalog["nav_pill"] = navDef;

// 5. Memory Receipt Card
const receiptComp = createComponentFromSvg(library["memory_receipt_card.svg"], "❖ Cards / Memory Receipt", 60, 720);
masterSection.appendChild(receiptComp);
receiptComp.x = 60;
receiptComp.y = 720;
masterCatalog["receipt_card"] = receiptComp;

// 6. PHANTOM Module Nodes (SMRITI, AEGIS, LUMEN)
const nodeSmriti = createComponentFromSvg(library["phantom_module_node_smriti.svg"], "Module=SMRITI Home, State=Active", 60, 1140);
const nodeAegis = createComponentFromSvg(library["phantom_module_node_aegis.svg"], "Module=AEGIS Clinical, State=Idle", 320, 1140);
const nodeLumen = createComponentFromSvg(library["phantom_module_node_lumen.svg"], "Module=LUMEN Lab, State=Idle", 580, 1140);
masterSection.appendChild(nodeSmriti);
masterSection.appendChild(nodeAegis);
masterSection.appendChild(nodeLumen);
const moduleSet = figma.combineAsVariants([nodeSmriti, nodeAegis, nodeLumen], masterSection);
moduleSet.name = "❖ Nodes / PHANTOM Module Pill";
moduleSet.x = 60;
moduleSet.y = 1140;
masterCatalog["module_node_smriti"] = nodeSmriti;
masterCatalog["module_node_aegis"] = nodeAegis;
masterCatalog["module_node_lumen"] = nodeLumen;

// 7. Status Pill Variants
const statusLive = figma.createComponent();
statusLive.name = "Status=Live";
statusLive.resize(96, 28);
statusLive.cornerRadius = 14;
statusLive.fills = [{{ type: 'SOLID', color: {{ r: 6/255, g: 78/255, b: 59/255 }} }}]; // deep green
statusLive.strokes = [{{ type: 'SOLID', color: {{ r: 16/255, g: 185/255, b: 129/255 }} }}];

const statusRec = figma.createComponent();
statusRec.name = "Status=Recording";
statusRec.resize(112, 28);
statusRec.cornerRadius = 14;
statusRec.fills = [{{ type: 'SOLID', color: {{ r: 136/255, g: 19/255, b: 55/255 }} }}]; // deep rose
statusRec.strokes = [{{ type: 'SOLID', color: {{ r: 225/255, g: 29/255, b: 72/255 }} }}];

masterSection.appendChild(statusLive);
masterSection.appendChild(statusRec);
const statusSet = figma.combineAsVariants([statusLive, statusRec], masterSection);
statusSet.name = "❖ Status / Indicator Pill";
statusSet.x = 1050;
statusSet.y = 720;
masterCatalog["status_pill"] = statusLive;

// ----------------------------------------------------------------------------
// PAGE 03: SMRITI Desktop (1440px)
// ----------------------------------------------------------------------------
const p3 = pages["03 — SMRITI Desktop"];

// 1. Complete Editorial Landing Page
const deskFull = figma.createNodeFromSvg(screens["03_smriti_desktop_complete.svg"]);
deskFull.name = "03 — SMRITI Desktop Complete (1440×4800)";
deskFull.x = 0;
deskFull.y = 0;
p3.appendChild(deskFull);

// Place real Component Instances on the page
if (masterCatalog["nav_pill"]) {{
  const navInst = masterCatalog["nav_pill"].createInstance();
  navInst.name = "Instance: Nav / Floating Pill";
  navInst.x = 470;
  navInst.y = 32;
  p3.appendChild(navInst);
}}

if (masterCatalog["button_primary"]) {{
  const heroBtnInst = masterCatalog["button_primary"].createInstance();
  heroBtnInst.name = "Instance: Hero Primary CTA";
  heroBtnInst.x = 80;
  heroBtnInst.y = 540;
  p3.appendChild(heroBtnInst);
  
  const ctaBtnInst = masterCatalog["button_primary"].createInstance();
  ctaBtnInst.name = "Instance: Final Onboarding CTA";
  ctaBtnInst.x = 620;
  ctaBtnInst.y = 4450;
  p3.appendChild(ctaBtnInst);
}}

if (masterCatalog["button_secondary"]) {{
  const heroSecInst = masterCatalog["button_secondary"].createInstance();
  heroSecInst.name = "Instance: Hero Secondary CTA";
  heroSecInst.x = 290;
  heroSecInst.y = 540;
  p3.appendChild(heroSecInst);
}}

if (masterCatalog["receipt_card"]) {{
  const receiptInst = masterCatalog["receipt_card"].createInstance();
  receiptInst.name = "Instance: Memory Receipt Live Card";
  receiptInst.x = 760;
  receiptInst.y = 3100;
  p3.appendChild(receiptInst);
}}

// ----------------------------------------------------------------------------
// PAGE 04: SMRITI Tablet & Mobile (768px & 390px)
// ----------------------------------------------------------------------------
const p4 = pages["04 — SMRITI Tablet & Mobile"];

const tabNode = figma.createNodeFromSvg(screens["04_smriti_responsive_tablet.svg"]);
tabNode.name = "04 — SMRITI Tablet Viewport (768×2400)";
tabNode.x = 0;
tabNode.y = 0;
p4.appendChild(tabNode);

const mobNode = figma.createNodeFromSvg(screens["04_smriti_responsive_mobile.svg"]);
mobNode.name = "04 — SMRITI Mobile Viewport (390×2400)";
mobNode.x = 868;
mobNode.y = 0;
p4.appendChild(mobNode);

// Add mobile instances
if (masterCatalog["button_primary"]) {{
  const mobBtnInst = masterCatalog["button_primary"].createInstance();
  mobBtnInst.name = "Instance: Mobile Primary CTA";
  mobBtnInst.x = 900;
  mobBtnInst.y = 480;
  p4.appendChild(mobBtnInst);
}}

// ----------------------------------------------------------------------------
// PAGE 05: PHANTOM Core Experience (1440×900)
// ----------------------------------------------------------------------------
const p5 = pages["05 — PHANTOM Core Experience"];

const phCore = figma.createNodeFromSvg(screens["05_phantom_core_experience.svg"]);
phCore.name = "05 — PHANTOM Core Canvas (1440×900)";
phCore.x = 0;
phCore.y = 0;
p5.appendChild(phCore);

const phSmriti = figma.createNodeFromSvg(screens["05_phantom_module_smriti_active.svg"]);
phSmriti.name = "05 — PHANTOM SMRITI Home Module Active (1440×900)";
phSmriti.x = 1540;
phSmriti.y = 0;
p5.appendChild(phSmriti);

const phAegis = figma.createNodeFromSvg(screens["05_phantom_module_aegis_active.svg"]);
phAegis.name = "05 — PHANTOM AEGIS Clinical Module Active (1440×900)";
phAegis.x = 3080;
phAegis.y = 0;
p5.appendChild(phAegis);

const phLumen = figma.createNodeFromSvg(screens["05_phantom_module_lumen_active.svg"]);
phLumen.name = "05 — PHANTOM LUMEN Lab Module Active (1440×900)";
phLumen.x = 4620;
phLumen.y = 0;
p5.appendChild(phLumen);

// ----------------------------------------------------------------------------
// PAGE 06: Interaction States
// ----------------------------------------------------------------------------
const p6 = pages["06 — Interaction States"];
const statesNode = figma.createNodeFromSvg(screens["06_interaction_states.svg"]);
statesNode.name = "06 — Interactive States & Physics Matrix (1920×1080)";
statesNode.x = 0;
statesNode.y = 0;
p6.appendChild(statesNode);

// ----------------------------------------------------------------------------
// PAGE 07: Prototype & User Flows
// ----------------------------------------------------------------------------
const p7 = pages["07 — Prototype & User Flows"];
const flowNode = figma.createNodeFromSvg(screens["07_user_flows_prototype.svg"]);
flowNode.name = "07 — Complete Interactive User Journey Architecture (1920×1200)";
flowNode.x = 0;
flowNode.y = 0;
p7.appendChild(flowNode);

// ----------------------------------------------------------------------------
// PAGE 08: Handoff & Documentation
// ----------------------------------------------------------------------------
const p8 = pages["08 — Handoff & Documentation"];
const handoffNode = figma.createNodeFromSvg(screens["08_handoff_documentation.svg"]);
handoffNode.name = "08 — Production Handoff & Developer Digest (1920×1400)";
handoffNode.x = 0;
handoffNode.y = 0;
p8.appendChild(handoffNode);

// ----------------------------------------------------------------------------
// FINALIZE: Set Current Page to Cover, Zoom to Fit, and Notify
// ----------------------------------------------------------------------------
figma.currentPage = p0;
figma.viewport.scrollAndZoomIntoView([coverNode]);

figma.notify("✨ SMRITI × PHANTOM: 9 Pages, Foundations, Master Components, Variants & Instances Generated!");
figma.closePlugin();
"""

with open('figma-plugin/code.js', 'w', encoding='utf-8') as f:
    f.write(js_code)

print(f"Generated complete figma-plugin/code.js successfully! File size: {len(js_code)} bytes.")
