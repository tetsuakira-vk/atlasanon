// Atlas//Anon — main.js

// ── Grain texture ─────────────────────────────────────────────────────────────
const Grain = {
  init() {
    const overlay = document.querySelector('.grain-overlay');
    if (!overlay) return;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(256, 256);
    const d = img.data;

    for (let i = 0; i < d.length; i += 4) {
      const v = Math.floor(Math.random() * 255);
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }

    ctx.putImageData(img, 0, 0);
    overlay.style.backgroundImage = `url(${canvas.toDataURL()})`;
    overlay.style.backgroundSize = '256px 256px';
  }
};

// ── Hero particle system ──────────────────────────────────────────────────────
const HeroParticles = {
  canvas: null,
  ctx: null,
  particles: [],
  raf: null,

  init() {
    this.canvas = document.getElementById('hero-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this.spawn();
    this.draw();
    window.addEventListener('resize', () => {
      this.resize();
      this.spawn();
    });
  },

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  spawn() {
    const density = (this.canvas.width * this.canvas.height) / 14000;
    const count = Math.min(Math.floor(density), 110);

    this.particles = Array.from({ length: count }, () => ({
      x:     Math.random() * this.canvas.width,
      y:     Math.random() * this.canvas.height,
      r:     Math.random() * 1.4 + 0.3,
      vx:    (Math.random() - 0.5) * 0.22,
      vy:    (Math.random() - 0.5) * 0.22,
      alpha: Math.random() * 0.45 + 0.05,
      hue:   Math.random() > 0.55 ? 295 : 265, // pink vs purple
    }));
  },

  draw() {
    const { ctx, canvas, particles } = this;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -5) p.x = canvas.width + 5;
      if (p.x > canvas.width + 5) p.x = -5;
      if (p.y < -5) p.y = canvas.height + 5;
      if (p.y > canvas.height + 5) p.y = -5;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 75%, 72%, ${p.alpha})`;
      ctx.fill();
    });

    this.raf = requestAnimationFrame(() => this.draw());
  }
};

// ── Scroll reveal ─────────────────────────────────────────────────────────────
const Reveal = {
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
  }
};

// ── Navigation ────────────────────────────────────────────────────────────────
const Nav = {
  init() {
    const nav  = document.querySelector('.site-nav');
    const btn  = document.getElementById('hamburger');
    const menu = document.getElementById('nav-links');
    if (!nav) return;

    // Scrolled state
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 70);
    window.addEventListener('scroll', onScroll, { passive: true });

    // Mobile menu
    if (btn && menu) {
      btn.addEventListener('click', () => {
        const open = menu.classList.toggle('is-open');
        btn.classList.toggle('is-open', open);
        document.body.style.overflow = open ? 'hidden' : '';
      });

      // Close on link click
      menu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          menu.classList.remove('is-open');
          btn.classList.remove('is-open');
          document.body.style.overflow = '';
        });
      });
    }
  }
};

// ── Smooth scroll ─────────────────────────────────────────────────────────────
const Scroll = {
  init() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }
};

// ── Logo interactive ─────────────────────────────────────────────────────────
const LogoInteractive = {
  el: null,
  glitchTimer: null,
  isHovered: false,

  glitchFrames: [
    { t: 'translate(-6px, 2px)',  f: 'drop-shadow(-7px 0 rgba(232,121,249,0.95)) drop-shadow(7px 0 rgba(124,58,237,0.95))' },
    { t: 'translate(6px, -3px)',  f: 'drop-shadow(7px 0 rgba(192,38,211,0.95)) drop-shadow(-7px 0 rgba(124,58,237,0.95))' },
    { t: 'translate(-4px, 4px)',  f: 'drop-shadow(0 0 30px rgba(232,121,249,0.7)) drop-shadow(-4px 2px rgba(124,58,237,0.8))' },
    { t: 'translate(5px, -1px)',  f: 'drop-shadow(5px -2px rgba(192,38,211,0.9)) drop-shadow(-3px 0 rgba(232,121,249,0.6))' },
    { t: 'translate(-2px, -4px)', f: 'drop-shadow(0 0 50px rgba(192,38,211,0.4)) drop-shadow(-6px 0 rgba(232,121,249,0.8))' },
    { t: 'translate(0, 0)',       f: 'drop-shadow(0 0 40px rgba(192,38,211,0.25))' },
  ],

  init() {
    this.el = document.querySelector('.hero__logo');
    if (!this.el) return;

    this.el.addEventListener('mouseenter', () => this.onEnter());
    this.el.addEventListener('mousemove',  (e) => this.onMove(e));
    this.el.addEventListener('mouseleave', () => this.onLeave());

    // Also works on touch — tap triggers a glitch burst
    this.el.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.el.style.animation = 'none';
      this.burst(1.4, 500, () => { this.el.style.animation = ''; });
    }, { passive: false });
  },

  burst(intensity = 1, duration = 380, onDone) {
    clearInterval(this.glitchTimer);
    let frame = 0;
    const maxFrames = Math.ceil(duration / 55);

    this.glitchTimer = setInterval(() => {
      const { t, f } = this.glitchFrames[frame % this.glitchFrames.length];
      this.el.style.transform = t.replace(/(\d+)/g, (n) => Math.round(n * intensity));
      this.el.style.filter    = f;
      frame++;

      if (frame >= maxFrames) {
        clearInterval(this.glitchTimer);
        this.glitchTimer = null;
        if (onDone) onDone();
      }
    }, 55);
  },

  onEnter() {
    this.isHovered = true;
    this.el.style.animation = 'none';
    this.el.style.cursor = 'crosshair';
    this.burst(1.2, 350);
  },

  onMove(e) {
    if (this.glitchTimer) return;

    const rect = this.el.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width  / 2); // -1 to 1
    const dy = (e.clientY - cy) / (rect.height / 2); // -1 to 1

    const rotX  = dy * -10;
    const rotY  = dx *  10;
    const shX   = dx * -14;
    const shY   = dy * -10;
    const glow  = `drop-shadow(${shX}px ${shY}px 28px rgba(192,38,211,0.6)) drop-shadow(0 0 50px rgba(124,58,237,0.25))`;

    this.el.style.transform  = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.05)`;
    this.el.style.filter     = glow;
    this.el.style.transition = 'transform 0.08s linear, filter 0.12s linear';
  },

  onLeave() {
    this.isHovered = false;
    this.el.style.transition = '';
    clearInterval(this.glitchTimer);
    this.glitchTimer = null;

    // Brief exit glitch then restore
    this.el.style.transform = 'translate(4px, -2px)';
    this.el.style.filter    = 'drop-shadow(-5px 0 rgba(232,121,249,0.8)) drop-shadow(5px 0 rgba(124,58,237,0.8))';
    setTimeout(() => {
      this.el.style.transform = '';
      this.el.style.filter    = '';
      setTimeout(() => { this.el.style.animation = ''; }, 80);
    }, 110);
  }
};

