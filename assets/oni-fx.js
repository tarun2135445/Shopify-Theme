/**
 * ONI THEORY 鬼の理論 — Anime & Gaming Dynamic Effects
 */

(function () {
  'use strict';

  /* ── Cursor trail particles ── */
  function initCursorTrail() {
    const canvas = document.createElement('canvas');
    canvas.id = 'oni-cursor-canvas';
    Object.assign(canvas.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: '9999',
    });
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    const particles = [];
    const COLORS = ['#FF3346', '#BF5FFF', '#00F5FF'];
    let mouse = { x: -200, y: -200 };
    let active = false;

    document.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      active = true;

      if (Math.random() < 0.4) {
        particles.push({
          x: mouse.x,
          y: mouse.y,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2 - 0.4,
          life: 1,
          decay: 0.035 + Math.random() * 0.03,
          size: 1.5 + Math.random() * 2,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }
    });

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
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
      requestAnimationFrame(loop);
    }
    loop();
  }

  /* ── Random glitch burst on headings ── */
  function initGlitchHeadings() {
    const headings = document.querySelectorAll('h1, h2');
    headings.forEach((el) => {
      if (!el.dataset.text) el.dataset.text = el.textContent;
      setInterval(() => {
        if (Math.random() > 0.97) {
          el.classList.add('oni-glitch');
          setTimeout(() => el.classList.remove('oni-glitch'), 600);
        }
      }, 3000 + Math.random() * 5000);
    });
  }

  /* ── "POWER UP" toast on add-to-cart ── */
  function initAddToCartToast() {
    const style = document.createElement('style');
    style.textContent = `
      .oni-toast {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 10000;
        background: #0B0B10;
        border: 1px solid #FF3346;
        box-shadow: 0 0 16px rgba(255,51,70,0.55), 0 4px 20px rgba(0,0,0,0.6);
        padding: 10px 18px;
        font-family: 'Orbitron', sans-serif;
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #FF3346;
        display: flex;
        align-items: center;
        gap: 10px;
        opacity: 0;
        transform: translateY(12px);
        transition: opacity 0.25s ease, transform 0.25s ease;
        pointer-events: none;
      }
      .oni-toast.oni-toast--show {
        opacity: 1;
        transform: translateY(0);
      }
      .oni-toast__icon {
        font-size: 1rem;
        animation: oni-float 1s ease-in-out 3;
      }
      @keyframes oni-float {
        0%,100% { transform: translateY(0); }
        50%      { transform: translateY(-5px); }
      }
    `;
    document.head.appendChild(style);

    const toast = document.createElement('div');
    toast.className = 'oni-toast';
    toast.innerHTML = '<span class="oni-toast__icon">⚡</span><span>ADDED TO CART</span>';
    document.body.appendChild(toast);

    let toastTimer = null;
    function showToast() {
      clearTimeout(toastTimer);
      toast.classList.add('oni-toast--show');
      toastTimer = setTimeout(() => toast.classList.remove('oni-toast--show'), 2200);
    }

    /* Listen to Shopify cart events */
    document.addEventListener('cart:add', showToast);
    /* Also watch for button clicks as fallback */
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cart-add], .product-form__submit, .quick-add__submit');
      if (btn) setTimeout(showToast, 400);
    });
  }

  /* ── Page load reveal: animate sections into view ── */
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) return;
    const style = document.createElement('style');
    style.textContent = `
      .oni-reveal {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.55s ease, transform 0.55s ease;
      }
      .oni-reveal.oni-reveal--visible {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);

    const targets = document.querySelectorAll(
      'product-card, .collection-card, .featured-blog-posts-card, .media-with-text__content'
    );
    targets.forEach((el) => el.classList.add('oni-reveal'));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('oni-reveal--visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    targets.forEach((el) => observer.observe(el));
  }

  /* ── Boot sequence: power-on effect on first visit ── */
  function initBootSequence() {
    if (sessionStorage.getItem('oni-booted')) return;
    sessionStorage.setItem('oni-booted', '1');

    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      background: '#07070D',
      zIndex: '99999',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      fontFamily: "'Orbitron', sans-serif",
      color: '#FF3346',
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      transition: 'opacity 0.6s ease',
    });

    const title = document.createElement('div');
    title.textContent = '鬼の理論';
    title.style.cssText = 'font-size: clamp(1.4rem, 4vw, 2.5rem); font-weight: 900; text-shadow: 0 0 18px #FF3346, 0 0 40px rgba(255,51,70,0.4);';

    const sub = document.createElement('div');
    sub.textContent = 'ONI THEORY';
    sub.style.cssText = 'font-size: clamp(0.6rem, 1.5vw, 0.9rem); color: #BF5FFF; letter-spacing: 0.35em; text-shadow: 0 0 10px #BF5FFF;';

    const bar = document.createElement('div');
    bar.style.cssText = 'width: 180px; height: 2px; background: #1a1a22; margin-top: 16px; overflow: hidden;';
    const barFill = document.createElement('div');
    barFill.style.cssText = 'height: 100%; width: 0; background: linear-gradient(90deg, #FF3346, #BF5FFF); transition: width 0.7s ease; box-shadow: 0 0 8px #FF3346;';
    bar.appendChild(barFill);

    overlay.appendChild(title);
    overlay.appendChild(sub);
    overlay.appendChild(bar);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      setTimeout(() => { barFill.style.width = '100%'; }, 100);
      setTimeout(() => { overlay.style.opacity = '0'; }, 1000);
      setTimeout(() => { overlay.remove(); }, 1650);
    });
  }

  /* ── Init all on DOMContentLoaded ── */
  function init() {
    /* Skip effects on mobile/low-powered devices */
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReduced) {
      if (!isMobile) initCursorTrail();
      initBootSequence();
    }

    initGlitchHeadings();
    initAddToCartToast();
    initScrollReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
