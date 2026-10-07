/**
 * ==============================================================================
 * SECTION 08: TRUST — CONTROLLER
 * Handles:
 * - Quiet IntersectionObserver staggered reveal sequence
 * - Strict prefers-reduced-motion support
 * ==============================================================================
 */

(function () {
  'use strict';

  class TrustSectionController {
    constructor() {
      this.section = document.getElementById('trust');
      if (!this.section) return;

      this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.init();
    }

    init() {
      if (this.prefersReducedMotion) {
        this.section.classList.add('revealed');
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.section.classList.add('revealed');
              observer.unobserve(this.section);
            }
          });
        },
        { threshold: 0.12 }
      );

      observer.observe(this.section);
    }
  }

  // Mount on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.smritiTrust = new TrustSectionController();
    });
  } else {
    window.smritiTrust = new TrustSectionController();
  }
})();
