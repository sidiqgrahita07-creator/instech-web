/*
  BSF Fly Animation — versi 5:
  - Lalat bebas, ga di-clamp di viewport
  - Target perch: visible diutamakan
  - Tidak ada auto-detach
  - Rest state: snap ke target
  - ★ Flow Chart sync: 1 fly otomatis ke step aktif di System Model
*/

// ═══ COUNT-UP STATISTIK DAMPAK ═════════════════════════════════════════════
// Angka naik dari 0 → target saat section masuk viewport (sekali jalan).
(function countUp() {
  const els = document.querySelectorAll('.countup');
  if (els.length === 0) return;

  const fmt = n => n.toLocaleString('id-ID');

  function animate(el) {
    const target = parseFloat(el.dataset.target) || 0;
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const DURATION = 1600;
    const start = performance.now();

    function step(now) {
      const t = Math.min(1, (now - start) / DURATION);
      const e = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const val = Math.round(target * e);
      el.textContent = prefix + fmt(val) + suffix;
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = prefix + fmt(target) + suffix;
    }
    requestAnimationFrame(step);
  }

  if (!('IntersectionObserver' in window)) {
    els.forEach(animate);
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (en.isIntersecting) { animate(en.target); obs.unobserve(en.target); }
    });
  }, { threshold: 0.4 });
  els.forEach(el => io.observe(el));
})();


// ═══ FAQ ACCORDION ═════════════════════════════════════════════════════════
// Klik pertanyaan → buka/tutup. Buka satu otomatis tutup yang lain.
(function faqAccordion() {
  const wrap = document.querySelector('[data-faq]');
  if (!wrap) return;
  const items = Array.from(wrap.querySelectorAll('.faq-item'));

  items.forEach(item => {
    const btn = item.querySelector('.faq-q');
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('faq-open');
      items.forEach(i => i.classList.remove('faq-open'));
      if (!isOpen) item.classList.add('faq-open');
    });
  });
})();


// ═══ NAV DROPDOWN ══════════════════════════════════════════════════════════
// Buka saat hover (desktop) atau klik (touch). Tutup saat: mouse keluar,
// klik di luar, klik link menu, atau pencet Escape. Tidak ada yang "nyangkut".
(function navDropdown() {
  const groups = Array.from(document.querySelectorAll('.nav-group'));
  if (groups.length === 0) return;

  let openGroup = null;
  let closeTimer = null;

  function close(g) {
    if (!g) return;
    g.classList.remove('open');
    if (openGroup === g) openGroup = null;
  }
  function closeAll() { groups.forEach(close); openGroup = null; }
  function open(g) {
    clearTimeout(closeTimer);
    if (openGroup && openGroup !== g) close(openGroup);
    g.classList.add('open');
    openGroup = g;
  }

  groups.forEach(g => {
    const trigger = g.querySelector('.nav-trigger');

    // Hover (desktop) — tutup pakai delay kecil biar gerak mouse nyaman
    g.addEventListener('mouseenter', () => open(g));
    g.addEventListener('mouseleave', () => {
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => close(g), 120);
    });

    // Klik/tap trigger → toggle (buat layar sentuh)
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      g.classList.contains('open') ? close(g) : open(g);
    });

    // Klik link di dalam menu → tutup + lepas fokus
    g.querySelectorAll('.nav-menu a').forEach(a => {
      a.addEventListener('click', () => { closeAll(); trigger.blur(); });
    });
  });

  // Klik di luar / Escape → tutup semua
  document.addEventListener('click', () => closeAll());
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });
})();


// ═══ STATS CYCLING ═════════════════════════════════════════════════════════
// Nyalakan tiap stat bergantian (CO₂, Metana, Limbah, Degradasi)
(function statsRotate() {
  const groups = document.querySelectorAll('[data-stats-cycle]');
  if (groups.length === 0) return;
  const INTERVAL_MS = 1400;

  groups.forEach(group => {
    const items = Array.from(group.querySelectorAll('.stat-item'));
    if (items.length === 0) return;
    let idx = 0;
    let paused = false;

    function activate(i) {
      items.forEach((s, k) => s.classList.toggle('stat-active', k === i));
    }

    items.forEach((item, i) => {
      item.addEventListener('mouseenter', () => { paused = true; activate(i); idx = i; });
      item.addEventListener('mouseleave', () => { paused = false; });
    });

    activate(0);
    setInterval(() => {
      if (paused) return;
      idx = (idx + 1) % items.length;
      activate(idx);
    }, INTERVAL_MS);
  });
})();


