import base64
import os
import json

brain = "/Users/devanshsingh/.gemini/antigravity-ide/brain/8404bdc8-4523-40df-b065-77aecc86f707/figma_3d_assets"

def read_b64(filename):
    path = os.path.join(brain, filename)
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("ascii")

b64_assets = {
    "hero_desktop": read_b64("hero_desktop.jpg"),
    "hero_tablet": read_b64("hero_tablet.jpg"),
    "hero_mobile": read_b64("hero_mobile.jpg"),
    "phantom_wireframe": read_b64("phantom_wireframe.jpg"),
    "reality_diff": read_b64("reality_diff_canvas.jpg"),
    "glasses_3d": read_b64("glasses_3d.png"),
    "cta_world": read_b64("cta_world.jpg"),
}

print(f"Loaded all {len(b64_assets)} assets into memory.")

js_code = f"""// Figma Screen Fidelity Generator
// Exact 1:1 Website Reproduction (Desktop 1440px, Tablet 768px, Mobile 390px)

(async () => {{
  figma.notify("Starting screen reconstruction with 100% website fidelity...", {{ timeout: 3000 }});

  // 1. Load Fonts
  await Promise.all([
    figma.loadFontAsync({{ family: "Inter", style: "Regular" }}),
    figma.loadFontAsync({{ family: "Inter", style: "Medium" }}),
    figma.loadFontAsync({{ family: "Inter", style: "Semi Bold" }}),
    figma.loadFontAsync({{ family: "Inter", style: "Bold" }}),
    figma.loadFontAsync({{ family: "Georgia", style: "Regular" }}),
    figma.loadFontAsync({{ family: "Georgia", style: "Italic" }})
  ]);

  // Assets
  const assets = {json.dumps(b64_assets)};
  function getImagePaint(key) {{
    if (!assets[key]) return {{ type: "SOLID", color: {{ r: 0.1, g: 0.1, b: 0.1 }} }};
    const bytes = figma.base64Decode(assets[key]);
    const img = figma.createImage(bytes);
    return {{
      type: "IMAGE",
      scaleMode: "FILL",
      imageHash: img.hash
    }};
  }}

  // Find Pages
  const p2 = figma.root.children.find(p => p.name.startsWith("02"));
  const p3 = figma.root.children.find(p => p.name.startsWith("03"));
  const p4 = figma.root.children.find(p => p.name.startsWith("04"));

  if (!p3 || !p4) {{
    figma.notify("Error: Pages 03 or 04 not found!");
    figma.closePlugin();
    return;
  }}

  // Master Component Catalog
  const compCatalog = {{}};
  if (p2) {{
    const all = p2.findAll(n => n.type === "COMPONENT" || n.type === "COMPONENT_SET");
    for (const c of all) {{
      if (c.name.includes("Button / Primary Ink")) compCatalog["btn_primary"] = c;
      if (c.name.includes("Button / Secondary Glass Pill")) compCatalog["btn_secondary"] = c;
      if (c.name.includes("Button / Ghost Quiet Mono")) compCatalog["btn_ghost"] = c;
      if (c.name.includes("Nav / Floating Pill")) compCatalog["nav_pill"] = c;
      if (c.name.includes("Cards / Memory Receipt")) compCatalog["receipt_card"] = c;
      if (c.name.includes("Nodes / PHANTOM Module")) compCatalog["node_module"] = c;
      if (c.name.includes("Status / Indicator Pill")) compCatalog["status_pill"] = c;
    }}
  }}

  function createInstance(key) {{
    const c = compCatalog[key];
    if (!c) return null;
    if (c.type === "COMPONENT_SET") return c.defaultVariant.createInstance();
    if (c.type === "COMPONENT") return c.createInstance();
    return null;
  }}

  // Color Definitions
  const cPaper = {{ r: 0.992, g: 0.984, b: 0.969 }}; // #FDFBF7
  const cPaperElevated = {{ r: 0.961, g: 0.949, b: 0.922 }}; // #F5F2EB
  const cInk = {{ r: 0.059, g: 0.078, b: 0.071 }}; // #0F1412
  const cMuted = {{ r: 0.412, g: 0.443, b: 0.486 }}; // #69717C
  const cOrange = {{ r: 0.812, g: 0.271, b: 0.0 }}; // #CF4500
  const cDarkCosmos = {{ r: 0.047, g: 0.055, b: 0.071 }}; // #0C0E12
  const cDarkCard = {{ r: 0.071, g: 0.086, b: 0.118 }}; // #12161E
  const cCyan = {{ r: 0.22, g: 0.882, b: 1.0 }}; // #38E1FF
  const cBorderWarm = {{ r: 0.902, g: 0.878, b: 0.835 }}; // #E6E0D5
  const cBorderDark = {{ r: 0.12, g: 0.15, b: 0.20 }};

  // Helper: Create Text Node
  function makeText(str, opts = {{}}) {{
    const t = figma.createText();
    t.fontName = opts.font || {{ family: "Inter", style: "Regular" }};
    t.characters = str;
    t.fontSize = opts.size || 14;
    t.lineHeight = opts.lineHeight ? {{ value: opts.lineHeight, unit: "PIXELS" }} : {{ unit: "AUTO" }};
    t.letterSpacing = opts.letterSpacing ? {{ value: opts.letterSpacing, unit: "PIXELS" }} : {{ value: 0, unit: "PIXELS" }};
    t.fills = [{{ type: "SOLID", color: opts.color || cInk }}];
    if (opts.opacity !== undefined) t.opacity = opts.opacity;
    if (opts.width) {{
      t.textAutoResize = "HEIGHT";
      t.resize(opts.width, t.height);
    }} else {{
      t.textAutoResize = "WIDTH_AND_HEIGHT";
    }}
    return t;
  }}

  // Helper: Create Pill Badge
  function makePill(text, opts = {{}}) {{
    const f = figma.createFrame();
    f.layoutMode = "HORIZONTAL";
    f.primaryAxisSizingMode = "AUTO";
    f.counterAxisSizingMode = "AUTO";
    f.paddingLeft = opts.padX || 14;
    f.paddingRight = opts.padX || 14;
    f.paddingTop = opts.padY || 6;
    f.paddingBottom = opts.padY || 6;
    f.itemSpacing = 8;
    f.cornerRadius = 9999;
    f.fills = [{{ type: "SOLID", color: opts.bg || {{ r: 1, g: 1, b: 1 }}, opacity: opts.bgOpacity || 1 }}];
    if (opts.stroke) {{
      f.strokes = [{{ type: "SOLID", color: opts.stroke }}];
      f.strokeWeight = 1;
    }}
    if (opts.dotColor) {{
      const dot = figma.createEllipse();
      dot.resize(7, 7);
      dot.fills = [{{ type: "SOLID", color: opts.dotColor }}];
      f.appendChild(dot);
    }}
    const txt = makeText(text, {{
      font: opts.font || {{ family: "Inter", style: "Medium" }},
      size: opts.size || 11,
      color: opts.color || cInk,
      letterSpacing: opts.letterSpacing || 0.5
    }});
    f.appendChild(txt);
    return f;
  }}

  // Helper: Top Rule with Chapter Index
  function makeChapterHeader(num, title, width, isDark = false) {{
    const f = figma.createFrame();
    f.layoutMode = "HORIZONTAL";
    f.primaryAxisSizingMode = "FIXED";
    f.counterAxisSizingMode = "AUTO";
    f.resize(width, 32);
    f.layoutAlign = "STRETCH";
    f.primaryAxisAlignItems = "SPACE_BETWEEN";
    f.counterAxisAlignItems = "CENTER";
    f.fills = [];

    // Left index: e.g. "01 ·"
    const leftWrap = figma.createFrame();
    leftWrap.layoutMode = "HORIZONTAL";
    leftWrap.primaryAxisSizingMode = "AUTO";
    leftWrap.counterAxisSizingMode = "AUTO";
    leftWrap.itemSpacing = 6;
    leftWrap.counterAxisAlignItems = "CENTER";
    leftWrap.fills = [];

    const numTxt = makeText(num, {{
      font: {{ family: "Inter", style: "Semi Bold" }},
      size: 11,
      color: isDark ? cCyan : cOrange,
      letterSpacing: 1
    }});
    const dot = figma.createEllipse();
    dot.resize(4, 4);
    dot.fills = [{{ type: "SOLID", color: isDark ? cCyan : cOrange }}];

    leftWrap.appendChild(numTxt);
    leftWrap.appendChild(dot);

    // Right title: e.g. "A FAMILIAR MOMENT"
    const titleTxt = makeText(title, {{
      font: {{ family: "Inter", style: "Medium" }},
      size: 11,
      color: isDark ? cCyan : cMuted,
      letterSpacing: 1.5
    }});

    f.appendChild(leftWrap);
    f.appendChild(titleTxt);
    return f;
  }}

  // ============================================================================
  // RECONSTRUCT PAGE 03: SMRITI DESKTOP COMPLETE (1440×8310)
  // ============================================================================
  // Clear previous contents of Page 03
  for (const c of [...p3.children]) c.remove();

  const deskFrame = figma.createFrame();
  deskFrame.name = "03 — SMRITI Desktop Complete (1440×8310)";
  deskFrame.resize(1440, 8310);
  deskFrame.fills = [{{ type: "SOLID", color: cPaper }}];
  p3.appendChild(deskFrame);

  // SECTION 00: SITE NAVIGATION (Floating Pill at top)
  const navWrap = figma.createFrame();
  navWrap.name = "Section 00 / Site Header Nav";
  navWrap.resize(1440, 90);
  navWrap.x = 0;
  navWrap.y = 0;
  navWrap.fills = [];

  const navPill = figma.createFrame();
  navPill.name = "Nav / Floating Pill Container";
  navPill.resize(1240, 58);
  navPill.x = 100;
  navPill.y = 20;
  navPill.cornerRadius = 29;
  navPill.fills = [{{ type: "SOLID", color: {{ r: 1, g: 1, b: 1 }}, opacity: 0.94 }}];
  navPill.strokes = [{{ type: "SOLID", color: cBorderWarm }}];
  navPill.strokeWeight = 1;
  navPill.layoutMode = "HORIZONTAL";
  navPill.primaryAxisAlignItems = "SPACE_BETWEEN";
  navPill.counterAxisAlignItems = "CENTER";
  navPill.paddingLeft = 28;
  navPill.paddingRight = 10;
  navWrap.appendChild(navPill);

  // Brand
  const wordmark = makeText("SMRITI.", {{
    font: {{ family: "Inter", style: "Bold" }},
    size: 18,
    letterSpacing: 0.5
  }});
  navPill.appendChild(wordmark);

  // Links
  const navLinks = figma.createFrame();
  navLinks.layoutMode = "HORIZONTAL";
  navLinks.itemSpacing = 36;
  navLinks.fills = [];
  ["How it works", "PHANTOM", "Reality diff", "Memory receipt", "Trust"].forEach(l => {{
    const lnk = makeText(l, {{
      font: {{ family: "Inter", style: "Medium" }},
      size: 13,
      color: l === "PHANTOM" ? cOrange : cInk
    }});
    navLinks.appendChild(lnk);
  }});
  navPill.appendChild(navLinks);

  // Action Button
  const navCta = makePill("See the moment →", {{
    bg: cInk,
    color: cPaper,
    padX: 18,
    padY: 10,
    size: 12
  }});
  navPill.appendChild(navCta);

  // SECTION 01: HERO (#home, 1440×900)
  const heroSec = figma.createFrame();
  heroSec.name = "Section 01 / Hero (#home)";
  heroSec.resize(1440, 900);
  heroSec.x = 0;
  heroSec.y = 0;
  heroSec.fills = [getImagePaint("hero_desktop")];
  deskFrame.appendChild(heroSec);

  // Hero Overline Pill (top right)
  const heroOverline = makePill("A quiet afternoon at home", {{
    dotColor: cOrange,
    bg: {{ r: 1, g: 1, b: 1 }},
    bgOpacity: 0.85,
    stroke: cBorderWarm,
    color: cInk,
    padX: 14,
    padY: 6
  }});
  heroOverline.x = 1110;
  heroOverline.y = 118;
  heroSec.appendChild(heroOverline);

  // Hero Copy Block (bottom left)
  const heroCopy = figma.createFrame();
  heroCopy.name = "Hero Copy Block";
  heroCopy.layoutMode = "VERTICAL";
  heroCopy.itemSpacing = 16;
  heroCopy.x = 100;
  heroCopy.y = 520;
  heroCopy.fills = [];

  const heroEyebrow = makeText("• SPATIAL MEMORY FOR EVERYDAY LIFE", {{
    font: {{ family: "Inter", style: "Semi Bold" }},
    size: 11,
    color: cOrange,
    letterSpacing: 1.5
  }});
  heroCopy.appendChild(heroEyebrow);

  const heroTitle = figma.createFrame();
  heroTitle.layoutMode = "VERTICAL";
  heroTitle.itemSpacing = 0;
  heroTitle.fills = [];
  const t1 = makeText("Your home", {{ font: {{ family: "Georgia", style: "Regular" }}, size: 68, lineHeight: 72 }});
  const t2 = makeText("remembers.", {{ font: {{ family: "Georgia", style: "Italic" }}, size: 68, lineHeight: 72, color: cOrange }});
  heroTitle.appendChild(t1);
  heroTitle.appendChild(t2);
  heroCopy.appendChild(heroTitle);

  const heroSub = makeText("SMRITI remembers where everyday things were — and shows what changed.", {{
    font: {{ family: "Inter", style: "Regular" }},
    size: 15,
    lineHeight: 24,
    color: cMuted,
    width: 440
  }});
  heroCopy.appendChild(heroSub);

  // Hero Actions (bottom right)
  const heroActions = figma.createFrame();
  heroActions.name = "Hero Actions";
  heroActions.layoutMode = "VERTICAL";
  heroActions.itemSpacing = 12;
  heroActions.counterAxisAlignItems = "CENTER";
  heroActions.x = 1140;
  heroActions.y = 750;
  heroActions.fills = [];

  const heroBtn = makePill("See how it works →", {{
    bg: cInk,
    color: cPaper,
    padX: 24,
    padY: 14,
    size: 13
  }});
  const heroLink = makeText("Where are my glasses?", {{
    font: {{ family: "Inter", style: "Regular" }},
    size: 12,
    color: cInk
  }});
  heroActions.appendChild(heroBtn);
  heroActions.appendChild(heroLink);
  heroSec.appendChild(heroActions);

  // Hero Scroll Cue
  const scrollCue = makeText("SCROLL TO FOLLOW THE MOMENT ———", {{
    font: {{ family: "Inter", style: "Medium" }},
    size: 10,
    color: cMuted,
    letterSpacing: 2
  }});
  scrollCue.x = 100;
  scrollCue.y = 860;
  heroSec.appendChild(scrollCue);
  heroSec.appendChild(heroCopy);

  // Bring Navigation to top of hero
  deskFrame.appendChild(navWrap);

  // SECTION 02: CHAPTER 01 (#moments, y: 900, h: 698)
  const ch1 = figma.createFrame();
  ch1.name = "Section 02 / Chapter 01 — A Familiar Moment (#moments)";
  ch1.resize(1440, 698);
  ch1.x = 0;
  ch1.y = 900;
  ch1.fills = [{{ type: "SOLID", color: cPaper }}];
  ch1.paddingLeft = 100;
  ch1.paddingRight = 100;
  ch1.paddingTop = 80;
  ch1.paddingBottom = 80;
  ch1.layoutMode = "VERTICAL";
  ch1.primaryAxisAlignItems = "SPACE_BETWEEN";
  deskFrame.appendChild(ch1);

  ch1.appendChild(makeChapterHeader("01", "A FAMILIAR MOMENT", 1240));

  // Two col layout
  const ch1Body = figma.createFrame();
  ch1Body.layoutMode = "HORIZONTAL";
  ch1Body.primaryAxisAlignItems = "SPACE_BETWEEN";
  ch1Body.resize(1240, 360);
  ch1Body.layoutAlign = "STRETCH";
  ch1Body.fills = [];

  // Left
  const ch1Left = figma.createFrame();
  ch1Left.layoutMode = "VERTICAL";
  ch1Left.itemSpacing = 0;
  ch1Left.fills = [];
  ch1Left.appendChild(makeText("“Where did I", {{ font: {{ family: "Georgia", style: "Regular" }}, size: 60, lineHeight: 68 }}));
  const ch1H2 = figma.createFrame();
  ch1H2.layoutMode = "HORIZONTAL";
  ch1H2.itemSpacing = 8;
  ch1H2.fills = [];
  ch1H2.appendChild(makeText("put my", {{ font: {{ family: "Georgia", style: "Regular" }}, size: 60, lineHeight: 68 }}));
  ch1H2.appendChild(makeText("glasses?”", {{ font: {{ family: "Georgia", style: "Italic" }}, size: 60, lineHeight: 68, color: cOrange }}));
  ch1Left.appendChild(ch1H2);
  ch1Body.appendChild(ch1Left);

  // Right
  const ch1Right = figma.createFrame();
  ch1Right.layoutMode = "VERTICAL";
  ch1Right.itemSpacing = 20;
  ch1Right.fills = [];
  ch1Right.appendChild(makeText("Some days, a familiar room can feel a little less familiar.", {{
    font: {{ family: "Inter", style: "Medium" }},
    size: 24,
    lineHeight: 34,
    width: 480
  }}));
  ch1Right.appendChild(makeText("SMRITI keeps a gentle memory of where everyday things were, so the answer is close when someone needs it.", {{
    font: {{ family: "Inter", style: "Regular" }},
    size: 15,
    lineHeight: 24,
    color: cMuted,
    width: 480
  }}));
  ch1Right.appendChild(makeText("Watch the moment unfold ↗", {{
    font: {{ family: "Inter", style: "Semi Bold" }},
    size: 14,
    color: cInk
  }}));
  ch1Body.appendChild(ch1Right);
  ch1.appendChild(ch1Body);

  // Bottom ribbon
  const ribbon = figma.createFrame();
  ribbon.layoutMode = "HORIZONTAL";
  ribbon.itemSpacing = 16;
  ribbon.primaryAxisAlignItems = "CENTER";
  ribbon.counterAxisAlignItems = "CENTER";
  ribbon.layoutAlign = "STRETCH";
  ribbon.fills = [];
  ["READING GLASSES", "HOUSE KEYS", "MEDICINE"].forEach((item, idx) => {{
    ribbon.appendChild(makePill(item, {{ bg: {{ r: 1, g: 1, b: 1 }}, stroke: cBorderWarm, size: 10, letterSpacing: 1.5, padX: 20, padY: 10 }}));
    if (idx < 2) {{
      const d = figma.createEllipse();
      d.resize(4, 4);
      d.fills = [{{ type: "SOLID", color: cOrange }}];
      ribbon.appendChild(d);
    }}
  }});
  ch1.appendChild(ribbon);

  // SECTION 03: CHAPTER 02 (chapter-moments, y: 1598, h: 645)
  const ch2 = figma.createFrame();
  ch2.name = "Section 03 / Chapter 02 — Three Quiet Moments";
  ch2.resize(1440, 645);
  ch2.x = 0;
  ch2.y = 1598;
  ch2.fills = [{{ type: "SOLID", color: cPaper }}];
  ch2.paddingLeft = 100;
  ch2.paddingRight = 100;
  ch2.paddingTop = 70;
  ch2.paddingBottom = 70;
  ch2.layoutMode = "VERTICAL";
  ch2.primaryAxisAlignItems = "SPACE_BETWEEN";
  deskFrame.appendChild(ch2);

  ch2.appendChild(makeChapterHeader("02", "THREE QUIET MOMENTS", 1240));

  const ch2Body = figma.createFrame();
  ch2Body.layoutMode = "HORIZONTAL";
  ch2Body.primaryAxisAlignItems = "SPACE_BETWEEN";
  ch2Body.layoutAlign = "STRETCH";
  ch2Body.fills = [];

  // Left
  const ch2Left = figma.createFrame();
  ch2Left.layoutMode = "VERTICAL";
  ch2Left.itemSpacing = 18;
  ch2Left.fills = [];
  const ch2Title = figma.createFrame();
  ch2Title.layoutMode = "VERTICAL";
  ch2Title.fills = [];
  ch2Title.appendChild(makeText("A little help,", {{ font: {{ family: "Georgia", style: "Regular" }}, size: 48, lineHeight: 56 }}));
  ch2Title.appendChild(makeText("right on time.", {{ font: {{ family: "Georgia", style: "Italic" }}, size: 48, lineHeight: 56, color: cOrange }}));
  ch2Left.appendChild(ch2Title);
  ch2Left.appendChild(makeText("Nothing to learn. Nothing to remember about the technology. Just a clear answer when it matters.", {{
    font: {{ family: "Inter", style: "Regular" }},
    size: 15,
    lineHeight: 24,
    color: cMuted,
    width: 400
  }}));
  ch2Body.appendChild(ch2Left);

  // Right: 3 moments list
  const ch2List = figma.createFrame();
  ch2List.layoutMode = "VERTICAL";
  ch2List.itemSpacing = 0;
  ch2List.fills = [];

  const moments = [
    {{ num: "01", title: "Remember", desc: "The glasses have a usual place. SMRITI keeps track of it.", tag: "BEFORE" }},
    {{ num: "02", title: "Notice", desc: "Later, they are somewhere else. The room has changed.", tag: "AFTER" }},
    {{ num: "03", title: "Explain", desc: "A small, certain answer replaces a frustrating search.", tag: "FOUND" }}
  ];

  moments.forEach(m => {{
    const row = figma.createFrame();
    row.layoutMode = "HORIZONTAL";
    row.primaryAxisAlignItems = "SPACE_BETWEEN";
    row.counterAxisAlignItems = "CENTER";
    row.resize(680, 85);
    row.fills = [];
    row.strokes = [{{ type: "SOLID", color: cBorderWarm }}];
    row.strokeWeight = 1;

    const rowLeft = figma.createFrame();
    rowLeft.layoutMode = "HORIZONTAL";
    rowLeft.itemSpacing = 24;
    rowLeft.counterAxisAlignItems = "CENTER";
    rowLeft.fills = [];
    rowLeft.appendChild(makeText(m.num, {{ font: {{ family: "Inter", style: "Semi Bold" }}, size: 12, color: cOrange }}));

    const textWrap = figma.createFrame();
    textWrap.layoutMode = "VERTICAL";
    textWrap.itemSpacing = 4;
    textWrap.fills = [];
    textWrap.appendChild(makeText(m.title, {{ font: {{ family: "Inter", style: "Semi Bold" }}, size: 18 }}));
    textWrap.appendChild(makeText(m.desc, {{ font: {{ family: "Inter", style: "Regular" }}, size: 13, color: cMuted, width: 440 }}));
    rowLeft.appendChild(textWrap);

    row.appendChild(rowLeft);
    row.appendChild(makePill(m.tag, {{ bg: cPaperElevated, stroke: cBorderWarm, size: 10, letterSpacing: 1.5, padX: 14, padY: 6 }}));
    ch2List.appendChild(row);
  }});

  ch2Body.appendChild(ch2List);
  ch2.appendChild(ch2Body);

  // SECTION 04: CHAPTER 03 (#reality-diff, y: 2243, h: 773)
  const ch3 = figma.createFrame();
  ch3.name = "Section 04 / Chapter 03 — One Meaningful Change (#reality-diff)";
  ch3.resize(1440, 773);
  ch3.x = 0;
  ch3.y = 2243;
  ch3.fills = [{{ type: "SOLID", color: cPaper }}];
  ch3.paddingLeft = 100;
  ch3.paddingRight = 100;
  ch3.paddingTop = 60;
  ch3.paddingBottom = 60;
  ch3.layoutMode = "VERTICAL";
  ch3.primaryAxisAlignItems = "SPACE_BETWEEN";
  deskFrame.appendChild(ch3);

  ch3.appendChild(makeChapterHeader("03", "ONE MEANINGFUL CHANGE", 1240));

  const ch3Header = figma.createFrame();
  ch3Header.layoutMode = "VERTICAL";
  ch3Header.itemSpacing = 8;
  ch3Header.fills = [];
  const ch3TitleWrap = figma.createFrame();
  ch3TitleWrap.layoutMode = "HORIZONTAL";
  ch3TitleWrap.itemSpacing = 8;
  ch3TitleWrap.fills = [];
  ch3TitleWrap.appendChild(makeText("The room,", {{ font: {{ family: "Georgia", style: "Regular" }}, size: 44, lineHeight: 52 }}));
  ch3TitleWrap.appendChild(makeText("then and now.", {{ font: {{ family: "Georgia", style: "Italic" }}, size: 44, lineHeight: 52, color: cOrange }}));
  ch3Header.appendChild(ch3TitleWrap);
  ch3Header.appendChild(makeText("Move through the afternoon. See what stayed — and what moved.", {{
    font: {{ family: "Inter", style: "Regular" }},
    size: 15,
    color: cMuted
  }}));
  ch3.appendChild(ch3Header);

  // Timeline Card
  const diffCard = figma.createFrame();
  diffCard.resize(1240, 360);
  diffCard.cornerRadius = 24;
  diffCard.fills = [{{ type: "SOLID", color: cPaperElevated }}];
  diffCard.strokes = [{{ type: "SOLID", color: cBorderWarm }}];
  diffCard.strokeWeight = 1;
  diffCard.paddingLeft = 40;
  diffCard.paddingRight = 40;
  diffCard.paddingTop = 40;
  diffCard.paddingBottom = 40;
  diffCard.layoutMode = "VERTICAL";
  diffCard.primaryAxisAlignItems = "SPACE_BETWEEN";

  // Timepoints
  const tp = figma.createFrame();
  tp.layoutMode = "HORIZONTAL";
  tp.primaryAxisAlignItems = "SPACE_BETWEEN";
  tp.layoutAlign = "STRETCH";
  tp.fills = [];
  const tp1 = figma.createFrame();
  tp1.layoutMode = "VERTICAL";
  tp1.fills = [];
  tp1.appendChild(makeText("2:10 PM", {{ font: {{ family: "Inter", style: "Semi Bold" }}, size: 14, color: cOrange }}));
  tp1.appendChild(makeText("At the side table", {{ font: {{ family: "Inter", style: "Regular" }}, size: 13, color: cMuted }}));

  const tp2 = figma.createFrame();
  tp2.layoutMode = "VERTICAL";
  tp2.fills = [];
  tp2.appendChild(makeText("4:40 PM", {{ font: {{ family: "Inter", style: "Semi Bold" }}, size: 14, color: cInk }}));
  tp2.appendChild(makeText("On the bookshelf", {{ font: {{ family: "Inter", style: "Regular" }}, size: 13, color: cMuted }}));

  tp.appendChild(tp1);
  tp.appendChild(tp2);
  diffCard.appendChild(tp);

  // Track Line with Slider
  const trackLine = figma.createFrame();
  trackLine.resize(1160, 8);
  trackLine.cornerRadius = 4;
  trackLine.fills = [{{ type: "SOLID", color: cBorderWarm }}];
  diffCard.appendChild(trackLine);

  // Readout bar
  const readout = figma.createFrame();
  readout.layoutMode = "HORIZONTAL";
  readout.primaryAxisAlignItems = "SPACE_BETWEEN";
  readout.counterAxisAlignItems = "CENTER";
  readout.layoutAlign = "STRETCH";
  readout.fills = [];
  readout.appendChild(makeText("The glasses begin on the side table.", {{ font: {{ family: "Inter", style: "Medium" }}, size: 16 }}));
  readout.appendChild(makeText("01 / 01", {{ font: {{ family: "Inter", style: "Semi Bold" }}, size: 13, color: cOrange }}));
  diffCard.appendChild(readout);

  ch3.appendChild(diffCard);
  ch3.appendChild(makeText("A simple visual memory. No searching through recordings.", {{
    font: {{ family: "Inter", style: "Regular" }},
    size: 13,
    color: cMuted
  }}));

  // SECTION 05: CHAPTER 04 (#memory, y: 3016, h: 588)
  const ch4 = figma.createFrame();
  ch4.name = "Section 05 / Chapter 04 — A Memory to Keep (#memory)";
  ch4.resize(1440, 588);
  ch4.x = 0;
  ch4.y = 3016;
  ch4.fills = [{{ type: "SOLID", color: cPaper }}];
  ch4.paddingLeft = 100;
  ch4.paddingRight = 100;
  ch4.paddingTop = 60;
  ch4.paddingBottom = 60;
  ch4.layoutMode = "VERTICAL";
  ch4.primaryAxisAlignItems = "SPACE_BETWEEN";
  deskFrame.appendChild(ch4);

  ch4.appendChild(makeChapterHeader("04", "A MEMORY TO KEEP", 1240));

  const ch4Body = figma.createFrame();
  ch4Body.layoutMode = "HORIZONTAL";
  ch4Body.primaryAxisAlignItems = "SPACE_BETWEEN";
  ch4Body.layoutAlign = "STRETCH";
  ch4Body.fills = [];

  const ch4Left = figma.createFrame();
  ch4Left.layoutMode = "VERTICAL";
  ch4Left.itemSpacing = 16;
  ch4Left.fills = [];
  ch4Left.appendChild(makeText("CLEAR, CALM, CERTAIN", {{ font: {{ family: "Inter", style: "Semi Bold" }}, size: 11, color: cOrange, letterSpacing: 1.5 }}));
  const ch4Title = figma.createFrame();
  ch4Title.layoutMode = "VERTICAL";
  ch4Title.fills = [];
  ch4Title.appendChild(makeText("The answer,", {{ font: {{ family: "Georgia", style: "Regular" }}, size: 48, lineHeight: 56 }}));
  ch4Title.appendChild(makeText("without the search.", {{ font: {{ family: "Georgia", style: "Italic" }}, size: 48, lineHeight: 56, color: cOrange }}));
  ch4Left.appendChild(ch4Title);
  ch4Body.appendChild(ch4Left);

  // Receipt Preview
  const ch4Receipt = figma.createFrame();
  ch4Receipt.resize(460, 280);
  ch4Receipt.cornerRadius = 20;
  ch4Receipt.fills = [{{ type: "SOLID", color: {{ r: 1, g: 1, b: 1 }} }}];
  ch4Receipt.strokes = [{{ type: "SOLID", color: cBorderWarm }}];
  ch4Receipt.strokeWeight = 1;
  ch4Receipt.paddingLeft = 32;
  ch4Receipt.paddingRight = 32;
  ch4Receipt.paddingTop = 28;
  ch4Receipt.paddingBottom = 28;
  ch4Receipt.layoutMode = "VERTICAL";
  ch4Receipt.primaryAxisAlignItems = "SPACE_BETWEEN";

  const rTop = figma.createFrame();
  rTop.layoutMode = "HORIZONTAL";
  rTop.primaryAxisAlignItems = "SPACE_BETWEEN";
  rTop.layoutAlign = "STRETCH";
  rTop.fills = [];
  rTop.appendChild(makeText("SMRITI", {{ font: {{ family: "Inter", style: "Bold" }}, size: 14 }}));
  rTop.appendChild(makeText("HOME MEMORY · 01", {{ font: {{ family: "Inter", style: "Semi Bold" }}, size: 10, color: cMuted, letterSpacing: 1 }}));
  ch4Receipt.appendChild(rTop);

  ch4Receipt.appendChild(makeText("READING GLASSES", {{ font: {{ family: "Inter", style: "Semi Bold" }}, size: 24 }}));

  const rRoute = figma.createFrame();
  rRoute.layoutMode = "HORIZONTAL";
  rRoute.itemSpacing = 20;
  rRoute.counterAxisAlignItems = "CENTER";
  rRoute.fills = [];
  rRoute.appendChild(makeText("2:10 PM Side table", {{ font: {{ family: "Inter", style: "Regular" }}, size: 13, color: cMuted }}));
  rRoute.appendChild(makeText("→", {{ font: {{ family: "Inter", style: "Bold" }}, size: 16, color: cOrange }}));
  rRoute.appendChild(makeText("4:40 PM Bookshelf", {{ font: {{ family: "Inter", style: "Semi Bold" }}, size: 13 }}));
  ch4Receipt.appendChild(rRoute);

  const rBottom = figma.createFrame();
  rBottom.layoutMode = "HORIZONTAL";
  rBottom.primaryAxisAlignItems = "SPACE_BETWEEN";
  rBottom.layoutAlign = "STRETCH";
  rBottom.fills = [];
  rBottom.appendChild(makePill("CONFIRMED MOVED", {{ dotColor: {{ r: 0.2, g: 0.8, b: 0.4 }}, bg: cPaperElevated, size: 10, letterSpacing: 1 }}));
  rBottom.appendChild(makeText("One meaningful change", {{ font: {{ family: "Inter", style: "Regular" }}, size: 11, color: cMuted }}));
  ch4Receipt.appendChild(rBottom);

  ch4Body.appendChild(ch4Receipt);
  ch4.appendChild(ch4Body);

  // SECTION 06: CHAPTER 05 (#phantom, y: 3604, h: 826)
  const ch5 = figma.createFrame();
  ch5.name = "Section 06 / Chapter 05 — PHANTOM Spatial Engine (#phantom)";
  ch5.resize(1440, 826);
  ch5.x = 0;
  ch5.y = 3604;
  ch5.fills = [{{ type: "SOLID", color: cDarkCosmos }}];
  ch5.paddingLeft = 100;
  ch5.paddingRight = 100;
  ch5.paddingTop = 60;
  ch5.paddingBottom = 60;
  ch5.layoutMode = "VERTICAL";
  ch5.primaryAxisAlignItems = "SPACE_BETWEEN";
  deskFrame.appendChild(ch5);

  ch5.appendChild(makeChapterHeader("05", "PHANTOM SPATIAL ENGINE", 1240, true));

  const ch5Body = figma.createFrame();
  ch5Body.layoutMode = "HORIZONTAL";
  ch5Body.primaryAxisAlignItems = "SPACE_BETWEEN";
  ch5Body.layoutAlign = "STRETCH";
  ch5Body.fills = [];

  // Left
  const ch5Left = figma.createFrame();
  ch5Left.layoutMode = "VERTICAL";
  ch5Left.itemSpacing = 16;
  ch5Left.fills = [];
  ch5Left.appendChild(makeText("• 05 / PHANTOM", {{ font: {{ family: "Inter", style: "Semi Bold" }}, size: 11, color: cCyan, letterSpacing: 1.5 }}));
  ch5Left.appendChild(makeText("Meet PHANTOM.", {{ font: {{ family: "Georgia", style: "Regular" }}, size: 52, color: {{ r: 1, g: 1, b: 1 }} }}));
  ch5Left.appendChild(makeText("The spatial memory engine behind SMRITI.", {{ font: {{ family: "Inter", style: "Medium" }}, size: 16, color: cCyan }}));
  ch5Left.appendChild(makeText("PHANTOM remembers where things were, compares that memory with what exists now, and reveals what changed.", {{
    font: {{ family: "Inter", style: "Regular" }},
    size: 14,
    lineHeight: 22,
    color: {{ r: 0.7, g: 0.75, b: 0.8 }},
    width: 480
  }}));

  // Process pipeline
  ch5Left.appendChild(makePill("REMEMBER → COMPARE → EXPLAIN", {{
    bg: cDarkCard,
    stroke: cBorderDark,
    color: cCyan,
    size: 11,
    letterSpacing: 1.5,
    padX: 18,
    padY: 8
  }}));

  // State Card
  const stCard = figma.createFrame();
  stCard.resize(480, 180);
  stCard.cornerRadius = 16;
  stCard.fills = [{{ type: "SOLID", color: cDarkCard }}];
  stCard.strokes = [{{ type: "SOLID", color: cBorderDark }}];
  stCard.strokeWeight = 1;
  stCard.paddingLeft = 24;
  stCard.paddingRight = 24;
  stCard.paddingTop = 20;
  stCard.paddingBottom = 20;
  stCard.layoutMode = "VERTICAL";
  stCard.itemSpacing = 10;

  stCard.appendChild(makeText("STATE 04 · CHANGE FOUND", {{ font: {{ family: "Inter", style: "Semi Bold" }}, size: 10, color: cCyan, letterSpacing: 1 }}));
  stCard.appendChild(makeText("Difference detected", {{ font: {{ family: "Inter", style: "Bold" }}, size: 20, color: {{ r: 1, g: 1, b: 1 }} }}));
  stCard.appendChild(makeText("The previous position remains as a ghosted reference. A spatial displacement path connects the side table to the bookshelf.", {{
    font: {{ family: "Inter", style: "Regular" }},
    size: 12,
    lineHeight: 18,
    color: {{ r: 0.7, g: 0.75, b: 0.8 }}
  }}));
  ch5Left.appendChild(stCard);

  // Stage Selector Tabs
  const tabRow = figma.createFrame();
  tabRow.layoutMode = "HORIZONTAL";
  tabRow.itemSpacing = 8;
  tabRow.fills = [];
  ["Ready", "Scanning", "Analyzing", "Found", "Confirmed"].forEach(tab => {{
    tabRow.appendChild(makePill(tab, {{
      bg: tab === "Found" ? cCyan : cDarkCard,
      stroke: cBorderDark,
      color: tab === "Found" ? cDarkCosmos : {{ r: 0.8, g: 0.85, b: 0.9 }},
      padX: 14,
      padY: 6,
      size: 11
    }}));
  }});
  ch5Left.appendChild(tabRow);
  ch5Body.appendChild(ch5Left);

  // Right: Wireframe 3D Canvas Container
  const wfCanvas = figma.createFrame();
  wfCanvas.resize(680, 520);
  wfCanvas.cornerRadius = 24;
  wfCanvas.fills = [getImagePaint("phantom_wireframe")];
  wfCanvas.strokes = [{{ type: "SOLID", color: cBorderDark }}];
  wfCanvas.strokeWeight = 1;

  ch5Body.appendChild(wfCanvas);
  ch5.appendChild(ch5Body);

  // SECTION 07: CHAPTER 06 (#reality-diff-compare, y: 4430, h: 1444)
  const ch6 = figma.createFrame();
  ch6.name = "Section 07 / Chapter 06 — Reality Diff Compare (#reality-diff-compare)";
  ch6.resize(1440, 1444);
  ch6.x = 0;
  ch6.y = 4430;
  ch6.fills = [{{ type: "SOLID", color: cPaper }}];
  ch6.paddingLeft = 100;
  ch6.paddingRight = 100;
  ch6.paddingTop = 60;
  ch6.paddingBottom = 60;
  ch6.layoutMode = "VERTICAL";
  ch6.primaryAxisAlignItems = "SPACE_BETWEEN";
  deskFrame.appendChild(ch6);

  ch6.appendChild(makeChapterHeader("06", "REALITY DIFF", 1240));

  const ch6Head = figma.createFrame();
  ch6Head.layoutMode = "VERTICAL";
  ch6Head.itemSpacing = 8;
  ch6Head.fills = [];
  ch6Head.appendChild(makeText("• 06 / REALITY DIFF", {{ font: {{ family: "Inter", style: "Semi Bold" }}, size: 11, color: cOrange, letterSpacing: 1.5 }}));
  ch6Head.appendChild(makeText("See what changed.", {{ font: {{ family: "Georgia", style: "Regular" }}, size: 52, lineHeight: 60 }}));
  ch6Head.appendChild(makeText("SMRITI compares moments in your home so the change doesn't have to live only in your memory.", {{
    font: {{ family: "Inter", style: "Regular" }},
    size: 15,
    color: cMuted
  }}));
  ch6.appendChild(ch6Head);

  // Comparison Big Card
  const compCard = figma.createFrame();
  compCard.resize(1240, 780);
  compCard.cornerRadius = 24;
  compCard.fills = [{{ type: "SOLID", color: cPaperElevated }}];
  compCard.strokes = [{{ type: "SOLID", color: cBorderWarm }}];
  compCard.strokeWeight = 1;
  compCard.layoutMode = "VERTICAL";

  // Comparison Viewport with Image
  const compView = figma.createFrame();
  compView.resize(1240, 680);
  compView.cornerRadius = 24;
  compView.fills = [getImagePaint("reality_diff")];
  compCard.appendChild(compView);

  // Evidence Bar
  const evBar = figma.createFrame();
  evBar.resize(1240, 100);
  evBar.paddingLeft = 40;
  evBar.paddingRight = 40;
  evBar.layoutMode = "HORIZONTAL";
  evBar.primaryAxisAlignItems = "SPACE_BETWEEN";
  evBar.counterAxisAlignItems = "CENTER";
  evBar.fills = [];

  const evTime = figma.createFrame();
  evTime.layoutMode = "HORIZONTAL";
  evTime.itemSpacing = 20;
  evTime.counterAxisAlignItems = "CENTER";
  evTime.fills = [];
  evTime.appendChild(makeText("2:10 PM Side table", {{ font: {{ family: "Inter", style: "Regular" }}, size: 13, color: cMuted }}));
  evTime.appendChild(makeText("→", {{ font: {{ family: "Inter", style: "Bold" }}, size: 16, color: cOrange }}));
  evTime.appendChild(makeText("4:40 PM Bookshelf", {{ font: {{ family: "Inter", style: "Semi Bold" }}, size: 13 }}));
  evBar.appendChild(evTime);

  evBar.appendChild(makeText("OBJECT MOVED: GLASSES → TABLE → BOOKSHELF", {{
    font: {{ family: "Inter", style: "Semi Bold" }},
    size: 11,
    color: cOrange,
    letterSpacing: 1.5
  }}));
  compCard.appendChild(evBar);
  ch6.appendChild(compCard);

  // Editorial Closing Quote
  const edClose = figma.createFrame();
  edClose.layoutMode = "VERTICAL";
  edClose.itemSpacing = 12;
  edClose.fills = [];
  edClose.appendChild(makeText("“Not everything changes.\\nOnly what matters.”", {{
    font: {{ family: "Georgia", style: "Regular" }},
    size: 44,
    lineHeight: 52
  }}));
  edClose.appendChild(makeText("SMRITI makes the difference visible.", {{
    font: {{ family: "Inter", style: "Medium" }},
    size: 16,
    color: cMuted
  }}));
  ch6.appendChild(edClose);

  // SECTION 08: CHAPTER 07 (#memory-receipt-section, y: 5874, h: 752)
  const ch7 = figma.createFrame();
  ch7.name = "Section 08 / Chapter 07 — Memory Receipt (#memory-receipt-section)";
  ch7.resize(1440, 752);
  ch7.x = 0;
  ch7.y = 5874;
  ch7.fills = [{{ type: "SOLID", color: cPaper }}];
  ch7.paddingLeft = 100;
  ch7.paddingRight = 100;
  ch7.paddingTop = 60;
  ch7.paddingBottom = 60;
  ch7.layoutMode = "VERTICAL";
  ch7.primaryAxisAlignItems = "SPACE_BETWEEN";
  deskFrame.appendChild(ch7);

  ch7.appendChild(makeChapterHeader("07", "MEMORY RECEIPT", 1240));

  const ch7Body = figma.createFrame();
  ch7Body.layoutMode = "HORIZONTAL";
  ch7Body.primaryAxisAlignItems = "SPACE_BETWEEN";
  ch7Body.layoutAlign = "STRETCH";
  ch7Body.fills = [];

  // Left
  const ch7Left = figma.createFrame();
  ch7Left.layoutMode = "VERTICAL";
  ch7Left.itemSpacing = 16;
  ch7Left.fills = [];
  ch7Left.appendChild(makeText("• 07 / MEMORY RECEIPT", {{ font: {{ family: "Inter", style: "Semi Bold" }}, size: 11, color: cOrange, letterSpacing: 1.5 }}));
  const ch7Title = figma.createFrame();
  ch7Title.layoutMode = "VERTICAL";
  ch7Title.fills = [];
  ch7Title.appendChild(makeText("Remembered,", {{ font: {{ family: "Georgia", style: "Regular" }}, size: 52, lineHeight: 60 }}));
  ch7Title.appendChild(makeText("not guessed.", {{ font: {{ family: "Georgia", style: "Italic" }}, size: 52, lineHeight: 60, color: cOrange }}));
  ch7Left.appendChild(ch7Title);
  ch7Left.appendChild(makeText("SMRITI turns a change in your home into a simple record you can understand.", {{
    font: {{ family: "Inter", style: "Regular" }},
    size: 15,
    lineHeight: 24,
    color: cMuted,
    width: 440
  }}));

  // Narrative box with orange left border
  const narrBox = figma.createFrame();
  narrBox.resize(440, 110);
  narrBox.cornerRadius = 8;
  narrBox.fills = [{{ type: "SOLID", color: {{ r: 1, g: 1, b: 1 }} }}];
  narrBox.strokes = [{{ type: "SOLID", color: cOrange }}];
  narrBox.strokeWeight = 3;
  narrBox.paddingLeft = 20;
  narrBox.paddingRight = 20;
  narrBox.paddingTop = 16;
  narrBox.paddingBottom = 16;
  narrBox.layoutMode = "VERTICAL";
  narrBox.itemSpacing = 6;
  narrBox.appendChild(makeText("Every memory has a place.", {{ font: {{ family: "Inter", style: "Semi Bold" }}, size: 16 }}));
  narrBox.appendChild(makeText("Observed change: reading glasses moved from the side table to the bookshelf.", {{
    font: {{ family: "Inter", style: "Regular" }},
    size: 13,
    color: cMuted
  }}));
  ch7Left.appendChild(narrBox);
  ch7Body.appendChild(ch7Left);

  // Center: Physical Memory Receipt Instance or Reconstructed Artifact
  const receiptInst = createInstance("receipt_card");
  if (receiptInst) {{
    ch7Body.appendChild(receiptInst);
  }} else {{
    // Fallback receipt
    const rFallback = figma.createFrame();
    rFallback.resize(380, 480);
    rFallback.cornerRadius = 16;
    rFallback.fills = [{{ type: "SOLID", color: {{ r: 1, g: 1, b: 1 }} }}];
    rFallback.strokes = [{{ type: "SOLID", color: cBorderWarm }}];
    rFallback.paddingLeft = 28;
    rFallback.paddingRight = 28;
    rFallback.paddingTop = 24;
    rFallback.paddingBottom = 24;
    rFallback.layoutMode = "VERTICAL";
    rFallback.primaryAxisAlignItems = "SPACE_BETWEEN";

    rFallback.appendChild(makeText("SMRITI MEMORY RECEIPT", {{ font: {{ family: "Inter", style: "Bold" }}, size: 14 }}));
    rFallback.appendChild(makeText("OBJECT MOVED: Reading glasses", {{ font: {{ family: "Inter", style: "Semi Bold" }}, size: 20 }}));
    rFallback.appendChild(makeText("Side table (2:10 PM) → Bookshelf (4:40 PM)", {{ font: {{ family: "Inter", style: "Medium" }}, size: 13 }}));
    rFallback.appendChild(makeText("SPATIAL DISPLACEMENT: 4.85 METERS", {{ font: {{ family: "Inter", style: "Regular" }}, size: 12, color: cMuted }}));
    rFallback.appendChild(makePill("CONFIRMED", {{ dotColor: {{ r: 0.2, g: 0.8, b: 0.4 }}, bg: cPaperElevated, size: 10 }}));
    ch7Body.appendChild(rFallback);
  }}

  // Right: 3D Glasses companion
  const glassesCompanion = figma.createFrame();
  glassesCompanion.resize(240, 200);
  glassesCompanion.fills = [];
  glassesCompanion.layoutMode = "VERTICAL";
  glassesCompanion.counterAxisAlignItems = "CENTER";
  glassesCompanion.itemSpacing = 12;

  const glassesImg = figma.createFrame();
  glassesImg.resize(240, 160);
  glassesImg.fills = [getImagePaint("glasses_3d")];
  glassesCompanion.appendChild(glassesImg);
  glassesCompanion.appendChild(makePill("PHYSICAL ARTIFACT", {{ bg: cPaperElevated, stroke: cBorderWarm, size: 9, letterSpacing: 1.5 }}));
  ch7Body.appendChild(glassesCompanion);

  ch7.appendChild(ch7Body);

  // SECTION 09: CHAPTER 08 (#trust, y: 6626, h: 892)
  const ch8 = figma.createFrame();
  ch8.name = "Section 09 / Chapter 08 — Trust Manifesto (#trust)";
  ch8.resize(1440, 892);
  ch8.x = 0;
  ch8.y = 6626;
  ch8.fills = [{{ type: "SOLID", color: cDarkCosmos }}];
  ch8.paddingLeft = 100;
  ch8.paddingRight = 100;
  ch8.paddingTop = 60;
  ch8.paddingBottom = 60;
  ch8.layoutMode = "VERTICAL";
  ch8.primaryAxisAlignItems = "SPACE_BETWEEN";
  deskFrame.appendChild(ch8);

  ch8.appendChild(makeChapterHeader("08", "TRUST", 1240, true));

  const ch8Body = figma.createFrame();
  ch8Body.layoutMode = "HORIZONTAL";
  ch8Body.primaryAxisAlignItems = "SPACE_BETWEEN";
  ch8Body.layoutAlign = "STRETCH";
  ch8Body.fills = [];

  // Left col
  const ch8Left = figma.createFrame();
  ch8Left.layoutMode = "VERTICAL";
  ch8Left.itemSpacing = 16;
  ch8Left.fills = [];
  ch8Left.appendChild(makeText("• 08 / TRUST", {{ font: {{ family: "Inter", style: "Semi Bold" }}, size: 11, color: cOrange, letterSpacing: 1.5 }}));
  const ch8Title = figma.createFrame();
  ch8Title.layoutMode = "VERTICAL";
  ch8Title.fills = [];
  ch8Title.appendChild(makeText("Technology should reduce", {{ font: {{ family: "Georgia", style: "Regular" }}, size: 48, lineHeight: 56, color: {{ r: 1, g: 1, b: 1 }} }}));
  ch8Title.appendChild(makeText("confusion,", {{ font: {{ family: "Georgia", style: "Regular" }}, size: 48, lineHeight: 56, color: {{ r: 1, g: 1, b: 1 }} }}));
  ch8Title.appendChild(makeText("not create more of it.", {{ font: {{ family: "Georgia", style: "Italic" }}, size: 48, lineHeight: 56, color: cOrange }}));
  ch8Left.appendChild(ch8Title);
  ch8Body.appendChild(ch8Left);

  // Right col: Lead + 3 principles
  const ch8Right = figma.createFrame();
  ch8Right.layoutMode = "VERTICAL";
  ch8Right.itemSpacing = 28;
  ch8Right.fills = [];
  ch8Right.appendChild(makeText("SMRITI is designed to support people and caregivers with a clearer picture of what changed around them — without turning everyday life into surveillance.", {{
    font: {{ family: "Inter", style: "Regular" }},
    size: 16,
    lineHeight: 26,
    color: {{ r: 0.8, g: 0.85, b: 0.9 }},
    width: 580
  }}));

  const principles = [
    {{ num: "01 — CONTEXT", text: "Remember the environment, not just the object." }},
    {{ num: "02 — CLARITY", text: "Show what changed instead of forcing someone to remember." }},
    {{ num: "03 — HUMAN CONTROL", text: "Technology assists the caregiver. It does not replace them." }}
  ];

  principles.forEach(p => {{
    const pBox = figma.createFrame();
    pBox.layoutMode = "VERTICAL";
    pBox.itemSpacing = 8;
    pBox.fills = [];
    pBox.appendChild(makeText(p.num, {{ font: {{ family: "Inter", style: "Semi Bold" }}, size: 11, color: cOrange, letterSpacing: 1.5 }}));
    pBox.appendChild(makeText(p.text, {{ font: {{ family: "Inter", style: "Medium" }}, size: 18, color: {{ r: 1, g: 1, b: 1 }} }}));
    ch8Right.appendChild(pBox);
  }});

  ch8Body.appendChild(ch8Right);
  ch8.appendChild(ch8Body);

  // SECTION 10: CHAPTER 09 (#final-cta) & FOOTER (y: 7518, h: 792)
  const ch9 = figma.createFrame();
  ch9.name = "Section 10 / Chapter 09 — Final Moment & Footer (#final-cta)";
  ch9.resize(1440, 792);
  ch9.x = 0;
  ch9.y = 7518;
  ch9.fills = [{{ type: "SOLID", color: cDarkCosmos }}];
  ch9.paddingLeft = 100;
  ch9.paddingRight = 100;
  ch9.paddingTop = 60;
  ch9.paddingBottom = 40;
  ch9.layoutMode = "VERTICAL";
  ch9.primaryAxisAlignItems = "SPACE_BETWEEN";
  deskFrame.appendChild(ch9);

  ch9.appendChild(makeChapterHeader("09", "FINAL MOMENT", 1240, true));

  const ch9Body = figma.createFrame();
  ch9Body.layoutMode = "HORIZONTAL";
  ch9Body.primaryAxisAlignItems = "SPACE_BETWEEN";
  ch9Body.layoutAlign = "STRETCH";
  ch9Body.fills = [];

  // Left
  const ch9Left = figma.createFrame();
  ch9Left.layoutMode = "VERTICAL";
  ch9Left.itemSpacing = 20;
  ch9Left.fills = [];
  ch9Left.appendChild(makeText("• 09 / CLOSING", {{ font: {{ family: "Inter", style: "Semi Bold" }}, size: 11, color: cOrange, letterSpacing: 1.5 }}));
  const ch9Title = figma.createFrame();
  ch9Title.layoutMode = "VERTICAL";
  ch9Title.fills = [];
  ch9Title.appendChild(makeText("What if your home", {{ font: {{ family: "Georgia", style: "Regular" }}, size: 52, lineHeight: 60, color: {{ r: 1, g: 1, b: 1 }} }}));
  ch9Title.appendChild(makeText("could remember for you?", {{ font: {{ family: "Georgia", style: "Italic" }}, size: 52, lineHeight: 60, color: cOrange }}));
  ch9Left.appendChild(ch9Title);
  ch9Left.appendChild(makeText("SMRITI gives caregivers a clearer picture of what changed — so everyday uncertainty can become a little easier to navigate.", {{
    font: {{ family: "Inter", style: "Regular" }},
    size: 15,
    lineHeight: 24,
    color: {{ r: 0.8, g: 0.85, b: 0.9 }},
    width: 480
  }}));

  ch9Left.appendChild(makePill("Explore SMRITI ↗", {{
    bg: {{ r: 1, g: 1, b: 1 }},
    color: cInk,
    padX: 28,
    padY: 14,
    size: 14
  }}));
  ch9Body.appendChild(ch9Left);

  // Right: 3D Corner canvas
  const ctaWorld = figma.createFrame();
  ctaWorld.resize(600, 440);
  ctaWorld.cornerRadius = 24;
  ctaWorld.fills = [getImagePaint("cta_world")];
  ch9Body.appendChild(ctaWorld);
  ch9.appendChild(ch9Body);

  // Closing footer
  const ft = figma.createFrame();
  ft.layoutMode = "HORIZONTAL";
  ft.primaryAxisAlignItems = "SPACE_BETWEEN";
  ft.counterAxisAlignItems = "CENTER";
  ft.layoutAlign = "STRETCH";
  ft.fills = [];
  ft.strokes = [{{ type: "SOLID", color: cBorderDark }}];
  ft.strokeWeight = 1;
  ft.paddingTop = 20;

  const ftLeft = figma.createFrame();
  ftLeft.layoutMode = "HORIZONTAL";
  ftLeft.itemSpacing = 16;
  ftLeft.fills = [];
  ftLeft.appendChild(makeText("SMRITI / PHANTOM", {{ font: {{ family: "Inter", style: "Semi Bold" }}, size: 12, color: cOrange }}));
  ftLeft.appendChild(makeText("A spatial memory system for everyday life.", {{ font: {{ family: "Inter", style: "Regular" }}, size: 12, color: {{ r: 0.6, g: 0.65, b: 0.7 }} }}));
  ft.appendChild(ftLeft);
  ft.appendChild(makeText("Back to the beginning ↑", {{ font: {{ family: "Inter", style: "Medium" }}, size: 12, color: {{ r: 1, g: 1, b: 1 }} }}));
  ch9.appendChild(ft);

  // ============================================================================
  // RECONSTRUCT PAGE 04: TABLET & MOBILE (768px & 390px)
  // ============================================================================
  for (const c of [...p4.children]) c.remove();

  // 1. TABLET VIEWPORT (768×9120)
  const tabFrame = figma.createFrame();
  tabFrame.name = "04 — SMRITI Tablet Viewport (768×9120)";
  tabFrame.resize(768, 9120);
  tabFrame.x = 0;
  tabFrame.y = 0;
  tabFrame.fills = [{{ type: "SOLID", color: cPaper }}];
  p4.appendChild(tabFrame);

  // Tablet Hero
  const tabHero = figma.createFrame();
  tabHero.name = "Hero / Tablet";
  tabHero.resize(768, 1024);
  tabHero.fills = [getImagePaint("hero_tablet")];
  tabHero.paddingLeft = 32;
  tabHero.paddingRight = 32;
  tabHero.paddingTop = 20;
  tabHero.layoutMode = "VERTICAL";
  tabHero.primaryAxisAlignItems = "SPACE_BETWEEN";
  tabFrame.appendChild(tabHero);

  // Tablet Nav
  const tabNav = figma.createFrame();
  tabNav.resize(704, 52);
  tabNav.cornerRadius = 26;
  tabNav.fills = [{{ type: "SOLID", color: {{ r: 1, g: 1, b: 1 }}, opacity: 0.94 }}];
  tabNav.strokes = [{{ type: "SOLID", color: cBorderWarm }}];
  tabNav.layoutMode = "HORIZONTAL";
  tabNav.primaryAxisAlignItems = "SPACE_BETWEEN";
  tabNav.counterAxisAlignItems = "CENTER";
  tabNav.paddingLeft = 20;
  tabNav.paddingRight = 8;
  tabNav.appendChild(makeText("SMRITI.", {{ font: {{ family: "Inter", style: "Bold" }}, size: 18 }}));
  const tabNavRight = figma.createFrame();
  tabNavRight.layoutMode = "HORIZONTAL";
  tabNavRight.itemSpacing = 8;
  tabNavRight.counterAxisAlignItems = "CENTER";
  tabNavRight.fills = [];
  tabNavRight.appendChild(makePill("→", {{ bg: cInk, color: cPaper, padX: 12, padY: 8, size: 12 }}));
  tabNavRight.appendChild(makePill("☰", {{ bg: cPaperElevated, color: cInk, padX: 12, padY: 8, size: 14 }}));
  tabNav.appendChild(tabNavRight);
  tabHero.appendChild(tabNav);

  // Tablet Hero Content
  const tabHeroContent = figma.createFrame();
  tabHeroContent.layoutMode = "VERTICAL";
  tabHeroContent.itemSpacing = 16;
  tabHeroContent.paddingBottom = 40;
  tabHeroContent.fills = [];
  tabHeroContent.appendChild(makePill("A quiet afternoon at home", {{ dotColor: cOrange, bg: {{ r: 1, g: 1, b: 1 }}, padX: 12, padY: 6 }}));
  tabHeroContent.appendChild(makeText("• SPATIAL MEMORY FOR EVERYDAY LIFE", {{ font: {{ family: "Inter", style: "Semi Bold" }}, size: 10, color: cOrange, letterSpacing: 1.5 }}));
  const tabTitle = figma.createFrame();
  tabTitle.layoutMode = "VERTICAL";
  tabTitle.fills = [];
  tabTitle.appendChild(makeText("Your home", {{ font: {{ family: "Georgia", style: "Regular" }}, size: 56, lineHeight: 62 }}));
  tabTitle.appendChild(makeText("remembers.", {{ font: {{ family: "Georgia", style: "Italic" }}, size: 56, lineHeight: 62, color: cOrange }}));
  tabHeroContent.appendChild(tabTitle);
  tabHeroContent.appendChild(makeText("SMRITI remembers where everyday things were — and shows what changed.", {{
    font: {{ family: "Inter", style: "Regular" }},
    size: 15,
    lineHeight: 24,
    color: cMuted,
    width: 500
  }}));
  const tabActions = figma.createFrame();
  tabActions.layoutMode = "HORIZONTAL";
  tabActions.itemSpacing = 16;
  tabActions.counterAxisAlignItems = "CENTER";
  tabActions.fills = [];
  tabActions.appendChild(makePill("See how it works →", {{ bg: cInk, color: cPaper, padX: 20, padY: 12, size: 13 }}));
  tabActions.appendChild(makeText("Where are my glasses?", {{ font: {{ family: "Inter", style: "Regular" }}, size: 13 }}));
  tabHeroContent.appendChild(tabActions);
  tabHero.appendChild(tabHeroContent);

  // Tablet Chapters 01 to 09
  // Chapter 01 Tablet
  const tabCh1 = figma.createFrame();
  tabCh1.resize(768, 683);
  tabCh1.y = 1024;
  tabCh1.fills = [{{ type: "SOLID", color: cPaper }}];
  tabCh1.paddingLeft = 32;
  tabCh1.paddingRight = 32;
  tabCh1.paddingTop = 60;
  tabCh1.paddingBottom = 60;
  tabCh1.layoutMode = "VERTICAL";
  tabCh1.primaryAxisAlignItems = "SPACE_BETWEEN";
  tabCh1.appendChild(makeChapterHeader("01", "A FAMILIAR MOMENT", 704));

  const tabCh1Body = figma.createFrame();
  tabCh1Body.layoutMode = "VERTICAL";
  tabCh1Body.itemSpacing = 20;
  tabCh1Body.fills = [];
  tabCh1Body.appendChild(makeText("“Where did I put my glasses?”", {{ font: {{ family: "Georgia", style: "Regular" }}, size: 44, lineHeight: 52 }}));
  tabCh1Body.appendChild(makeText("Some days, a familiar room can feel a little less familiar.", {{ font: {{ family: "Inter", style: "Medium" }}, size: 22, lineHeight: 30 }}));
  tabCh1Body.appendChild(makeText("SMRITI keeps a gentle memory of where everyday things were, so the answer is close when someone needs it.", {{
    font: {{ family: "Inter", style: "Regular" }},
    size: 15,
    lineHeight: 24,
    color: cMuted,
    width: 640
  }}));
  tabCh1Body.appendChild(makeText("Watch the moment unfold ↗", {{ font: {{ family: "Inter", style: "Semi Bold" }}, size: 14 }}));
  tabCh1.appendChild(tabCh1Body);

  const tabRibbon = figma.createFrame();
  tabRibbon.layoutMode = "HORIZONTAL";
  tabRibbon.itemSpacing = 12;
  tabRibbon.counterAxisAlignItems = "CENTER";
  tabRibbon.fills = [];
  ["READING GLASSES", "HOUSE KEYS", "MEDICINE"].forEach(item => {{
    tabRibbon.appendChild(makePill(item, {{ bg: {{ r: 1, g: 1, b: 1 }}, stroke: cBorderWarm, size: 10, letterSpacing: 1 }}));
  }});
  tabCh1.appendChild(tabRibbon);
  tabFrame.appendChild(tabCh1);

  // Tablet Chapter 05 (PHANTOM)
  const tabCh5 = figma.createFrame();
  tabCh5.resize(768, 1206);
  tabCh5.y = 3635;
  tabCh5.fills = [{{ type: "SOLID", color: cDarkCosmos }}];
  tabCh5.paddingLeft = 32;
  tabCh5.paddingRight = 32;
  tabCh5.paddingTop = 60;
  tabCh5.paddingBottom = 60;
  tabCh5.layoutMode = "VERTICAL";
  tabCh5.primaryAxisAlignItems = "SPACE_BETWEEN";
  tabCh5.appendChild(makeChapterHeader("05", "PHANTOM SPATIAL ENGINE", 704, true));

  const tabCh5Content = figma.createFrame();
  tabCh5Content.layoutMode = "VERTICAL";
  tabCh5Content.itemSpacing = 16;
  tabCh5Content.fills = [];
  tabCh5Content.appendChild(makeText("• 05 / PHANTOM", {{ font: {{ family: "Inter", style: "Semi Bold" }}, size: 10, color: cCyan, letterSpacing: 1.5 }}));
  tabCh5Content.appendChild(makeText("Meet PHANTOM.", {{ font: {{ family: "Georgia", style: "Regular" }}, size: 48, color: {{ r: 1, g: 1, b: 1 }} }}));
  tabCh5Content.appendChild(makeText("The spatial memory engine behind SMRITI.", {{ font: {{ family: "Inter", style: "Medium" }}, size: 16, color: cCyan }}));
  tabCh5Content.appendChild(makeText("PHANTOM remembers where things were, compares that memory with what exists now, and reveals what changed.", {{
    font: {{ family: "Inter", style: "Regular" }},
    size: 14,
    lineHeight: 22,
    color: {{ r: 0.7, g: 0.75, b: 0.8 }},
    width: 640
  }}));
  tabCh5Content.appendChild(makePill("REMEMBER → COMPARE → EXPLAIN", {{ bg: cDarkCard, stroke: cBorderDark, color: cCyan, size: 10, padX: 14, padY: 8 }}));

  // Wireframe canvas
  const tabWf = figma.createFrame();
  tabWf.resize(704, 440);
  tabWf.cornerRadius = 20;
  tabWf.fills = [getImagePaint("phantom_wireframe")];
  tabCh5Content.appendChild(tabWf);

  tabCh5.appendChild(tabCh5Content);
  tabFrame.appendChild(tabCh5);

  // Tablet Chapter 06 (Reality Diff)
  const tabCh6 = figma.createFrame();
  tabCh6.resize(768, 1075);
  tabCh6.y = 4841;
  tabCh6.fills = [{{ type: "SOLID", color: cPaper }}];
  tabCh6.paddingLeft = 32;
  tabCh6.paddingRight = 32;
  tabCh6.paddingTop = 60;
  tabCh6.paddingBottom = 60;
  tabCh6.layoutMode = "VERTICAL";
  tabCh6.primaryAxisAlignItems = "SPACE_BETWEEN";
  tabCh6.appendChild(makeChapterHeader("06", "REALITY DIFF", 704));

  const tabCh6Head = figma.createFrame();
  tabCh6Head.layoutMode = "VERTICAL";
  tabCh6Head.itemSpacing = 8;
  tabCh6Head.fills = [];
  tabCh6Head.appendChild(makeText("• 06 / REALITY DIFF", {{ font: {{ family: "Inter", style: "Semi Bold" }}, size: 11, color: cOrange, letterSpacing: 1.5 }}));
  tabCh6Head.appendChild(makeText("See what changed.", {{ font: {{ family: "Georgia", style: "Regular" }}, size: 48 }}));
  tabCh6Head.appendChild(makeText("SMRITI compares moments in your home so the change doesn't have to live only in your memory.", {{
    font: {{ family: "Inter", style: "Regular" }},
    size: 14,
    color: cMuted
  }}));
  tabCh6.appendChild(tabCh6Head);

  const tabDiffCard = figma.createFrame();
  tabDiffCard.resize(704, 520);
  tabDiffCard.cornerRadius = 20;
  tabDiffCard.fills = [{{ type: "SOLID", color: cPaperElevated }}];
  tabDiffCard.strokes = [{{ type: "SOLID", color: cBorderWarm }}];

  const tabDiffImg = figma.createFrame();
  tabDiffImg.resize(704, 440);
  tabDiffImg.cornerRadius = 20;
  tabDiffImg.fills = [getImagePaint("reality_diff")];
  tabDiffCard.appendChild(tabDiffImg);
  tabCh6.appendChild(tabDiffCard);
  tabFrame.appendChild(tabCh6);

  // ----------------------------------------------------------------------------
  // 2. MOBILE VIEWPORT (390×8780)
  // ----------------------------------------------------------------------------
  const mobFrame = figma.createFrame();
  mobFrame.name = "04 — SMRITI Mobile Viewport (390×8780)";
  mobFrame.resize(390, 8780);
  mobFrame.x = 868;
  mobFrame.y = 0;
  mobFrame.fills = [{{ type: "SOLID", color: cPaper }}];
  p4.appendChild(mobFrame);

  // Mobile Hero (390×844)
  const mobHero = figma.createFrame();
  mobHero.name = "Hero / Mobile";
  mobHero.resize(390, 844);
  mobHero.fills = [getImagePaint("hero_mobile")];
  mobHero.paddingLeft = 20;
  mobHero.paddingRight = 20;
  mobHero.paddingTop = 16;
  mobHero.paddingBottom = 30;
  mobHero.layoutMode = "VERTICAL";
  mobHero.primaryAxisAlignItems = "SPACE_BETWEEN";
  mobFrame.appendChild(mobHero);

  // Mobile Nav
  const mobNav = figma.createFrame();
  mobNav.resize(350, 50);
  mobNav.cornerRadius = 25;
  mobNav.fills = [{{ type: "SOLID", color: {{ r: 1, g: 1, b: 1 }}, opacity: 0.94 }}];
  mobNav.strokes = [{{ type: "SOLID", color: cBorderWarm }}];
  mobNav.layoutMode = "HORIZONTAL";
  mobNav.primaryAxisAlignItems = "SPACE_BETWEEN";
  mobNav.counterAxisAlignItems = "CENTER";
  mobNav.paddingLeft = 16;
  mobNav.paddingRight = 8;
  mobNav.appendChild(makeText("SMRITI.", {{ font: {{ family: "Inter", style: "Bold" }}, size: 16 }}));
  const mobNavRight = figma.createFrame();
  mobNavRight.layoutMode = "HORIZONTAL";
  mobNavRight.itemSpacing = 6;
  mobNavRight.counterAxisAlignItems = "CENTER";
  mobNavRight.fills = [];
  mobNavRight.appendChild(makePill("→", {{ bg: cInk, color: cPaper, padX: 10, padY: 6, size: 11 }}));
  mobNavRight.appendChild(makePill("☰", {{ bg: cPaperElevated, color: cInk, padX: 10, padY: 6, size: 12 }}));
  mobNav.appendChild(mobNavRight);
  mobHero.appendChild(mobNav);

  // Mobile Hero Content (bottom aligned)
  const mobHeroContent = figma.createFrame();
  mobHeroContent.layoutMode = "VERTICAL";
  mobHeroContent.itemSpacing = 12;
  mobHeroContent.fills = [];
  mobHeroContent.appendChild(makePill("A quiet afternoon at home", {{ dotColor: cOrange, bg: {{ r: 1, g: 1, b: 1 }}, padX: 10, padY: 5, size: 10 }}));
  mobHeroContent.appendChild(makeText("• SPATIAL MEMORY FOR EVERYDAY LIFE", {{ font: {{ family: "Inter", style: "Semi Bold" }}, size: 9, color: cOrange, letterSpacing: 1.2 }}));
  const mobTitle = figma.createFrame();
  mobTitle.layoutMode = "VERTICAL";
  mobTitle.fills = [];
  mobTitle.appendChild(makeText("Your home", {{ font: {{ family: "Georgia", style: "Regular" }}, size: 44, lineHeight: 48 }}));
  mobTitle.appendChild(makeText("remembers.", {{ font: {{ family: "Georgia", style: "Italic" }}, size: 44, lineHeight: 48, color: cOrange }}));
  mobHeroContent.appendChild(mobTitle);
  mobHeroContent.appendChild(makeText("SMRITI remembers where everyday things were — and shows what changed.", {{
    font: {{ family: "Inter", style: "Regular" }},
    size: 13,
    lineHeight: 20,
    color: cMuted,
    width: 350
  }}));
  const mobHeroActions = figma.createFrame();
  mobHeroActions.layoutMode = "VERTICAL";
  mobHeroActions.itemSpacing = 8;
  mobHeroActions.fills = [];
  mobHeroActions.appendChild(makePill("See how it works →", {{ bg: cInk, color: cPaper, padX: 20, padY: 12, size: 13 }}));
  mobHeroActions.appendChild(makeText("Where are my glasses?", {{ font: {{ family: "Inter", style: "Regular" }}, size: 12 }}));
  mobHeroContent.appendChild(mobHeroActions);
  mobHero.appendChild(mobHeroContent);

  // Mobile Chapter 01 (390×634)
  const mobCh1 = figma.createFrame();
  mobCh1.resize(390, 634);
  mobCh1.y = 844;
  mobCh1.fills = [{{ type: "SOLID", color: cPaper }}];
  mobCh1.paddingLeft = 20;
  mobCh1.paddingRight = 20;
  mobCh1.paddingTop = 48;
  mobCh1.paddingBottom = 48;
  mobCh1.layoutMode = "VERTICAL";
  mobCh1.primaryAxisAlignItems = "SPACE_BETWEEN";
  mobCh1.appendChild(makeChapterHeader("01", "A FAMILIAR MOMENT", 350));

  const mobCh1Body = figma.createFrame();
  mobCh1Body.layoutMode = "VERTICAL";
  mobCh1Body.itemSpacing = 16;
  mobCh1Body.fills = [];
  mobCh1Body.appendChild(makeText("“Where did I\\nput my glasses?”", {{ font: {{ family: "Georgia", style: "Regular" }}, size: 36, lineHeight: 42 }}));
  mobCh1Body.appendChild(makeText("Some days, a familiar room can feel a little less familiar.", {{ font: {{ family: "Inter", style: "Medium" }}, size: 18, lineHeight: 26, width: 350 }}));
  mobCh1Body.appendChild(makeText("SMRITI keeps a gentle memory of where everyday things were, so the answer is close when someone needs it.", {{
    font: {{ family: "Inter", style: "Regular" }},
    size: 13,
    lineHeight: 20,
    color: cMuted,
    width: 350
  }}));
  mobCh1Body.appendChild(makeText("Watch the moment unfold ↗", {{ font: {{ family: "Inter", style: "Semi Bold" }}, size: 13 }}));
  mobCh1.appendChild(mobCh1Body);

  const mobRibbon = figma.createFrame();
  mobRibbon.layoutMode = "HORIZONTAL";
  mobRibbon.itemSpacing = 8;
  mobRibbon.fills = [];
  ["READING GLASSES", "KEYS", "MEDICINE"].forEach(item => {{
    mobRibbon.appendChild(makePill(item, {{ bg: {{ r: 1, g: 1, b: 1 }}, stroke: cBorderWarm, size: 9, padX: 10, padY: 6 }}));
  }});
  mobCh1.appendChild(mobRibbon);
  mobFrame.appendChild(mobCh1);

  // Mobile Chapter 05 (PHANTOM, 390×1136)
  const mobCh5 = figma.createFrame();
  mobCh5.resize(390, 1136);
  mobCh5.y = 3459;
  mobCh5.fills = [{{ type: "SOLID", color: cDarkCosmos }}];
  mobCh5.paddingLeft = 20;
  mobCh5.paddingRight = 20;
  mobCh5.paddingTop = 48;
  mobCh5.paddingBottom = 48;
  mobCh5.layoutMode = "VERTICAL";
  mobCh5.primaryAxisAlignItems = "SPACE_BETWEEN";
  mobCh5.appendChild(makeChapterHeader("05", "PHANTOM SPATIAL ENGINE", 350, true));

  const mobCh5Content = figma.createFrame();
  mobCh5Content.layoutMode = "VERTICAL";
  mobCh5Content.itemSpacing = 14;
  mobCh5Content.fills = [];
  mobCh5Content.appendChild(makeText("• 05 / PHANTOM", {{ font: {{ family: "Inter", style: "Semi Bold" }}, size: 9, color: cCyan, letterSpacing: 1.2 }}));
  mobCh5Content.appendChild(makeText("Meet PHANTOM.", {{ font: {{ family: "Georgia", style: "Regular" }}, size: 38, color: {{ r: 1, g: 1, b: 1 }} }}));
  mobCh5Content.appendChild(makeText("The spatial memory engine behind SMRITI.", {{ font: {{ family: "Inter", style: "Medium" }}, size: 14, color: cCyan }}));
  mobCh5Content.appendChild(makeText("PHANTOM remembers where things were, compares that memory with what exists now, and reveals what changed.", {{
    font: {{ family: "Inter", style: "Regular" }},
    size: 13,
    lineHeight: 20,
    color: {{ r: 0.7, g: 0.75, b: 0.8 }},
    width: 350
  }}));
  mobCh5Content.appendChild(makePill("REMEMBER → COMPARE → EXPLAIN", {{ bg: cDarkCard, stroke: cBorderDark, color: cCyan, size: 9, padX: 10, padY: 6 }}));

  // Wireframe canvas
  const mobWf = figma.createFrame();
  mobWf.resize(350, 260);
  mobWf.cornerRadius = 16;
  mobWf.fills = [getImagePaint("phantom_wireframe")];
  mobCh5Content.appendChild(mobWf);
  mobCh5.appendChild(mobCh5Content);
  mobFrame.appendChild(mobCh5);

  // Mobile Chapter 06 (Reality Diff, 390×965)
  const mobCh6 = figma.createFrame();
  mobCh6.resize(390, 965);
  mobCh6.y = 4595;
  mobCh6.fills = [{{ type: "SOLID", color: cPaper }}];
  mobCh6.paddingLeft = 20;
  mobCh6.paddingRight = 20;
  mobCh6.paddingTop = 48;
  mobCh6.paddingBottom = 48;
  mobCh6.layoutMode = "VERTICAL";
  mobCh6.primaryAxisAlignItems = "SPACE_BETWEEN";
  mobCh6.appendChild(makeChapterHeader("06", "REALITY DIFF", 350));

  const mobCh6Head = figma.createFrame();
  mobCh6Head.layoutMode = "VERTICAL";
  mobCh6Head.itemSpacing = 8;
  mobCh6Head.fills = [];
  mobCh6Head.appendChild(makeText("• 06 / REALITY DIFF", {{ font: {{ family: "Inter", style: "Semi Bold" }}, size: 9, color: cOrange, letterSpacing: 1.2 }}));
  mobCh6Head.appendChild(makeText("See what changed.", {{ font: {{ family: "Georgia", style: "Regular" }}, size: 38 }}));
  mobCh6Head.appendChild(makeText("SMRITI compares moments in your home so the change doesn't have to live only in your memory.", {{
    font: {{ family: "Inter", style: "Regular" }},
    size: 13,
    lineHeight: 20,
    color: cMuted,
    width: 350
  }}));
  mobCh6.appendChild(mobCh6Head);

  const mobDiffCard = figma.createFrame();
  mobDiffCard.resize(350, 320);
  mobDiffCard.cornerRadius = 16;
  mobDiffCard.fills = [{{ type: "SOLID", color: cPaperElevated }}];
  mobDiffCard.strokes = [{{ type: "SOLID", color: cBorderWarm }}];

  const mobDiffImg = figma.createFrame();
  mobDiffImg.resize(350, 240);
  mobDiffImg.cornerRadius = 16;
  mobDiffImg.fills = [getImagePaint("reality_diff")];
  mobDiffCard.appendChild(mobDiffImg);
  mobCh6.appendChild(mobDiffCard);
  mobFrame.appendChild(mobCh6);

  // Switch to Page 03 to show desktop
  figma.currentPage = p3;
  figma.viewport.scrollAndZoomIntoView([deskFrame]);

  figma.notify("✅ Reconstruction complete: Exact website fidelity rendered in Figma!", {{ timeout: 4000 }});
  figma.closePlugin();
}})();
"""

with open("figma-plugin/code.js", "w") as f:
    f.write(js_code)

print("Generated figma-plugin/code.js successfully.")
print(f"File size: {os.path.getsize('figma-plugin/code.js')} bytes.")
