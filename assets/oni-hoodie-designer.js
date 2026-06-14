/**
 * ONI THEORY 鬼の理論 — CUSTOM HOODIE DESIGNER
 * ------------------------------------------------------------
 * A self-contained <oni-hoodie-designer> custom element:
 *   • step wizard (color → size → placement → upload → text → review)
 *   • live HTML5 canvas mockup (front / back) with drag, resize,
 *     rotate and pinch-to-zoom
 *   • permanent file handling — the customer's design is uploaded
 *     with the order (native Shopify Files via the Cart AJAX API,
 *     or an optional Cloudinary unsigned upload) so it lands in the
 *     order admin as a downloadable link
 *   • line item properties for color, size, placement, design URL,
 *     custom text + font, plus a private print spec + flat mockup
 *
 * Cart integration reuses the theme's own machinery: dispatching a
 * CartAddEvent (cart:update) opens the cart drawer, updates the cart
 * bubble and re-renders <cart-items-component>.
 *
 * Framer-style transitions use the global `window.Motion`
 * (motion.dev, already loaded by the theme) with a graceful
 * no-motion fallback.
 */

import { CartAddEvent } from '@theme/events';

const PLACEMENTS = {
  front: 'Front',
  back: 'Back',
  both: 'Front + Back',
};

/* Normalised print areas (fraction of canvas W/H) per view. */
const PRINT = {
  front: { cx: 0.5, cy: 0.4, w: 0.42, h: 0.46 },
  back: { cx: 0.5, cy: 0.39, w: 0.46, h: 0.5 },
};

const HANDLE_R = 13;
const ROTATE_OFFSET = 26;
const EASE = [0.22, 1, 0.36, 1];

/* ── small helpers ──────────────────────────────────────── */
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

function hexToRgb(hex) {
  let c = (hex || '#000000').replace('#', '');
  if (c.length === 3) c = c.replace(/(.)/g, '$1$1');
  return {
    r: parseInt(c.slice(0, 2), 16) || 0,
    g: parseInt(c.slice(2, 4), 16) || 0,
    b: parseInt(c.slice(4, 6), 16) || 0,
  };
}
function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
function shade(hex, amt) {
  const { r, g, b } = hexToRgb(hex);
  const f = (v) => clamp(Math.round(v + 255 * amt), 0, 255);
  return `rgb(${f(r)}, ${f(g)}, ${f(b)})`;
}
function rot(x, y, a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: x * c - y * s, y: x * s + y * c };
}
function bytes(n) {
  if (n < 1024) return n + ' B';
  if (n < 1048576) return (n / 1024).toFixed(0) + ' KB';
  return (n / 1048576).toFixed(1) + ' MB';
}

