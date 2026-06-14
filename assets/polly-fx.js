/**
 * POLLY FX — Premium editorial motion layer
 *
 * Oh Polly-inspired enhancements that sit alongside (never replace)
 * the existing oni-fx system. Everything here is opt-in via data
 * attributes, namespaced `polly-`, and degrades gracefully:
 *
 *   [data-polly-reveal]  fade + rise into view
 *   [data-polly-words]   word-by-word heading reveal
 *   [data-polly-media]   clip-up media reveal with image settle
 *   [data-polly-stagger] auto-staggers child reveals
 *   .polly-kenburns      ongoing slow image zoom (CSS only)
 *   #polly-back-to-top   floating scroll-to-top control
 *
 * Safety
 *   - Skips checkout / order pages (PCI scope).
 *   - Respects prefers-reduced-motion: reduce (no hidden states).
 *   - "Before reveal" hidden states only apply once `.polly-fx-ready`
 *     is on <html>, which we add only when IntersectionObserver and
 *     motion are both available — so content is never trapped hidden.
 *   - A safety timer reveals anything the observer somehow missed.
 */
(function () {
  'use strict';

  /* Skip checkout / order pages. */
  if (/\/(checkouts?|thank[_-]you|orders)/.test(window.location.pathname)) return;

  var prefersReduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function onReady(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    }
  }

  /* ────────────────────────────────────────────────
     Word splitting for [data-polly-words]
     Wrap each word in a clipping mask + inner span so CSS can
     rise each word independently. Preserves accessible text.
  ──────────────────────────────────────────────── */
  function splitWords(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var nodes = scope.querySelectorAll('[data-polly-words]:not([data-polly-words-ready])');

    nodes.forEach(function (el) {
      el.setAttribute('data-polly-words-ready', '1');

      /* Only split simple text nodes; bail if it contains markup. */
      if (el.children.length > 0) return;

      var text = (el.textContent || '').trim();
      if (!text) return;

      var words = text.split(/\s+/);
      var frag = document.createDocumentFragment();

      words.forEach(function (word, i) {
        var mask = document.createElement('span');
        mask.className = 'polly-word';
        var inner = document.createElement('span');
        inner.className = 'polly-word__i';
        inner.style.setProperty('--polly-wi', String(i));
        inner.textContent = word;
        mask.appendChild(inner);
        frag.appendChild(mask);

        /* Preserve a real space between words for natural wrapping. */
        if (i < words.length - 1) frag.appendChild(document.createTextNode(' '));
      });

      el.textContent = '';
      el.appendChild(frag);
    });
  }

  /* ────────────────────────────────────────────────
     Auto-stagger: give each revealing child of
     [data-polly-stagger] an increasing delay.
  ──────────────────────────────────────────────── */
  function applyStagger(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope
      .querySelectorAll('[data-polly-stagger]:not([data-polly-stagger-ready])')
      .forEach(function (group) {
        group.setAttribute('data-polly-stagger-ready', '1');
        var step = parseInt(group.getAttribute('data-polly-stagger'), 10) || 90;
        var children = group.children;
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          if (
            child.hasAttribute('data-polly-reveal') ||
            child.hasAttribute('data-polly-words') ||
            child.hasAttribute('data-polly-media')
          ) {
            child.style.setProperty('--polly-delay', i * step + 'ms');
          }
        }
      });

    /* Honour explicit data-polly-delay on individual elements. */
    scope.querySelectorAll('[data-polly-delay]').forEach(function (el) {
      el.style.setProperty('--polly-delay', el.getAttribute('data-polly-delay'));
    });
  }

  /* ────────────────────────────────────────────────
     Reveal observer
  ──────────────────────────────────────────────── */
  var SELECTOR = '[data-polly-reveal], [data-polly-words], [data-polly-media]';

  function revealAll() {
    document.querySelectorAll(SELECTOR).forEach(function (el) {
      el.classList.add('polly-in');
    });
  }

  function initReveal() {
    var targets = document.querySelectorAll(SELECTOR);
    if (!targets.length) return;

    /* No observer support or reduced motion → show everything, no FX. */
    if (prefersReduced || !('IntersectionObserver' in window)) {
      revealAll();
      return;
    }

    /* Activate hidden "before reveal" states now that we can animate. */
    document.documentElement.classList.add('polly-fx-ready');

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('polly-in');
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });

    /* Safety net: never leave content hidden if something goes wrong. */
    setTimeout(revealAll, 4000);
  }

  /* ────────────────────────────────────────────────
     Back-to-top control
  ──────────────────────────────────────────────── */
  function initBackToTop() {
    if (document.getElementById('polly-back-to-top')) return;

    var btn = document.createElement('button');
    btn.id = 'polly-back-to-top';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M12 19V5M12 5l-6 6M12 5l6 6" stroke="currentColor" ' +
      'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    document.body.appendChild(btn);

    var THRESHOLD = 600;
    var rafId = null;

    function update() {
      rafId = null;
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      btn.classList.toggle('is-visible', y > THRESHOLD);
    }

    function onScroll() {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });

    update();
  }

  /* ────────────────────────────────────────────────
     Boot
  ──────────────────────────────────────────────── */
  function init() {
    splitWords(document);
    applyStagger(document);
    initReveal();
    initBackToTop();

    /* Pick up sections injected by the theme editor while editing. */
    if (window.Shopify && window.Shopify.designMode) {
      document.addEventListener('shopify:section:load', function (e) {
        var section = e.target;
        splitWords(section);
        applyStagger(section);
        section.querySelectorAll(SELECTOR).forEach(function (el) {
          /* In the editor, reveal immediately so authors see content. */
          el.classList.add('polly-in');
        });
      });
    }
  }

  onReady(init);
})();