// ═══ FLOW ROW AUTO-CYCLE ═════════════════════════════════════════════════
// Tiap [data-flow-row] punya state machine sendiri:
//   phase 'step' → step nyala STEP_MS
//   phase 'conn' → step mati + garis ke depan fill CONN_MS
//   ulangi ke step berikutnya, loop infinite
(function flowRows() {
  const STEP_MS = 1500;
  const CONN_MS = 1100;
  const PAUSE_MS = 90000;

  const rows = document.querySelectorAll('[data-flow-row]');
  if (rows.length === 0) return;

  let processRowState = null;

  rows.forEach(row => {
    const steps = Array.from(row.querySelectorAll('.flow-step'));
    const conns = Array.from(row.querySelectorAll('.flow-conn'));
    if (steps.length === 0) return;

    const state = {
      activeIdx: 0,
      phase: 'step',
      pauseUntil: 0,
      timer: null
    };
    if (row.id === 'flow-process') processRowState = state;

    conns.forEach(c => c.style.setProperty('--conn-duration', CONN_MS + 'ms'));

    function setStepActive(idx) {
      steps.forEach((s, i) => s.classList.toggle('flow-active', i === idx));
    }
    function triggerConn(idx) {
      conns.forEach((c, i) => {
        if (i === idx) {
          c.classList.remove('flow-conn-active');
          void c.offsetWidth; // force reflow → restart animation
          c.classList.add('flow-conn-active');
        } else {
          c.classList.remove('flow-conn-active');
        }
      });
    }

    function tick() {
      if (Date.now() < state.pauseUntil) {
        state.timer = setTimeout(tick, 80);
        return;
      }
      if (state.phase === 'step') {
        setStepActive(state.activeIdx);
        conns.forEach(c => c.classList.remove('flow-conn-active'));
        state.phase = 'conn';
        state.timer = setTimeout(tick, STEP_MS);
      } else {
        steps[state.activeIdx].classList.remove('flow-active');
        const connIdx = state.activeIdx;
        if (connIdx < conns.length) {
          triggerConn(connIdx);
          state.timer = setTimeout(() => {
            state.activeIdx = (state.activeIdx + 1) % steps.length;
            state.phase = 'step';
            tick();
          }, CONN_MS);
        } else {
          // Wrap dari step terakhir balik ke step 0 tanpa conn
          conns.forEach(c => c.classList.remove('flow-conn-active'));
          state.activeIdx = 0;
          state.phase = 'step';
          state.timer = setTimeout(tick, 250);
        }
      }
    }

    steps.forEach((step, idx) => {
      step.addEventListener('mouseenter', () => {
        state.pauseUntil = Date.now() + PAUSE_MS;
        setStepActive(idx);
        conns.forEach(c => c.classList.remove('flow-conn-active'));
        state.activeIdx = idx;
        state.phase = 'step';
      });
      step.addEventListener('mouseleave', () => {
        state.pauseUntil = 0;
      });
    });

    tick();
  });

  // Expose process row active step untuk fly tracking
  window.getFlowActiveStep = () => {
    if (!processRowState) return null;
    const row = document.getElementById('flow-process');
    if (!row) return null;
    const steps = row.querySelectorAll('.flow-step');
    return steps[processRowState.activeIdx] || null;
  };
})();


