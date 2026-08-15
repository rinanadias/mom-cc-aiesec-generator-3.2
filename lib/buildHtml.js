import { buildAttendanceList, determineSigners } from "./momLogic";
import { AIESEC_LOGO_BASE64 } from "./logoBase64";

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderMeetingProcess(topics) {
  // topics: [{ topic, subtopics: [{ subtopic, bullets: [string] }] }]
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
    date, // { day, date, month, year }
    time, // { start, end }
    zoomLink,
    topics, // [{ topic, subtopics:[{subtopic, bullets:[]}] }]
    results, // [string]
    photoDataUrl, // base64 image string
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

<!-- Link Font Lato dari Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">

<style>
  @page { 
    size: A4; 
    margin: 0; 
  }

  /* Mencegah teks meluber ke samping di seluruh bagian dokumen */
  * {
    box-sizing: border-box;
    overflow-wrap: break-word;
    word-break: break-word;
  }

  /* Memastikan sel tabel tidak melebar keluar batas */
  table {
    table-layout: fixed;
    width: 100%;
  }

  td, th {
    word-break: break-word;
    overflow-wrap: break-word;
  }

  body {
    font-family: 'Lato', Arial, sans-serif;
    color: #000;
    margin: 0;
    font-size: 11px;
    -webkit-print-color-adjust: exact;
  }

  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 1in; /* Margin standar 1 inci (25.4mm) */
    position: relative;
    page-break-after: always;
  }

  .page:last-child { 
    page-break-after: auto; 
  }

  /* ---------- COVER ---------- */
  .cover-logo {
    height: 55px;
    width: auto;
    display: block;
  }

  .cover-title-block { 
    text-align: right; 
    margin-top: 110mm; /* Presisi 11cm sesuai penggaris GDoc */
  }

  .cover-title {
    color: #00b0f0;
    font-size: 26px;
    font-weight: 400;
    line-height: 1.3;
    margin: 0 0 12px 0;
  }

  .cover-recorded {
    font-size: 14px;
    margin-top: 10px;
    line-height: 1.4;
  }

  .cover-recorded-name {
    font-weight: 400;
  }

  .cover-abstract-label {
    color: #00b0f0;
    font-size: 14px;
    font-weight: 700;
    margin-top: 38mm; /* Jarak 3.8cm dari Notetaker */
  }

  .cover-abstract {
    font-size: 9px;
    margin-top: 4px;
  }

  .cover-footer {
    position: absolute;
    bottom: 1in;
    right: 1in;
    text-align: right;
  }

  .cover-footer b { font-size: 12px; }
  .cover-footer div { font-size: 10px; color: #000000; }

  /* ---------- BODY PAGE ---------- */
  .doc-header {
    font-size: 10px;
    margin-bottom: 25px;
    text-align: right;
    font-style: italic;
    color: #00b0f0;
  }

  .doc-header .brand { 
    font-weight: 700; 
    font-style: normal; 
    color: #00b0f0; 
  }

  h2.section {
    color: #00b0f0;
    font-size: 14px;
    font-weight: 700;
    margin: 22px 0 10px 0;
  }

  table.grid {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 15px;
  }

  table.grid th, table.grid td {
    border: 1px solid #000;
    padding: 6px 8px;
    text-align: left;
    vertical-align: middle;
    font-size: 11px;
  }

  table.grid th { font-weight: 400; text-align: center; }
  td.check { text-align: center; width: 30px; }

  .kv-row { font-size: 11px; margin-bottom: 4px; }
  .kv-row .kv-label { display: inline-block; width: 140px; }

  .countdown-date { font-weight: 400; font-size: 11px; margin-bottom: 4px; }

  table.agenda { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
  table.agenda th, table.agenda td {
    border: 1px solid #000;
    padding: 6px 8px;
    text-align: left;
    vertical-align: top;
    font-size: 11px;
  }

  table.agenda th { text-align: center; font-weight: 400; }
  .agenda-no { width: 30px; text-align: center; }
  .agenda-topic { width: 110px; }
  .subtopic { margin-bottom: 8px; }
  .subtopic:last-child { margin-bottom: 0; }
  .subtopic-title { margin-bottom: 3px; font-weight: 600; }
  .bullets { margin: 0 0 4px 0; padding-left: 16px; }
  .bullets li { margin-bottom: 3px; }

  .results-intro { font-size: 11px; margin-bottom: 8px; }
  .results-list { padding-left: 18px; font-size: 11px; margin-top: 0; }
  .results-list li { margin-bottom: 4px; }

  .attest {
    font-size: 10.5px;
    margin-top: 18px;
    margin-bottom: 25px;
    line-height: 1.4;
  }

  .doc-photo-wrap { 
    text-align: center; 
    margin-top: 15px;
    margin-bottom: 30px; 
    width: 100%;
  }

  .doc-photo {
    width: 100%;
    max-height: 420px;
    object-fit: cover;
    border-radius: 2px;
  }

  table.sign-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }

  table.sign-table td {
    border: none;
    text-align: left;
    width: 33.33%;
    vertical-align: top;
    padding: 0 5px;
    font-size: 10.5px;
  }

  .sign-name { font-weight: 700; }
  .sign-role { font-style: italic; margin-top: 2px; font-size: 9.5px; color: #444; }
</style>
</head>
<body>

  <!-- ===================== COVER PAGE ===================== -->
  <div class="page">
    <img class="cover-logo" src="${AIESEC_LOGO_BASE64}" alt="AIESEC" />
    <div class="cover-title-block">
      <div class="cover-title">${escapeHtml(epName)}'s Check-In Call<br/>MINUTES OF MEETING</div>
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

  <!-- ===================== BODY PAGE ===================== -->
  <div class="page">
    <div class="doc-header">${runningHeader}</div>

    <h2 class="section">1. Attendance List</h2>
    <table class="grid">
      <thead><tr><th>Name</th><th>Title/ Functional</th><th></th></tr></thead>
      <tbody>${attendanceRows}</tbody>
    </table>

    <h2 class="section">2. Meeting Location</h2>
    <div class="kv-row"><span class="kv-label">Building</span>: -</div>
    <div class="kv-row"><span class="kv-label">Conference Room</span>: Zoom Meeting</div>
    <div class="kv-row"><span class="kv-label">Conference Line</span>: ${escapeHtml(zoomLink)}</div>
    <div class="kv-row"><span class="kv-label">Web Address</span>: -</div>

    <h2 class="section">3. Meeting Countdown</h2>
    <div class="countdown-date">${escapeHtml(date.day)}, ${escapeHtml(date.date)} ${escapeHtml(date.month)} ${escapeHtml(date.year)}</div>
    <div class="kv-row"><span class="kv-label">Meeting Schedule Start</span>: ${escapeHtml(time.start)} WIB</div>
    <div class="kv-row"><span class="kv-label">Meeting Schedule End</span>: ${escapeHtml(time.end)} WIB</div>

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
        : `<div class="doc-photo-wrap" style="color:#999; font-size:11px;">[Foto dokumentasi belum diupload]</div>`
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
  </div>

</body>
</html>`;
}