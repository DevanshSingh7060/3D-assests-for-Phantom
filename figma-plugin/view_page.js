
const p0 = figma.root.children.find(p => p.name.startsWith('00'));
if (p0) {
  figma.currentPage = p0;
  figma.viewport.scrollAndZoomIntoView(p0.children);
  figma.notify('Ready at Page 00: Cover & Overview');
}
figma.closePlugin();
