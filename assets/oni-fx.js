/**
 * ONI THEORY 鬼の理論 — Anime & Gaming Effects v3
 *
 * Fixes from v2 audit:
 * - sessionStorage wrapped in try/catch (Safari private mode)
 * - canvas.getContext null-checked (canvas-blocking extensions)
 * - correct cart event: 'cart:update' (was 'cart:add')
 * - rAF loop stops when idle (battery drain fix)
 * - particles capped at MAX_PARTICLES = 60
 * - setInterval handles stored & cleared (memory leak fix)
 * - MutationObserver keeps data-text on dynamic headings
 * - boot overlay protected against navigation interruption
 * - all effects skip checkout pages (PCI/Shopify compliance)
 * - resize listener debounced
 * - guard against duplicate canvas init
 */
(function () {
  'use strict';

  /* ── Skip checkout / order pages to avoid PCI scope issues ── */
  const path = window.location.pathname;
  if (/\/(checkouts?|thank[_-]you|orders)/.test(path)) return;

  /* ── Safe sessionStorage ── */
  const store = {
    get: function (k) {
      try { return sessionStorage.getItem(k); } catch (_) { return null; }
    },
    set: function (k, v) {
      try { sessionStorage.setItem(k, v); } catch (_) { /* noop */ }
    },
  };

  /* ── Debounce ── */
  function debounce(fn, ms) {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  /* ── Cleanup registry for View Transition navigations ── */
  var cleanups = [];
  function onCleanup(fn) { cleanups.push(fn); }
  document.addEventListener('pageswap', function () {
    cleanups.forEach(function (fn) { try { fn(); } catch (_) {} });
    cleanups = [];
  });

  /* ────────────────────────────────────────────────
     1. CURSOR TRAIL
  ──────────────────────────────────────────────── */
  function initCursorTrail() {
    /* Prevent duplicate canvas if re-init is triggered */
    if (document.getElementById('oni-cursor-canvas')) return;

    var canvas = document.createElement('canvas');
    canvas.id = 'oni-cursor-canvas';
    Object.assign(canvas.style, {
      position: 'fixed', top: '0', left: '0',
      width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: '9999',
    });
    document.body.appendChild(canvas);

    /* Null-check: canvas blocked by extension or policy */
    var ctx = null;
    try { ctx = canvas.getContext('2d'); } catch (_) {}
    if (!ctx) { canvas.remove(); return; }

    var W = canvas.width  = window.innerWidth;
    var H = canvas.height = window.innerHeight;

    var onResize = debounce(function () {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }, 150);
    window.addEventListener('resize', onResize);

    var MAX_PARTICLES = 60;
    var particles = [];
    var COLORS = ['#FF3346', '#BF5FFF', '#00F5FF'];
    var lastMouse = 0;      /* timestamp of last mousemove */
    var rafId = null;
    var running = false;

    function spawnParticle(x, y) {
      if (particles.length >= MAX_PARTICLES) return;
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2 - 0.4,
        life: 1,
        decay: 0.035 + Math.random() * 0.03,
        size: 1.5 + Math.random() * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }

    function loop() {
      var now = Date.now();
      /* Stop rAF when idle: no particles AND no recent mouse movement */
      if (particles.length === 0 && now - lastMouse > 2000) {
        running = false;
        rafId = null;
        ctx.clearRect(0, 0, W, H);
        return;
      }

      ctx.clearRect(0, 0, W, H);
      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = p.life * 0.75;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      rafId = requestAnimationFrame(loop);
    }

    function onMouseMove(e) {
      lastMouse = Date.now();
      if (Math.random() < 0.4) spawnParticle(e.clientX, e.clientY);
      if (!running) {
        running = true;
        rafId = requestAnimationFrame(loop);
      }
    }

    document.addEventListener('mousemove', onMouseMove);

    onCleanup(function () {
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (rafId) cancelAnimationFrame(rafId);
      canvas.remove();
    });
  }

  /* ────────────────────────────────────────────────
     2. ANIMATED GRADIENT BORDER ON PRODUCT CARDS
     Injects a div child — avoids overflow:hidden clip
     that would swallow the inset:-1px pseudo approach.
  ──────────────────────────────────────────────── */
  function initCardBorders() {
    var style = document.createElement('style');
    style.textContent = [
      '.oni-card-border {',
      '  position: absolute; inset: 0;',
      '  border-radius: inherit;',
      '  background: linear-gradient(135deg,#FF3346,#BF5FFF,#00F5FF,#FF3346);',
      '  background-size: 300% 300%;',
      '  animation: oni-border-rotate 3s linear infinite;',
      '  opacity: 0;',
      '  transition: opacity .35s ease;',
      '  pointer-events: none;',
      '  z-index: -1;',
      '  margin: -1px;',
      '}',
      'product-card:hover .oni-card-border,',
      '.product-card:hover .oni-card-border { opacity: .65; }',
    ].join('\n');
    document.head.appendChild(style);

    function addBorder(card) {
      if (card.querySelector('.oni-card-border')) return;
      var div = document.createElement('div');
      div.className = 'oni-card-border';
      div.setAttribute('aria-hidden', 'true');
      card.appendChild(div);
    }

    document.querySelectorAll('product-card, .product-card').forEach(addBorder);

    /* Watch for dynamically loaded cards (quick-add, infinite scroll) */
    var obs = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (!(node instanceof HTMLElement)) return;
          var cards = [];
          if (node.matches && node.matches('product-card, .product-card')) {
            cards.push(node);
          }
          node.querySelectorAll && node.querySelectorAll('product-card, .product-card')
            .forEach(function (c) { cards.push(c); });
          cards.forEach(addBorder);
        });
      });
    });
    obs.observe(document.body, { childList: true, subtree: true });
    onCleanup(function () { obs.disconnect(); });
  }

  /* ────────────────────────────────────────────────
     3. VERTICAL SCAN LINE ON PRODUCT CARD HOVER
     Injects .oni-card-scan div into each card media
  ──────────────────────────────────────────────── */
  function initCardScan() {
    function addScan(card) {
      var media = card.querySelector('.media, .product-card__media, .card__media');
      if (!media || media.querySelector('.oni-card-scan')) return;
      media.style.position = 'relative';
      media.style.overflow = 'hidden';
      var scan = document.createElement('div');
      scan.className = 'oni-card-scan';
      scan.setAttribute('aria-hidden', 'true');
      media.appendChild(scan);
    }
    document.querySelectorAll('product-card, .product-card').forEach(addScan);

    var obs = new MutationObserver(function (m) {
      m.forEach(function (mut) {
        mut.addedNodes.forEach(function (node) {
          if (!(node instanceof HTMLElement)) return;
          var cards = [];
          if (node.matches && node.matches('product-card, .product-card')) cards.push(node);
          node.querySelectorAll && node.querySelectorAll('product-card, .product-card')
            .forEach(function (c) { cards.push(c); });
          cards.forEach(addScan);
        });
      });
    });
    obs.observe(document.body, { childList: true, subtree: true });
    onCleanup(function () { obs.disconnect(); });
  }

  /* ────────────────────────────────────────────────
     4. GLITCH HEADINGS
     data-text kept in sync via MutationObserver.
     Single observer instead of N intervals.
  ──────────────────────────────────────────────── */
  function initGlitchHeadings() {
    function setDataText(el) {
      el.dataset.text = el.textContent || '';
    }

    /* Set on all existing headings */
    document.querySelectorAll('h1, h2').forEach(setDataText);

    /* Keep data-text fresh on text changes */
    var textObs = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        var el = m.target.nodeType === 1 ? m.target : m.target.parentElement;
        if (el && (el.tagName === 'H1' || el.tagName === 'H2')) setDataText(el);
      });
    });
    document.querySelectorAll('h1, h2').forEach(function (el) {
      textObs.observe(el, { characterData: true, childList: true, subtree: true });
    });

    /* Watch for new headings added dynamically */
    var domObs = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (!(node instanceof HTMLElement)) return;
          var heads = [];
          if (node.tagName === 'H1' || node.tagName === 'H2') heads.push(node);
          node.querySelectorAll && node.querySelectorAll('h1, h2')
            .forEach(function (h) { heads.push(h); });
          heads.forEach(function (h) {
            setDataText(h);
            textObs.observe(h, { characterData: true, childList: true, subtree: true });
          });
        });
      });
    });
    domObs.observe(document.body, { childList: true, subtree: true });

    /* Single interval drives all glitch — random heading, not one per heading */
    var headings = Array.from(document.querySelectorAll('h1, h2'));
    if (!headings.length) return;

    var glitchTimer = setInterval(function () {
      /* Refresh list in case DOM changed */
      headings = Array.from(document.querySelectorAll('h1, h2'));
      if (!headings.length) return;
      if (Math.random() > 0.7) return;       /* fire ~30% of ticks */
      var el = headings[Math.floor(Math.random() * headings.length)];
      if (!el || el.classList.contains('oni-glitch')) return;
      el.classList.add('oni-glitch');
      setTimeout(function () { el.classList.remove('oni-glitch'); }, 500);
    }, 4000);

    onCleanup(function () {
      clearInterval(glitchTimer);
      textObs.disconnect();
      domObs.disconnect();
    });
  }

  /* ────────────────────────────────────────────────
     5. ADD-TO-CART TOAST
  ──────────────────────────────────────────────── */
  function initAddToCartToast() {
    var style = document.createElement('style');
    style.textContent = [
      '.oni-toast {',
      '  position:fixed; bottom:24px; right:24px; z-index:10000;',
      '  background:#0B0B10;',
      '  border:1px solid #FF3346;',
      '  box-shadow:0 0 16px rgba(255,51,70,.55),0 4px 20px rgba(0,0,0,.6);',
      '  padding:10px 18px;',
      '  font-family:"Orbitron",sans-serif; font-size:.65rem;',
      '  font-weight:700; letter-spacing:.14em; text-transform:uppercase;',
      '  color:#FF3346;',
      '  display:flex; align-items:center; gap:10px;',
      '  opacity:0; transform:translateY(12px);',
      '  transition:opacity .25s ease,transform .25s ease;',
      '  pointer-events:none;',
      '}',
      '.oni-toast--show { opacity:1; transform:translateY(0); }',
    ].join('\n');
    document.head.appendChild(style);

    var toast = document.createElement('div');
    toast.className = 'oni-toast';
    toast.setAttribute('aria-live', 'polite');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = '<span aria-hidden="true">&#9889;</span><span>Added to cart</span>';
    document.body.appendChild(toast);

    var toastTimer = null;
    var lastShow = 0;
    function showToast() {
      var now = Date.now();
      if (now - lastShow < 800) return;   /* debounce duplicate events */
      lastShow = now;
      clearTimeout(toastTimer);
      toast.classList.add('oni-toast--show');
      toastTimer = setTimeout(function () {
        toast.classList.remove('oni-toast--show');
      }, 2400);
    }

    /* Primary: Shopify's cart:update event (CartAddEvent.eventName) */
    document.addEventListener('cart:update', showToast);

    /* Fallback: button click — fires after server responds via fly-to-cart */
    document.addEventListener('click', function (e) {
      var btn = e.target.closest(
        '.product-form__submit, .quick-add__submit, [data-cart-add]'
      );
      if (btn && !btn.disabled) setTimeout(showToast, 600);
    });

    onCleanup(function () {
      clearTimeout(toastTimer);
      document.removeEventListener('cart:update', showToast);
      toast.remove();
    });
  }

  /* ────────────────────────────────────────────────
     6. SCROLL REVEAL
  ──────────────────────────────────────────────── */
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) return;

    var style = document.createElement('style');
    style.textContent = [
      '.oni-reveal { opacity:0; transform:translateY(20px);',
      '  transition:opacity .55s ease,transform .55s ease; }',
      '.oni-reveal--visible { opacity:1; transform:translateY(0); }',
    ].join('\n');
    document.head.appendChild(style);

    var SELECTORS = [
      'product-card',
      '.product-card',
      '.collection-card',
      '.featured-blog-posts-card',
      '.media-with-text__content',
    ].join(', ');

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('oni-reveal--visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    function observe(root) {
      root.querySelectorAll(SELECTORS).forEach(function (el) {
        if (!el.classList.contains('oni-reveal')) {
          el.classList.add('oni-reveal');
          observer.observe(el);
        }
      });
    }
    observe(document);

    /* Watch for dynamically added cards */
    var domObs = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (node instanceof HTMLElement) observe(node);
        });
      });
    });
    domObs.observe(document.body, { childList: true, subtree: true });

    onCleanup(function () {
      observer.disconnect();
      domObs.disconnect();
    });
  }

  /* ────────────────────────────────────────────────
     7. PRODUCT IMAGE TILT (desktop only, subtle)
  ──────────────────────────────────────────────── */
  function initImageTilt() {
    var MAX_TILT = 6;   /* degrees */
    function applyTilt(e) {
      var card = e.currentTarget;
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width  - 0.5;
      var y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform =
        'perspective(700px) rotateX(' + (-y * MAX_TILT) + 'deg) rotateY(' + (x * MAX_TILT) + 'deg)';
    }
    function resetTilt(e) {
      e.currentTarget.style.transform = '';
    }

    function attachTilt(card) {
      if (card.dataset.tiltInit) return;
      card.dataset.tiltInit = '1';
      card.addEventListener('mousemove', applyTilt);
      card.addEventListener('mouseleave', resetTilt);
    }

    document.querySelectorAll('product-card, .product-card').forEach(attachTilt);

    var obs = new MutationObserver(function (m) {
      m.forEach(function (mut) {
        mut.addedNodes.forEach(function (node) {
          if (!(node instanceof HTMLElement)) return;
          var cards = [];
          if (node.matches && node.matches('product-card, .product-card')) cards.push(node);
          node.querySelectorAll && node.querySelectorAll('product-card, .product-card')
            .forEach(function (c) { cards.push(c); });
          cards.forEach(attachTilt);
        });
      });
    });
    obs.observe(document.body, { childList: true, subtree: true });
    onCleanup(function () { obs.disconnect(); });
  }

  /* ────────────────────────────────────────────────
     8. BOOT SEQUENCE (first visit overlay)
     Protected against navigation interruption.
  ──────────────────────────────────────────────── */
  function initBootSequence() {
    if (store.get('oni-booted')) return;
    store.set('oni-booted', '1');

    var overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0',
      background: '#07070D',
      zIndex: '99999',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '12px',
      fontFamily: "'Orbitron',sans-serif",
      color: '#FF3346', letterSpacing: '0.2em',
      textTransform: 'uppercase',
      transition: 'opacity 0.5s ease',
    });

    overlay.innerHTML = [
      '<div style="font-size:clamp(1.4rem,4vw,2.5rem);font-weight:900;',
        'text-shadow:0 0 18px #FF3346,0 0 40px rgba(255,51,70,.4)">鬼の理論</div>',
      '<div style="font-size:clamp(.55rem,1.4vw,.8rem);color:#BF5FFF;',
        'letter-spacing:.35em;text-shadow:0 0 10px #BF5FFF">ONI THEORY</div>',
      '<div style="width:160px;height:2px;background:#1a1a22;margin-top:14px;overflow:hidden">',
        '<div class="oni-boot-fill" style="height:100%;width:0;',
          'background:linear-gradient(90deg,#FF3346,#BF5FFF);',
          'box-shadow:0 0 8px #FF3346;',
          'animation:oni-boot-bar .7s .1s ease forwards">',
        '</div>',
      '</div>',
    ].join('');
    document.body.appendChild(overlay);

    var fadeTimer   = null;
    var removeTimer = null;

    function dismiss() {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
      overlay.style.opacity = '0';
      removeTimer = setTimeout(function () {
        if (overlay.parentNode) overlay.remove();
      }, 550);
    }

    fadeTimer = setTimeout(dismiss, 1000);

    /* If user navigates before fade completes, clean up immediately */
    onCleanup(function () {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
      if (overlay.parentNode) overlay.remove();
    });
  }

  /* ────────────────────────────────────────────────
     9. NAVIGATION PROGRESS BAR (v4)
     Neon bar at top during page navigations.
     Uses pageswap (View Transitions) + link clicks.
  ──────────────────────────────────────────────── */
  function initNavProgress() {
    var bar = document.createElement('div');
    bar.className = 'oni-nav-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    var timer = null;
    function start() {
      clearTimeout(timer);
      bar.classList.add('oni-nav-progress--active');
      bar.style.width = '0';
      /* Force reflow so width transition restarts */
      void bar.offsetWidth;
      bar.style.width = '70%';
      /* Crawl toward 90% if navigation is slow */
      timer = setTimeout(function () { bar.style.width = '90%'; }, 600);
    }

    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a) return;
      var href = a.getAttribute('href');
      /* Internal navigations only */
      if (!href || href.charAt(0) === '#' || a.target === '_blank') return;
      if (/^(mailto:|tel:|javascript:)/.test(href)) return;
      if (a.origin && a.origin !== window.location.origin) return;
      start();
    });

    /* Page restored from bfcache or transition finished */
    window.addEventListener('pageshow', function () {
      clearTimeout(timer);
      bar.style.width = '100%';
      setTimeout(function () {
        bar.classList.remove('oni-nav-progress--active');
        bar.style.width = '0';
      }, 250);
    });

    onCleanup(function () {
      clearTimeout(timer);
      bar.remove();
    });
  }

  /* ────────────────────────────────────────────────
     10. HOLOGRAPHIC SHEEN (v4)
     Injects .oni-holo div into card media — trading
     card rainbow sweep on hover (CSS does the rest).
  ──────────────────────────────────────────────── */
  function initHoloSheen() {
    function addHolo(card) {
      var media = card.querySelector('.media, .product-card__media, .card__media');
      if (!media || media.querySelector('.oni-holo')) return;
      var holo = document.createElement('div');
      holo.className = 'oni-holo';
      holo.setAttribute('aria-hidden', 'true');
      media.appendChild(holo);
    }
    document.querySelectorAll('product-card, .product-card').forEach(addHolo);

    var obs = new MutationObserver(function (m) {
      m.forEach(function (mut) {
        mut.addedNodes.forEach(function (node) {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches && node.matches('product-card, .product-card')) addHolo(node);
          node.querySelectorAll && node.querySelectorAll('product-card, .product-card')
            .forEach(addHolo);
        });
      });
    });
    obs.observe(document.body, { childList: true, subtree: true });
    onCleanup(function () { obs.disconnect(); });
  }

  /* ────────────────────────────────────────────────
     11. HUD COUNTERS (v4)
     Animates [data-oni-count] numbers when scrolled
     into view (used by the Oni stats HUD section).
  ──────────────────────────────────────────────── */
  function initHudCounters() {
    if (!('IntersectionObserver' in window)) return;
    var els = document.querySelectorAll('[data-oni-count]');
    if (!els.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-oni-count'), 10) || 0;
        var t0 = null;
        var DURATION = 1200;
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / DURATION, 1);
          /* easeOutCubic */
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased);
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });

    els.forEach(function (el) { io.observe(el); });
    onCleanup(function () { io.disconnect(); });
  }

  /* ────────────────────────────────────────────────
     12. MAGNETIC BUTTONS (v4, desktop only)
     Primary buttons subtly pull toward the cursor.
  ──────────────────────────────────────────────── */
  function initMagneticButtons() {
    var STRENGTH = 5; /* px max displacement — subtle */

    function onMove(e) {
      var btn = e.currentTarget;
      var r = btn.getBoundingClientRect();
      var x = ((e.clientX - r.left) / r.width  - 0.5) * 2;
      var y = ((e.clientY - r.top)  / r.height - 0.5) * 2;
      btn.style.translate = (x * STRENGTH) + 'px ' + (y * STRENGTH) + 'px';
    }
    function onLeave(e) {
      e.currentTarget.style.translate = '';
    }

    function attach(btn) {
      if (btn.dataset.oniMagnet) return;
      btn.dataset.oniMagnet = '1';
      btn.addEventListener('mousemove', onMove);
      btn.addEventListener('mouseleave', onLeave);
    }
    document.querySelectorAll('.button--primary').forEach(attach);

    var obs = new MutationObserver(function (m) {
      m.forEach(function (mut) {
        mut.addedNodes.forEach(function (node) {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches && node.matches('.button--primary')) attach(node);
          node.querySelectorAll && node.querySelectorAll('.button--primary').forEach(attach);
        });
      });
    });
    obs.observe(document.body, { childList: true, subtree: true });
    onCleanup(function () { obs.disconnect(); });
  }

  /* ────────────────────────────────────────────────
     13. KONAMI CODE EASTER EGG (v4)
     ↑↑↓↓←→←→BA — unlocks ONI MODE + discount code.
  ──────────────────────────────────────────────── */
  function initKonami() {
    var SEQ = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown',
               'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    var pos = 0;

    var overlay = null;
    function showUnlock() {
      document.documentElement.classList.add('oni-mode');
      store.set('oni-mode', '1');

      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'oni-cheat';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-label', 'Cheat code accepted');
        /* To attach a reward: create a discount code in Shopify admin,
           then set ONI_CHEAT_CODE to it (e.g. 'ONIMODE') and update the copy. */
        var ONI_CHEAT_CODE = '';
        overlay.innerHTML = [
          '<div class="oni-cheat__title">Cheat code accepted</div>',
          '<div class="oni-cheat__sub">鬼モード解放 — ONI MODE unlocked</div>',
          ONI_CHEAT_CODE
            ? '<div class="oni-cheat__code">' + ONI_CHEAT_CODE + '</div>' +
              '<div class="oni-cheat__sub">Use at checkout</div>'
            : '<div class="oni-cheat__sub">Visuals intensified — welcome to the other side</div>',
          '<button type="button" class="oni-cheat__close">Continue</button>',
        ].join('');
        document.body.appendChild(overlay);
        overlay.querySelector('.oni-cheat__close').addEventListener('click', function () {
          overlay.classList.remove('oni-cheat--show');
        });
        overlay.addEventListener('click', function (e) {
          if (e.target === overlay) overlay.classList.remove('oni-cheat--show');
        });
      }
      /* Next frame so the transition fires */
      requestAnimationFrame(function () {
        overlay.classList.add('oni-cheat--show');
      });
    }

    function onKey(e) {
      /* Don't hijack typing in form fields */
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) {
        pos = 0;
        return;
      }
      var key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === SEQ[pos]) {
        pos++;
        if (pos === SEQ.length) {
          pos = 0;
          showUnlock();
        }
      } else {
        pos = key === SEQ[0] ? 1 : 0;
      }
    }

    document.addEventListener('keydown', onKey);

    /* Restore oni-mode if previously unlocked this session */
    if (store.get('oni-mode')) {
      document.documentElement.classList.add('oni-mode');
    }

    onCleanup(function () {
      document.removeEventListener('keydown', onKey);
      if (overlay) overlay.remove();
    });
  }

  /* ────────────────────────────────────────────────
     11. STAGGER GRID — cascade card entrance
  ──────────────────────────────────────────────── */
  function initStaggerGrid() {
    if (!('IntersectionObserver' in window)) return;

    var GRID_SELECTORS = [
      'ul.grid',
      'ul.product-grid',
      '.collection-grid',
      'ul[class*="grid"]',
      '.grid--uniform',
    ].join(',');

    var STEP = 85; /* ms per card */

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var grid = entry.target;
        if (grid.dataset.oniStaggerDone) return;
        grid.dataset.oniStaggerDone = '1';
        grid.classList.add('oni-stagger-parent');
        var cards = grid.querySelectorAll(
          'product-card, .product-card, .collection-card, li.grid__item'
        );
        cards.forEach(function (card, i) {
          card.style.setProperty('--oni-card-delay', i * STEP + 'ms');
        });
        observer.unobserve(grid);
      });
    }, { threshold: 0.04, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll(GRID_SELECTORS).forEach(function (g) {
      observer.observe(g);
    });

    /* Re-check after dynamic section loads */
    var domObs = new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches && node.matches(GRID_SELECTORS)) observer.observe(node);
          node.querySelectorAll && node.querySelectorAll(GRID_SELECTORS)
            .forEach(function (g) { observer.observe(g); });
        });
      });
    });
    domObs.observe(document.body, { childList: true, subtree: true });

    onCleanup(function () { observer.disconnect(); domObs.disconnect(); });
  }

  /* ────────────────────────────────────────────────
     12. SECTION WIPE — clip-path reveal on headings
  ──────────────────────────────────────────────── */
  function initSectionWipe() {
    if (!('IntersectionObserver' in window)) return;

    var SELECTORS = [
      '.section-header',
      '.section__heading',
      'h2.shopify-section__heading',
      '.oni-stats-hud',
      '.featured-collection .section-header',
    ].join(', ');

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('oni-section-wipe--visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll(SELECTORS).forEach(function (el) {
      if (!el.dataset.oniWipeDone) {
        el.dataset.oniWipeDone = '1';
        el.classList.add('oni-section-wipe');
        observer.observe(el);
      }
    });

    onCleanup(function () { observer.disconnect(); });
  }

  /* ────────────────────────────────────────────────
     13. PARALLAX SCROLL — hero / background elements
  ──────────────────────────────────────────────── */
  function initParallax() {
    /* Automatically tag hero media elements */
    document.querySelectorAll(
      '.banner__media, .hero__media, [class*="banner__"] img, .oni-hero__bg'
    ).forEach(function (el) {
      if (!el.dataset.oniParallax) el.dataset.oniParallax = '0.22';
    });

    var targets = [];
    document.querySelectorAll('[data-oni-parallax]').forEach(function (el) {
      targets.push({ el: el, factor: parseFloat(el.dataset.oniParallax) || 0.2 });
    });
    if (!targets.length) return;

    var ticking = false;
    function tick() {
      var sy = window.scrollY;
      targets.forEach(function (t) {
        var rect = t.el.getBoundingClientRect();
        /* Only move when near the viewport */
        if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
        var mid    = rect.top + rect.height / 2;
        var relPos = (window.innerHeight / 2 - mid) * t.factor;
        t.el.style.transform = 'translateY(' + relPos.toFixed(2) + 'px)';
      });
      ticking = false;
    }

    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(tick); }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onCleanup(function () { window.removeEventListener('scroll', onScroll); });
  }

  /* ────────────────────────────────────────────────
     14. TEXT SCRAMBLE — heading char scramble on entry
  ──────────────────────────────────────────────── */
  function initTextScramble() {
    if (!('IntersectionObserver' in window)) return;

    var CHARS = '!<>-_\\/[]{}=+*^?#鬼龍火神';
    var DURATION = 680;

    function scramble(el) {
      var orig = el.dataset.origText || el.textContent;
      el.dataset.origText = orig;
      var start = performance.now();
      function frame(now) {
        var progress    = Math.min((now - start) / DURATION, 1);
        var revealUpTo  = Math.floor(progress * orig.length);
        var out = '';
        for (var i = 0; i < orig.length; i++) {
          if (orig[i] === ' ') { out += ' '; continue; }
          out += i < revealUpTo
            ? orig[i]
            : CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        el.textContent = out;
        if (progress < 1) requestAnimationFrame(frame);
        else el.textContent = orig;
      }
      requestAnimationFrame(frame);
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          scramble(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    /* Target section headings only — skip product names to avoid CLS */
    document.querySelectorAll(
      '.section__heading, h2.shopify-section__heading, .section-header__heading'
    ).forEach(function (el) {
      /* Skip very long strings and elements with child HTML (icons etc.) */
      if (el.children.length === 0 && el.textContent.trim().length < 55) {
        observer.observe(el);
      }
    });

    onCleanup(function () { observer.disconnect(); });
  }

  /* ────────────────────────────────────────────────
     INIT
  ──────────────────────────────────────────────── */
  function init() {
    /* UA sniff alone misses touch devices with desktop UAs —
       pointer/hover media queries catch those */
    var isMobile =
      /Mobi|Android/i.test(navigator.userAgent) ||
      window.matchMedia('(hover: none), (pointer: coarse)').matches;
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReduced) {
      initBootSequence();
      if (!isMobile) {
        initCursorTrail();
        initMagneticButtons();
      }
      initImageTilt();
      initHoloSheen();
    }

    initCardBorders();
    initCardScan();
    initGlitchHeadings();
    initAddToCartToast();
    initScrollReveal();
    initNavProgress();
    initHudCounters();
    initKonami();
    initStaggerGrid();
    initSectionWipe();
    if (!prefersReduced) {
      initParallax();
      initTextScramble();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
