// Konfigurasi Tailwind bersama — dipakai semua halaman.
// Kombinasi Warna page 11 — Cool Blue Steel Palette
tailwind.config = {
  theme: {
    extend: {
      colors: {
        navy:  '#0C3049',  // Dark Navy   (terkuat)
        slate: '#44607A',  // Slate Blue  (mid-dark)
        steel: '#7797AC',  // Desaturated Steel (mid)
        mist:  '#D9DCDE',  // Light Cool Grey (paling terang)
        teal:  '#7797AC',  // alias = steel
        cream: '#D3CEC8',  // Soft Cream
        brown: '#6C4734',  // Earthy Brown
        leaf:  '#44607A'   // alias = slate
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  }
};
