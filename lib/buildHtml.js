import { buildAttendanceList, determineSigners } from "./momLogic";
import { AIESEC_LOGO_BASE64 } from "./logoBase64";

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderMeetingProcess(topics) {
  return topics
    .map((t, i) => {
      const subtopicHtml = t.subtopics
        .map((st) => {
          const bulletsHtml = st.bullets
            .filter((b) => b.trim())
            .map((b) => `<li>${escapeHtml(b)}</li>`)
            .join("");
          return `
            <div class="subtopic">
              ${st.subtopic ? `<div class="subtopic-title">${escapeHtml(st.subtopic)}</div>` : ""}
              <ul class="bullets">${bulletsHtml}</ul>
            </div>`;
        })
        .join("");

      return `
        <tr>
          <td class="agenda-no">${i + 2}</td>
          <td class="agenda-topic">${escapeHtml(t.topic)}</td>
          <td class="agenda-details">${subtopicHtml}</td>
        </tr>`;
    })
    .join("");
}

export function buildMomHtml(data) {
  const {
    epNames,
    notetakerName,
    attendeeNames,
    date,
    time,
    zoomLink,
    topics,
    results,
    photoDataUrl,
  } = data;

  const epName = epNames[0] || "";
  const attendance = buildAttendanceList(notetakerName, attendeeNames, epNames);
  const signers = determineSigners(notetakerName, attendeeNames, epNames);

  const attendanceRows = attendance
    .map(
      (a) => `
      <tr>
        <td>${escapeHtml(a.name)}</td>
        <td>${escapeHtml(a.title)}</td>
        <td class="check">${a.isPresent ? "V" : ""}</td>
      </tr>`
    )
    .join("");
  const resultsHtml = results
    .filter((r) => r.trim())
    .map((r) => `<li>${escapeHtml(r)}</li>`)
    .join("");

  const runningHeader = `${escapeHtml(epName)}'s Check-In Call MINUTES OF MEETING <span class="brand">| AIESEC in Universitas Indonesia</span>`;

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">

<style>
  * {
    box-sizing: border-box;
  }

  body {
    font-family: 'Lato', Arial, sans-serif;
    color: #000;
    margin: 0;
    padding: 0;
    font-size: 11pt;
    line-height: 1.3;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* ---------- BASE PAGE LAYOUT (A4 KUNCI MUTLAK) ---------- */
  .page {
    width: 210mm;
    height: 297mm;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    padding: 1in;
    background: #ffffff;
    page-break-after: always;
    break-after: page;
  }

  .page:last-child {
    page-break-after: auto;
    break-after: auto;
  }

  /* ---------- TAMPILAN SCREEN / PREVIEW BROWSER ---------- */
  @media screen {
    body {
      background-color: #525659;
      padding: 30px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .page {
      margin-bottom: 30px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
    }
  }

  /* ---------- SETUP HALAMAN CETAK/PDF ---------- */
  @page {
    size: A4 portrait;
    margin: 0;
  }

  @media print {
    body {
      background: none;
    }
    .page {
      box-shadow: none;
    }
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  td, th {
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  /* ---------- COVER PAGE ---------- */
  .cover-logo {
    height: 40pt;
    width: auto;
    position: absolute;
    top: 0.3in;
    left: 0.3in;
  }

  .cover-title-block { 
    text-align: right; 
    margin-top: 278pt;
    margin-right: -31pt;
  }

  .cover-title {
    color: #00b0f0;
    font-size: 26pt;
    font-weight: 400;
    line-height: 1.1;
    margin: 0 0 10pt 0;
    word-break: break-word;
  }

  .cover-subtitle {
    display: block;
    margin-top: 15pt;
  }

  .cover-recorded {
    font-size: 14pt;
    margin-top: 6pt;
    line-height: 1.7;
  }

  .cover-recorded-name {
    font-weight: 400;
  }

  .cover-abstract-label {
    color: #00b0f0;
    font-size: 14pt;
    font-weight: 700;
    margin-top: 82pt;
  }

  .cover-abstract {
    font-size: 9.5pt;
    margin-top: 7pt;
    word-break: break-word;
  }

  .cover-footer {
    position: absolute;
    bottom: 2.3in;
    right: 0.6in;
    text-align: right;
  }

  .cover-footer b { font-size: 13pt; display: block; }
  .cover-footer div { font-size: 9.5pt; color: #000; }

  /* ---------- BODY PAGES ---------- */
  .doc-header {
    font-size: 10.5pt;
    position: absolute;
    top: 0.5in;
    right: 0.98in;
    text-align: right;
    font-style: italic;
    color: #00b0f0;
    word-break: break-word;
  }

  .doc-header .brand { 
    font-weight: 700; 
    font-style: normal; 
    color: #00b0f0; 
  }

  /* NOMOR HALAMAN POJOK KANAN BAWAH */
  .doc-footer-page {
    position: absolute;
    bottom: 0.6in;
    right: 0.98in;
    font-size: 32pt;
    font-weight: 400;
    color: #00b0f0;
    line-height: 1;
  }

  /* STANDAR JARAK SEMUA JUDUL SECTION KE KONTEN BAWAHNYA */
  h2.section {
    color: #00b0f0;
    font-size: 13.5pt;
    font-weight: 700;
    margin-top: 18pt;
    margin-bottom: 8pt;
  }

  .page > h2.section:first-of-type {
    margin-top: 0;
  }

  table.grid {
    width: 96%;
    margin-bottom: 14pt;
    margin-top: 0;
    position: relative;
    top: auto;
    margin-left: 14pt;
    line-height: 1.5;
  }

  table.grid th, table.grid td {
    border: 1px solid #000;
    padding: 5pt 7pt;
    text-align: left;
    vertical-align: middle;
    font-size: 10.5pt;
  }

  table.grid th { font-weight: 400; text-align: center; }
  td.check { text-align: center; width: 35px; }

  .kv-table {
    width: 100%;
    margin-bottom: 14pt;
    margin-left: 14pt;
    transform: none;
  }

  .kv-table td {
    padding: 2pt 0;
    font-size: 10.5pt;
    vertical-align: top;
  }

  .kv-table .kv-label {
    width: 160px;
    white-space: nowrap;
  }

  .kv-table .kv-sep {
    width: 15px;
  }

  .kv-table .kv-val {
    word-break: break-all;
    overflow-wrap: anywhere;
  }

  .countdown-date { 
    font-weight: 400; 
    font-size: 10.5pt; 
    margin-bottom: 4pt; 
    margin-top: 0; 
    margin-left: 14pt; 
  }

  table.agenda { 
    width: 96%; 
    margin-bottom: 14pt; 
    margin-left: 14pt; 
    margin-top: 0; 
  }
  
  table.agenda th, table.agenda td {
    border: 1px solid #000;
    padding: 5pt 7pt;
    text-align: left;
    vertical-align: top;
    font-size: 10.5pt;
  }

  table.agenda th { text-align: center; font-weight: 400; }
  .agenda-no { width: 45px; text-align: center; }
  .agenda-topic { width: 120px; word-break: break-word; }
  .agenda-details { word-break: break-all; overflow-wrap: anywhere; }

  .subtopic { margin-bottom: 6pt; }
  .subtopic:last-child { margin-bottom: 0; }
  .subtopic-title { margin-bottom: 2pt; font-weight: 600; word-break: break-word; }
  .bullets { margin: 0 0 3pt 0; padding-left: 14pt; }
  .bullets li { margin-bottom: 2pt; word-break: break-all; overflow-wrap: anywhere; }

  .results-intro { 
    font-size: 10.5pt; 
    margin-bottom: 6pt; 
    margin-left: 14pt; 
    margin-top: 0; 
  }
  .results-list { padding-left: 16pt; font-size: 10.5pt; margin-top: 0; margin-left: 14pt; }
  .results-list li { margin-bottom: 3pt; word-break: break-all; overflow-wrap: anywhere; }

  .attest {
    font-size: 10pt;
    margin-top: 15pt;
    margin-bottom: 20pt;
    line-height: 1.35;
    margin-left: 14pt;
  }

  .doc-photo-wrap { 
    text-align: center; 
    margin-top: 12pt;
    margin-bottom: 24pt; 
    width: 100%;
    margin-left: 14pt;
  }

  .doc-photo {
    width: 100%;
    max-height: 380pt;
    object-fit: cover;
  }

  table.sign-table {
    width: 100%;
    margin-top: 18pt;
    margin-left: 14pt;
  }

  table.sign-table td {
    border: none;
    text-align: left;
    width: 33.33%;
    vertical-align: top;
    padding: 0 4pt;
    font-size: 10pt;
  }

  .sign-name { font-weight: 700; word-break: break-word; }
  .sign-role { font-style: italic; margin-top: 2pt; font-size: 9pt; color: #444; word-break: break-word; }
</style>
</head>
<body>

  <!-- ===================== PAGE 1: COVER ===================== -->
  <div class="page">
    <img class="cover-logo" src="${AIESEC_LOGO_BASE64}" alt="AIESEC" />
    <div class="cover-title-block">
      <div class="cover-title">
        ${escapeHtml(epName)}'s Check-In Call<br/>
        <span class="cover-subtitle">MINUTES OF MEETING</span>
      </div>
      <div class="cover-recorded">
        Recorded by:<br/>
        <span class="cover-recorded-name">${escapeHtml(notetakerName)}</span>
      </div>
      <div class="cover-abstract-label">Abstract</div>
      <div class="cover-abstract">${escapeHtml(epName)}'s Check-In Call, ${escapeHtml(date.date)} ${escapeHtml(date.month)} ${escapeHtml(date.year)}</div>
    </div>
    <div class="cover-footer">
      <b>AIESEC in Universitas Indonesia</b>
      <div>makara@aiesec.net</div>
    </div>
  </div>

  <!-- ===================== PAGE 2: MAIN CONTENT (PAGE 1) ===================== -->
  <div class="page">
    <div class="doc-header">${runningHeader}</div>

    <h2 class="section">1. Attendance List</h2>
    <table class="grid">
      <thead><tr><th>Name</th><th>Title/ Functional</th><th></th></tr></thead>
      <tbody>${attendanceRows}</tbody>
    </table>

    <h2 class="section">2. Meeting Location</h2>
    <table class="kv-table">
      <tr>
        <td class="kv-label">Building</td>
        <td class="kv-sep">:</td>
        <td class="kv-val">-</td>
      </tr>
      <tr>
        <td class="kv-label">Conference Room</td>
        <td class="kv-sep">:</td>
        <td class="kv-val">Zoom Meeting</td>
      </tr>
      <tr>
        <td class="kv-label">Conference Line</td>
        <td class="kv-sep">:</td>
        <td class="kv-val">${escapeHtml(zoomLink)}</td>
      </tr>
      <tr>
        <td class="kv-label">Web Address</td>
        <td class="kv-sep">:</td>
        <td class="kv-val">-</td>
      </tr>
    </table>

    <h2 class="section">3. Meeting Countdown</h2>
    <div class="countdown-date">${escapeHtml(date.day)}, ${escapeHtml(date.date)} ${escapeHtml(date.month)} ${escapeHtml(date.year)}</div>
    <table class="kv-table">
      <tr>
        <td class="kv-label">Meeting Schedule Start</td>
        <td class="kv-sep">:</td>
        <td class="kv-val">${escapeHtml(time.start)} WIB</td>
      </tr>
      <tr>
        <td class="kv-label">Meeting Schedule End</td>
        <td class="kv-sep">:</td>
        <td class="kv-val">${escapeHtml(time.end)} WIB</td>
      </tr>
    </table>

    <h2 class="section">4. Meeting Process</h2>
    <table class="agenda">
      <thead><tr><th class="agenda-no">No.</th><th class="agenda-topic">Agenda</th><th>Details</th></tr></thead>
      <tbody>
        <tr>
          <td class="agenda-no">1</td>
          <td class="agenda-topic">Opening</td>
          <td><ul class="bullets"><li>Introduction of all participants</li></ul></td>
        </tr>
        ${renderMeetingProcess(topics)}
        <tr>
          <td class="agenda-no">${topics.length + 2}</td>
          <td class="agenda-topic">Closing</td>
          <td><ul class="bullets"><li>The meeting was documented and concluded with an expression of gratitude.</li></ul></td>
        </tr>
      </tbody>
    </table>

    <!-- NOMOR HALAMAN 1 -->
    <div class="doc-footer-page">1</div>
  </div>

  <!-- ===================== PAGE 3: RESULTS & SIGNATURES (PAGE 2) ===================== -->
  <div class="page">
    <div class="doc-header">${runningHeader}</div>

    <h2 class="section">5. Meeting Result</h2>
    <div class="results-intro">The meeting has the conclusion and meet the resolution which consist of,</div>
    <ol class="results-list">${resultsHtml}</ol>

    <div class="attest">
      We, the signature bearers, proclaim that AIESEC in Universitas Indonesia Meeting has happened on
      ${escapeHtml(date.day)}, ${escapeHtml(date.date)} ${escapeHtml(date.month)} ${escapeHtml(date.year)}, in Zoom Meeting.
    </div>

    ${
      photoDataUrl
        ? `<div class="doc-photo-wrap"><img class="doc-photo" src="${photoDataUrl}" /></div>`
        : `<div class="doc-photo-wrap" style="color:#999; font-size:10pt;">[Foto dokumentasi belum diupload]</div>`
    }

    <table class="sign-table">
      <tr>
        <td>
          <div class="sign-name">${escapeHtml(signers.left.name)}</div>
          <div class="sign-role">${escapeHtml(signers.left.title)}</div>
        </td>
        <td>
          <div class="sign-name">${escapeHtml(signers.middle.name)}</div>
          <div class="sign-role">General Note Taker</div>
        </td>
        <td>
          <div class="sign-name">${escapeHtml(signers.right.name)}</div>
          <div class="sign-role">Exchange Participant</div>
        </td>
      </tr>
    </table>

    <!-- NOMOR HALAMAN 2 -->
    <div class="doc-footer-page">2</div>
  </div>

</body>
</html>`;
}