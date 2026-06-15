/**
 * ONI MOTION — Framer-style scroll motion + interactions
 *
 * Scroll work (section reveals, parallax) is powered by Motion (motion.dev),
 * the framework-agnostic engine from the Framer Motion team (window.Motion).
 * The drag carousel and magnetic buttons are dependency-free so they keep
 * working even if Motion fails to load. Sits alongside oni-fx / polly-fx and
 * never replaces them.
 *
 *   Section reveals  homepage sections fade + rise into view
 *   [data-oni-parallax="6"]   element drifts on scroll (percent of travel)
 *   magnetic buttons          primary CTAs drift toward the cursor
 *   [data-oni-carousel]       kinetic drag track with momentum/inertia
 *
 * Safety
 *   - Skips checkout / order pages.
 *   - The reveal hidden state (oni-motion.css) only applies under
 *     html.oni-motion-ready, added by the head script; this file signals
 *     window.__oniMotionBooted so the head failsafe knows it ran, and force-
 *     reveals everything on error / after a timeout.
 *   - Respects prefers-reduced-motion (no parallax/magnetic/momentum).
 *   - Theme editor: content shows immediately; re-inits on section load.
 */
(function () {
  'use strict';

  if (/\/(checkouts?|thank[_-]you|orders)/.test(window.location.pathname)) return;

  window.__oniMotionBooted = true;

  var docEl = document.documentElement;
  var prefersReduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer =
    window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var EASE = [0.22, 1, 0.36, 1];
  var REVEALED = 'oni-revealed';

  function sections() {
    return Array.prototype.slice.call(
      document.querySelectorAll('main[data-template="index"] > .shopify-section:not(:first-child)')
    );
  }
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

  /* ───────── Section reveals (Motion) ───────── */
  function initReveals() {
    var Motion = window.Motion;
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
          if (el.dataset.oniRevealing) return;
          el.dataset.oniRevealing = '1';
          var done = function () {
            revealNow(el);
          };
          try {
            var a = Motion.animate(
              el,
              { opacity: [0, 1], transform: ['translate3d(0, 40px, 0)', 'translate3d(0, 0, 0)'] },
              { duration: 0.85, ease: EASE }
            );
            if (a && a.finished && typeof a.finished.then === 'function') a.finished.then(done).catch(done);
            else setTimeout(done, 900);
          } catch (e) {
            done();
          }
        },
        { amount: 0.2, margin: '0px 0px -8% 0px' }
      );
    });

    setTimeout(revealAll, 4000);
  }

  /* ───────── Parallax (Motion) ───────── */
  function initParallax() {
    var Motion = window.Motion;
    if (prefersReduced || !Motion || typeof Motion.scroll !== 'function' || typeof Motion.animate !== 'function') return;
    document.querySelectorAll('[data-oni-parallax]').forEach(function (el) {
      if (el.dataset.oniParallaxReady) return;
      el.dataset.oniParallaxReady = '1';
      var depth = parseFloat(el.getAttribute('data-oni-parallax')) || 6;
      try {
        Motion.scroll(
          Motion.animate(
            el,
            { transform: ['translate3d(0,' + -depth + '%,0)', 'translate3d(0,' + depth + '%,0)'] },
            { ease: 'linear' }
          ),
          { target: el, offset: ['start end', 'end start'] }
        );
      } catch (e) {}
    });
  }

  /* ───────── Magnetic buttons (no dependency) ───────── */
  var MAGNETIC_SEL =
    '.oni-hero__actions a.button, .oni-promo__actions a.button, .polly-editorial__actions a.button, [data-oni-magnetic]';
  function initMagnetic() {
    if (!finePointer || prefersReduced) return;
    document.querySelectorAll(MAGNETIC_SEL).forEach(function (btn) {
      if (btn.dataset.oniMagnetic === 'ready') return;
      btn.dataset.oniMagnetic = 'ready';
      btn.style.transition = 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)';
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        btn.style.transform =
          'translate(' + (e.clientX - (r.left + r.width / 2)) * 0.3 + 'px,' +
          (e.clientY - (r.top + r.height / 2)) * 0.45 + 'px)';
      });
      btn.addEventListener('pointerleave', function () {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }

  /* ───────── Kinetic inertia carousel (no dependency) ───────── */
  function initCarousel() {
    document.querySelectorAll('[data-oni-carousel]').forEach(function (track) {
      if (track.dataset.oniCarousel === 'ready') return;
      track.dataset.oniCarousel = 'ready';

      var viewport = track.parentElement;
      var pos = 0, max = 0, dragging = false, moved = false;
      var startX = 0, startPos = 0, lastX = 0, lastT = 0, vel = 0, raf = null;

      function bounds() { max = Math.max(0, track.scrollWidth - viewport.clientWidth); }
      function clamp(p) { return Math.max(-max, Math.min(0, p)); }
      function apply() { track.style.transform = 'translate3d(' + pos + 'px, 0, 0)'; }
      function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }
      function momentum() {
        if (prefersReduced) { raf = null; return; }
        vel *= 0.94; pos += vel;
        if (pos > 0) { pos = 0; vel = 0; }
        if (pos < -max) { pos = -max; vel = 0; }
        apply();
        raf = Math.abs(vel) > 0.15 ? requestAnimationFrame(momentum) : null;
      }

      bounds();
      window.addEventListener('resize', function () { bounds(); pos = clamp(pos); apply(); });
      window.addEventListener('load', function () { bounds(); pos = clamp(pos); apply(); });

      track.addEventListener('pointerdown', function (e) {
        dragging = true; moved = false; track.classList.add('is-dragging');
        try { track.setPointerCapture(e.pointerId); } catch (_) {}
        startX = e.clientX; startPos = pos; lastX = e.clientX; lastT = performance.now(); vel = 0; stop();
      });
      track.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var dx = e.clientX - startX;
        if (Math.abs(dx) > 4) moved = true;
        pos = clamp(startPos + dx);
        var now = performance.now(), dt = now - lastT;
        if (dt > 0) { vel = (e.clientX - lastX) / dt * 16; lastX = e.clientX; lastT = now; }
        apply();
      });
      function end() {
        if (!dragging) return;
        dragging = false; track.classList.remove('is-dragging');
        raf = requestAnimationFrame(momentum);
      }
      track.addEventListener('pointerup', end);
      track.addEventListener('pointercancel', end);
      /* Swallow the click that ends a drag so it doesn't navigate. */
      track.addEventListener('click', function (e) {
        if (moved) { e.preventDefault(); e.stopPropagation(); }
      }, true);
      /* Horizontal wheel / trackpad — let vertical scroll the page. */
      viewport.addEventListener('wheel', function (e) {
        if (max <= 0) return;
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
        pos = clamp(pos - e.deltaX); apply(); stop(); e.preventDefault();
      }, { passive: false });

      apply();
    });
  }

  function init() {
    initReveals();
    initParallax();
    initMagnetic();
    initCarousel();

    if (window.Shopify && window.Shopify.designMode) {
      document.addEventListener('shopify:section:load', function () {
        initParallax();
        initMagnetic();
        initCarousel();
      });
    }
  }

  onReady(init);
})();
