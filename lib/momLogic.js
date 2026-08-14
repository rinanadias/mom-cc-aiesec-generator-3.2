import { ROLE_ORDER, STAFF } from "./people";

// Ambil data lengkap staff (title, role) dari nama.
function findStaff(name) {
  return STAFF.find((s) => s.name === name);
}

/**
 * Susun attendance list sesuai urutan template:
 * General Notetaker (paling atas) -> staff lain urut hierarki role -> EP (paling bawah)
 *
 * @param {string} notetakerName - nama yang dipilih sebagai General Notetaker
 * @param {string[]} attendeeNames - nama-nama staff lain yang hadir (bukan notetaker)
 * @param {string[]} epNames - nama-nama EP yang hadir
 * @returns {Array<{name: string, title: string, isPresent: boolean}>}
 */
export function buildAttendanceList(notetakerName, attendeeNames, epNames) {
  const rows = [];

  // 1. General Notetaker selalu di paling atas
  if (notetakerName) {
    rows.push({
      name: notetakerName,
      title: "General Notetaker",
      isPresent: true,
    });
  }

  // 2. Attendee lain, disortir dari role tertinggi ke terendah
  const attendeesWithData = attendeeNames
    .map((name) => findStaff(name))
    .filter(Boolean)
    .sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role));

  attendeesWithData.forEach((staff) => {
    rows.push({
      name: staff.name,
      title: staff.title,
      isPresent: true,
    });
  });

  // 3. EP selalu di paling bawah
  epNames.forEach((name) => {
    rows.push({
      name,
      title: "Exchange Participant",
      isPresent: true,
    });
  });

  return rows;
}

/**
 * Tentukan 3 penandatangan sesuai urutan kiri -> tengah -> kanan:
 * role tertinggi yang HADIR -> General Notetaker -> EP
 *
 * @param {string} notetakerName
 * @param {string[]} attendeeNames - staff lain yang hadir (bukan notetaker)
 * @param {string[]} epNames
 * @returns {{ left: {name, title}, middle: {name, title}, right: {name, title} }}
 */
export function determineSigners(notetakerName, attendeeNames, epNames) {
  const attendeesWithData = attendeeNames
    .map((name) => findStaff(name))
    .filter(Boolean)
    .sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role));

  // Kalau notetaker sendiri juga punya role staff (misal Dreama jadi notetaker tapi
  // dia juga Team Member), dia tetap dihitung sebagai General Notetaker, bukan attendee biasa,
  // jadi highest role diambil dari attendeeNames yang BUKAN notetaker.
  const highest = attendeesWithData[0]; // sudah urut dari role tertinggi

  const left = highest
    ? { name: highest.name, title: highest.title }
    : // fallback: kalau nggak ada attendee lain sama sekali selain notetaker,
      // posisi kiri diisi notetaker juga tidak masuk akal -> kosongkan title generik
      { name: "-", title: "-" };

  const middle = { name: notetakerName || "-", title: "General Notetaker" };

  const right = {
    name: epNames[0] || "-",
    title: "Exchange Participant",
  };

  return { left, middle, right };
}
