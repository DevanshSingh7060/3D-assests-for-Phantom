(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const startButtons = [...document.querySelectorAll('[data-start-story]')];
  const startStory = () => {
    document.getElementById('home')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => window.triggerSmritiStory?.(), 250);
  };
  $('btnNavStart')?.addEventListener('click', startStory);
  $('btnFooterStart')?.addEventListener('click', startStory);
  startButtons.forEach((button) => button.addEventListener('click', startStory));

  $('btnFindGlasses')?.addEventListener('click', () => {
    document.getElementById('home')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => window.smritiApp?.findGlasses(), 250);
  });

  const slider = $('diffRangeSlider');
  const progress = $('diffTrackProgress');
  const thumb = document.querySelector('.diff-thumb');
  const readout = $('scrubCenterText');
  const ghost = $('zoneGhostGlasses');
  const updateDiff = () => {
    if (!slider) return;
    const value = Number(slider.value);
    if (progress) progress.style.width = `${value}%`;
    if (thumb) thumb.style.left = `${value}%`;
    if (readout) readout.textContent = value < 48 ? 'The glasses begin on the side table.' : value < 88 ? 'One meaningful change detected.' : 'The glasses are now on the bookshelf.';
    ghost?.classList.toggle('visible', value > 68);
    window.smritiApp?.scrubRealityDiff(value / 100);
  };
  slider?.addEventListener('input', updateDiff);
  updateDiff();

  const header = $('siteHeader');
  const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 22);
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
})();