(function () {
  const stage = document.getElementById('bsf-stage');
  const flyEls = document.querySelectorAll('.fly');
  if (!stage || flyEls.length === 0) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    stage.style.display = 'none';
    return;
  }

  function isInViewport(r) {
    return r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
  }

  function getPerchPool() {
    const pool = [];
    document.querySelectorAll('[data-bsf-perch]').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width < 10 || r.height < 10) return;
      pool.push({
        el,
        type: el.dataset.bsfPerch || 'icon',
        visible: isInViewport(r)
      });
    });
    const wood = document.getElementById('bsf-wood');
    if (wood) pool.push({ el: wood, type: 'wood', visible: true });
    return pool;
  }

  function lerpAngle(a, b, t) {
    let d = b - a;
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    return a + d * t;
  }
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  class Fly {
    constructor(el, index) {
      this.el = el;
      this.index = index;  // ★ store index untuk identify "follower fly"
      this.talking = false; // ★ true saat lalat lagi "ngobrol" (balon chat kebuka)
      this.x = window.innerWidth * (0.2 + Math.random() * 0.6);
      this.y = window.innerHeight * (0.25 + Math.random() * 0.4);
      this.vx = (Math.random() - 0.5) * 100;
      this.vy = (Math.random() - 0.5) * 100;
      this.rotation = 0;
      this.scale = 0.85;
      this.maxSpeed = 230 + Math.random() * 70;
      this.state = 'fly';          // 'fly' | 'hover' | 'landing' | 'rest'
      this.stateUntil = 0;
      this.hoverStart = 0;
      this.hoverDuration = 0;
      this.landStart = 0;
      this.landDuration = 800;
      this.landFromRot = 0;
      this.landFromScale = 1;
      this.landToRot = 0;
      this.landToScale = 0.5;
      this.targetEl = null;
      this.targetType = 'icon';
      this.targetOffsetX = 0.5;
      this.targetOffsetY = 0.5;
      this.depthPhase = index * 1.7;
      this.wobblePhase = Math.random() * Math.PI * 2;
      this.render();
    }

    pickNewTarget() {
      const pool = getPerchPool();
      if (pool.length === 0) return;

      // ★ BIAS fly-1: ke step flow chart yang sedang aktif
      if (this.index === 0 && typeof window.getFlowActiveStep === 'function') {
        const activeStep = window.getFlowActiveStep();
        if (activeStep) {
          const r = activeStep.getBoundingClientRect();
          if (r.width > 10 && r.height > 10) {
            this.targetEl = activeStep;
            this.targetType = 'edge';
            this.targetOffsetX = 0.3 + Math.random() * 0.4;
            this.targetOffsetY = 0;
            return;
          }
        }
      }

      // ★ BIAS fly-4: spesialis egg trap (90% selalu ke media bertelur)
      if (this.index === 3 && Math.random() < 0.9) {
        const wood = document.getElementById('bsf-wood');
        if (wood) {
          this.targetEl = wood;
          this.targetType = 'wood';
          this.targetOffsetX = 0.25 + Math.random() * 0.5;
          this.targetOffsetY = 0.15 + Math.random() * 0.4;
          return;
        }
      }

      // Prefer visible perches 85% of the time
      const visible = pool.filter(p => p.visible);
      const usePool = (visible.length > 0 && Math.random() < 0.85) ? visible : pool;

      const occupied = new Set(
        flyObjects
          .filter(f => f !== this && (f.state === 'rest' || f.state === 'landing' || f.state === 'hover') && f.targetEl)
          .map(f => f.targetEl)
      );
      let candidates = usePool.filter(p => p.el !== this.targetEl && !occupied.has(p.el));
      if (candidates.length === 0) candidates = usePool.filter(p => p.el !== this.targetEl);
      if (candidates.length === 0) candidates = usePool;
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      this.targetEl = pick.el;
      this.targetType = pick.type;

      if (pick.type === 'wood') {
        this.targetOffsetX = 0.3 + Math.random() * 0.4;
        this.targetOffsetY = 0.2 + Math.random() * 0.3;
      } else if (pick.type === 'edge') {
        this.targetOffsetX = 0.15 + Math.random() * 0.7;
        this.targetOffsetY = 0;
      } else {
        this.targetOffsetX = 0.4 + Math.random() * 0.2;
        this.targetOffsetY = 0.4 + Math.random() * 0.2;
      }
    }

    getTargetPos() {
      if (!this.targetEl) return null;
      const r = this.targetEl.getBoundingClientRect();
      if (this.targetType === 'edge') {
        return { x: r.left + r.width * this.targetOffsetX, y: r.top - 5 };
      }
      return {
        x: r.left + r.width * this.targetOffsetX,
        y: r.top  + r.height * this.targetOffsetY
      };
    }

    update(dt, now) {
      // ── TALKING: lalat diam (hinggap) selama balon chat kebuka ──
      if (this.talking) {
        this.rotation = lerpAngle(this.rotation, 0, Math.min(1, dt * 8));
        this.scale += (0.62 - this.scale) * Math.min(1, dt * 8);
        return;
      }

      // ── REST: snap ke target (instant tracking, smooth saat scroll) ──
      if (this.state === 'rest') {
        const tp = this.getTargetPos();
        if (tp) { this.x = tp.x; this.y = tp.y; }
        if (now > this.stateUntil) {
          this.state = 'fly';
          this.el.classList.remove('resting');
          this.vx = (Math.random() - 0.5) * 200;
          this.vy = -100 - Math.random() * 80;
          this.pickNewTarget();
        }
        return;
      }

      // ── LANDING: smooth ease-out lerp ──
      if (this.state === 'landing') {
        const t = Math.min(1, (now - this.landStart) / this.landDuration);
        const e = easeOut(t);
        const tp = this.getTargetPos();
        if (tp) {
          // Lerp ke target dengan rate naik di akhir (snap di akhir)
          const rate = Math.min(1, dt * (5 + e * 25));
          this.x += (tp.x - this.x) * rate;
          this.y += (tp.y - this.y) * rate;
        }
        this.rotation = lerpAngle(this.landFromRot, this.landToRot, e);
        this.scale = this.landFromScale + (this.landToScale - this.landFromScale) * e;
        if (t >= 1) {
          this.state = 'rest';
          this.el.classList.add('resting');
          this.stateUntil = now + 1600 + Math.random() * 2600;
          if (tp) { this.x = tp.x; this.y = tp.y; }
        }
        return;
      }

      // ── HOVER: terbang melingkar di sekitar target ──
      if (this.state === 'hover') {
        const tp = this.getTargetPos();
        if (!tp) { this.state = 'fly'; return; }
        const t = (now - this.hoverStart) / 1000;
        const angle = t * 1.4;
        const radius = Math.max(8, 45 - t * 9);
        const targetX = tp.x + Math.cos(angle) * radius;
        const targetY = tp.y + Math.sin(angle) * radius * 0.5;
        const hRate = Math.min(1, dt * 7);
        this.x += (targetX - this.x) * hRate;
        this.y += (targetY - this.y) * hRate;
        const depthOsc = 0.5 + 0.5 * Math.cos(t * 2.0);
        const targetScale = 0.5 + depthOsc * 0.85;
        this.scale += (targetScale - this.scale) * dt * 3;
        this.rotation += dt * 22;

        if (now > this.hoverStart + this.hoverDuration) {
          this.state = 'landing';
          this.landStart = now;
          this.landDuration = 750 + Math.random() * 250;
          this.landFromRot = this.rotation;
          this.landFromScale = this.scale;
          if (this.targetType === 'wood') {
            this.landToRot = (Math.random() < 0.5 ? 180 : 0) + (Math.random() - 0.5) * 25;
            if (this.landToRot > 180) this.landToRot -= 360;
          } else if (this.targetType === 'edge') {
            this.landToRot = (Math.random() < 0.5 ? 180 : 0) + (Math.random() - 0.5) * 20;
            if (this.landToRot > 180) this.landToRot -= 360;
          } else {
            this.landToRot = (Math.random() < 0.5 ? 180 : 0) + (Math.random() - 0.5) * 30;
            if (this.landToRot > 180) this.landToRot -= 360;
          }
          this.landToScale = 0.42 + Math.random() * 0.15;
        }
        return;
      }

      // ── FLY: smooth steering tanpa clamp (bebas keluar viewport) ──
      if (!this.targetEl) { this.pickNewTarget(); return; }
      const tp = this.getTargetPos();
      if (!tp) { this.pickNewTarget(); return; }
      const dx = tp.x - this.x;
      const dy = tp.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 95) {
        this.state = 'hover';
        this.hoverStart = now;
        this.hoverDuration = 1500 + Math.random() * 1300;
        return;
      }

      // Reynolds steering
      const desiredVx = (dx / dist) * this.maxSpeed;
      const desiredVy = (dy / dist) * this.maxSpeed;
      this.vx += (desiredVx - this.vx) * dt * 2.0;
      this.vy += (desiredVy - this.vy) * dt * 2.0;

      const sp = Math.hypot(this.vx, this.vy);
      if (sp > this.maxSpeed) {
        this.vx = (this.vx / sp) * this.maxSpeed;
        this.vy = (this.vy / sp) * this.maxSpeed;
      }

      const wobX = Math.sin(now / 260 + this.wobblePhase) * 10;
      const wobY = Math.cos(now / 310 + this.wobblePhase) * 7;
      this.x += this.vx * dt + wobX * dt;
      this.y += this.vy * dt + wobY * dt;

      // ★ NO CLAMP — lalat boleh terbang ke mana saja (termasuk keluar viewport)

      // Rotation follow velocity
      const targetRot = Math.atan2(this.vy, this.vx) * 180 / Math.PI;
      this.rotation = lerpAngle(this.rotation, targetRot, Math.min(1, dt * 5));

      // Depth swing during flight
      const flyScale = 0.6 + 0.5 * (0.5 + 0.5 * Math.sin(now / 950 + this.depthPhase));
      this.scale += (flyScale - this.scale) * dt * 1.8;
    }

    render() {
      let flipX = 1;
      let tilt = this.rotation;
      if (this.rotation > 90 || this.rotation < -90) {
        flipX = -1;
        if (this.rotation > 90) tilt = 180 - this.rotation;
        else tilt = -180 - this.rotation;
      }
      tilt = Math.max(-42, Math.min(42, tilt));

      this.el.style.transform =
        `translate(${this.x}px, ${this.y}px) ` +
        `scaleX(${flipX}) ` +
        `rotate(${tilt}deg) ` +
        `scale(${this.scale})`;
    }
  }

  const flyObjects = [];
  flyEls.forEach((el, i) => flyObjects.push(new Fly(el, i)));

  // ─── BSF CHAT BUBBLE — klik lalat → muncul info BSF (balon kecil) ──────────
  const BSF_FACTS = [
    'Halo! Aku larva <b class="bsf-bubble-name">Black Soldier Fly</b> (<i>Hermetia illucens</i>) 🪰. Dalam 24 jam aku bisa melahap limbah organik berkali-kali lipat berat tubuhku!',
    'Tahu nggak? Aku <b class="bsf-bubble-name">nggak menularkan penyakit</b> sama sekali. Beda dari lalat rumah, aku nggak hinggap di makananmu & nggak bawa bakteri.',
    'Tubuhku mengandung sampai <b class="bsf-bubble-name">40-45% protein</b> & 30% lemak — makanya aku jadi pakan favorit ayam, ikan, dan udang 🐟',
    'Kotoranku disebut <b class="bsf-bubble-name">kasgot</b> (bekas maggot) — pupuk organik super yang bisa kurangi sampai 50% pupuk kimia 🌱',
    'Aku bekerja <b class="bsf-bubble-name">24/7 tanpa henti</b> mengurai limbah pabrik. Hasilnya? Zero residu ke TPA!',
    'Saat jadi lalat dewasa, aku cuma hidup ±1 minggu dan <b class="bsf-bubble-name">nggak makan</b> — tugasku cuma bertelur untuk generasi berikutnya 🥚',
    'Dari limbah jadi maggot, kasgot, sampai bio oil — aku ini <b class="bsf-bubble-name">mesin daur ulang alami</b> buat industri FMCG! ♻️',
    'Siklus hidupku lengkap cuma <b class="bsf-bubble-name">±40-45 hari</b>: telur → larva → prepupa → pupa → lalat dewasa. Cepat banget, kan?',
    'Sekali kawin, induk betina bisa bertelur <b class="bsf-bubble-name">500-900 butir</b> sekaligus. Bayangin berapa banyak pelahap limbah baru! 🥚',
    'Aku paling rakus & produktif di suhu <b class="bsf-bubble-name">27-30°C</b> dengan kelembapan hangat — persis iklim tropis Indonesia 🌴',
    'Menu makanku luas: <b class="bsf-bubble-name">sisa makanan, ampas, sludge IPAL, sampai limbah pasar</b>. Pemakan segala yang ramah lingkungan! 🍂',
    'Aku memangkas emisi: limbah yang biasanya membusuk & lepas <b class="bsf-bubble-name">gas metana</b> aku ubah jadi produk bernilai. Turun ~90% CO₂!',
    'Cangkang prepupa-ku kaya <b class="bsf-bubble-name">chitin & chitosan</b> — bahan bernilai untuk industri farmasi & kosmetik 💊',
    'Minyak dari tubuhku (<b class="bsf-bubble-name">bio oil BSF</b>) kaya asam laurat — booster pakan ternak yang bikin lebih sehat 💧',
    'Di site Instech, setiap suapanku dipantau <b class="bsf-bubble-name">IoT realtime</b>: suhu, berat pakan, & hasil panen semua tercatat untuk laporan PROPER & ESG 📊',
  ];
  let factIdx = Math.floor(Math.random() * BSF_FACTS.length);
  let talkingFly = null;
  let bubbleTimer = null;

  const bubble = document.createElement('div');
  bubble.id = 'bsf-bubble';
  bubble.innerHTML =
    '<button class="bsf-bubble-close" aria-label="Tutup">&times;</button>' +
    '<div class="bsf-bubble-row"><span class="bsf-bubble-ava">🪰</span>' +
    '<p class="bsf-bubble-text"></p></div>';
  document.body.appendChild(bubble);
  const bubbleText = bubble.querySelector('.bsf-bubble-text');

  function positionBubble() {
    if (!talkingFly) return;
    const r = talkingFly.el.getBoundingClientRect();
    const bw = bubble.offsetWidth || 240;
    const bh = bubble.offsetHeight || 90;
    let left = r.left + r.width / 2 - bw / 2;
    left = Math.max(12, Math.min(window.innerWidth - bw - 12, left));
    let top = r.top - bh - 14;
    if (top < 12) { top = r.bottom + 14; bubble.classList.add('below'); }
    else bubble.classList.remove('below');
    bubble.style.left = left + 'px';
    bubble.style.top = top + 'px';
  }

  function hideBubble() {
    bubble.classList.remove('show');
    if (talkingFly) {
      talkingFly.talking = false;
      talkingFly.el.classList.remove('resting');
      talkingFly = null;
    }
    clearTimeout(bubbleTimer);
  }

  function showBubbleFor(fly) {
    if (talkingFly && talkingFly !== fly) {
      talkingFly.talking = false;
      talkingFly.el.classList.remove('resting');
    }
    talkingFly = fly;
    fly.talking = true;
    fly.el.classList.add('resting');
    bubbleText.innerHTML = BSF_FACTS[factIdx % BSF_FACTS.length];
    factIdx++;
    bubble.classList.add('show');
    positionBubble();
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(hideBubble, 11000);
  }

  flyObjects.forEach(fly => {
    fly.el.addEventListener('click', (e) => {
      e.stopPropagation();
      showBubbleFor(fly);
    });
  });
  bubble.addEventListener('click', (e) => e.stopPropagation());
  bubble.querySelector('.bsf-bubble-close').addEventListener('click', hideBubble);
  document.addEventListener('click', hideBubble);

  let lastTime = performance.now();
  function loop(now) {
    const dt = Math.min(0.04, (now - lastTime) / 1000);
    lastTime = now;
    for (const f of flyObjects) {
      f.update(dt, now);
      f.render();
    }
    if (talkingFly) positionBubble();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
