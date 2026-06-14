/**
 * ONI MOTION — Framer-style scroll motion layer
 *
 * Powered by Motion (motion.dev) — the framework-agnostic animation
 * engine from the Framer Motion team (loaded as `window.Motion`). Sits
 * alongside oni-fx / polly-fx and never replaces them.
 *
 *   - Homepage content sections fade + rise into view on scroll
 *     (the polished "everything settles in as you scroll" feel).
 *   - [data-oni-parallax="<percent>"] elements drift on scroll (opt-in).
 *
 * Safety
 *   - Skips checkout / order pages.
 *   - The initial hidden state (oni-motion.css) only applies under
 *     `html.oni-motion-ready`, added by the head script. This script
 *     signals `window.__oniMotionBooted` so the head failsafe knows it
 *     ran; if anything goes wrong here, every section is force-revealed.
 *   - Respects prefers-reduced-motion (head script skips the class).
 *   - In the theme editor, sections are shown immediately.
 */
(function () {
  'use strict';

  if (/\/(checkouts?|thank[_-]you|orders)/.test(window.location.pathname)) return;

  /* Let the head-level failsafe know the motion script booted. */
  window.__oniMotionBooted = true;

  var docEl = document.documentElement;
  var prefersReduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var EASE = [0.22, 1, 0.36, 1];
  var REVEALED = 'oni-revealed';

  function sections() {
    return Array.prototype.slice.call(
      document.querySelectorAll(
        'main[data-template="index"] > .shopify-section:not(:first-child)'
      )
    );
  }

  /* Lock a section to its visible resting state and drop inline styles
     so no transform/stacking context lingers after the entrance. */
  function revealNow(el) {
    el.classList.add(REVEALED);
    el.style.opacity = '';
    el.style.transform = '';
    el.style.willChange = '';
  }

  function revealAll() {
    sections().forEach(revealNow);
  }

  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn, { once: true });
  }

  function boot() {
    var Motion = window.Motion;

    /* No library, reduced motion, or no observer → show everything and
       drop the gating class so the hidden CSS never applies. */
    if (
      prefersReduced ||
      !Motion ||
      typeof Motion.inView !== 'function' ||
      typeof Motion.animate !== 'function' ||
      !('IntersectionObserver' in window)
    ) {
      revealAll();
      docEl.classList.remove('oni-motion-ready');
      return;
    }

    /* Theme editor: keep authored content visible, no scroll gymnastics. */
    if (window.Shopify && window.Shopify.designMode) {
      revealAll();
      document.addEventListener('shopify:section:load', revealAll);
      return;
    }

    sections().forEach(function (el) {
      el.style.willChange = 'opacity, transform';

      Motion.inView(
        el,
        function () {
          /* Fire once per section. */
          if (el.dataset.oniRevealing) return;
          el.dataset.oniRevealing = '1';

          var done = function () {
            revealNow(el);
          };

          try {
            var controls = Motion.animate(
              el,
              {
                opacity: [0, 1],
                transform: ['translate3d(0, 30px, 0)', 'translate3d(0, 0, 0)'],
              },
              { duration: 0.85, ease: EASE }
            );

            if (controls && controls.finished && typeof controls.finished.then === 'function') {
              controls.finished.then(done).catch(done);
            } else {
              setTimeout(done, 900);
            }
          } catch (e) {
            done();
          }
        },
        { amount: 0.2, margin: '0px 0px -8% 0px' }
      );
    });

    /* Opt-in parallax: drift an element as it passes through the viewport.
       Add data-oni-parallax="8" (percent of travel) to any element. */
    if (typeof Motion.scroll === 'function') {
      document.querySelectorAll('[data-oni-parallax]').forEach(function (el) {
        var depth = parseFloat(el.getAttribute('data-oni-parallax')) || 8;
        try {
          Motion.scroll(
            Motion.animate(
              el,
              {
                transform: [
                  'translate3d(0, ' + -depth + '%, 0)',
                  'translate3d(0, ' + depth + '%, 0)',
                ],
              },
              { ease: 'linear' }
            ),
            { target: el, offset: ['start end', 'end start'] }
          );
        } catch (e) {
          /* Parallax is non-essential; ignore failures. */
        }
      });
    }

    /* Safety net: reveal anything the observer somehow missed. */
    setTimeout(revealAll, 4000);
  }

  onReady(boot);
})();