// ── HUD flicker ──────────────────────────────────────────────────────────────
const HUD = {
  freq: document.getElementById('hud-freq'),
  baseFreq: 138.72,

  init() {
    if (!this.freq) return;
    setInterval(() => {
      // Occasionally flicker the frequency value
      if (Math.random() < 0.3) {
        const delta = (Math.random() - 0.5) * 2;
        const val = (this.baseFreq + delta).toFixed(2);
        this.freq.textContent = `${val}Hz`;
        this.freq.style.color = Math.random() < 0.15 ? 'var(--pink, #e879f9)' : '';
        setTimeout(() => { this.freq.style.color = ''; }, 120);
      }
    }, 2200);
  }
};

// ── Frequencies spectrum ─────────────────────────────────────────────────────
const Frequencies = {
  BAR_COUNT: 52,
  bars: [],
  raf: null,
  mouseX: -1,
  isHovered: false,

  init() {
    const el = document.getElementById('freq-spectrum');
    if (!el) return;

    const frag = document.createDocumentFragment();

    for (let i = 0; i < this.BAR_COUNT; i++) {
      const t    = i / (this.BAR_COUNT - 1);
      const bell = Math.sin(Math.PI * t);
      const base = 0.06 + bell * 0.62;

      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.style.setProperty('--dur', (0.45 + Math.random() * 0.7).toFixed(2) + 's');
      bar.style.setProperty('--del', (Math.random() * 0.55).toFixed(2) + 's');
      bar.style.setProperty('--min', (base * 0.1).toFixed(3));
      bar.style.setProperty('--max', (base * 0.72).toFixed(3));
      this.bars.push({ el: bar, base });
      frag.appendChild(bar);
    }

    el.appendChild(frag);

    el.addEventListener('mouseenter', () => { this.isHovered = true; this._tick(el); });
    el.addEventListener('mouseleave', () => {
      this.isHovered = false;
      cancelAnimationFrame(this.raf);
      this.bars.forEach(b => {
        b.el.style.transform  = '';
        b.el.style.animation  = '';
      });
    });
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      this.mouseX = (e.clientX - rect.left) / rect.width;
    });

    this._initReadout();
  },

  _tick(el) {
    if (!this.isHovered) return;
    const mx = this.mouseX;

    this.bars.forEach((b, i) => {
      const t    = i / (this.BAR_COUNT - 1);
      const dist = Math.abs(t - mx);
      const spike = Math.exp(-dist * dist * 22); // tight Gaussian around cursor
      const h = b.base * 0.72 + spike * (1 - b.base * 0.72);
      b.el.style.transform = `scaleY(${h.toFixed(3)})`;
      b.el.style.animation = 'none';
    });

    this.raf = requestAnimationFrame(() => this._tick(el));
  },

  _initReadout() {
    const bpmEl = document.getElementById('fq-bpm');
    const sigEl = document.getElementById('fq-signal');

    const bpms = [138, 140, 138, 141, 138, 137, 139, 138];
    let bi = 0;
    if (bpmEl) setInterval(() => {
      bi = (bi + 1) % bpms.length;
      bpmEl.textContent = bpms[bi];
    }, 3700);

    if (sigEl) setInterval(() => {
      if (Math.random() > 0.78) {
        sigEl.textContent = '—';
        setTimeout(() => { if (sigEl) sigEl.textContent = 'LIVE'; }, 150);
      }
    }, 5300);
  }
};

// ── Boot ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Grain.init();
  HeroParticles.init();
  LogoInteractive.init();
  Reveal.init();
  Nav.init();
  Scroll.init();
  HUD.init();
  Frequencies.init();
});
