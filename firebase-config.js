/*
  ─────────────────────────────────────────────────────────────────────────────
  KONFIGURASI FIREBASE — GANTI nilai di bawah dengan punya kamu.
  ─────────────────────────────────────────────────────────────────────────────
  Cara dapat:
   1. Buka https://console.firebase.google.com → Add project (mis. "instech")
   2. Authentication → Get started → tab "Sign-in method" → aktifkan
      "Email/Password" → Save
   3. Project settings (⚙️) → "Your apps" → klik ikon Web (</>) → daftarkan
      app (mis. "instech-web") → SALIN object firebaseConfig → tempel di sini.
   4. Authentication → Settings → Authorized domains → Add domain:
      sidiqgrahita07-creator.github.io
   5. Authentication → Users → Add user (buat akun untuk tiap orang yang boleh login)

  CATATAN: nilai-nilai ini BUKAN rahasia — aman ada di kode publik. Keamanan
  ditegakkan oleh Firebase (authorized domains + akun + rules), bukan oleh
  menyembunyikan apiKey.
  ─────────────────────────────────────────────────────────────────────────────
*/
const firebaseConfig = {
  apiKey: "GANTI_APIKEY",
  authDomain: "GANTI_PROJECT.firebaseapp.com",
  projectId: "GANTI_PROJECT",
  storageBucket: "GANTI_PROJECT.appspot.com",
  messagingSenderId: "GANTI_SENDERID",
  appId: "GANTI_APPID"
};

// URL dashboard tujuan setelah login berhasil
const DASHBOARD_URL = "https://sidiqgrahita07-creator.github.io/instech-dashboard/";
