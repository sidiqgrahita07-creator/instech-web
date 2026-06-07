/*
  layout.js — komponen bersama semua halaman:
  - Navbar (dropdown desktop + menu mobile) dengan deteksi halaman aktif
  - Footer 4 kolom
  - Stage animasi lalat BSF (disuntik ke #site-bsf)
  Dijalankan SEBELUM app.js supaya elemen nav/lalat sudah ada saat app.js mengikat event.
*/
(function () {
  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  // ─── Struktur Menu ────────────────────────────────────────────────────────
  const MENU = [
    { label: 'Beranda', href: 'index.html' },
    { label: 'Perusahaan', children: [
      { label: 'Tentang Kami',  href: 'tentang.html' },
      { label: 'Tim Kami',      href: 'tim.html' },
      { label: 'Nilai & Budaya',href: 'nilai.html' },
      { label: 'Mitra & Klien', href: 'mitra.html' },
    ]},
    { label: 'Solusi', children: [
      { label: 'Sistem Biokonversi',  href: 'sistem.html' },
      { label: 'Layanan',             href: 'layanan.html' },
      { label: 'Proses Implementasi', href: 'implementasi.html' },
      { label: 'Dampak Terukur',      href: 'dampak.html' },
    ]},
    { label: 'Produk', children: [
      { label: 'Semua Produk',           href: 'produk.html' },
      { label: 'Maggot Segar',           href: 'produk-maggot.html',  icon: '🐛' },
      { label: 'Biofertilizer (Kasgot)', href: 'produk-kasgot.html',  icon: '🌱' },
      { label: 'Tepung Protein BSF',     href: 'produk-tepung.html',  icon: '🌾' },
      { label: 'Bio Oil BSF',            href: 'produk-biooil.html',  icon: '💧' },
    ]},
    { label: 'FAQ', href: 'faq.html' },
  ];

  // ─── Navbar desktop ───────────────────────────────────────────────────────
  function deskLinks() {
    return MENU.map(item => {
      if (!item.children) {
        const act = item.href === current ? ' nav-top-active' : '';
        return `<a href="${item.href}" class="nav-top hover:text-steel transition${act}">${item.label}</a>`;
      }
      const childAct = item.children.some(c => c.href === current);
      const items = item.children.map(c => {
        const a = c.href === current ? ' class="active"' : '';
        return `<a href="${c.href}"${a}>${c.icon ? c.icon + ' ' : ''}${c.label}</a>`;
      }).join('');
      return `<div class="nav-group">
        <button type="button" class="nav-trigger flex items-center gap-1 hover:text-steel transition${childAct ? ' nav-top-active' : ''}">
          ${item.label}
          <svg class="nav-caret w-3 h-3" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="nav-menu">${items}</div>
      </div>`;
    }).join('');
  }

  // ─── Navbar mobile (flatten + heading grup) ───────────────────────────────
  function mobileLinks() {
    let html = MENU.map(item => {
      if (!item.children) {
        const act = item.href === current ? ' text-steel' : ' text-navy';
        return `<a href="${item.href}" class="block px-6 py-3 font-bold${act}">${item.label}</a>`;
      }
      const kids = item.children.map(c => {
        const act = c.href === current ? ' text-steel' : ' text-navy/75';
        return `<a href="${c.href}" class="block px-8 py-2.5 text-sm font-semibold${act}">${c.icon ? c.icon + ' ' : ''}${c.label}</a>`;
      }).join('');
      return `<div class="border-t border-navy/5">
        <div class="px-6 pt-3 pb-1 text-[11px] font-black tracking-widest text-steel">${item.label.toUpperCase()}</div>
        ${kids}
      </div>`;
    }).join('');
    html += `<a href="kontak.html" class="block m-4 mt-5 text-center bg-navy text-cream font-bold py-3 rounded-lg">Konsultasi</a>`;
    return html;
  }

  const navHTML = `
  <nav class="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-b border-navy/10">
    <div class="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
      <a href="index.html" class="flex items-center gap-2">
        <img src="assets/logo-instech.png" alt="Instech" class="h-9">
      </a>
      <div class="hidden md:flex items-center gap-6 text-sm font-semibold">
        ${deskLinks()}
      </div>
      <div class="flex items-center gap-2">
        <a href="kontak.html" class="hidden md:inline-block bg-navy text-cream text-sm font-bold px-4 py-2 rounded-lg hover:bg-steel transition">Konsultasi</a>
        <button id="navHamburger" class="md:hidden w-10 h-10 grid place-items-center rounded-lg hover:bg-navy/5 transition" aria-label="Buka menu">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
        </button>
      </div>
    </div>
    <div id="navMobile" class="md:hidden bg-white border-t border-navy/10 max-h-0 overflow-hidden transition-[max-height] duration-300 ease-out">
      <div class="py-2">${mobileLinks()}</div>
    </div>
  </nav>`;

  // ─── Footer ───────────────────────────────────────────────────────────────
  const footerHTML = `
  <footer class="bg-navy text-mist/70 pt-14 pb-8">
    <div class="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-8">
      <div>
        <img src="assets/logo-instech.png" alt="Instech" class="h-9 bg-cream rounded-lg p-1 mb-4">
        <p class="text-sm text-mist/70 leading-relaxed">Zero Industrial Solid Waste melalui biokonversi BSF untuk industri FMCG.</p>
        <p class="text-xs text-cream/50 mt-3">Inovasi Nusantara untuk Dunia</p>
      </div>
      <div>
        <div class="text-mist font-black text-sm mb-3">Perusahaan</div>
        <div class="flex flex-col gap-2 text-sm">
          <a href="tentang.html" class="hover:text-cream">Tentang Kami</a>
          <a href="tim.html" class="hover:text-cream">Tim Kami</a>
          <a href="nilai.html" class="hover:text-cream">Nilai & Budaya</a>
          <a href="mitra.html" class="hover:text-cream">Mitra & Klien</a>
        </div>
      </div>
      <div>
        <div class="text-mist font-black text-sm mb-3">Solusi & Produk</div>
        <div class="flex flex-col gap-2 text-sm">
          <a href="sistem.html" class="hover:text-cream">Sistem Biokonversi</a>
          <a href="layanan.html" class="hover:text-cream">Layanan</a>
          <a href="dampak.html" class="hover:text-cream">Dampak Terukur</a>
          <a href="produk.html" class="hover:text-cream">Produk Turunan</a>
        </div>
      </div>
      <div>
        <div class="text-mist font-black text-sm mb-3">Hubungi</div>
        <div class="flex flex-col gap-2 text-sm">
          <a href="mailto:instech.nusantara@gmail.com" class="hover:text-cream">instech.nusantara@gmail.com</a>
          <a href="https://www.instech.co.id" target="_blank" class="hover:text-cream">www.instech.co.id</a>
          <span class="text-mist/55">Delta Silicon, Cikarang, Jawa Barat</span>
          <a href="faq.html" class="hover:text-cream mt-1">FAQ</a>
        </div>
      </div>
    </div>
    <div class="max-w-6xl mx-auto px-6 mt-10 pt-6 border-t border-mist/10 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
      <div>© 2026 PT Instech Solusi Nusantara · a ZEKINDO company</div>
      <div class="text-cream/50">www.instech.co.id</div>
    </div>
  </footer>`;

  // ─── Stage Lalat BSF (egg trap + 4 lalat) ─────────────────────────────────
  const bsfHTML = `
  <div id="bsf-stage" aria-hidden="true">
    <svg id="bsf-wood" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
      <polygon points="5,115 5,25 12,18 12,108" fill="#3d2410"/>
      <polygon points="186,115 186,25 193,18 193,108" fill="#3d2410"/>
      <polygon points="12,18 193,18 186,25 5,25" fill="#5d3a1f"/>
      <rect x="12" y="25" width="174" height="83" fill="#8b5e3c"/>
      <rect x="12" y="27"  width="174" height="9" fill="#c9986d"/>
      <rect x="12" y="38"  width="174" height="9" fill="#a87a4f"/>
      <rect x="12" y="49"  width="174" height="9" fill="#c9986d"/>
      <rect x="12" y="60"  width="174" height="9" fill="#a87a4f"/>
      <rect x="12" y="71"  width="174" height="9" fill="#c9986d"/>
      <rect x="12" y="82"  width="174" height="9" fill="#a87a4f"/>
      <rect x="12" y="93"  width="174" height="9" fill="#c9986d"/>
      <rect x="12" y="36"  width="174" height="2" fill="#1f1208"/>
      <rect x="12" y="47"  width="174" height="2" fill="#1f1208"/>
      <rect x="12" y="58"  width="174" height="2" fill="#1f1208"/>
      <rect x="12" y="69"  width="174" height="2" fill="#1f1208"/>
      <rect x="12" y="80"  width="174" height="2" fill="#1f1208"/>
      <rect x="12" y="91"  width="174" height="2" fill="#1f1208"/>
      <rect x="12" y="102" width="174" height="2" fill="#1f1208"/>
      <polygon points="12,25 186,25 180,12 18,12" fill="#d4a675"/>
      <g fill="#f3d97c">
        <ellipse cx="50"  cy="37"  rx="14" ry="1" opacity="0.9"/>
        <ellipse cx="120" cy="48"  rx="18" ry="1" opacity="0.9"/>
        <ellipse cx="80"  cy="59"  rx="12" ry="1" opacity="0.9"/>
        <ellipse cx="140" cy="70"  rx="16" ry="1" opacity="0.9"/>
        <ellipse cx="60"  cy="81"  rx="14" ry="1" opacity="0.9"/>
        <ellipse cx="130" cy="92"  rx="12" ry="1" opacity="0.9"/>
        <ellipse cx="90"  cy="103" rx="10" ry="1" opacity="0.9"/>
      </g>
    </svg>

    <template id="bsf-svg-template">
      <svg viewBox="0 0 64 34" xmlns="http://www.w3.org/2000/svg">
        <g class="wings">
          <ellipse class="wing-far" cx="30" cy="14" rx="20" ry="4" fill="rgba(170,180,195,0.32)" stroke="rgba(60,70,80,0.25)" stroke-width="0.25"/>
          <ellipse class="wing-near" cx="32" cy="13" rx="22" ry="5" fill="rgba(190,200,210,0.5)" stroke="rgba(60,70,80,0.4)" stroke-width="0.3"/>
        </g>
        <ellipse cx="14" cy="20" rx="14" ry="5" fill="#000" opacity="0.35" transform="translate(0.3, 0.6)"/>
        <ellipse cx="14" cy="20" rx="14" ry="5" fill="#0a0a0a"/>
        <path d="M 4 18 Q 14 16.3, 26 18.2" stroke="#3a3a48" stroke-width="0.7" fill="none" opacity="0.75"/>
        <path d="M 4 22 Q 14 23.5, 26 22" stroke="#000" stroke-width="0.5" fill="none" opacity="0.55"/>
        <ellipse cx="18" cy="20" rx="3" ry="1.4" fill="#e8e8ec" opacity="0.9"/>
        <ellipse cx="36" cy="17.5" rx="7.5" ry="5.5" fill="#000" opacity="0.45"/>
        <ellipse cx="36" cy="17" rx="7" ry="5" fill="#0e1014"/>
        <ellipse cx="34" cy="14.5" rx="4.5" ry="2.2" fill="#1a3540" opacity="0.75"/>
        <ellipse cx="50" cy="18" rx="5.5" ry="5" fill="#000" opacity="0.45"/>
        <ellipse cx="50" cy="17.5" rx="5" ry="4.5" fill="#0a0a0a"/>
        <ellipse cx="51" cy="16.5" rx="3.8" ry="3.3" fill="#3a1414"/>
        <ellipse cx="51.5" cy="16" rx="1.3" ry="1" fill="#1a0606"/>
        <ellipse cx="50.3" cy="15" rx="1.2" ry="0.5" fill="#7a3030" opacity="0.8"/>
        <path d="M 53 14 Q 57 9, 60 5 Q 61 4, 61.5 3" stroke="#0a0a0a" stroke-width="0.7" fill="none" stroke-linecap="round"/>
        <g stroke="#0a0a0a" stroke-width="0.65" fill="none" stroke-linecap="round">
          <path d="M 16 24 L 13 31 L 13 33"/>
          <path d="M 24 24 L 22 31 L 23 33"/>
          <path d="M 32 23 L 32 30 L 33 32"/>
        </g>
        <g class="legs-front" stroke="#0a0a0a" stroke-width="0.65" fill="none" stroke-linecap="round">
          <path d="M 42 22 L 45 28 L 46 30"/>
          <path d="M 44 22 L 47 27 L 49 28"/>
        </g>
      </svg>
    </template>

    <div class="fly fly-1"></div>
    <div class="fly fly-2"></div>
    <div class="fly fly-3"></div>
    <div class="fly fly-4"></div>
  </div>`;

  // ─── Inject ke placeholder ────────────────────────────────────────────────
  const navMount = document.getElementById('site-nav');
  const footMount = document.getElementById('site-footer');
  const bsfMount = document.getElementById('site-bsf');
  if (navMount)  navMount.innerHTML  = navHTML;
  if (footMount) footMount.innerHTML = footerHTML;
  if (bsfMount)  bsfMount.innerHTML  = bsfHTML;

  // Isi tiap .fly dengan SVG dari template
  const tpl = document.getElementById('bsf-svg-template');
  if (tpl) {
    const svg = tpl.content.querySelector('svg').outerHTML;
    document.querySelectorAll('.fly').forEach(f => f.innerHTML = svg);
  }

  // Toggle menu mobile
  const burger = document.getElementById('navHamburger');
  const mobile = document.getElementById('navMobile');
  if (burger && mobile) {
    burger.addEventListener('click', () => {
      const open = mobile.style.maxHeight && mobile.style.maxHeight !== '0px';
      mobile.style.maxHeight = open ? '0px' : mobile.scrollHeight + 'px';
    });
  }
})();