class OniHoodieDesigner extends HTMLElement {
  connectedCallback() {
    if (this.__booted) return;
    this.__booted = true;

    try {
      this.config = JSON.parse(this.querySelector('script[data-hd-config]')?.textContent || '{}');
    } catch (_) {
      this.config = {};
    }

    this.state = {
      step: 0,
      furthest: 0,
      color: null,
      size: null,
      placement: 'front',
      file: null,
      img: null,
      imgURL: null,
      text: '',
      font: this.config.fonts?.[0]?.stack || 'sans-serif',
      fontLabel: this.config.fonts?.[0]?.label || 'Default',
      textColor: '#ffffff',
      view: 'front',
      selected: null,
      views: {
        front: this.#defaultTransforms(),
        back: this.#defaultTransforms(),
      },
    };

    this.steps = Array.from(this.querySelectorAll('.oni-hd__step'));
    this.canvas = this.querySelector('.oni-hd__canvas');
    this.ctx = this.canvas?.getContext('2d') || null;
    this.pointers = new Map();

    this.#bindWizard();
    this.#bindColor();
    this.#bindSize();
    this.#bindPlacement();
    this.#bindUpload();
    this.#bindText();
    this.#bindCanvas();
    this.#bindStage();
    this.#bindCart();

    this.#syncViewTabs();
    this.#refresh();
    this.#resizeCanvas();

    if ('ResizeObserver' in window) {
      this.__ro = new ResizeObserver(() => this.#resizeCanvas());
      this.__ro.observe(this.canvas.parentElement);
    }
    window.addEventListener('pageshow', this.#onResize);
    window.addEventListener('orientationchange', this.#onResize);

    /* redraw once custom (Google) fonts are ready so canvas text is crisp */
    if (document.fonts?.ready) document.fonts.ready.then(() => this.draw()).catch(() => {});
  }

  disconnectedCallback() {
    this.__ro?.disconnect();
    window.removeEventListener('pageshow', this.#onResize);
    window.removeEventListener('orientationchange', this.#onResize);
    if (this.state?.imgURL) URL.revokeObjectURL(this.state.imgURL);
  }

  #onResize = () => this.#resizeCanvas();
  #defaultTransforms() {
    return {
      img: { x: 0.5, y: PRINT.front.cy, scale: 1, rot: 0 },
      txt: { x: 0.5, y: PRINT.front.cy + 0.16, scale: 1, rot: 0 },
    };
  }

  /* ════════════════════ WIZARD ════════════════════ */
  #bindWizard() {
    this.querySelector('[data-hd-next]')?.addEventListener('click', () => this.#go(this.state.step + 1));
    this.querySelector('[data-hd-back]')?.addEventListener('click', () => this.#go(this.state.step - 1));

    this.querySelectorAll('.oni-hd__progress li').forEach((li, i) => {
      li.addEventListener('click', () => {
        if (i <= this.state.furthest) this.#go(i);
      });
    });
  }

  #go(next) {
    const max = this.steps.length - 1;
    next = clamp(next, 0, max);
    if (next === this.state.step) return;
    if (next > this.state.step && !this.#canLeave(this.state.step)) {
      this.#flagValidation(this.state.step);
      return;
    }
    this.state.step = next;
    this.state.furthest = Math.max(this.state.furthest, next);
    this.#refresh();

    const el = this.steps[next];
    const M = window.Motion;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (el && M?.animate && !reduced) {
      try {
        M.animate(el, { opacity: [0, 1], transform: ['translateX(14px)', 'translateX(0)'] }, { duration: 0.34, ease: EASE });
      } catch (_) {}
    }
    /* keep the panel in view on mobile after advancing */
    if (window.matchMedia?.('(max-width: 899px)').matches) {
      this.querySelector('.oni-hd__panel')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' });
    }
  }

  #canLeave(step) {
    const key = this.steps[step]?.dataset.hdStep;
    if (key === 'color') return !!this.state.color;
    if (key === 'size') return !!this.state.size;
    if (key === 'upload') return !!this.state.file;
    return true;
  }

  #flagValidation(step) {
    const el = this.steps[step]?.querySelector('[data-hd-validation]');
    if (el) {
      el.setAttribute('data-show', '');
      clearTimeout(this.__valT);
      this.__valT = setTimeout(() => el.removeAttribute('data-show'), 3200);
    }
  }

  #refresh() {
    this.steps.forEach((el, i) => {
      el.toggleAttribute('data-active', i === this.state.step);
      el.querySelectorAll('.oni-hd__validation').forEach((v) => v.removeAttribute('data-show'));
    });
    this.querySelectorAll('.oni-hd__progress li').forEach((li, i) => {
      li.toggleAttribute('data-done', i < this.state.step);
      li.toggleAttribute('data-active', i === this.state.step);
      li.style.cursor = i <= this.state.furthest ? 'pointer' : 'default';
    });

    const back = this.querySelector('[data-hd-back]');
    if (back) back.style.visibility = this.state.step === 0 ? 'hidden' : 'visible';

    const isLast = this.state.step === this.steps.length - 1;
    this.querySelector('[data-hd-next]')?.toggleAttribute('hidden', isLast);
    this.querySelector('[data-hd-add]')?.toggleAttribute('hidden', !isLast);

    const counter = this.querySelector('[data-hd-counter]');
    if (counter) counter.textContent = `Step ${this.state.step + 1} / ${this.steps.length}`;

    if (isLast) this.#renderSummary();
    this.#updateAddState();
  }

  /* ════════════════════ COLOR ════════════════════ */
  #bindColor() {
    this.querySelectorAll('[data-hd-color]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.state.color = {
          name: btn.dataset.hdColor,
          hex: btn.dataset.hex,
          front: btn.dataset.front || '',
          back: btn.dataset.back || '',
          frontImg: null,
          backImg: null,
        };
        this.querySelectorAll('[data-hd-color]').forEach((b) =>
          b.setAttribute('aria-pressed', String(b === btn))
        );
        this.#loadMockups();
        this.#hideEmpty();
        this.draw();
        this.#refresh();
      });
    });
  }

  #loadMockups() {
    const c = this.state.color;
    if (!c) return;
    ['front', 'back'].forEach((v) => {
      const src = c[v];
      if (!src) return;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        c[v + 'Img'] = img;
        this.draw();
      };
      img.src = src;
    });
  }

  /* ════════════════════ SIZE ════════════════════ */
  #bindSize() {
    this.querySelectorAll('[data-hd-size]').forEach((btn) => {
      if (btn.dataset.available === 'false') {
        btn.setAttribute('disabled', '');
        return;
      }
      btn.addEventListener('click', () => {
        this.state.size = btn.dataset.hdSize;
        this.querySelectorAll('[data-hd-size]').forEach((b) =>
          b.setAttribute('aria-pressed', String(b === btn))
        );
        this.#refresh();
      });
    });
  }

  /* ════════════════════ PLACEMENT ════════════════════ */
  #bindPlacement() {
    this.querySelectorAll('[data-hd-placement]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.state.placement = btn.dataset.hdPlacement;
        this.querySelectorAll('[data-hd-placement]').forEach((b) =>
          b.setAttribute('aria-pressed', String(b === btn))
        );
        if (!this.#isPrinted(this.state.view)) {
          this.state.view = this.state.placement === 'back' ? 'back' : 'front';
        }
        this.#syncViewTabs();
        this.draw();
        this.#refresh();
      });
    });
  }

  #isPrinted(view) {
    const p = this.state.placement;
    return p === 'both' || p === view;
  }

  #syncViewTabs() {
    const both = this.state.placement === 'both';
    this.querySelectorAll('[data-hd-view]').forEach((tab) => {
      const v = tab.dataset.hdView;
      const show = both || this.state.placement === v;
      tab.toggleAttribute('hidden', !show);
      tab.setAttribute('aria-selected', String(v === this.state.view));
    });
  }

  /* ════════════════════ UPLOAD ════════════════════ */
  #bindUpload() {
    const drop = this.querySelector('[data-hd-drop]');
    const input = this.querySelector('[data-hd-file]');
    if (!drop || !input) return;

    drop.addEventListener('click', () => input.click());
    drop.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        input.click();
      }
    });
    input.addEventListener('change', () => {
      if (input.files?.[0]) this.#handleFile(input.files[0]);
    });
    ['dragenter', 'dragover'].forEach((t) =>
      drop.addEventListener(t, (e) => {
        e.preventDefault();
        drop.classList.add('oni-hd__drop--over');
      })
    );
    ['dragleave', 'drop'].forEach((t) =>
      drop.addEventListener(t, (e) => {
        e.preventDefault();
        drop.classList.remove('oni-hd__drop--over');
      })
    );
    drop.addEventListener('drop', (e) => {
      const f = e.dataTransfer?.files?.[0];
      if (f) this.#handleFile(f);
    });

    this.querySelector('[data-hd-remove]')?.addEventListener('click', () => this.#removeFile());
  }

  #handleFile(file) {
    const err = this.querySelector('[data-hd-upload-error]');
    const okTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    const max = (this.config.maxFileSizeMB || 20) * 1048576;
    const show = (m) => {
      if (err) {
        err.textContent = m;
        err.setAttribute('data-show', '');
      }
    };
    if (err) err.removeAttribute('data-show');

    const typeOk = okTypes.includes(file.type) || /\.(png|jpe?g|svg)$/i.test(file.name);
    if (!typeOk) return show('Use a PNG, JPG or SVG file.');
    if (file.size > max) return show(`That file is ${bytes(file.size)} — max is ${this.config.maxFileSizeMB || 20}MB.`);

    if (this.state.imgURL) URL.revokeObjectURL(this.state.imgURL);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      this.state.file = file;
      this.state.img = img;
      this.state.imgURL = url;
      this.state.selected = 'image';
      /* re-centre the design in the print area on both views */
      this.state.views.front.img = { x: PRINT.front.cx, y: PRINT.front.cy, scale: 1, rot: 0 };
      this.state.views.back.img = { x: PRINT.back.cx, y: PRINT.back.cy, scale: 1, rot: 0 };
      this.#renderFileChip();
      this.#hideEmpty();
      this.draw();
      this.#refresh();
    };
    img.onerror = () => show('That image could not be read. Try another file.');
    img.src = url;
  }

  #renderFileChip() {
    const chip = this.querySelector('[data-hd-filechip]');
    if (!chip || !this.state.file) return;
    chip.setAttribute('data-has-file', '');
    const thumb = chip.querySelector('.oni-hd__file-thumb');
    if (thumb) thumb.src = this.state.imgURL;
    const name = chip.querySelector('.oni-hd__file-name');
    if (name) name.textContent = this.state.file.name;
    const meta = chip.querySelector('.oni-hd__file-meta');
    if (meta) meta.textContent = `✓ ${bytes(this.state.file.size)} · ready`;
  }

  #removeFile() {
    if (this.state.imgURL) URL.revokeObjectURL(this.state.imgURL);
    this.state.file = null;
    this.state.img = null;
    this.state.imgURL = null;
    this.state.selected = this.state.text ? 'text' : null;
    const chip = this.querySelector('[data-hd-filechip]');
    chip?.removeAttribute('data-has-file');
    const input = this.querySelector('[data-hd-file]');
    if (input) input.value = '';
    this.draw();
    this.#refresh();
  }

  /* ════════════════════ TEXT ════════════════════ */
  #bindText() {
    const input = this.querySelector('[data-hd-text]');
    input?.addEventListener('input', () => {
      this.state.text = input.value;
      if (this.state.text && !this.state.selected) this.state.selected = 'text';
      this.draw();
      this.#updateAddState();
    });

    const font = this.querySelector('[data-hd-font]');
    font?.addEventListener('change', () => {
      const opt = font.selectedOptions[0];
      this.state.font = opt.value;
      this.state.fontLabel = opt.textContent.trim();
      this.draw();
      if (document.fonts?.load) {
        document.fonts
          .load(`700 40px ${this.state.font}`)
          .then(() => this.draw())
          .catch(() => {});
      }
    });

    this.querySelectorAll('[data-hd-textcolor]').forEach((chip) => {
      chip.addEventListener('click', () => {
        this.state.textColor = chip.dataset.hdTextcolor;
        this.#syncTextColor();
        this.draw();
      });
    });
    const native = this.querySelector('[data-hd-textcolor-native]');
    native?.addEventListener('input', () => {
      this.state.textColor = native.value;
      this.#syncTextColor();
      this.draw();
    });
    this.#syncTextColor();
  }

  #syncTextColor() {
    this.querySelectorAll('[data-hd-textcolor]').forEach((c) =>
      c.setAttribute('aria-pressed', String(c.dataset.hdTextcolor.toLowerCase() === this.state.textColor.toLowerCase()))
    );
    const native = this.querySelector('[data-hd-textcolor-native]');
    if (native) native.value = this.state.textColor;
  }

  /* ════════════════════ STAGE (tabs / reset) ════════════════════ */
  #bindStage() {
    this.querySelectorAll('[data-hd-view]').forEach((tab) => {
      tab.addEventListener('click', () => {
        this.state.view = tab.dataset.hdView;
        this.#syncViewTabs();
        this.draw();
      });
    });
    this.querySelector('[data-hd-reset]')?.addEventListener('click', () => {
      this.state.views[this.state.view] = this.#defaultTransforms();
      this.draw();
    });
  }

  #hideEmpty() {
    this.querySelector('[data-hd-empty]')?.setAttribute('hidden', '');
  }

  /* ════════════════════ CANVAS ENGINE ════════════════════ */
  #resizeCanvas() {
    if (!this.ctx) return;
    const wrap = this.canvas.parentElement;
    const rect = wrap.getBoundingClientRect();
    if (!rect.width) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = rect.width;
    this.H = rect.height;
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw();
  }

  #printPx(view, W, H) {
    const p = PRINT[view];
    return { cx: p.cx * W, cy: p.cy * H, w: p.w * W, h: p.h * H };
  }

  /* drawn pixel geometry of an object on a given view/size */
  #geom(kind, view, W, H, ctx) {
    const t = this.state.views[view][kind];
    const pa = this.#printPx(view, W, H);
    if (kind === 'img') {
      const img = this.state.img;
      if (!img) return null;
      const base = Math.min(pa.w / img.naturalWidth, pa.h / img.naturalHeight);
      const w = img.naturalWidth * base * t.scale;
      const h = img.naturalHeight * base * t.scale;
      return { cx: t.x * W, cy: t.y * H, w, h, rot: t.rot };
    }
    // text
    if (!this.state.text) return null;
    const fontPx = pa.h * 0.17 * t.scale;
    ctx.font = `700 ${fontPx}px ${this.state.font}`;
    const w = Math.max(ctx.measureText(this.state.text).width, 8);
    return { cx: t.x * W, cy: t.y * H, w, h: fontPx, rot: t.rot, fontPx };
  }

  draw() {
    if (!this.ctx) return;
    const { ctx, W, H } = this;
    if (!W) return;
    ctx.clearRect(0, 0, W, H);
    this.#renderScene(ctx, W, H, this.state.view, false);

    /* selection handles for the active object */
    const sel = this.state.selected;
    if (sel && this.#isPrinted(this.state.view)) {
      const g = this.#geom(sel === 'image' ? 'img' : 'txt', this.state.view, W, H, ctx);
      if (g) this.#drawHandles(ctx, g);
    }
    this.#updateGrabCursor();
  }

  #renderScene(ctx, W, H, view, forExport) {
    if (this.state.color) this.#drawHoodie(ctx, W, H, this.state.color.hex, view);
    if (!forExport) this.#drawPrintGuide(ctx, W, H, view);

    if (!this.#isPrinted(view)) return;

    // design image
    if (this.state.img) {
      const g = this.#geom('img', view, W, H, ctx);
      ctx.save();
      ctx.translate(g.cx, g.cy);
      ctx.rotate(g.rot);
      ctx.drawImage(this.state.img, -g.w / 2, -g.h / 2, g.w, g.h);
      ctx.restore();
    }
    // text
    if (this.state.text) {
      const g = this.#geom('txt', view, W, H, ctx);
      ctx.save();
      ctx.translate(g.cx, g.cy);
      ctx.rotate(g.rot);
      ctx.font = `700 ${g.fontPx}px ${this.state.font}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = this.state.textColor;
      ctx.fillText(this.state.text, 0, 0);
      ctx.restore();
    }
  }

  #drawPrintGuide(ctx, W, H, view) {
    if (!this.state.color) return;
    const pa = this.#printPx(view, W, H);
    const light = luminance(this.state.color.hex) > 0.5;
    ctx.save();
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = light ? 'rgba(0,0,0,0.28)' : 'rgba(255,255,255,0.28)';
    ctx.strokeRect(pa.cx - pa.w / 2, pa.cy - pa.h / 2, pa.w, pa.h);
    ctx.restore();
  }

  #drawHandles(ctx, g) {
    ctx.save();
    ctx.translate(g.cx, g.cy);
    ctx.rotate(g.rot);
    const hw = g.w / 2;
    const hh = g.h / 2;
    ctx.strokeStyle = '#ff3346';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(-hw, -hh, g.w, g.h);
    ctx.setLineDash([]);
    // rotate stem
    ctx.beginPath();
    ctx.moveTo(0, -hh);
    ctx.lineTo(0, -hh - ROTATE_OFFSET);
    ctx.stroke();
    const dot = (x, y, fill) => {
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };
    dot(hw, hh, '#ff7a18'); // resize
    dot(0, -hh - ROTATE_OFFSET, '#ff3346'); // rotate
    ctx.restore();
  }

  /* generated hoodie silhouette, tinted to the chosen colour */
  #drawHoodie(ctx, W, H, hex, view) {
    const c = this.state.color;
    const mock = view === 'back' ? c.backImg : c.frontImg;
    if (mock && mock.complete && mock.naturalWidth) {
      const r = Math.min(W / mock.naturalWidth, H / mock.naturalHeight);
      const w = mock.naturalWidth * r;
      const h = mock.naturalHeight * r;
      ctx.drawImage(mock, (W - w) / 2, (H - h) / 2, w, h);
      return;
    }

    const X = (n) => n * W;
    const Y = (n) => n * H;
    const dark = luminance(hex) < 0.25;
    const body = hex;
    const shadow = shade(hex, dark ? 0.06 : -0.1);
    const hi = shade(hex, dark ? 0.12 : 0.06);
    const stitch = luminance(hex) > 0.5 ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.22)';

    ctx.save();
    ctx.lineJoin = 'round';

    // soft ground shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(X(0.5), Y(0.95), X(0.26), Y(0.02), 0, 0, Math.PI * 2);
    ctx.filter = 'blur(6px)';
    ctx.fill();
    ctx.restore();

    // sleeves
    ctx.fillStyle = shadow;
    const sleeve = (dir) => {
      const m = dir; // 1 left, -1 right mirrored around 0.5
      const fx = (n) => X(0.5 + m * (n - 0.5));
      ctx.beginPath();
      ctx.moveTo(fx(0.31), Y(0.31));
      ctx.bezierCurveTo(fx(0.2), Y(0.32), fx(0.12), Y(0.36), fx(0.13), Y(0.42));
      ctx.lineTo(fx(0.17), Y(0.62));
      ctx.bezierCurveTo(fx(0.18), Y(0.66), fx(0.25), Y(0.66), fx(0.26), Y(0.62));
      ctx.lineTo(fx(0.3), Y(0.44));
      ctx.bezierCurveTo(fx(0.31), Y(0.4), fx(0.32), Y(0.35), fx(0.31), Y(0.31));
      ctx.closePath();
      ctx.fill();
      // cuff
      ctx.save();
      ctx.strokeStyle = stitch;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(fx(0.175), Y(0.6));
      ctx.lineTo(fx(0.255), Y(0.6));
      ctx.stroke();
      ctx.restore();
    };
    sleeve(1);
    sleeve(-1);

    // hood (behind body)
    ctx.fillStyle = shadow;
    ctx.beginPath();
    ctx.moveTo(X(0.35), Y(0.31));
    ctx.bezierCurveTo(X(0.3), Y(0.18), X(0.4), Y(0.1), X(0.5), Y(0.1));
    ctx.bezierCurveTo(X(0.6), Y(0.1), X(0.7), Y(0.18), X(0.65), Y(0.31));
    ctx.bezierCurveTo(X(0.6), Y(0.25), X(0.4), Y(0.25), X(0.35), Y(0.31));
    ctx.closePath();
    ctx.fill();

    // body
    const grad = ctx.createLinearGradient(0, Y(0.28), 0, Y(0.93));
    grad.addColorStop(0, hi);
    grad.addColorStop(0.5, body);
    grad.addColorStop(1, shade(hex, dark ? 0.03 : -0.06));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(X(0.31), Y(0.31));
    ctx.lineTo(X(0.42), Y(0.3));
    ctx.bezierCurveTo(X(0.46), Y(0.37), X(0.54), Y(0.37), X(0.58), Y(0.3));
    ctx.lineTo(X(0.69), Y(0.31));
    ctx.bezierCurveTo(X(0.72), Y(0.45), X(0.73), Y(0.7), X(0.72), Y(0.9));
    ctx.bezierCurveTo(X(0.72), Y(0.93), X(0.69), Y(0.94), X(0.66), Y(0.93));
    ctx.lineTo(X(0.34), Y(0.93));
    ctx.bezierCurveTo(X(0.31), Y(0.94), X(0.28), Y(0.93), X(0.28), Y(0.9));
    ctx.bezierCurveTo(X(0.27), Y(0.7), X(0.28), Y(0.45), X(0.31), Y(0.31));
    ctx.closePath();
    ctx.fill();

    // neck rib
    ctx.strokeStyle = stitch;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(X(0.42), Y(0.3));
    ctx.bezierCurveTo(X(0.46), Y(0.36), X(0.54), Y(0.36), X(0.58), Y(0.3));
    ctx.stroke();

    // hem + cuffs rib lines
    ctx.beginPath();
    ctx.moveTo(X(0.3), Y(0.89));
    ctx.lineTo(X(0.7), Y(0.89));
    ctx.stroke();

    if (view === 'front') {
      // kangaroo pocket
      ctx.fillStyle = shade(hex, dark ? 0.04 : -0.05);
      ctx.beginPath();
      ctx.moveTo(X(0.37), Y(0.63));
      ctx.lineTo(X(0.63), Y(0.63));
      ctx.lineTo(X(0.6), Y(0.8));
      ctx.lineTo(X(0.4), Y(0.8));
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = stitch;
      ctx.stroke();
      // drawstrings
      ctx.lineWidth = 2;
      ctx.strokeStyle = shade(hex, 0.18);
      ctx.beginPath();
      ctx.moveTo(X(0.47), Y(0.33));
      ctx.lineTo(X(0.47), Y(0.46));
      ctx.moveTo(X(0.53), Y(0.33));
      ctx.lineTo(X(0.53), Y(0.46));
      ctx.stroke();
    } else {
      // back hood drape
      ctx.fillStyle = shade(hex, dark ? 0.05 : -0.04);
      ctx.beginPath();
      ctx.moveTo(X(0.4), Y(0.3));
      ctx.bezierCurveTo(X(0.43), Y(0.2), X(0.57), Y(0.2), X(0.6), Y(0.3));
      ctx.bezierCurveTo(X(0.55), Y(0.27), X(0.45), Y(0.27), X(0.4), Y(0.3));
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  /* ── pointer interaction ── */
  #bindCanvas() {
    if (!this.canvas) return;
    this.canvas.addEventListener('pointerdown', this.#onDown);
    this.canvas.addEventListener('pointermove', this.#onMove);
    this.canvas.addEventListener('pointerup', this.#onUp);
    this.canvas.addEventListener('pointercancel', this.#onUp);
    this.canvas.addEventListener('pointerleave', this.#onUp);
  }

  #pos(e) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  #hit(kind, p) {
    const g = this.#geom(kind === 'image' ? 'img' : 'txt', this.state.view, this.W, this.H, this.ctx);
    if (!g) return null;
    const d = rot(p.x - g.cx, p.y - g.cy, -g.rot);
    const hw = g.w / 2;
    const hh = g.h / 2;
    const near = (hx, hy) => Math.hypot(d.x - hx, d.y - hy) <= HANDLE_R;
    if (near(hw, hh)) return 'scale';
    if (near(0, -hh - ROTATE_OFFSET)) return 'rotate';
    const pad = 10;
    if (Math.abs(d.x) <= hw + pad && Math.abs(d.y) <= hh + pad) return 'move';
    return null;
  }

  #onDown = (e) => {
    if (!this.#isPrinted(this.state.view) || (!this.state.img && !this.state.text)) return;
    this.canvas.setPointerCapture?.(e.pointerId);
    const p = this.#pos(e);
    this.pointers.set(e.pointerId, p);

    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      this.pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y), scale: this.#activeT()?.scale || 1 };
      return;
    }

    // hit-test the currently selected object first, then the other
    const order = this.state.selected === 'text' ? ['text', 'image'] : ['image', 'text'];
    let target = null;
    let mode = null;
    for (const k of order) {
      const has = k === 'image' ? this.state.img : this.state.text;
      if (!has) continue;
      const m = this.#hit(k, p);
      if (m) {
        target = k;
        mode = m;
        break;
      }
    }
    if (!target) {
      this.state.selected = null;
      this.draw();
      return;
    }
    this.state.selected = target;
    const t = this.#activeT();
    const g = this.#geom(target === 'image' ? 'img' : 'txt', this.state.view, this.W, this.H, this.ctx);
    this.drag = {
      mode,
      offX: p.x - g.cx,
      offY: p.y - g.cy,
      startScale: t.scale,
      startRot: t.rot,
      startDist: Math.hypot(p.x - g.cx, p.y - g.cy) || 1,
      startAng: Math.atan2(p.y - g.cy, p.x - g.cx) - t.rot,
    };
    this.draw();
  };

  #onMove = (e) => {
    if (!this.pointers.has(e.pointerId)) {
      this.#hoverCursor(e);
      return;
    }
    const p = this.#pos(e);
    this.pointers.set(e.pointerId, p);
    const t = this.#activeT();
    if (!t) return;

    if (this.pinch && this.pointers.size >= 2) {
      const [a, b] = [...this.pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      t.scale = clamp(this.pinch.scale * (d / this.pinch.dist), 0.1, 6);
      this.draw();
      return;
    }
    if (!this.drag) return;
    const g = this.#geom(this.state.selected === 'image' ? 'img' : 'txt', this.state.view, this.W, this.H, this.ctx);
    if (this.drag.mode === 'move') {
      t.x = clamp((p.x - this.drag.offX) / this.W, 0, 1);
      t.y = clamp((p.y - this.drag.offY) / this.H, 0, 1);
    } else if (this.drag.mode === 'scale') {
      const dist = Math.hypot(p.x - g.cx, p.y - g.cy);
      t.scale = clamp(this.drag.startScale * (dist / this.drag.startDist), 0.1, 6);
    } else if (this.drag.mode === 'rotate') {
      t.rot = Math.atan2(p.y - g.cy, p.x - g.cx) - this.drag.startAng;
    }
    this.draw();
  };

  #onUp = (e) => {
    this.pointers.delete(e.pointerId);
    if (this.pointers.size < 2) this.pinch = null;
    if (this.pointers.size === 0) this.drag = null;
  };

  #activeT() {
    const sel = this.state.selected;
    if (!sel) return null;
    return this.state.views[this.state.view][sel === 'image' ? 'img' : 'txt'];
  }

  #hoverCursor(e) {
    if (!this.#isPrinted(this.state.view) || (!this.state.img && !this.state.text)) return;
    const p = this.#pos(e);
    const order = this.state.selected === 'text' ? ['text', 'image'] : ['image', 'text'];
    let over = null;
    for (const k of order) {
      const has = k === 'image' ? this.state.img : this.state.text;
      if (has && this.#hit(k, p)) {
        over = true;
        break;
      }
    }
    this.canvas.classList.toggle('oni-hd__canvas--grab', !!over);
  }

  #updateGrabCursor() {
    this.canvas.classList.toggle('oni-hd__canvas--grabbing', !!this.drag);
  }

  /* ════════════════════ SUMMARY ════════════════════ */
  #renderSummary() {
    const el = this.querySelector('[data-hd-summary]');
    if (!el) return;
    const s = this.state;
    const rows = [];
    const row = (k, v) => rows.push(`<li><span class="k">${k}</span><span class="v">${v}</span></li>`);
    if (s.color)
      rows.push(
        `<li><span class="k">Color</span><span class="v v--swatch"><i style="background:${s.color.hex}"></i>${s.color.name}</span></li>`
      );
    if (s.size) row('Size', s.size);
    row('Placement', PLACEMENTS[s.placement]);
    row('Design', s.file ? s.file.name : '<span style="color:#ffb3bb">none yet</span>');
    if (s.text) {
      row('Custom text', `“${s.text.replace(/</g, '&lt;')}”`);
      row('Font', s.fontLabel);
      rows.push(
        `<li><span class="k">Text color</span><span class="v v--swatch"><i style="background:${s.textColor}"></i>${s.textColor}</span></li>`
      );
    }
    el.innerHTML = rows.join('');

    const variant = this.#variant();
    const price = this.querySelector('[data-hd-price]');
    if (price) price.textContent = variant?.price_formatted || this.config.priceFormatted || '';
  }

  /* ════════════════════ CART ════════════════════ */
  #variant() {
    const vs = this.config.variants || [];
    const color = this.state.color?.name?.toLowerCase();
    const size = this.state.size?.toLowerCase();
    const vals = (v) => Object.values(v.options || {}).map((x) => String(x).toLowerCase());
    let m =
      vs.find((v) => (!color || vals(v).includes(color)) && (!size || vals(v).includes(size))) ||
      (size ? vs.find((v) => vals(v).includes(size)) : null) ||
      vs.find((v) => String(v.id) === String(this.config.defaultVariantId)) ||
      vs[0];
    return m || null;
  }

  #updateAddState() {
    const ready = !!(this.state.color && this.state.size && this.state.file);
    const btn = this.querySelector('[data-hd-add]');
    if (btn) btn.disabled = !ready;
  }

  #bindCart() {
    this.querySelector('[data-hd-add]')?.addEventListener('click', () => this.#addToCart());
  }

  #placementSpec() {
    const fmt = (t) =>
      `pos ${Math.round(t.x * 100)}%,${Math.round(t.y * 100)}% · size ${Math.round(t.scale * 100)}% · rot ${Math.round((t.rot * 180) / Math.PI)}°`;
    const parts = [];
    ['front', 'back'].forEach((v) => {
      if (!this.#isPrinted(v)) return;
      const t = this.state.views[v];
      let line = `${v.toUpperCase()} — design ${fmt(t.img)}`;
      if (this.state.text) line += ` | text ${fmt(t.txt)}`;
      parts.push(line);
    });
    return parts.join('  ||  ');
  }

  /* flatten the printed view(s) into one PNG for the order */
  async #mockupBlob() {
    if (!this.W) return null;
    const views = ['front', 'back'].filter((v) => this.#isPrinted(v));
    if (!views.length) return null;
    const w = this.W;
    const h = this.H;
    const off = document.createElement('canvas');
    off.width = w * views.length;
    off.height = h;
    const c = off.getContext('2d');
    if (!c) return null;
    views.forEach((v, i) => {
      c.save();
      c.translate(w * i, 0);
      c.fillStyle = '#15151c';
      c.fillRect(0, 0, w, h);
      this.#renderScene(c, w, h, v, true);
      c.restore();
    });
    return new Promise((res) => {
      try {
        off.toBlob((b) => res(b), 'image/png');
      } catch (_) {
        res(null); // canvas tainted (e.g. external SVG) — skip silently
      }
    });
  }

  async #uploadCloudinary(file, name) {
    const { cloudName, uploadPreset } = this.config.cloudinary || {};
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', uploadPreset);
    if (name) fd.append('public_id', name);
    const r = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: 'POST',
      body: fd,
    });
    if (!r.ok) throw new Error('Upload failed (' + r.status + ')');
    const j = await r.json();
    return j.secure_url;
  }

  async #addToCart() {
    const btn = this.querySelector('[data-hd-add]');
    const msg = this.querySelector('[data-hd-cart-msg]');
    const fail = (m) => {
      if (msg) {
        msg.className = 'oni-hd__msg oni-hd__msg--error';
        msg.textContent = m;
        msg.setAttribute('data-show', '');
      }
      btn?.removeAttribute('data-loading');
      if (btn) btn.disabled = false;
    };
    if (msg) msg.removeAttribute('data-show');

    if (!this.state.color || !this.state.size) return fail('Pick a color and size first.');
    if (!this.state.file) return fail('Upload your design before adding to cart.');
    const variant = this.#variant();
    if (!variant?.id) return fail('This product is not set up yet. Add the product in the section settings.');

    btn?.setAttribute('data-loading', '');
    if (btn) btn.disabled = true;

    try {
      const fd = new FormData();
      fd.append('id', String(variant.id));
      fd.append('quantity', '1');
      fd.append('properties[Hoodie color]', this.state.color.name);
      fd.append('properties[Size]', this.state.size);
      fd.append('properties[Print placement]', PLACEMENTS[this.state.placement]);
      if (this.state.text.trim()) {
        fd.append('properties[Custom text]', this.state.text.trim());
        fd.append('properties[Font]', this.state.fontLabel);
        fd.append('properties[Text color]', this.state.textColor);
      }
      fd.append('properties[_Print spec]', this.#placementSpec());
      fd.append('properties[_Designer]', 'oni-hoodie-designer v1');

      const mockup = await this.#mockupBlob();

      if (this.config.provider === 'cloudinary' && this.config.cloudinary?.cloudName) {
        const designUrl = await this.#uploadCloudinary(this.state.file, null);
        fd.append('properties[Design file]', designUrl);
        if (mockup) {
          const mUrl = await this.#uploadCloudinary(new File([mockup], 'mockup.png', { type: 'image/png' }), null);
          fd.append('properties[_Mockup]', mUrl);
        }
      } else {
        // native Shopify Files upload via the Cart AJAX API
        fd.append('properties[Design file]', this.state.file, this.state.file.name);
        if (mockup) fd.append('properties[_Mockup]', mockup, 'mockup.png');
      }

      const res = await fetch(Theme.routes.cart_add_url, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: fd,
      });
      const data = await res.json();
      if (data.status || !res.ok) {
        return fail(data.description || data.message || 'Could not add to cart. Please try again.');
      }

      btn?.removeAttribute('data-loading');

      // refresh cart UI through the theme's own event pipeline
      let cart = null;
      try {
        cart = await fetch(`${window.Shopify?.routes?.root || '/'}cart.js`).then((r) => r.json());
      } catch (_) {}
      this.dispatchEvent(
        new CartAddEvent(cart || undefined, this.id || 'oni-hoodie-designer', {
          source: 'oni-hoodie-designer',
          itemCount: cart?.item_count ?? 1,
          productId: this.config.productId,
        })
      );

      const after = this.config.afterAdd || 'drawer';
      if (after === 'cart') {
        window.location.href = Theme.routes.cart_url;
        return;
      }
      const drawer = document.querySelector('cart-drawer-component');
      if (after === 'drawer' && drawer && typeof drawer.open === 'function') {
        drawer.open();
      } else if (msg) {
        msg.className = 'oni-hd__msg oni-hd__msg--success';
        msg.innerHTML = `Added to cart — <a href="${Theme.routes.cart_url}" style="color:inherit;text-decoration:underline">view cart →</a>`;
        msg.setAttribute('data-show', '');
      }
    } catch (err) {
      console.error('[oni-hoodie-designer]', err);
      fail('Something went wrong uploading your design. Please try again.');
    }
  }
}

if (!customElements.get('oni-hoodie-designer')) {
  customElements.define('oni-hoodie-designer', OniHoodieDesigner);
}
