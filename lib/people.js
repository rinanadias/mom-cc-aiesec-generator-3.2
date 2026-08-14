// =====================================================================
// DAFTAR ORANG — edit di sini kalau ada pergantian kepengurusan / EP baru
// Nggak perlu ubah file lain, cukup tambah/hapus/edit baris di bawah.
// =====================================================================

// Urutan role dari yang PALING TINGGI ke PALING RENDAH.
// Dipakai untuk nyortir attendance list & nentuin siapa yang ttd di posisi kiri.
// Kalau ada role baru, tambahin ke sini sesuai urutan hierarkinya.
export const ROLE_ORDER = [
  "LCVP",
  "Team Leader",
  "Team Member",
];

// Staff yang bisa jadi General Notetaker ATAU Attendee (LCVP/Team Leader/Team Member).
// "role" harus salah satu dari ROLE_ORDER di atas persis (case-sensitive).
export const STAFF = [
  {
    name: "Syarifaziva Alika Wulandari",
    title: "LCVP of Outgoing Global Talent",
    role: "LCVP",
  },
  {
    name: "Rina Nadia Salsabila",
    title: "Team Leader of Quality and Customer Experience",
    role: "Team Leader",
  },
  {
    name: "Dreama Jesica",
    title: "Team Member of Quality and Customer Experience",
    role: "Team Member",
  },
  {
    name: "Rona Mary Sibuea",
    title: "Team Member of Quality and Customer Experience",
    role: "Team Member",
  },
];

// Daftar EP (Exchange Participant) yang bisa dipilih di form.
export const EPS = [
  { name: "Zesiro Danendra" },
  { name: "Cecilia Natasha Putri" },
  { name: "Esther Kuntari Putri" },
  { name: "Honi Hari Putri" },
  { name: "Ridwan Satrio Hadikusuma" },
  { name: "Farsya Izzati Widodo" },
  { name: "Nandya Fadilla" },
];
