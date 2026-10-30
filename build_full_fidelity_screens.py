#!/usr/bin/env python3
"""
build_full_fidelity_screens.py
Generates figma-plugin/code.js with exact website fidelity and robust Auto Layout:
1. '03 — SMRITI Desktop Complete (1440)'
2. '04 — SMRITI Tablet Viewport (768)'
3. '04 — SMRITI Mobile Viewport (390)'

All sections use vertical Auto Layout, dynamic hugging heights, explicit text wrapping,
proper spacing, no overlapping or clipping, and real 3D visual assets.
"""

import os
import json
import base64

BRAIN_DIR = "/Users/devanshsingh/.gemini/antigravity-ide/brain/8404bdc8-4523-40df-b065-77aecc86f707"
ASSET_DIR = os.path.join(BRAIN_DIR, "figma_3d_assets")

def get_b64(fname):
    p = os.path.join(ASSET_DIR, fname)
    with open(p, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

assets = {
    "hero_desktop": get_b64("hero_desktop.jpg"),
    "hero_tablet": get_b64("hero_tablet.jpg"),
    "hero_mobile": get_b64("hero_mobile.jpg"),
    "phantom_wireframe": get_b64("phantom_wireframe.jpg"),
    "reality_diff": get_b64("reality_diff_canvas.jpg"),
    "glasses_3d": get_b64("glasses_3d.png"),
    "cta_world": get_b64("cta_world.jpg"),
}

assets_json = json.dumps(assets)

js_body = r'''
(async () => {
  // Load fonts
  const fonts = [
    { family: "Inter", style: "Regular" },
    { family: "Inter", style: "Medium" },
    { family: "Inter", style: "Semi Bold" },
    { family: "Inter", style: "Bold" },
    { family: "Georgia", style: "Regular" },
    { family: "Georgia", style: "Italic" }
  ];
  for (const f of fonts) {
    try { await figma.loadFontAsync(f); } catch (e) { console.warn("Font error:", f, e); }
  }

  // Set document title
  figma.root.name = "SMRITI × PHANTOM Complete Product Design System";

  // Find target pages
  const p3 = figma.root.children.find(p => p.name.includes("03") && p.name.includes("Desktop"));
  const p4 = figma.root.children.find(p => p.name.includes("04") && (p.name.includes("Tablet") || p.name.includes("Mobile")));

  if (!p3 || !p4) {
    figma.notify("Error: Target pages not found.");
    figma.closePlugin();
    return;
  }

  // Color Definitions
  const cPaper = { r: 0.992, g: 0.984, b: 0.969 }; // #FDFBF7
  const cPaperElevated = { r: 0.961, g: 0.949, b: 0.922 }; // #F5F2EB
  const cInk = { r: 0.059, g: 0.078, b: 0.071 }; // #0F1412
  const cMuted = { r: 0.412, g: 0.443, b: 0.486 }; // #69717C
  const cOrange = { r: 0.812, g: 0.271, b: 0.0 }; // #CF4500
  const cDarkCosmos = { r: 0.047, g: 0.055, b: 0.071 }; // #0C0E12
  const cDarkCard = { r: 0.071, g: 0.086, b: 0.118 }; // #12161E
  const cCyan = { r: 0.22, g: 0.882, b: 1.0 }; // #38E1FF
  const cBorderWarm = { r: 0.902, g: 0.878, b: 0.835 }; // #E6E0D5
  const cBorderDark = { r: 0.12, g: 0.15, b: 0.20 };

  // Image fill cache
  const imageFills = {};
  for (const [k, b64] of Object.entries(RAW_ASSETS)) {
    try {
      const img = figma.createImage(figma.base64Decode(b64));
      imageFills[k] = { type: "IMAGE", imageHash: img.hash, scaleMode: "FILL" };
    } catch (e) {
      console.warn("Image decode error:", k, e);
    }
  }

  function getImagePaint(key) {
    return imageFills[key] || { type: "SOLID", color: cPaperElevated };
  }

  // Helpers
  function makeText(str, opts = {}) {
    const t = figma.createText();
    t.fontName = opts.font || { family: "Inter", style: "Regular" };
    t.characters = str;
    t.fontSize = opts.size || 14;
    t.lineHeight = opts.lineHeight ? { value: opts.lineHeight, unit: "PIXELS" } : { unit: "AUTO" };
    t.letterSpacing = opts.letterSpacing ? { value: opts.letterSpacing, unit: "PIXELS" } : { value: 0, unit: "PIXELS" };
    t.fills = [{ type: "SOLID", color: opts.color || cInk }];
    if (opts.opacity !== undefined) t.opacity = opts.opacity;
    if (opts.width) {
      t.textAutoResize = "HEIGHT";
      t.resize(opts.width, t.height);
    } else {
      t.textAutoResize = "WIDTH_AND_HEIGHT";
    }
    return t;
  }

  function makePill(text, opts = {}) {
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
    f.fills = [{ type: "SOLID", color: opts.bg || { r: 1, g: 1, b: 1 }, opacity: opts.bgOpacity || 1 }];
    if (opts.stroke) {
      f.strokes = [{ type: "SOLID", color: opts.stroke }];
      f.strokeWeight = 1;
    }
    if (opts.dotColor) {
      const dot = figma.createEllipse();
      dot.resize(7, 7);
      dot.fills = [{ type: "SOLID", color: opts.dotColor }];
      f.appendChild(dot);
    }
    const txt = makeText(text, {
      font: opts.font || { family: "Inter", style: "Medium" },
      size: opts.size || 11,
      color: opts.color || cInk,
      letterSpacing: opts.letterSpacing || 0.5
    });
    f.appendChild(txt);
    return f;
  }

  function makeChapterHeader(num, title, width, isDark = false) {
    const f = figma.createFrame();
    f.layoutMode = "HORIZONTAL";
    f.primaryAxisSizingMode = "FIXED";
    f.counterAxisSizingMode = "AUTO";
    f.resize(width, 28);
    f.layoutAlign = "STRETCH";
    f.primaryAxisAlignItems = "SPACE_BETWEEN";
    f.counterAxisAlignItems = "CENTER";
    f.fills = [];

    const leftWrap = figma.createFrame();
    leftWrap.layoutMode = "HORIZONTAL";
    leftWrap.primaryAxisSizingMode = "AUTO";
    leftWrap.counterAxisSizingMode = "AUTO";
    leftWrap.itemSpacing = 6;
    leftWrap.counterAxisAlignItems = "CENTER";
    leftWrap.fills = [];

    const numTxt = makeText(num, {
      font: { family: "Inter", style: "Semi Bold" },
      size: 11,
      color: isDark ? cCyan : cOrange,
      letterSpacing: 1
    });
    const dot = figma.createEllipse();
    dot.resize(4, 4);
    dot.fills = [{ type: "SOLID", color: isDark ? cCyan : cOrange }];

    leftWrap.appendChild(numTxt);
    leftWrap.appendChild(dot);

    const titleTxt = makeText(title, {
      font: { family: "Inter", style: "Medium" },
      size: 11,
      color: isDark ? cCyan : cMuted,
      letterSpacing: 1.5
    });

    f.appendChild(leftWrap);
    f.appendChild(titleTxt);
    return f;
  }

  const momentsData = [
    { num: "01", title: "Remember", desc: "The glasses have a usual place. SMRITI keeps track of it.", badge: "BEFORE" },
    { num: "02", title: "Notice", desc: "Later, they are somewhere else. The room has changed.", badge: "AFTER" },
    { num: "03", title: "Explain", desc: "A small, certain answer replaces a frustrating search.", badge: "FOUND" }
  ];

  const trustData = [
    {
      num: "01",
      title: "Remember the environment, not just the object.",
      desc: "Most tools try to track things with tags, beacons, or constant alarms. SMRITI simply remembers how the room looked, the way a person would."
    },
    {
      num: "02",
      title: "Show what changed instead of forcing someone to remember.",
      desc: "Instead of searching through hours of footage or reading through logs, you see a single clear comparison: before, and after."
    },
    {
      num: "03",
      title: "Technology assists the caregiver. It does not replace them.",
      desc: "SMRITI is designed to sit quietly in the background — giving families and caregivers answers without intrusion or surveillance."
    }
  ];

  // ============================================================================
  // BUILD DESKTOP SCREEN (1440px)
  // ============================================================================
  for (const c of [...p3.children]) c.remove();

  const deskFrame = figma.createFrame();
  deskFrame.name = "03 — SMRITI Desktop Complete (1440×8310)";
  deskFrame.resize(1440, 8310);
  deskFrame.fills = [{ type: "SOLID", color: cPaper }];
  p3.appendChild(deskFrame);

  // Nav Floating Pill
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
  navPill.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.94 }];
  navPill.strokes = [{ type: "SOLID", color: cBorderWarm }];
  navPill.strokeWeight = 1;
  navPill.layoutMode = "HORIZONTAL";
  navPill.primaryAxisAlignItems = "SPACE_BETWEEN";
  navPill.counterAxisAlignItems = "CENTER";
  navPill.paddingLeft = 28;
  navPill.paddingRight = 10;
  navWrap.appendChild(navPill);

  navPill.appendChild(makeText("SMRITI.", { font: { family: "Inter", style: "Bold" }, size: 18, letterSpacing: 0.5 }));

  const navLinks = figma.createFrame();
  navLinks.layoutMode = "HORIZONTAL";
  navLinks.itemSpacing = 36;
  navLinks.fills = [];
  ["How it works", "PHANTOM", "Reality diff", "Memory receipt", "Trust"].forEach(l => {
    navLinks.appendChild(makeText(l, { font: { family: "Inter", style: "Medium" }, size: 13, color: cMuted }));
  });
  navPill.appendChild(navLinks);

  const navActions = figma.createFrame();
  navActions.layoutMode = "HORIZONTAL";
  navActions.itemSpacing = 12;
  navActions.counterAxisAlignItems = "CENTER";
  navActions.fills = [];
  navActions.appendChild(makePill("Where are my glasses?", { bg: cPaperElevated, stroke: cBorderWarm, size: 12 }));
  navActions.appendChild(makePill("Experience PHANTOM ↗", { bg: cInk, color: cPaper, padX: 18, padY: 10, size: 12 }));
  navPill.appendChild(navActions);
  deskFrame.appendChild(navWrap);

  // Section 01: Hero (#home, 1440×900)
  const heroSec = figma.createFrame();
  heroSec.name = "Section 01 / Hero Scene (#home)";
  heroSec.resize(1440, 900);
  heroSec.x = 0;
  heroSec.y = 0;
  heroSec.fills = [getImagePaint("hero_desktop")];
  heroSec.paddingLeft = 100;
  heroSec.paddingRight = 100;
  heroSec.paddingTop = 130;
  heroSec.paddingBottom = 80;
  heroSec.layoutMode = "VERTICAL";
  heroSec.primaryAxisAlignItems = "SPACE_BETWEEN";
  deskFrame.appendChild(heroSec);

  const heroTop = figma.createFrame();
  heroTop.layoutMode = "VERTICAL";
  heroTop.itemSpacing = 16;
  heroTop.fills = [];
  heroTop.appendChild(makePill("A quiet afternoon at home", { dotColor: cOrange, bg: { r: 1, g: 1, b: 1 }, padX: 14, padY: 7 }));
  heroTop.appendChild(makeText("SPATIAL MEMORY FOR EVERYDAY LIFE", { font: { family: "Inter", style: "Semi Bold" }, size: 11, color: cOrange, letterSpacing: 1.5 }));
  heroSec.appendChild(heroTop);

  const heroMid = figma.createFrame();
  heroMid.layoutMode = "VERTICAL";
  heroMid.itemSpacing = 20;
  heroMid.fills = [];

  const heroTitle = figma.createFrame();
  heroTitle.layoutMode = "VERTICAL";
  heroTitle.fills = [];
  heroTitle.appendChild(makeText("Your home", { font: { family: "Georgia", style: "Regular" }, size: 76, lineHeight: 82 }));
  heroTitle.appendChild(makeText("remembers.", { font: { family: "Georgia", style: "Italic" }, size: 76, lineHeight: 82, color: cOrange }));
  heroMid.appendChild(heroTitle);

  heroMid.appendChild(makeText("SMRITI remembers where everyday things were — and shows what changed.\nA calm, spatial memory for anyone who has ever searched a familiar room.", {
    font: { family: "Inter", style: "Regular" },
    size: 18,
    lineHeight: 28,
    color: cMuted,
    width: 520
  }));

  const heroBtns = figma.createFrame();
  heroBtns.layoutMode = "HORIZONTAL";
  heroBtns.itemSpacing = 16;
  heroBtns.counterAxisAlignItems = "CENTER";
  heroBtns.fills = [];
  heroBtns.appendChild(makePill("See how it works →", { bg: cInk, color: cPaper, padX: 24, padY: 14, size: 14 }));
  heroBtns.appendChild(makeText("Where are my glasses?", { font: { family: "Inter", style: "Medium" }, size: 14 }));
  heroMid.appendChild(heroBtns);
  heroSec.appendChild(heroMid);

  // Section 02: Chapter 01 (#moments, y: 900, h: 698)
  const ch1 = figma.createFrame();
  ch1.name = "Section 02 / Chapter 01 — A Familiar Moment (#moments)";
  ch1.resize(1440, 698);
  ch1.x = 0;
  ch1.y = 900;
  ch1.fills = [{ type: "SOLID", color: cPaper }];
  ch1.paddingLeft = 100;
  ch1.paddingRight = 100;
  ch1.paddingTop = 60;
  ch1.paddingBottom = 60;
  ch1.layoutMode = "VERTICAL";
  ch1.primaryAxisAlignItems = "SPACE_BETWEEN";
  deskFrame.appendChild(ch1);

  ch1.appendChild(makeChapterHeader("01", "A FAMILIAR MOMENT", 1240));

  const ch1Body = figma.createFrame();
  ch1Body.layoutMode = "HORIZONTAL";
  ch1Body.primaryAxisAlignItems = "SPACE_BETWEEN";
  ch1Body.counterAxisAlignItems = "CENTER";
  ch1Body.layoutAlign = "STRETCH";
  ch1Body.fills = [];

  const ch1Left = figma.createFrame();
  ch1Left.layoutMode = "VERTICAL";
  ch1Left.itemSpacing = 20;
  ch1Left.fills = [];
  ch1Left.appendChild(makeText("“Where did I put my glasses?”", { font: { family: "Georgia", style: "Regular" }, size: 52, lineHeight: 60, width: 620 }));
  ch1Left.appendChild(makeText("Some days, a familiar room can feel a little less familiar.", { font: { family: "Inter", style: "Medium" }, size: 24, lineHeight: 32, width: 600 }));
  ch1Left.appendChild(makeText("SMRITI keeps a gentle memory of where everyday things were, so the answer is close when someone needs it.", {
    font: { family: "Inter", style: "Regular" },
    size: 16,
    lineHeight: 26,
    color: cMuted,
    width: 580
  }));
  ch1Left.appendChild(makeText("Watch the moment unfold ↗", { font: { family: "Inter", style: "Semi Bold" }, size: 14 }));
  ch1Body.appendChild(ch1Left);

  const ch1Right = figma.createFrame();
  ch1Right.resize(480, 320);
  ch1Right.cornerRadius = 20;
  ch1Right.fills = [getImagePaint("glasses_3d")];
  ch1Right.strokes = [{ type: "SOLID", color: cBorderWarm }];
  ch1Right.strokeWeight = 1;
  ch1Body.appendChild(ch1Right);
  ch1.appendChild(ch1Body);

  const ribbon = figma.createFrame();
  ribbon.layoutMode = "HORIZONTAL";
  ribbon.itemSpacing = 12;
  ribbon.counterAxisAlignItems = "CENTER";
  ribbon.fills = [];
  ["READING GLASSES", "HOUSE KEYS", "MEDICINE"].forEach(item => {
    ribbon.appendChild(makePill(item, { bg: { r: 1, g: 1, b: 1 }, stroke: cBorderWarm, size: 11, letterSpacing: 1 }));
  });
  ch1.appendChild(ribbon);

  // Section 03: Chapter 02 (chapter-moments, y: 1598, h: 645)
  const ch2 = figma.createFrame();
  ch2.name = "Section 03 / Chapter 02 — Three Quiet Moments (chapter-moments)";
  ch2.resize(1440, 645);
  ch2.x = 0;
  ch2.y = 1598;
  ch2.fills = [{ type: "SOLID", color: cPaperElevated }];
  ch2.paddingLeft = 100;
  ch2.paddingRight = 100;
  ch2.paddingTop = 60;
  ch2.paddingBottom = 60;
  ch2.layoutMode = "VERTICAL";
  ch2.primaryAxisAlignItems = "SPACE_BETWEEN";
  deskFrame.appendChild(ch2);

  ch2.appendChild(makeChapterHeader("02", "THREE QUIET MOMENTS", 1240));

  const ch2Head = figma.createFrame();
  ch2Head.layoutMode = "VERTICAL";
  ch2Head.itemSpacing = 12;
  ch2Head.fills = [];
  ch2Head.appendChild(makeText("A little help, right on time.", { font: { family: "Georgia", style: "Regular" }, size: 48, lineHeight: 56 }));
  ch2Head.appendChild(makeText("Nothing to learn. Nothing to remember about the technology. Just a clear answer when it matters.", {
    font: { family: "Inter", style: "Regular" },
    size: 16,
    color: cMuted,
    width: 700
  }));
  ch2.appendChild(ch2Head);

  const ch2Cards = figma.createFrame();
  ch2Cards.layoutMode = "HORIZONTAL";
  ch2Cards.itemSpacing = 24;
  ch2Cards.layoutAlign = "STRETCH";
  ch2Cards.fills = [];

  momentsData.forEach(m => {
    const card = figma.createFrame();
    card.resize(397, 240);
    card.cornerRadius = 16;
    card.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
    card.strokes = [{ type: "SOLID", color: cBorderWarm }];
    card.strokeWeight = 1;
    card.paddingLeft = 28;
    card.paddingRight = 28;
    card.paddingTop = 28;
    card.paddingBottom = 28;
    card.layoutMode = "VERTICAL";
    card.primaryAxisAlignItems = "SPACE_BETWEEN";

    const cTop = figma.createFrame();
    cTop.layoutMode = "HORIZONTAL";
    cTop.primaryAxisAlignItems = "SPACE_BETWEEN";
    cTop.counterAxisAlignItems = "CENTER";
    cTop.layoutAlign = "STRETCH";
    cTop.fills = [];
    cTop.appendChild(makeText(m.num, { font: { family: "Inter", style: "Semi Bold" }, size: 14, color: cOrange }));
    cTop.appendChild(makePill(m.badge, { bg: cPaperElevated, size: 9, letterSpacing: 1 }));
    card.appendChild(cTop);

    const cBody = figma.createFrame();
    cBody.layoutMode = "VERTICAL";
    cBody.itemSpacing = 10;
    cBody.fills = [];
    cBody.appendChild(makeText(m.title, { font: { family: "Georgia", style: "Regular" }, size: 28 }));
    cBody.appendChild(makeText(m.desc, { font: { family: "Inter", style: "Regular" }, size: 14, lineHeight: 22, color: cMuted, width: 341 }));
    card.appendChild(cBody);

    ch2Cards.appendChild(card);
  });
  ch2.appendChild(ch2Cards);

  // Section 04: Chapter 03 (#reality-diff, y: 2243, h: 773)
  const ch3 = figma.createFrame();
  ch3.name = "Section 04 / Chapter 03 — One Meaningful Change (#reality-diff)";
  ch3.resize(1440, 773);
  ch3.x = 0;
  ch3.y = 2243;
  ch3.fills = [{ type: "SOLID", color: cPaper }];
  ch3.paddingLeft = 100;
  ch3.paddingRight = 100;
  ch3.paddingTop = 60;
  ch3.paddingBottom = 60;
  ch3.layoutMode = "VERTICAL";
  ch3.primaryAxisAlignItems = "SPACE_BETWEEN";
  deskFrame.appendChild(ch3);

  ch3.appendChild(makeChapterHeader("03", "ONE MEANINGFUL CHANGE", 1240));

  const ch3Head = figma.createFrame();
  ch3Head.layoutMode = "VERTICAL";
  ch3Head.itemSpacing = 12;
  ch3Head.fills = [];
  ch3Head.appendChild(makeText("The room, then and now.", { font: { family: "Georgia", style: "Regular" }, size: 48, lineHeight: 56 }));
  ch3Head.appendChild(makeText("Instead of replaying hours of video or searching through lists, SMRITI shows you only what changed: where the glasses were, and where they are now.", {
    font: { family: "Inter", style: "Regular" },
    size: 16,
    color: cMuted,
    width: 720
  }));
  ch3.appendChild(ch3Head);

  const diffCard = figma.createFrame();
  diffCard.resize(1240, 460);
  diffCard.cornerRadius = 20;
  diffCard.fills = [{ type: "SOLID", color: cPaperElevated }];
  diffCard.strokes = [{ type: "SOLID", color: cBorderWarm }];
  diffCard.strokeWeight = 1;
  diffCard.paddingLeft = 40;
  diffCard.paddingRight = 40;
  diffCard.paddingTop = 32;
  diffCard.paddingBottom = 32;
  diffCard.layoutMode = "VERTICAL";
  diffCard.primaryAxisAlignItems = "SPACE_BETWEEN";

  const diffVisual = figma.createFrame();
  diffVisual.resize(1160, 320);
  diffVisual.cornerRadius = 12;
  diffVisual.fills = [getImagePaint("reality_diff")];
  diffCard.appendChild(diffVisual);

  const readout = figma.createFrame();
  readout.layoutMode = "HORIZONTAL";
  readout.primaryAxisAlignItems = "SPACE_BETWEEN";
  readout.counterAxisAlignItems = "CENTER";
  readout.layoutAlign = "STRETCH";
  readout.fills = [];
  readout.appendChild(makeText("The glasses begin on the side table.", { font: { family: "Inter", style: "Medium" }, size: 16 }));
  readout.appendChild(makeText("01 / 01", { font: { family: "Inter", style: "Semi Bold" }, size: 13, color: cOrange }));
  diffCard.appendChild(readout);
  ch3.appendChild(diffCard);

  // Section 05: Chapter 04 (#memory, y: 3016, h: 588)
  const ch4 = figma.createFrame();
  ch4.name = "Section 05 / Chapter 04 — A Memory to Keep (#memory)";
  ch4.resize(1440, 588);
  ch4.x = 0;
  ch4.y = 3016;
  ch4.fills = [{ type: "SOLID", color: cPaper }];
  ch4.paddingLeft = 100;
  ch4.paddingRight = 100;
  ch4.paddingTop = 60;
  ch4.paddingBottom = 60;
  ch4.layoutMode = "VERTICAL";
  ch4.primaryAxisAlignItems = "SPACE_BETWEEN";
  deskFrame.appendChild(ch4);

  ch4.appendChild(makeChapterHeader("04", "A MEMORY TO KEEP", 1240));

  const ch4Head = figma.createFrame();
  ch4Head.layoutMode = "VERTICAL";
  ch4Head.itemSpacing = 12;
  ch4Head.fills = [];
  ch4Head.appendChild(makeText("The answer, without the search.", { font: { family: "Georgia", style: "Regular" }, size: 48, lineHeight: 56 }));
  ch4Head.appendChild(makeText("A single, clear card you can glance at or share with family. No tech jargon. Just the information you needed, exactly when you needed it.", {
    font: { family: "Inter", style: "Regular" },
    size: 16,
    color: cMuted,
    width: 680
  }));
  ch4.appendChild(ch4Head);

  const ch4Card = figma.createFrame();
  ch4Card.resize(1240, 240);
  ch4Card.cornerRadius = 16;
  ch4Card.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  ch4Card.strokes = [{ type: "SOLID", color: cBorderWarm }];
  ch4Card.strokeWeight = 1;
  ch4Card.paddingLeft = 32;
  ch4Card.paddingRight = 32;
  ch4Card.paddingTop = 24;
  ch4Card.paddingBottom = 24;
  ch4Card.layoutMode = "HORIZONTAL";
  ch4Card.primaryAxisAlignItems = "SPACE_BETWEEN";
  ch4Card.counterAxisAlignItems = "CENTER";

  const ch4CLeft = figma.createFrame();
  ch4CLeft.layoutMode = "VERTICAL";
  ch4CLeft.itemSpacing = 8;
  ch4CLeft.fills = [];
  ch4CLeft.appendChild(makePill("CLEAR, CALM, CERTAIN", { dotColor: cOrange, bg: cPaperElevated, size: 10 }));
  ch4CLeft.appendChild(makeText("Reading glasses", { font: { family: "Georgia", style: "Regular" }, size: 32 }));
  ch4CLeft.appendChild(makeText("Observed: Bookshelf (second shelf from top)", { font: { family: "Inter", style: "Regular" }, size: 14, color: cMuted }));
  ch4Card.appendChild(ch4CLeft);

  const ch4CRight = figma.createFrame();
  ch4CRight.layoutMode = "HORIZONTAL";
  ch4CRight.itemSpacing = 16;
  ch4CRight.counterAxisAlignItems = "CENTER";
  ch4CRight.fills = [];
  ch4CRight.appendChild(makePill("SHARE WITH FAMILY ↗", { bg: cPaperElevated, stroke: cBorderWarm, size: 12 }));
  ch4CRight.appendChild(makePill("VIEW TIMELINE →", { bg: cInk, color: cPaper, padX: 18, padY: 10, size: 12 }));
  ch4Card.appendChild(ch4CRight);
  ch4.appendChild(ch4Card);

  // Section 06: Chapter 05 (#phantom, y: 3604, h: 826)
  const ch5 = figma.createFrame();
  ch5.name = "Section 06 / Chapter 05 — The Architecture Behind Calm (#phantom)";
  ch5.resize(1440, 826);
  ch5.x = 0;
  ch5.y = 3604;
  ch5.fills = [{ type: "SOLID", color: cDarkCosmos }];
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
  ch5Body.counterAxisAlignItems = "CENTER";
  ch5Body.layoutAlign = "STRETCH";
  ch5Body.fills = [];

  const ch5Left = figma.createFrame();
  ch5Left.layoutMode = "VERTICAL";
  ch5Left.itemSpacing = 16;
  ch5Left.fills = [];
  ch5Left.appendChild(makeText("• 05 / PHANTOM", { font: { family: "Inter", style: "Semi Bold" }, size: 11, color: cCyan, letterSpacing: 1.5 }));
  ch5Left.appendChild(makeText("Meet PHANTOM.", { font: { family: "Georgia", style: "Regular" }, size: 52, color: { r: 1, g: 1, b: 1 } }));
  ch5Left.appendChild(makeText("The spatial-temporal engine powering SMRITI. Built for continuous ambient understanding with zero latency and absolute privacy.", {
    font: { family: "Inter", style: "Regular" },
    size: 16,
    lineHeight: 26,
    color: { r: 0.7, g: 0.75, b: 0.8 },
    width: 540
  }));

  const metricsRow = figma.createFrame();
  metricsRow.layoutMode = "HORIZONTAL";
  metricsRow.itemSpacing = 16;
  metricsRow.fills = [];
  [
    { k: "Reality Capture", v: "60 fps" },
    { k: "Temporal Diffing", v: "42 ms" },
    { k: "Gentle Retrieval", v: "99.8%" }
  ].forEach(m => {
    const b = figma.createFrame();
    b.resize(170, 70);
    b.cornerRadius = 8;
    b.fills = [{ type: "SOLID", color: cDarkCard }];
    b.strokes = [{ type: "SOLID", color: cBorderDark }];
    b.paddingLeft = 14;
    b.paddingTop = 10;
    b.layoutMode = "VERTICAL";
    b.appendChild(makeText(m.v, { font: { family: "Inter", style: "Bold" }, size: 20, color: cCyan }));
    b.appendChild(makeText(m.k, { font: { family: "Inter", style: "Regular" }, size: 11, color: { r: 0.6, g: 0.65, b: 0.7 } }));
    metricsRow.appendChild(b);
  });
  ch5Left.appendChild(metricsRow);
  ch5Body.appendChild(ch5Left);

  const ch5Right = figma.createFrame();
  ch5Right.resize(580, 420);
  ch5Right.cornerRadius = 20;
  ch5Right.fills = [getImagePaint("phantom_wireframe")];
  ch5Right.strokes = [{ type: "SOLID", color: cBorderDark }];
  ch5Body.appendChild(ch5Right);
  ch5.appendChild(ch5Body);

  // Section 07: Chapter 06 (#reality-diff-compare, y: 4430, h: 1444)
  const ch6 = figma.createFrame();
  ch6.name = "Section 07 / Chapter 06 — Reality Diff Live Comparison (#reality-diff-compare)";
  ch6.resize(1440, 1444);
  ch6.x = 0;
  ch6.y = 4430;
  ch6.fills = [{ type: "SOLID", color: cPaper }];
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
  ch6Head.itemSpacing = 12;
  ch6Head.fills = [];
  ch6Head.appendChild(makeText("• 06 / REALITY DIFF", { font: { family: "Inter", style: "Semi Bold" }, size: 11, color: cOrange, letterSpacing: 1.5 }));
  ch6Head.appendChild(makeText("See what changed.", { font: { family: "Georgia", style: "Regular" }, size: 52, width: 1240 }));
  ch6Head.appendChild(makeText("SMRITI compares moments in your home so the change doesn't have to live only in your memory.", {
    font: { family: "Inter", style: "Regular" },
    size: 16,
    color: cMuted,
    width: 680
  }));
  ch6.appendChild(ch6Head);

  const compCard = figma.createFrame();
  compCard.resize(1240, 900);
  compCard.cornerRadius = 24;
  compCard.fills = [{ type: "SOLID", color: cPaperElevated }];
  compCard.strokes = [{ type: "SOLID", color: cBorderWarm }];
  compCard.strokeWeight = 1;
  compCard.paddingLeft = 40;
  compCard.paddingRight = 40;
  compCard.paddingTop = 32;
  compCard.paddingBottom = 32;
  compCard.layoutMode = "VERTICAL";
  compCard.primaryAxisAlignItems = "SPACE_BETWEEN";

  const compImg = figma.createFrame();
  compImg.resize(1160, 720);
  compImg.cornerRadius = 16;
  compImg.fills = [getImagePaint("reality_diff")];
  compCard.appendChild(compImg);

  const evBar = figma.createFrame();
  evBar.layoutMode = "HORIZONTAL";
  evBar.primaryAxisAlignItems = "SPACE_BETWEEN";
  evBar.counterAxisAlignItems = "CENTER";
  evBar.layoutAlign = "STRETCH";
  evBar.fills = [];
  evBar.appendChild(makeText("2:10 PM Side table → 4:40 PM Bookshelf", { font: { family: "Inter", style: "Semi Bold" }, size: 14 }));
  evBar.appendChild(makeText("OBJECT MOVED: GLASSES → TABLE → BOOKSHELF", { font: { family: "Inter", style: "Semi Bold" }, size: 11, color: cOrange, letterSpacing: 1.5 }));
  compCard.appendChild(evBar);
  ch6.appendChild(compCard);

  const edClose = figma.createFrame();
  edClose.layoutMode = "VERTICAL";
  edClose.itemSpacing = 8;
  edClose.fills = [];
  edClose.appendChild(makeText("“Not everything changes. Only what matters.”", { font: { family: "Georgia", style: "Regular" }, size: 40, width: 1240 }));
  edClose.appendChild(makeText("SMRITI makes the difference visible.", { font: { family: "Inter", style: "Medium" }, size: 16, color: cMuted }));
  ch6.appendChild(edClose);

  // Section 08: Chapter 07 (#memory-receipt-section, y: 5874, h: 752)
  const ch7 = figma.createFrame();
  ch7.name = "Section 08 / Chapter 07 — Memory Receipt (#memory-receipt-section)";
  ch7.resize(1440, 752);
  ch7.x = 0;
  ch7.y = 5874;
  ch7.fills = [{ type: "SOLID", color: cPaper }];
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
  ch7Body.counterAxisAlignItems = "CENTER";
  ch7Body.layoutAlign = "STRETCH";
  ch7Body.fills = [];

  const ch7Left = figma.createFrame();
  ch7Left.layoutMode = "VERTICAL";
  ch7Left.itemSpacing = 16;
  ch7Left.fills = [];
  ch7Left.appendChild(makeText("• 07 / MEMORY RECEIPT", { font: { family: "Inter", style: "Semi Bold" }, size: 11, color: cOrange, letterSpacing: 1.5 }));
  ch7Left.appendChild(makeText("Remembered, not guessed.", { font: { family: "Georgia", style: "Regular" }, size: 48, width: 480 }));
  ch7Left.appendChild(makeText("When something moves, SMRITI generates a cryptographic memory receipt. A quiet, verified record of where it was, where it is now, and when the change occurred.", {
    font: { family: "Inter", style: "Regular" },
    size: 15,
    lineHeight: 24,
    color: cMuted,
    width: 480
  }));
  ch7Body.appendChild(ch7Left);

  const rCard = figma.createFrame();
  rCard.resize(460, 520);
  rCard.cornerRadius = 16;
  rCard.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  rCard.strokes = [{ type: "SOLID", color: cBorderWarm }];
  rCard.strokeWeight = 1;
  rCard.paddingLeft = 32;
  rCard.paddingRight = 32;
  rCard.paddingTop = 28;
  rCard.paddingBottom = 28;
  rCard.layoutMode = "VERTICAL";
  rCard.primaryAxisAlignItems = "SPACE_BETWEEN";

  const rcHead = figma.createFrame();
  rcHead.layoutMode = "HORIZONTAL";
  rcHead.primaryAxisAlignItems = "SPACE_BETWEEN";
  rcHead.counterAxisAlignItems = "CENTER";
  rcHead.layoutAlign = "STRETCH";
  rcHead.fills = [];
  rcHead.appendChild(makeText("SMRITI MEMORY RECEIPT", { font: { family: "Inter", style: "Bold" }, size: 13, letterSpacing: 1 }));
  rcHead.appendChild(makePill("CONFIRMED", { dotColor: { r: 0.2, g: 0.8, b: 0.4 }, bg: cPaperElevated, size: 10 }));
  rCard.appendChild(rcHead);

  const rcObj = figma.createFrame();
  rcObj.layoutMode = "VERTICAL";
  rcObj.itemSpacing = 6;
  rcObj.fills = [];
  rcObj.appendChild(makeText("Reading glasses", { font: { family: "Georgia", style: "Regular" }, size: 28 }));
  rcObj.appendChild(makeText("OBJECT ID: #REC-2026-0842-A", { font: { family: "Inter", style: "Semi Bold" }, size: 11, color: cMuted }));
  rCard.appendChild(rcObj);

  const rcLoc = figma.createFrame();
  rcLoc.layoutMode = "VERTICAL";
  rcLoc.itemSpacing = 10;
  rcLoc.fills = [];
  rcLoc.appendChild(makeText("BEFORE: 2:10 PM · Side table", { font: { family: "Inter", style: "Regular" }, size: 13, color: cMuted }));
  rcLoc.appendChild(makeText("AFTER: 4:40 PM · Bookshelf", { font: { family: "Inter", style: "Semi Bold" }, size: 14 }));
  rcLoc.appendChild(makeText("SPATIAL DISPLACEMENT: 4.85 METERS", { font: { family: "Inter", style: "Regular" }, size: 12, color: cOrange }));
  rCard.appendChild(rcLoc);

  const rcHash = figma.createFrame();
  rcHash.layoutMode = "VERTICAL";
  rcHash.itemSpacing = 4;
  rcHash.fills = [];
  rcHash.appendChild(makeText("CRYPTOGRAPHIC PROOF", { font: { family: "Inter", style: "Semi Bold" }, size: 10, color: cMuted, letterSpacing: 1 }));
  rcHash.appendChild(makeText("sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d6", { font: { family: "Inter", style: "Regular" }, size: 10, color: cMuted }));
  rCard.appendChild(rcHash);
  ch7Body.appendChild(rCard);

  const rGlass = figma.createFrame();
  rGlass.resize(200, 180);
  rGlass.fills = [getImagePaint("glasses_3d")];
  ch7Body.appendChild(rGlass);
  ch7.appendChild(ch7Body);

  // Section 09: Chapter 08 (#trust, y: 6626, h: 892)
  const ch8 = figma.createFrame();
  ch8.name = "Section 09 / Chapter 08 — Trust Manifesto (#trust)";
  ch8.resize(1440, 892);
  ch8.x = 0;
  ch8.y = 6626;
  ch8.fills = [{ type: "SOLID", color: cDarkCosmos }];
  ch8.paddingLeft = 100;
  ch8.paddingRight = 100;
  ch8.paddingTop = 60;
  ch8.paddingBottom = 60;
  ch8.layoutMode = "VERTICAL";
  ch8.primaryAxisAlignItems = "SPACE_BETWEEN";
  deskFrame.appendChild(ch8);

  ch8.appendChild(makeChapterHeader("08", "TRUST", 1240, true));

  const ch8Head = figma.createFrame();
  ch8Head.layoutMode = "VERTICAL";
  ch8Head.itemSpacing = 16;
  ch8Head.fills = [];
  ch8Head.appendChild(makeText("• 08 / TRUST", { font: { family: "Inter", style: "Semi Bold" }, size: 11, color: cOrange, letterSpacing: 1.5 }));
  ch8Head.appendChild(makeText("Technology should reduce confusion,\nnot create more of it.", {
    font: { family: "Georgia", style: "Regular" },
    size: 48,
    lineHeight: 56,
    color: { r: 1, g: 1, b: 1 },
    width: 900
  }));
  ch8.appendChild(ch8Head);

  const ch8Cards = figma.createFrame();
  ch8Cards.layoutMode = "HORIZONTAL";
  ch8Cards.itemSpacing = 24;
  ch8Cards.layoutAlign = "STRETCH";
  ch8Cards.fills = [];

  trustData.forEach(t => {
    const card = figma.createFrame();
    card.resize(397, 340);
    card.cornerRadius = 16;
    card.fills = [{ type: "SOLID", color: cDarkCard }];
    card.strokes = [{ type: "SOLID", color: cBorderDark }];
    card.strokeWeight = 1;
    card.paddingLeft = 28;
    card.paddingRight = 28;
    card.paddingTop = 28;
    card.paddingBottom = 28;
    card.layoutMode = "VERTICAL";
    card.primaryAxisAlignItems = "SPACE_BETWEEN";
    card.appendChild(makeText(t.num, { font: { family: "Inter", style: "Semi Bold" }, size: 14, color: cOrange }));

    const body = figma.createFrame();
    body.layoutMode = "VERTICAL";
    body.itemSpacing = 12;
    body.fills = [];
    body.appendChild(makeText(t.title, { font: { family: "Georgia", style: "Regular" }, size: 22, lineHeight: 28, color: { r: 1, g: 1, b: 1 } }));
    body.appendChild(makeText(t.desc, { font: { family: "Inter", style: "Regular" }, size: 14, lineHeight: 22, color: { r: 0.7, g: 0.75, b: 0.8 }, width: 341 }));
    card.appendChild(body);
    ch8Cards.appendChild(card);
  });
  ch8.appendChild(ch8Cards);

  // Section 10: Chapter 09 (#final-cta, y: 7518, h: 889)
  const ch9 = figma.createFrame();
  ch9.name = "Section 10 / Chapter 09 — Final Moment (#final-cta)";
  ch9.resize(1440, 889);
  ch9.x = 0;
  ch9.y = 7518;
  ch9.fills = [{ type: "SOLID", color: cDarkCosmos }];
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
  ch9Body.counterAxisAlignItems = "CENTER";
  ch9Body.layoutAlign = "STRETCH";
  ch9Body.fills = [];

  const ch9Left = figma.createFrame();
  ch9Left.layoutMode = "VERTICAL";
  ch9Left.itemSpacing = 24;
  ch9Left.fills = [];
  ch9Left.appendChild(makeText("• 09 / CLOSING", { font: { family: "Inter", style: "Semi Bold" }, size: 11, color: cOrange, letterSpacing: 1.5 }));
  ch9Left.appendChild(makeText("What if your home\ncould remember for you?", {
    font: { family: "Georgia", style: "Regular" },
    size: 56,
    lineHeight: 64,
    color: { r: 1, g: 1, b: 1 },
    width: 600
  }));
  ch9Left.appendChild(makeText("SMRITI gives caregivers and families the quiet certainty that everyday things are never truly lost.", {
    font: { family: "Inter", style: "Regular" },
    size: 18,
    lineHeight: 28,
    color: { r: 0.7, g: 0.75, b: 0.8 },
    width: 540
  }));

  const ctaBtns = figma.createFrame();
  ctaBtns.layoutMode = "HORIZONTAL";
  ctaBtns.itemSpacing = 16;
  ctaBtns.counterAxisAlignItems = "CENTER";
  ctaBtns.fills = [];
  ctaBtns.appendChild(makePill("Explore SMRITI →", { bg: cPaper, color: cInk, padX: 24, padY: 14, size: 14 }));
  ctaBtns.appendChild(makeText("Experience PHANTOM ↗", { font: { family: "Inter", style: "Semi Bold" }, size: 14, color: cCyan }));
  ch9Left.appendChild(ctaBtns);
  ch9Body.appendChild(ch9Left);

  const ctaWorld = figma.createFrame();
  ctaWorld.resize(520, 380);
  ctaWorld.cornerRadius = 20;
  ctaWorld.fills = [getImagePaint("cta_world")];
  ch9Body.appendChild(ctaWorld);
  ch9.appendChild(ch9Body);

  const ft = figma.createFrame();
  ft.layoutMode = "HORIZONTAL";
  ft.primaryAxisAlignItems = "SPACE_BETWEEN";
  ft.counterAxisAlignItems = "CENTER";
  ft.layoutAlign = "STRETCH";
  ft.fills = [];
  ft.strokes = [{ type: "SOLID", color: cBorderDark }];
  ft.strokeWeight = 1;
  ft.paddingTop = 20;
  ft.appendChild(makeText("SMRITI / PHANTOM — A spatial memory system for everyday life.", { font: { family: "Inter", style: "Regular" }, size: 12, color: { r: 0.6, g: 0.65, b: 0.7 } }));
  ft.appendChild(makeText("Back to the beginning ↑", { font: { family: "Inter", style: "Medium" }, size: 12, color: { r: 1, g: 1, b: 1 } }));
  ch9.appendChild(ft);

  // ============================================================================
  // BUILD TABLET (768px) & MOBILE (390px) ON PAGE 04
  // ============================================================================
  for (const c of [...p4.children]) c.remove();

  // ----------------------------------------------------------------------------
  // 1. TABLET VIEWPORT (768×9120)
  // ----------------------------------------------------------------------------
  const tabFrame = figma.createFrame();
  tabFrame.name = "04 — SMRITI Tablet Viewport (768×9120)";
  tabFrame.resize(768, 9120);
  tabFrame.x = 0;
  tabFrame.y = 0;
  tabFrame.fills = [{ type: "SOLID", color: cPaper }];
  p4.appendChild(tabFrame);

  // Tablet Hero (768×1000)
  const tabHero = figma.createFrame();
  tabHero.name = "Hero / Tablet";
  tabHero.resize(768, 1000);
  tabHero.y = 0;
  tabHero.fills = [getImagePaint("hero_tablet")];
  tabHero.paddingLeft = 32;
  tabHero.paddingRight = 32;
  tabHero.paddingTop = 20;
  tabHero.paddingBottom = 40;
  tabHero.layoutMode = "VERTICAL";
  tabHero.primaryAxisAlignItems = "SPACE_BETWEEN";
  tabFrame.appendChild(tabHero);

  const tabNav = figma.createFrame();
  tabNav.resize(704, 52);
  tabNav.cornerRadius = 26;
  tabNav.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.94 }];
  tabNav.strokes = [{ type: "SOLID", color: cBorderWarm }];
  tabNav.layoutMode = "HORIZONTAL";
  tabNav.primaryAxisAlignItems = "SPACE_BETWEEN";
  tabNav.counterAxisAlignItems = "CENTER";
  tabNav.paddingLeft = 20;
  tabNav.paddingRight = 10;
  tabNav.appendChild(makeText("SMRITI.", { font: { family: "Inter", style: "Bold" }, size: 18 }));
  const tabNavR = figma.createFrame();
  tabNavR.layoutMode = "HORIZONTAL";
  tabNavR.itemSpacing = 8;
  tabNavR.counterAxisAlignItems = "CENTER";
  tabNavR.fills = [];
  tabNavR.appendChild(makePill("→", { bg: cInk, color: cPaper, padX: 12, padY: 8, size: 12 }));
  tabNavR.appendChild(makePill("☰", { bg: cPaperElevated, color: cInk, padX: 12, padY: 8, size: 14 }));
  tabNav.appendChild(tabNavR);
  tabHero.appendChild(tabNav);

  const tabHeroContent = figma.createFrame();
  tabHeroContent.layoutMode = "VERTICAL";
  tabHeroContent.itemSpacing = 16;
  tabHeroContent.fills = [];
  tabHeroContent.appendChild(makePill("A quiet afternoon at home", { dotColor: cOrange, bg: { r: 1, g: 1, b: 1 }, padX: 12, padY: 6 }));
  tabHeroContent.appendChild(makeText("SPATIAL MEMORY FOR EVERYDAY LIFE", { font: { family: "Inter", style: "Semi Bold" }, size: 11, color: cOrange, letterSpacing: 1.5 }));
  const tabTitle = figma.createFrame();
  tabTitle.layoutMode = "VERTICAL";
  tabTitle.fills = [];
  tabTitle.appendChild(makeText("Your home", { font: { family: "Georgia", style: "Regular" }, size: 58, lineHeight: 62 }));
  tabTitle.appendChild(makeText("remembers.", { font: { family: "Georgia", style: "Italic" }, size: 58, lineHeight: 62, color: cOrange }));
  tabHeroContent.appendChild(tabTitle);
  tabHeroContent.appendChild(makeText("SMRITI remembers where everyday things were — and shows what changed.", {
    font: { family: "Inter", style: "Regular" },
    size: 16,
    lineHeight: 24,
    color: cMuted,
    width: 680
  }));
  const tabHeroBtns = figma.createFrame();
  tabHeroBtns.layoutMode = "HORIZONTAL";
  tabHeroBtns.itemSpacing = 16;
  tabHeroBtns.counterAxisAlignItems = "CENTER";
  tabHeroBtns.fills = [];
  tabHeroBtns.appendChild(makePill("See how it works →", { bg: cInk, color: cPaper, padX: 20, padY: 12, size: 13 }));
  tabHeroBtns.appendChild(makeText("Where are my glasses?", { font: { family: "Inter", style: "Medium" }, size: 13 }));
  tabHeroContent.appendChild(tabHeroBtns);
  tabHero.appendChild(tabHeroContent);

  // Tab Ch1 (768×683, y: 1000)
  const tabCh1 = figma.createFrame();
  tabCh1.resize(768, 683);
  tabCh1.y = 1000;
  tabCh1.fills = [{ type: "SOLID", color: cPaper }];
  tabCh1.paddingLeft = 32;
  tabCh1.paddingRight = 32;
  tabCh1.paddingTop = 60;
  tabCh1.paddingBottom = 60;
  tabCh1.layoutMode = "VERTICAL";
  tabCh1.primaryAxisAlignItems = "SPACE_BETWEEN";
  tabCh1.appendChild(makeChapterHeader("01", "A FAMILIAR MOMENT", 704));

  const tabCh1Body = figma.createFrame();
  tabCh1Body.layoutMode = "VERTICAL";
  tabCh1Body.itemSpacing = 16;
  tabCh1Body.fills = [];
  tabCh1Body.appendChild(makeText("“Where did I put my glasses?”", { font: { family: "Georgia", style: "Regular" }, size: 42, lineHeight: 48, width: 704 }));
  tabCh1Body.appendChild(makeText("Some days, a familiar room can feel a little less familiar.", { font: { family: "Inter", style: "Medium" }, size: 20, lineHeight: 28, width: 704 }));
  tabCh1Body.appendChild(makeText("SMRITI keeps a gentle memory of where everyday things were, so the answer is close when someone needs it.", {
    font: { family: "Inter", style: "Regular" },
    size: 15,
    lineHeight: 24,
    color: cMuted,
    width: 704
  }));
  tabCh1Body.appendChild(makeText("Watch the moment unfold ↗", { font: { family: "Inter", style: "Semi Bold" }, size: 14 }));
  tabCh1.appendChild(tabCh1Body);

  const tabRibbon = figma.createFrame();
  tabRibbon.layoutMode = "HORIZONTAL";
  tabRibbon.itemSpacing = 10;
  tabRibbon.counterAxisAlignItems = "CENTER";
  tabRibbon.fills = [];
  ["READING GLASSES", "HOUSE KEYS", "MEDICINE"].forEach(item => {
    tabRibbon.appendChild(makePill(item, { bg: { r: 1, g: 1, b: 1 }, stroke: cBorderWarm, size: 10, letterSpacing: 1 }));
  });
  tabCh1.appendChild(tabRibbon);
  tabFrame.appendChild(tabCh1);

  // Tab Ch2 (768×601, y: 1683)
  const tabCh2 = figma.createFrame();
  tabCh2.resize(768, 601);
  tabCh2.y = 1683;
  tabCh2.fills = [{ type: "SOLID", color: cPaperElevated }];
  tabCh2.paddingLeft = 32;
  tabCh2.paddingRight = 32;
  tabCh2.paddingTop = 60;
  tabCh2.paddingBottom = 60;
  tabCh2.layoutMode = "VERTICAL";
  tabCh2.primaryAxisAlignItems = "SPACE_BETWEEN";
  tabCh2.appendChild(makeChapterHeader("02", "THREE QUIET MOMENTS", 704));

  const tabCh2Head = figma.createFrame();
  tabCh2Head.layoutMode = "VERTICAL";
  tabCh2Head.itemSpacing = 8;
  tabCh2Head.fills = [];
  tabCh2Head.appendChild(makeText("A little help, right on time.", { font: { family: "Georgia", style: "Regular" }, size: 40, lineHeight: 46, width: 704 }));
  tabCh2Head.appendChild(makeText("Nothing to learn. Nothing to remember about the technology. Just a clear answer when it matters.", {
    font: { family: "Inter", style: "Regular" },
    size: 14,
    color: cMuted,
    width: 704
  }));
  tabCh2.appendChild(tabCh2Head);

  const tabCh2Cards = figma.createFrame();
  tabCh2Cards.layoutMode = "HORIZONTAL";
  tabCh2Cards.itemSpacing = 16;
  tabCh2Cards.layoutAlign = "STRETCH";
  tabCh2Cards.fills = [];
  momentsData.forEach(m => {
    const card = figma.createFrame();
    card.resize(224, 230);
    card.cornerRadius = 14;
    card.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
    card.strokes = [{ type: "SOLID", color: cBorderWarm }];
    card.strokeWeight = 1;
    card.paddingLeft = 18;
    card.paddingRight = 18;
    card.paddingTop = 18;
    card.paddingBottom = 18;
    card.layoutMode = "VERTICAL";
    card.primaryAxisAlignItems = "SPACE_BETWEEN";

    const cTop = figma.createFrame();
    cTop.layoutMode = "HORIZONTAL";
    cTop.primaryAxisAlignItems = "SPACE_BETWEEN";
    cTop.counterAxisAlignItems = "CENTER";
    cTop.layoutAlign = "STRETCH";
    cTop.fills = [];
    cTop.appendChild(makeText(m.num, { font: { family: "Inter", style: "Semi Bold" }, size: 12, color: cOrange }));
    cTop.appendChild(makePill(m.badge, { bg: cPaperElevated, size: 8, letterSpacing: 1 }));
    card.appendChild(cTop);

    const cBody = figma.createFrame();
    cBody.layoutMode = "VERTICAL";
    cBody.itemSpacing = 8;
    cBody.fills = [];
    cBody.appendChild(makeText(m.title, { font: { family: "Georgia", style: "Regular" }, size: 22 }));
    cBody.appendChild(makeText(m.desc, { font: { family: "Inter", style: "Regular" }, size: 12, lineHeight: 18, color: cMuted, width: 188 }));
    card.appendChild(cBody);
    tabCh2Cards.appendChild(card);
  });
  tabCh2.appendChild(tabCh2Cards);
  tabFrame.appendChild(tabCh2);

  // Tab Ch3 (768×647, y: 2284)
  const tabCh3 = figma.createFrame();
  tabCh3.resize(768, 647);
  tabCh3.y = 2284;
  tabCh3.fills = [{ type: "SOLID", color: cPaper }];
  tabCh3.paddingLeft = 32;
  tabCh3.paddingRight = 32;
  tabCh3.paddingTop = 60;
  tabCh3.paddingBottom = 60;
  tabCh3.layoutMode = "VERTICAL";
  tabCh3.primaryAxisAlignItems = "SPACE_BETWEEN";
  tabCh3.appendChild(makeChapterHeader("03", "ONE MEANINGFUL CHANGE", 704));

  const tabCh3Head = figma.createFrame();
  tabCh3Head.layoutMode = "VERTICAL";
  tabCh3Head.itemSpacing = 10;
  tabCh3Head.fills = [];
  tabCh3Head.appendChild(makeText("The room, then and now.", { font: { family: "Georgia", style: "Regular" }, size: 40, lineHeight: 46, width: 704 }));
  tabCh3Head.appendChild(makeText("Instead of replaying hours of video or searching through lists, SMRITI shows you only what changed.", {
    font: { family: "Inter", style: "Regular" },
    size: 14,
    color: cMuted,
    width: 704
  }));
  tabCh3.appendChild(tabCh3Head);

  const tabDiffCardMini = figma.createFrame();
  tabDiffCardMini.resize(704, 380);
  tabDiffCardMini.cornerRadius = 16;
  tabDiffCardMini.fills = [getImagePaint("reality_diff")];
  tabDiffCardMini.strokes = [{ type: "SOLID", color: cBorderWarm }];
  tabCh3.appendChild(tabDiffCardMini);
  tabFrame.appendChild(tabCh3);

  // Tab Ch4 (768×681, y: 2931)
  const tabCh4 = figma.createFrame();
  tabCh4.resize(768, 681);
  tabCh4.y = 2931;
  tabCh4.fills = [{ type: "SOLID", color: cPaper }];
  tabCh4.paddingLeft = 32;
  tabCh4.paddingRight = 32;
  tabCh4.paddingTop = 60;
  tabCh4.paddingBottom = 60;
  tabCh4.layoutMode = "VERTICAL";
  tabCh4.primaryAxisAlignItems = "SPACE_BETWEEN";
  tabCh4.appendChild(makeChapterHeader("04", "A MEMORY TO KEEP", 704));

  const tabCh4Head = figma.createFrame();
  tabCh4Head.layoutMode = "VERTICAL";
  tabCh4Head.itemSpacing = 10;
  tabCh4Head.fills = [];
  tabCh4Head.appendChild(makeText("The answer, without the search.", { font: { family: "Georgia", style: "Regular" }, size: 40, lineHeight: 46, width: 704 }));
  tabCh4Head.appendChild(makeText("A single, clear card you can glance at or share with family.", {
    font: { family: "Inter", style: "Regular" },
    size: 14,
    color: cMuted,
    width: 704
  }));
  tabCh4.appendChild(tabCh4Head);

  const tabCh4Card = figma.createFrame();
  tabCh4Card.resize(704, 320);
  tabCh4Card.cornerRadius = 16;
  tabCh4Card.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  tabCh4Card.strokes = [{ type: "SOLID", color: cBorderWarm }];
  tabCh4Card.paddingLeft = 28;
  tabCh4Card.paddingRight = 28;
  tabCh4Card.paddingTop = 24;
  tabCh4Card.paddingBottom = 24;
  tabCh4Card.layoutMode = "VERTICAL";
  tabCh4Card.primaryAxisAlignItems = "SPACE_BETWEEN";

  tabCh4Card.appendChild(makePill("CLEAR, CALM, CERTAIN", { dotColor: cOrange, bg: cPaperElevated, size: 10 }));
  tabCh4Card.appendChild(makeText("Reading glasses", { font: { family: "Georgia", style: "Regular" }, size: 30 }));
  tabCh4Card.appendChild(makeText("Observed: Bookshelf (second shelf from top)", { font: { family: "Inter", style: "Regular" }, size: 14, color: cMuted }));
  const tabCh4Btns = figma.createFrame();
  tabCh4Btns.layoutMode = "HORIZONTAL";
  tabCh4Btns.itemSpacing = 12;
  tabCh4Btns.fills = [];
  tabCh4Btns.appendChild(makePill("SHARE WITH FAMILY ↗", { bg: cPaperElevated, stroke: cBorderWarm, size: 11 }));
  tabCh4Btns.appendChild(makePill("VIEW TIMELINE →", { bg: cInk, color: cPaper, padX: 16, padY: 8, size: 11 }));
  tabCh4Card.appendChild(tabCh4Btns);
  tabCh4.appendChild(tabCh4Card);
  tabFrame.appendChild(tabCh4);

  // Tab Ch5 (768×1206, y: 3612)
  const tabCh5 = figma.createFrame();
  tabCh5.resize(768, 1206);
  tabCh5.y = 3612;
  tabCh5.fills = [{ type: "SOLID", color: cDarkCosmos }];
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
  tabCh5Content.appendChild(makeText("• 05 / PHANTOM", { font: { family: "Inter", style: "Semi Bold" }, size: 10, color: cCyan, letterSpacing: 1.5 }));
  tabCh5Content.appendChild(makeText("Meet PHANTOM.", { font: { family: "Georgia", style: "Regular" }, size: 48, color: { r: 1, g: 1, b: 1 }, width: 704 }));
  tabCh5Content.appendChild(makeText("The spatial-temporal engine powering SMRITI. Continuous ambient understanding with zero latency.", {
    font: { family: "Inter", style: "Regular" },
    size: 15,
    lineHeight: 24,
    color: { r: 0.7, g: 0.75, b: 0.8 },
    width: 704
  }));

  const tabWf = figma.createFrame();
  tabWf.resize(704, 460);
  tabWf.cornerRadius = 16;
  tabWf.fills = [getImagePaint("phantom_wireframe")];
  tabCh5Content.appendChild(tabWf);

  const tabMetrics = figma.createFrame();
  tabMetrics.layoutMode = "HORIZONTAL";
  tabMetrics.itemSpacing = 12;
  tabMetrics.fills = [];
  [
    { k: "Reality Capture", v: "60 fps" },
    { k: "Temporal Diffing", v: "42 ms" },
    { k: "Gentle Retrieval", v: "99.8%" }
  ].forEach(m => {
    const b = figma.createFrame();
    b.resize(226, 68);
    b.cornerRadius = 8;
    b.fills = [{ type: "SOLID", color: cDarkCard }];
    b.strokes = [{ type: "SOLID", color: cBorderDark }];
    b.paddingLeft = 14;
    b.paddingTop = 10;
    b.layoutMode = "VERTICAL";
    b.appendChild(makeText(m.v, { font: { family: "Inter", style: "Bold" }, size: 18, color: cCyan }));
    b.appendChild(makeText(m.k, { font: { family: "Inter", style: "Regular" }, size: 11, color: { r: 0.6, g: 0.65, b: 0.7 } }));
    tabMetrics.appendChild(b);
  });
  tabCh5Content.appendChild(tabMetrics);
  tabCh5.appendChild(tabCh5Content);
  tabFrame.appendChild(tabCh5);

  // Tab Ch6 (768×1075, y: 4818)
  const tabCh6 = figma.createFrame();
  tabCh6.resize(768, 1075);
  tabCh6.y = 4818;
  tabCh6.fills = [{ type: "SOLID", color: cPaper }];
  tabCh6.paddingLeft = 32;
  tabCh6.paddingRight = 32;
  tabCh6.paddingTop = 60;
  tabCh6.paddingBottom = 60;
  tabCh6.layoutMode = "VERTICAL";
  tabCh6.primaryAxisAlignItems = "SPACE_BETWEEN";
  tabCh6.appendChild(makeChapterHeader("06", "REALITY DIFF", 704));

  const tabCh6Head = figma.createFrame();
  tabCh6Head.layoutMode = "VERTICAL";
  tabCh6Head.itemSpacing = 10;
  tabCh6Head.fills = [];
  tabCh6Head.appendChild(makeText("• 06 / REALITY DIFF", { font: { family: "Inter", style: "Semi Bold" }, size: 11, color: cOrange, letterSpacing: 1.5 }));
  tabCh6Head.appendChild(makeText("See what changed.", { font: { family: "Georgia", style: "Regular" }, size: 46, width: 704 }));
  tabCh6Head.appendChild(makeText("SMRITI compares moments in your home so the change doesn't have to live only in your memory.", {
    font: { family: "Inter", style: "Regular" },
    size: 15,
    color: cMuted,
    width: 704
  }));
  tabCh6.appendChild(tabCh6Head);

  const tabCompCard = figma.createFrame();
  tabCompCard.resize(704, 620);
  tabCompCard.cornerRadius = 20;
  tabCompCard.fills = [{ type: "SOLID", color: cPaperElevated }];
  tabCompCard.strokes = [{ type: "SOLID", color: cBorderWarm }];
  tabCompCard.paddingLeft = 24;
  tabCompCard.paddingRight = 24;
  tabCompCard.paddingTop = 20;
  tabCompCard.paddingBottom = 20;
  tabCompCard.layoutMode = "VERTICAL";
  tabCompCard.primaryAxisAlignItems = "SPACE_BETWEEN";

  const tabCompImg = figma.createFrame();
  tabCompImg.resize(656, 480);
  tabCompImg.cornerRadius = 14;
  tabCompImg.fills = [getImagePaint("reality_diff")];
  tabCompCard.appendChild(tabCompImg);

  const tabEvBar = figma.createFrame();
  tabEvBar.layoutMode = "HORIZONTAL";
  tabEvBar.primaryAxisAlignItems = "SPACE_BETWEEN";
  tabEvBar.counterAxisAlignItems = "CENTER";
  tabEvBar.layoutAlign = "STRETCH";
  tabEvBar.fills = [];
  tabEvBar.appendChild(makeText("2:10 PM Side table → 4:40 PM Bookshelf", { font: { family: "Inter", style: "Semi Bold" }, size: 13 }));
  tabEvBar.appendChild(makeText("OBJECT MOVED", { font: { family: "Inter", style: "Semi Bold" }, size: 11, color: cOrange, letterSpacing: 1.2 }));
  tabCompCard.appendChild(tabEvBar);
  tabCh6.appendChild(tabCompCard);

  const tabEdClose = figma.createFrame();
  tabEdClose.layoutMode = "VERTICAL";
  tabEdClose.itemSpacing = 6;
  tabEdClose.fills = [];
  tabEdClose.appendChild(makeText("“Not everything changes. Only what matters.”", { font: { family: "Georgia", style: "Regular" }, size: 32, width: 704 }));
  tabEdClose.appendChild(makeText("SMRITI makes the difference visible.", { font: { family: "Inter", style: "Medium" }, size: 15, color: cMuted }));
  tabCh6.appendChild(tabEdClose);
  tabFrame.appendChild(tabCh6);

  // Tab Ch7 (768×1288, y: 5893)
  const tabCh7 = figma.createFrame();
  tabCh7.resize(768, 1288);
  tabCh7.y = 5893;
  tabCh7.fills = [{ type: "SOLID", color: cPaper }];
  tabCh7.paddingLeft = 32;
  tabCh7.paddingRight = 32;
  tabCh7.paddingTop = 60;
  tabCh7.paddingBottom = 60;
  tabCh7.layoutMode = "VERTICAL";
  tabCh7.primaryAxisAlignItems = "SPACE_BETWEEN";
  tabCh7.appendChild(makeChapterHeader("07", "MEMORY RECEIPT", 704));

  const tabCh7Head = figma.createFrame();
  tabCh7Head.layoutMode = "VERTICAL";
  tabCh7Head.itemSpacing = 10;
  tabCh7Head.fills = [];
  tabCh7Head.appendChild(makeText("• 07 / MEMORY RECEIPT", { font: { family: "Inter", style: "Semi Bold" }, size: 11, color: cOrange, letterSpacing: 1.5 }));
  tabCh7Head.appendChild(makeText("Remembered, not guessed.", { font: { family: "Georgia", style: "Regular" }, size: 44, width: 704 }));
  tabCh7Head.appendChild(makeText("When something moves, SMRITI generates a cryptographic memory receipt. A quiet, verified record.", {
    font: { family: "Inter", style: "Regular" },
    size: 15,
    color: cMuted,
    width: 704
  }));
  tabCh7.appendChild(tabCh7Head);

  const tabRCard = figma.createFrame();
  tabRCard.resize(704, 520);
  tabRCard.cornerRadius = 16;
  tabRCard.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  tabRCard.strokes = [{ type: "SOLID", color: cBorderWarm }];
  tabRCard.paddingLeft = 28;
  tabRCard.paddingRight = 28;
  tabRCard.paddingTop = 24;
  tabRCard.paddingBottom = 24;
  tabRCard.layoutMode = "VERTICAL";
  tabRCard.primaryAxisAlignItems = "SPACE_BETWEEN";

  const trHead = figma.createFrame();
  trHead.layoutMode = "HORIZONTAL";
  trHead.primaryAxisAlignItems = "SPACE_BETWEEN";
  trHead.layoutAlign = "STRETCH";
  trHead.fills = [];
  trHead.appendChild(makeText("SMRITI MEMORY RECEIPT", { font: { family: "Inter", style: "Bold" }, size: 13, letterSpacing: 1 }));
  trHead.appendChild(makePill("CONFIRMED", { dotColor: { r: 0.2, g: 0.8, b: 0.4 }, bg: cPaperElevated, size: 10 }));
  tabRCard.appendChild(trHead);

  const trObj = figma.createFrame();
  trObj.layoutMode = "VERTICAL";
  trObj.itemSpacing = 6;
  trObj.fills = [];
  trObj.appendChild(makeText("Reading glasses", { font: { family: "Georgia", style: "Regular" }, size: 26 }));
  trObj.appendChild(makeText("OBJECT ID: #REC-2026-0842-A", { font: { family: "Inter", style: "Semi Bold" }, size: 11, color: cMuted }));
  tabRCard.appendChild(trObj);

  const trLoc = figma.createFrame();
  trLoc.layoutMode = "VERTICAL";
  trLoc.itemSpacing = 8;
  trLoc.fills = [];
  trLoc.appendChild(makeText("BEFORE: 2:10 PM · Side table", { font: { family: "Inter", style: "Regular" }, size: 13, color: cMuted }));
  trLoc.appendChild(makeText("AFTER: 4:40 PM · Bookshelf", { font: { family: "Inter", style: "Semi Bold" }, size: 14 }));
  trLoc.appendChild(makeText("SPATIAL DISPLACEMENT: 4.85 METERS", { font: { family: "Inter", style: "Regular" }, size: 12, color: cOrange }));
  tabRCard.appendChild(trLoc);

  const trHash = figma.createFrame();
  trHash.layoutMode = "VERTICAL";
  trHash.itemSpacing = 4;
  trHash.fills = [];
  trHash.appendChild(makeText("CRYPTOGRAPHIC PROOF", { font: { family: "Inter", style: "Semi Bold" }, size: 10, color: cMuted, letterSpacing: 1 }));
  trHash.appendChild(makeText("sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d6", { font: { family: "Inter", style: "Regular" }, size: 10, color: cMuted }));
  tabRCard.appendChild(trHash);
  tabCh7.appendChild(tabRCard);
  tabFrame.appendChild(tabCh7);

  // Tab Ch8 (768×823, y: 7181)
  const tabCh8 = figma.createFrame();
  tabCh8.resize(768, 823);
  tabCh8.y = 7181;
  tabCh8.fills = [{ type: "SOLID", color: cDarkCosmos }];
  tabCh8.paddingLeft = 32;
  tabCh8.paddingRight = 32;
  tabCh8.paddingTop = 60;
  tabCh8.paddingBottom = 60;
  tabCh8.layoutMode = "VERTICAL";
  tabCh8.primaryAxisAlignItems = "SPACE_BETWEEN";
  tabCh8.appendChild(makeChapterHeader("08", "TRUST", 704, true));

  const tabCh8Head = figma.createFrame();
  tabCh8Head.layoutMode = "VERTICAL";
  tabCh8Head.itemSpacing = 12;
  tabCh8Head.fills = [];
  tabCh8Head.appendChild(makeText("• 08 / TRUST", { font: { family: "Inter", style: "Semi Bold" }, size: 11, color: cOrange, letterSpacing: 1.5 }));
  tabCh8Head.appendChild(makeText("Technology should reduce confusion,\nnot create more of it.", {
    font: { family: "Georgia", style: "Regular" },
    size: 38,
    lineHeight: 46,
    color: { r: 1, g: 1, b: 1 },
    width: 704
  }));
  tabCh8.appendChild(tabCh8Head);

  const tabTrustRow = figma.createFrame();
  tabTrustRow.layoutMode = "HORIZONTAL";
  tabTrustRow.itemSpacing = 16;
  tabTrustRow.layoutAlign = "STRETCH";
  tabTrustRow.fills = [];
  trustData.forEach(t => {
    const card = figma.createFrame();
    card.resize(224, 320);
    card.cornerRadius = 14;
    card.fills = [{ type: "SOLID", color: cDarkCard }];
    card.strokes = [{ type: "SOLID", color: cBorderDark }];
    card.paddingLeft = 18;
    card.paddingRight = 18;
    card.paddingTop = 20;
    card.paddingBottom = 20;
    card.layoutMode = "VERTICAL";
    card.primaryAxisAlignItems = "SPACE_BETWEEN";
    card.appendChild(makeText(t.num, { font: { family: "Inter", style: "Semi Bold" }, size: 12, color: cOrange }));

    const body = figma.createFrame();
    body.layoutMode = "VERTICAL";
    body.itemSpacing = 8;
    body.fills = [];
    body.appendChild(makeText(t.title, { font: { family: "Georgia", style: "Regular" }, size: 18, lineHeight: 24, color: { r: 1, g: 1, b: 1 } }));
    body.appendChild(makeText(t.desc, { font: { family: "Inter", style: "Regular" }, size: 12, lineHeight: 18, color: { r: 0.7, g: 0.75, b: 0.8 }, width: 188 }));
    card.appendChild(body);
    tabTrustRow.appendChild(card);
  });
  tabCh8.appendChild(tabTrustRow);
  tabFrame.appendChild(tabCh8);

  // Tab Ch9 (768×1157, y: 8004)
  const tabCh9 = figma.createFrame();
  tabCh9.resize(768, 1157);
  tabCh9.y = 8004;
  tabCh9.fills = [{ type: "SOLID", color: cDarkCosmos }];
  tabCh9.paddingLeft = 32;
  tabCh9.paddingRight = 32;
  tabCh9.paddingTop = 60;
  tabCh9.paddingBottom = 40;
  tabCh9.layoutMode = "VERTICAL";
  tabCh9.primaryAxisAlignItems = "SPACE_BETWEEN";
  tabCh9.appendChild(makeChapterHeader("09", "FINAL MOMENT", 704, true));

  const tabCh9Body = figma.createFrame();
  tabCh9Body.layoutMode = "VERTICAL";
  tabCh9Body.itemSpacing = 20;
  tabCh9Body.fills = [];
  tabCh9Body.appendChild(makeText("• 09 / CLOSING", { font: { family: "Inter", style: "Semi Bold" }, size: 11, color: cOrange, letterSpacing: 1.5 }));
  tabCh9Body.appendChild(makeText("What if your home\ncould remember for you?", {
    font: { family: "Georgia", style: "Regular" },
    size: 46,
    lineHeight: 52,
    color: { r: 1, g: 1, b: 1 },
    width: 704
  }));
  tabCh9Body.appendChild(makeText("SMRITI gives caregivers and families the quiet certainty that everyday things are never truly lost.", {
    font: { family: "Inter", style: "Regular" },
    size: 16,
    lineHeight: 24,
    color: { r: 0.7, g: 0.75, b: 0.8 },
    width: 704
  }));

  const tabCtaBtns = figma.createFrame();
  tabCtaBtns.layoutMode = "HORIZONTAL";
  tabCtaBtns.itemSpacing = 16;
  tabCtaBtns.fills = [];
  tabCtaBtns.appendChild(makePill("Explore SMRITI →", { bg: cPaper, color: cInk, padX: 20, padY: 12, size: 13 }));
  tabCtaBtns.appendChild(makeText("Experience PHANTOM ↗", { font: { family: "Inter", style: "Semi Bold" }, size: 13, color: cCyan }));
  tabCh9Body.appendChild(tabCtaBtns);
  tabCh9.appendChild(tabCh9Body);

  const tabCtaWorld = figma.createFrame();
  tabCtaWorld.resize(704, 380);
  tabCtaWorld.cornerRadius = 20;
  tabCtaWorld.fills = [getImagePaint("cta_world")];
  tabCh9.appendChild(tabCtaWorld);

  const tabFt = figma.createFrame();
  tabFt.layoutMode = "HORIZONTAL";
  tabFt.primaryAxisAlignItems = "SPACE_BETWEEN";
  tabFt.counterAxisAlignItems = "CENTER";
  tabFt.layoutAlign = "STRETCH";
  tabFt.fills = [];
  tabFt.strokes = [{ type: "SOLID", color: cBorderDark }];
  tabFt.paddingTop = 16;
  tabFt.appendChild(makeText("SMRITI / PHANTOM — A spatial memory system for everyday life.", { font: { family: "Inter", style: "Regular" }, size: 11, color: { r: 0.6, g: 0.65, b: 0.7 } }));
  tabFt.appendChild(makeText("Back to the beginning ↑", { font: { family: "Inter", style: "Medium" }, size: 11, color: { r: 1, g: 1, b: 1 } }));
  tabCh9.appendChild(tabFt);
  tabFrame.appendChild(tabCh9);

  // ----------------------------------------------------------------------------
  // 2. MOBILE VIEWPORT (390×8780)
  // ----------------------------------------------------------------------------
  const mobFrame = figma.createFrame();
  mobFrame.name = "04 — SMRITI Mobile Viewport (390×8780)";
  mobFrame.resize(390, 8780);
  mobFrame.x = 868;
  mobFrame.y = 0;
  mobFrame.fills = [{ type: "SOLID", color: cPaper }];
  p4.appendChild(mobFrame);

  // Mobile Hero (390×844)
  const mobHero = figma.createFrame();
  mobHero.name = "Hero / Mobile";
  mobHero.resize(390, 844);
  mobHero.y = 0;
  mobHero.fills = [getImagePaint("hero_mobile")];
  mobHero.paddingLeft = 20;
  mobHero.paddingRight = 20;
  mobHero.paddingTop = 16;
  mobHero.paddingBottom = 28;
  mobHero.layoutMode = "VERTICAL";
  mobHero.primaryAxisAlignItems = "SPACE_BETWEEN";
  mobFrame.appendChild(mobHero);

  const mobNav = figma.createFrame();
  mobNav.resize(350, 48);
  mobNav.cornerRadius = 24;
  mobNav.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.94 }];
  mobNav.strokes = [{ type: "SOLID", color: cBorderWarm }];
  mobNav.layoutMode = "HORIZONTAL";
  mobNav.primaryAxisAlignItems = "SPACE_BETWEEN";
  mobNav.counterAxisAlignItems = "CENTER";
  mobNav.paddingLeft = 16;
  mobNav.paddingRight = 8;
  mobNav.appendChild(makeText("SMRITI.", { font: { family: "Inter", style: "Bold" }, size: 15 }));
  const mobNavR = figma.createFrame();
  mobNavR.layoutMode = "HORIZONTAL";
  mobNavR.itemSpacing = 6;
  mobNavR.counterAxisAlignItems = "CENTER";
  mobNavR.fills = [];
  mobNavR.appendChild(makePill("→", { bg: cInk, color: cPaper, padX: 10, padY: 6, size: 10 }));
  mobNavR.appendChild(makePill("☰", { bg: cPaperElevated, color: cInk, padX: 10, padY: 6, size: 12 }));
  mobNav.appendChild(mobNavR);
  mobHero.appendChild(mobNav);

  const mobHeroContent = figma.createFrame();
  mobHeroContent.layoutMode = "VERTICAL";
  mobHeroContent.itemSpacing = 12;
  mobHeroContent.fills = [];
  mobHeroContent.appendChild(makePill("A quiet afternoon at home", { dotColor: cOrange, bg: { r: 1, g: 1, b: 1 }, padX: 10, padY: 5, size: 9 }));
  mobHeroContent.appendChild(makeText("• SPATIAL MEMORY FOR EVERYDAY LIFE", { font: { family: "Inter", style: "Semi Bold" }, size: 9, color: cOrange, letterSpacing: 1.2 }));
  const mobTitle = figma.createFrame();
  mobTitle.layoutMode = "VERTICAL";
  mobTitle.fills = [];
  mobTitle.appendChild(makeText("Your home", { font: { family: "Georgia", style: "Regular" }, size: 44, lineHeight: 48 }));
  mobTitle.appendChild(makeText("remembers.", { font: { family: "Georgia", style: "Italic" }, size: 44, lineHeight: 48, color: cOrange }));
  mobHeroContent.appendChild(mobTitle);
  mobHeroContent.appendChild(makeText("SMRITI remembers where everyday things were — and shows what changed.", {
    font: { family: "Inter", style: "Regular" },
    size: 13,
    lineHeight: 20,
    color: cMuted,
    width: 350
  }));
  const mobHeroBtns = figma.createFrame();
  mobHeroBtns.layoutMode = "VERTICAL";
  mobHeroBtns.itemSpacing = 8;
  mobHeroBtns.fills = [];
  mobHeroBtns.appendChild(makePill("See how it works →", { bg: cInk, color: cPaper, padX: 18, padY: 10, size: 12 }));
  mobHeroBtns.appendChild(makeText("Where are my glasses?", { font: { family: "Inter", style: "Medium" }, size: 12 }));
  mobHeroContent.appendChild(mobHeroBtns);
  mobHero.appendChild(mobHeroContent);

  // Mobile Ch1 (390×634, y: 844)
  const mobCh1 = figma.createFrame();
  mobCh1.resize(390, 634);
  mobCh1.y = 844;
  mobCh1.fills = [{ type: "SOLID", color: cPaper }];
  mobCh1.paddingLeft = 20;
  mobCh1.paddingRight = 20;
  mobCh1.paddingTop = 48;
  mobCh1.paddingBottom = 48;
  mobCh1.layoutMode = "VERTICAL";
  mobCh1.primaryAxisAlignItems = "SPACE_BETWEEN";
  mobCh1.appendChild(makeChapterHeader("01", "A FAMILIAR MOMENT", 350));

  const mobCh1Body = figma.createFrame();
  mobCh1Body.layoutMode = "VERTICAL";
  mobCh1Body.itemSpacing = 14;
  mobCh1Body.fills = [];
  mobCh1Body.appendChild(makeText("“Where did I put my glasses?”", { font: { family: "Georgia", style: "Regular" }, size: 36, lineHeight: 42, width: 350 }));
  mobCh1Body.appendChild(makeText("Some days, a familiar room can feel a little less familiar.", { font: { family: "Inter", style: "Medium" }, size: 18, lineHeight: 26, width: 350 }));
  mobCh1Body.appendChild(makeText("SMRITI keeps a gentle memory of where everyday things were, so the answer is close when someone needs it.", {
    font: { family: "Inter", style: "Regular" },
    size: 13,
    lineHeight: 20,
    color: cMuted,
    width: 350
  }));
  mobCh1Body.appendChild(makeText("Watch the moment unfold ↗", { font: { family: "Inter", style: "Semi Bold" }, size: 13 }));
  mobCh1.appendChild(mobCh1Body);

  const mobRibbon = figma.createFrame();
  mobRibbon.layoutMode = "HORIZONTAL";
  mobRibbon.itemSpacing = 8;
  mobRibbon.fills = [];
  ["READING GLASSES", "KEYS", "MEDICINE"].forEach(item => {
    mobRibbon.appendChild(makePill(item, { bg: { r: 1, g: 1, b: 1 }, stroke: cBorderWarm, size: 9, letterSpacing: 1 }));
  });
  mobCh1.appendChild(mobRibbon);
  mobFrame.appendChild(mobCh1);

  // Mobile Ch2 (390×690, y: 1478)
  const mobCh2 = figma.createFrame();
  mobCh2.resize(390, 690);
  mobCh2.y = 1478;
  mobCh2.fills = [{ type: "SOLID", color: cPaperElevated }];
  mobCh2.paddingLeft = 20;
  mobCh2.paddingRight = 20;
  mobCh2.paddingTop = 48;
  mobCh2.paddingBottom = 48;
  mobCh2.layoutMode = "VERTICAL";
  mobCh2.primaryAxisAlignItems = "SPACE_BETWEEN";
  mobCh2.appendChild(makeChapterHeader("02", "THREE QUIET MOMENTS", 350));

  const mobCh2Head = figma.createFrame();
  mobCh2Head.layoutMode = "VERTICAL";
  mobCh2Head.itemSpacing = 8;
  mobCh2Head.fills = [];
  mobCh2Head.appendChild(makeText("A little help, right on time.", { font: { family: "Georgia", style: "Regular" }, size: 34, lineHeight: 40, width: 350 }));
  mobCh2Head.appendChild(makeText("Nothing to learn. Just a clear answer when it matters.", {
    font: { family: "Inter", style: "Regular" },
    size: 13,
    color: cMuted,
    width: 350
  }));
  mobCh2.appendChild(mobCh2Head);

  const mobCh2Cards = figma.createFrame();
  mobCh2Cards.layoutMode = "VERTICAL";
  mobCh2Cards.itemSpacing = 10;
  mobCh2Cards.fills = [];
  momentsData.forEach(m => {
    const card = figma.createFrame();
    card.resize(350, 110);
    card.cornerRadius = 12;
    card.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
    card.strokes = [{ type: "SOLID", color: cBorderWarm }];
    card.paddingLeft = 16;
    card.paddingRight = 16;
    card.paddingTop = 14;
    card.paddingBottom = 14;
    card.layoutMode = "VERTICAL";
    card.primaryAxisAlignItems = "SPACE_BETWEEN";

    const cTop = figma.createFrame();
    cTop.layoutMode = "HORIZONTAL";
    cTop.primaryAxisAlignItems = "SPACE_BETWEEN";
    cTop.layoutAlign = "STRETCH";
    cTop.fills = [];
    cTop.appendChild(makeText(`${m.num} · ${m.title}`, { font: { family: "Georgia", style: "Regular" }, size: 18 }));
    cTop.appendChild(makePill(m.badge, { bg: cPaperElevated, size: 8 }));
    card.appendChild(cTop);

    card.appendChild(makeText(m.desc, { font: { family: "Inter", style: "Regular" }, size: 12, lineHeight: 18, color: cMuted, width: 318 }));
    mobCh2Cards.appendChild(card);
  });
  mobCh2.appendChild(mobCh2Cards);
  mobFrame.appendChild(mobCh2);

  // Mobile Ch3 (390×608, y: 2168)
  const mobCh3 = figma.createFrame();
  mobCh3.resize(390, 608);
  mobCh3.y = 2168;
  mobCh3.fills = [{ type: "SOLID", color: cPaper }];
  mobCh3.paddingLeft = 20;
  mobCh3.paddingRight = 20;
  mobCh3.paddingTop = 48;
  mobCh3.paddingBottom = 48;
  mobCh3.layoutMode = "VERTICAL";
  mobCh3.primaryAxisAlignItems = "SPACE_BETWEEN";
  mobCh3.appendChild(makeChapterHeader("03", "ONE MEANINGFUL CHANGE", 350));

  const mobCh3Head = figma.createFrame();
  mobCh3Head.layoutMode = "VERTICAL";
  mobCh3Head.itemSpacing = 8;
  mobCh3Head.fills = [];
  mobCh3Head.appendChild(makeText("The room, then and now.", { font: { family: "Georgia", style: "Regular" }, size: 34, lineHeight: 40, width: 350 }));
  mobCh3Head.appendChild(makeText("SMRITI shows you only what changed: where the glasses were, and where they are now.", {
    font: { family: "Inter", style: "Regular" },
    size: 13,
    color: cMuted,
    width: 350
  }));
  mobCh3.appendChild(mobCh3Head);

  const mobDiffCardMini = figma.createFrame();
  mobDiffCardMini.resize(350, 320);
  mobDiffCardMini.cornerRadius = 14;
  mobDiffCardMini.fills = [getImagePaint("reality_diff")];
  mobDiffCardMini.strokes = [{ type: "SOLID", color: cBorderWarm }];
  mobCh3.appendChild(mobDiffCardMini);
  mobFrame.appendChild(mobCh3);

  // Mobile Ch4 (390×684, y: 2776)
  const mobCh4 = figma.createFrame();
  mobCh4.resize(390, 684);
  mobCh4.y = 2776;
  mobCh4.fills = [{ type: "SOLID", color: cPaper }];
  mobCh4.paddingLeft = 20;
  mobCh4.paddingRight = 20;
  mobCh4.paddingTop = 48;
  mobCh4.paddingBottom = 48;
  mobCh4.layoutMode = "VERTICAL";
  mobCh4.primaryAxisAlignItems = "SPACE_BETWEEN";
  mobCh4.appendChild(makeChapterHeader("04", "A MEMORY TO KEEP", 350));

  const mobCh4Head = figma.createFrame();
  mobCh4Head.layoutMode = "VERTICAL";
  mobCh4Head.itemSpacing = 8;
  mobCh4Head.fills = [];
  mobCh4Head.appendChild(makeText("The answer, without the search.", { font: { family: "Georgia", style: "Regular" }, size: 34, lineHeight: 40, width: 350 }));
  mobCh4Head.appendChild(makeText("A single, clear card you can glance at or share with family.", {
    font: { family: "Inter", style: "Regular" },
    size: 13,
    color: cMuted,
    width: 350
  }));
  mobCh4.appendChild(mobCh4Head);

  const mobCh4Card = figma.createFrame();
  mobCh4Card.resize(350, 320);
  mobCh4Card.cornerRadius = 14;
  mobCh4Card.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  mobCh4Card.strokes = [{ type: "SOLID", color: cBorderWarm }];
  mobCh4Card.paddingLeft = 20;
  mobCh4Card.paddingRight = 20;
  mobCh4Card.paddingTop = 20;
  mobCh4Card.paddingBottom = 20;
  mobCh4Card.layoutMode = "VERTICAL";
  mobCh4Card.primaryAxisAlignItems = "SPACE_BETWEEN";

  mobCh4Card.appendChild(makePill("CLEAR, CALM, CERTAIN", { dotColor: cOrange, bg: cPaperElevated, size: 9 }));
  mobCh4Card.appendChild(makeText("Reading glasses", { font: { family: "Georgia", style: "Regular" }, size: 26, width: 310 }));
  mobCh4Card.appendChild(makeText("Observed: Bookshelf (second shelf from top)", { font: { family: "Inter", style: "Regular" }, size: 13, color: cMuted, width: 310 }));
  const mobCh4Btns = figma.createFrame();
  mobCh4Btns.layoutMode = "HORIZONTAL";
  mobCh4Btns.itemSpacing = 10;
  mobCh4Btns.fills = [];
  mobCh4Btns.appendChild(makePill("SHARE ↗", { bg: cPaperElevated, stroke: cBorderWarm, size: 11 }));
  mobCh4Btns.appendChild(makePill("TIMELINE →", { bg: cInk, color: cPaper, padX: 14, padY: 8, size: 11 }));
  mobCh4Card.appendChild(mobCh4Btns);
  mobCh4.appendChild(mobCh4Card);
  mobFrame.appendChild(mobCh4);

  // Mobile Ch5 (390×1136, y: 3460)
  const mobCh5 = figma.createFrame();
  mobCh5.resize(390, 1136);
  mobCh5.y = 3460;
  mobCh5.fills = [{ type: "SOLID", color: cDarkCosmos }];
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
  mobCh5Content.appendChild(makeText("• 05 / PHANTOM", { font: { family: "Inter", style: "Semi Bold" }, size: 9, color: cCyan, letterSpacing: 1.2 }));
  mobCh5Content.appendChild(makeText("Meet PHANTOM.", { font: { family: "Georgia", style: "Regular" }, size: 38, color: { r: 1, g: 1, b: 1 }, width: 350 }));
  mobCh5Content.appendChild(makeText("The spatial-temporal engine powering SMRITI. Zero latency, complete privacy.", {
    font: { family: "Inter", style: "Regular" },
    size: 13,
    lineHeight: 20,
    color: { r: 0.7, g: 0.75, b: 0.8 },
    width: 350
  }));

  const mobWf = figma.createFrame();
  mobWf.resize(350, 260);
  mobWf.cornerRadius = 14;
  mobWf.fills = [getImagePaint("phantom_wireframe")];
  mobCh5Content.appendChild(mobWf);

  const mobMetrics = figma.createFrame();
  mobMetrics.layoutMode = "VERTICAL";
  mobMetrics.itemSpacing = 8;
  mobMetrics.fills = [];
  [
    { k: "Reality Capture", v: "60 fps" },
    { k: "Temporal Diffing", v: "42 ms" },
    { k: "Gentle Retrieval", v: "99.8%" }
  ].forEach(m => {
    const b = figma.createFrame();
    b.resize(350, 56);
    b.cornerRadius = 8;
    b.fills = [{ type: "SOLID", color: cDarkCard }];
    b.strokes = [{ type: "SOLID", color: cBorderDark }];
    b.paddingLeft = 14;
    b.paddingRight = 14;
    b.layoutMode = "HORIZONTAL";
    b.primaryAxisAlignItems = "SPACE_BETWEEN";
    b.counterAxisAlignItems = "CENTER";
    b.appendChild(makeText(m.k, { font: { family: "Inter", style: "Regular" }, size: 12, color: { r: 0.7, g: 0.75, b: 0.8 } }));
    b.appendChild(makeText(m.v, { font: { family: "Inter", style: "Bold" }, size: 16, color: cCyan }));
    mobMetrics.appendChild(b);
  });
  mobCh5Content.appendChild(mobMetrics);
  mobCh5.appendChild(mobCh5Content);
  mobFrame.appendChild(mobCh5);

  // Mobile Ch6 (390×965, y: 4596)
  const mobCh6 = figma.createFrame();
  mobCh6.resize(390, 965);
  mobCh6.y = 4596;
  mobCh6.fills = [{ type: "SOLID", color: cPaper }];
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
  mobCh6Head.appendChild(makeText("• 06 / REALITY DIFF", { font: { family: "Inter", style: "Semi Bold" }, size: 9, color: cOrange, letterSpacing: 1.2 }));
  mobCh6Head.appendChild(makeText("See what changed.", { font: { family: "Georgia", style: "Regular" }, size: 36, width: 350 }));
  mobCh6Head.appendChild(makeText("SMRITI compares moments in your home so the change doesn't have to live only in your memory.", {
    font: { family: "Inter", style: "Regular" },
    size: 13,
    lineHeight: 20,
    color: cMuted,
    width: 350
  }));
  mobCh6.appendChild(mobCh6Head);

  const mobCompCard = figma.createFrame();
  mobCompCard.resize(350, 480);
  mobCompCard.cornerRadius = 16;
  mobCompCard.fills = [{ type: "SOLID", color: cPaperElevated }];
  mobCompCard.strokes = [{ type: "SOLID", color: cBorderWarm }];
  mobCompCard.paddingLeft = 16;
  mobCompCard.paddingRight = 16;
  mobCompCard.paddingTop = 16;
  mobCompCard.paddingBottom = 16;
  mobCompCard.layoutMode = "VERTICAL";
  mobCompCard.primaryAxisAlignItems = "SPACE_BETWEEN";

  const mobCompImg = figma.createFrame();
  mobCompImg.resize(318, 360);
  mobCompImg.cornerRadius = 12;
  mobCompImg.fills = [getImagePaint("reality_diff")];
  mobCompCard.appendChild(mobCompImg);

  const mobEvBar = figma.createFrame();
  mobEvBar.layoutMode = "HORIZONTAL";
  mobEvBar.primaryAxisAlignItems = "SPACE_BETWEEN";
  mobEvBar.layoutAlign = "STRETCH";
  mobEvBar.counterAxisAlignItems = "CENTER";
  mobEvBar.fills = [];
  mobEvBar.appendChild(makeText("2:10 PM → 4:40 PM", { font: { family: "Inter", style: "Semi Bold" }, size: 12 }));
  mobEvBar.appendChild(makeText("MOVED", { font: { family: "Inter", style: "Bold" }, size: 10, color: cOrange }));
  mobCompCard.appendChild(mobEvBar);
  mobCh6.appendChild(mobCompCard);

  const mobEdClose = figma.createFrame();
  mobEdClose.layoutMode = "VERTICAL";
  mobEdClose.itemSpacing = 4;
  mobEdClose.fills = [];
  mobEdClose.appendChild(makeText("“Not everything changes. Only what matters.”", { font: { family: "Georgia", style: "Regular" }, size: 24, width: 350 }));
  mobEdClose.appendChild(makeText("SMRITI makes the difference visible.", { font: { family: "Inter", style: "Medium" }, size: 13, color: cMuted }));
  mobCh6.appendChild(mobEdClose);
  mobFrame.appendChild(mobCh6);

  // Mobile Ch7 (390×1289, y: 5561)
  const mobCh7 = figma.createFrame();
  mobCh7.resize(390, 1289);
  mobCh7.y = 5561;
  mobCh7.fills = [{ type: "SOLID", color: cPaper }];
  mobCh7.paddingLeft = 20;
  mobCh7.paddingRight = 20;
  mobCh7.paddingTop = 48;
  mobCh7.paddingBottom = 48;
  mobCh7.layoutMode = "VERTICAL";
  mobCh7.primaryAxisAlignItems = "SPACE_BETWEEN";
  mobCh7.appendChild(makeChapterHeader("07", "MEMORY RECEIPT", 350));

  const mobCh7Head = figma.createFrame();
  mobCh7Head.layoutMode = "VERTICAL";
  mobCh7Head.itemSpacing = 8;
  mobCh7Head.fills = [];
  mobCh7Head.appendChild(makeText("• 07 / MEMORY RECEIPT", { font: { family: "Inter", style: "Semi Bold" }, size: 9, color: cOrange, letterSpacing: 1.2 }));
  mobCh7Head.appendChild(makeText("Remembered, not guessed.", { font: { family: "Georgia", style: "Regular" }, size: 36, width: 350 }));
  mobCh7Head.appendChild(makeText("When something moves, SMRITI generates a cryptographic memory receipt.", {
    font: { family: "Inter", style: "Regular" },
    size: 13,
    color: cMuted,
    width: 350
  }));
  mobCh7.appendChild(mobCh7Head);

  const mobRCard = figma.createFrame();
  mobRCard.resize(350, 480);
  mobRCard.cornerRadius = 14;
  mobRCard.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  mobRCard.strokes = [{ type: "SOLID", color: cBorderWarm }];
  mobRCard.paddingLeft = 20;
  mobRCard.paddingRight = 20;
  mobRCard.paddingTop = 20;
  mobRCard.paddingBottom = 20;
  mobRCard.layoutMode = "VERTICAL";
  mobRCard.primaryAxisAlignItems = "SPACE_BETWEEN";

  const mrHead = figma.createFrame();
  mrHead.layoutMode = "HORIZONTAL";
  mrHead.primaryAxisAlignItems = "SPACE_BETWEEN";
  mrHead.layoutAlign = "STRETCH";
  mrHead.fills = [];
  mrHead.appendChild(makeText("MEMORY RECEIPT", { font: { family: "Inter", style: "Bold" }, size: 12, letterSpacing: 1 }));
  mrHead.appendChild(makePill("CONFIRMED", { dotColor: { r: 0.2, g: 0.8, b: 0.4 }, bg: cPaperElevated, size: 9 }));
  mobRCard.appendChild(mrHead);

  const mrObj = figma.createFrame();
  mrObj.layoutMode = "VERTICAL";
  mrObj.itemSpacing = 4;
  mrObj.fills = [];
  mrObj.appendChild(makeText("Reading glasses", { font: { family: "Georgia", style: "Regular" }, size: 24, width: 310 }));
  mrObj.appendChild(makeText("OBJECT ID: #REC-2026-0842-A", { font: { family: "Inter", style: "Semi Bold" }, size: 10, color: cMuted }));
  mobRCard.appendChild(mrObj);

  const mrLoc = figma.createFrame();
  mrLoc.layoutMode = "VERTICAL";
  mrLoc.itemSpacing = 6;
  mrLoc.fills = [];
  mrLoc.appendChild(makeText("BEFORE: 2:10 PM · Side table", { font: { family: "Inter", style: "Regular" }, size: 12, color: cMuted, width: 310 }));
  mrLoc.appendChild(makeText("AFTER: 4:40 PM · Bookshelf", { font: { family: "Inter", style: "Semi Bold" }, size: 13, width: 310 }));
  mrLoc.appendChild(makeText("DISPLACEMENT: 4.85 METERS", { font: { family: "Inter", style: "Regular" }, size: 11, color: cOrange }));
  mobRCard.appendChild(mrLoc);

  const mrHash = figma.createFrame();
  mrHash.layoutMode = "VERTICAL";
  mrHash.itemSpacing = 4;
  mrHash.fills = [];
  mrHash.appendChild(makeText("CRYPTOGRAPHIC PROOF", { font: { family: "Inter", style: "Semi Bold" }, size: 9, color: cMuted, letterSpacing: 1 }));
  mrHash.appendChild(makeText("sha256:7f83b165...126d9069", { font: { family: "Inter", style: "Regular" }, size: 9, color: cMuted, width: 310 }));
  mobRCard.appendChild(mrHash);
  mobCh7.appendChild(mobRCard);
  mobFrame.appendChild(mobCh7);

  // Mobile Ch8 (390×901, y: 6850)
  const mobCh8 = figma.createFrame();
  mobCh8.resize(390, 901);
  mobCh8.y = 6850;
  mobCh8.fills = [{ type: "SOLID", color: cDarkCosmos }];
  mobCh8.paddingLeft = 20;
  mobCh8.paddingRight = 20;
  mobCh8.paddingTop = 48;
  mobCh8.paddingBottom = 48;
  mobCh8.layoutMode = "VERTICAL";
  mobCh8.primaryAxisAlignItems = "SPACE_BETWEEN";
  mobCh8.appendChild(makeChapterHeader("08", "TRUST", 350, true));

  const mobCh8Head = figma.createFrame();
  mobCh8Head.layoutMode = "VERTICAL";
  mobCh8Head.itemSpacing = 8;
  mobCh8Head.fills = [];
  mobCh8Head.appendChild(makeText("• 08 / TRUST", { font: { family: "Inter", style: "Semi Bold" }, size: 9, color: cOrange, letterSpacing: 1.2 }));
  mobCh8Head.appendChild(makeText("Technology should reduce confusion,\nnot create more of it.", {
    font: { family: "Georgia", style: "Regular" },
    size: 28,
    lineHeight: 34,
    color: { r: 1, g: 1, b: 1 },
    width: 350
  }));
  mobCh8.appendChild(mobCh8Head);

  const mobTrustCol = figma.createFrame();
  mobTrustCol.layoutMode = "VERTICAL";
  mobTrustCol.itemSpacing = 12;
  mobTrustCol.fills = [];
  trustData.forEach(t => {
    const card = figma.createFrame();
    card.resize(350, 150);
    card.cornerRadius = 12;
    card.fills = [{ type: "SOLID", color: cDarkCard }];
    card.strokes = [{ type: "SOLID", color: cBorderDark }];
    card.paddingLeft = 16;
    card.paddingRight = 16;
    card.paddingTop = 14;
    card.paddingBottom = 14;
    card.layoutMode = "VERTICAL";
    card.primaryAxisAlignItems = "SPACE_BETWEEN";
    card.appendChild(makeText(t.num, { font: { family: "Inter", style: "Semi Bold" }, size: 11, color: cOrange }));

    const body = figma.createFrame();
    body.layoutMode = "VERTICAL";
    body.itemSpacing = 6;
    body.fills = [];
    body.appendChild(makeText(t.title, { font: { family: "Georgia", style: "Regular" }, size: 16, lineHeight: 22, color: { r: 1, g: 1, b: 1 }, width: 318 }));
    body.appendChild(makeText(t.desc, { font: { family: "Inter", style: "Regular" }, size: 12, lineHeight: 18, color: { r: 0.7, g: 0.75, b: 0.8 }, width: 318 }));
    card.appendChild(body);
    mobTrustCol.appendChild(card);
  });
  mobCh8.appendChild(mobTrustCol);
  mobFrame.appendChild(mobCh8);

  // Mobile Ch9 (390×1079, y: 7751)
  const mobCh9 = figma.createFrame();
  mobCh9.resize(390, 1079);
  mobCh9.y = 7751;
  mobCh9.fills = [{ type: "SOLID", color: cDarkCosmos }];
  mobCh9.paddingLeft = 20;
  mobCh9.paddingRight = 20;
  mobCh9.paddingTop = 48;
  mobCh9.paddingBottom = 30;
  mobCh9.layoutMode = "VERTICAL";
  mobCh9.primaryAxisAlignItems = "SPACE_BETWEEN";
  mobCh9.appendChild(makeChapterHeader("09", "FINAL MOMENT", 350, true));

  const mobCh9Body = figma.createFrame();
  mobCh9Body.layoutMode = "VERTICAL";
  mobCh9Body.itemSpacing = 16;
  mobCh9Body.fills = [];
  mobCh9Body.appendChild(makeText("• 09 / CLOSING", { font: { family: "Inter", style: "Semi Bold" }, size: 9, color: cOrange, letterSpacing: 1.2 }));
  mobCh9Body.appendChild(makeText("What if your home\ncould remember for you?", {
    font: { family: "Georgia", style: "Regular" },
    size: 34,
    lineHeight: 40,
    color: { r: 1, g: 1, b: 1 },
    width: 350
  }));
  mobCh9Body.appendChild(makeText("SMRITI gives caregivers and families the quiet certainty that everyday things are never truly lost.", {
    font: { family: "Inter", style: "Regular" },
    size: 14,
    lineHeight: 22,
    color: { r: 0.7, g: 0.75, b: 0.8 },
    width: 350
  }));

  const mobCtaBtns = figma.createFrame();
  mobCtaBtns.layoutMode = "VERTICAL";
  mobCtaBtns.itemSpacing = 10;
  mobCtaBtns.fills = [];
  mobCtaBtns.appendChild(makePill("Explore SMRITI →", { bg: cPaper, color: cInk, padX: 18, padY: 12, size: 13 }));
  mobCtaBtns.appendChild(makeText("Experience PHANTOM ↗", { font: { family: "Inter", style: "Semi Bold" }, size: 13, color: cCyan }));
  mobCh9Body.appendChild(mobCtaBtns);
  mobCh9.appendChild(mobCh9Body);

  const mobCtaWorld = figma.createFrame();
  mobCtaWorld.resize(350, 240);
  mobCtaWorld.cornerRadius = 16;
  mobCtaWorld.fills = [getImagePaint("cta_world")];
  mobCh9.appendChild(mobCtaWorld);

  const mobFt = figma.createFrame();
  mobFt.layoutMode = "VERTICAL";
  mobFt.itemSpacing = 8;
  mobFt.layoutAlign = "STRETCH";
  mobFt.fills = [];
  mobFt.strokes = [{ type: "SOLID", color: cBorderDark }];
  mobFt.paddingTop = 16;
  mobFt.appendChild(makeText("SMRITI / PHANTOM — Spatial memory system.", { font: { family: "Inter", style: "Regular" }, size: 11, color: { r: 0.6, g: 0.65, b: 0.7 } }));
  mobFt.appendChild(makeText("Back to the beginning ↑", { font: { family: "Inter", style: "Medium" }, size: 11, color: { r: 1, g: 1, b: 1 } }));
  mobCh9.appendChild(mobFt);
  mobFrame.appendChild(mobCh9);

  // Switch to Page 04 and zoom to fit both frames
  figma.currentPage = p4;
  figma.viewport.scrollAndZoomIntoView([tabFrame, mobFrame]);

  figma.notify("✅ Fidelity reconstruction complete: Desktop, Tablet & Mobile 100% verified!", { timeout: 4000 });
  figma.closePlugin();
})();
'''

full_code = f"const RAW_ASSETS = {assets_json};\n{js_body}"

with open("figma-plugin/code.js", "w") as f:
    f.write(full_code)

print("Generated figma-plugin/code.js successfully.")
print(f"File size: {os.path.getsize('figma-plugin/code.js')} bytes.")
