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

<!-- Font Lato dari Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">

<style>
  @page { 
    size: A4; 
    margin: 1in; /* Margin 1 inci langsung ditangani PDF printer */
  }

  * {
    box-sizing: border-box;
    overflow-wrap: break-word;
    word-break: break-word;
  }

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
    font-size: 11pt;
    line-height: 1.3;
    -webkit-print-color-adjust: exact;
  }

  .page {
    width: 100%;
    min-height: 100vh;
    padding: 0;
    position: relative;
    page-break-after: always;
  }

  .page:last-child { 
    page-break-after: auto; 
  }

  /* ---------- COVER PAGE ---------- */
  .cover-logo {
    height: 40pt;
    width: auto;
    display: block;
  }

  .cover-title-block { 
    text-align: right; 
    margin-top: 210pt;
  }

  .cover-title {
    color: #00b0f0;
    font-size: 26pt;
    font-weight: 400;
    line-height: 1.25;
    margin: 0 0 10pt 0;
  }

  .cover-recorded {
    font-size: 12pt;
    margin-top: 12pt;
    line-height: 1.35;
  }

  .cover-recorded-name {
    font-weight: 400;
  }

  .cover-abstract-label {
    color: #00b0f0;
    font-size: 14pt;
    font-weight: 700;
    margin-top: 75pt;
  }

  .cover-abstract {
    font-size: 9.5pt;
    margin-top: 4pt;
  }

  .cover-footer {
    position: absolute;
    bottom: 0;
    right: 0;
    text-align: right;
  }

  .cover-footer b { font-size: 11.5pt; }
  .cover-footer div { font-size: 9.5pt; color: #000; }

  /* ---------- BODY PAGE ---------- */
  .doc-header {
    font-size: 9.5pt;
    margin-bottom: 20pt;
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
    font-size: 13.5pt;
    font-weight: 700;
    margin: 18pt 0 8pt 0;
  }

  table.grid {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 12pt;
  }

  table.grid th, table.grid td {
    border: 1px solid #000;
    padding: 5pt 7pt;
    text-align: left;
    vertical-align: middle;
    font-size: 10.5pt;
  }

  table.grid th { font-weight: 400; text-align: center; }
  td.check { text-align: center; width: 28pt; }

  .kv-row { font-size: 10.5pt; margin-bottom: 3pt; }
  .kv-row .kv-label { display: inline-block; width: 130pt; }

  .countdown-date { font-weight: 400; font-size: 10.5pt; margin-bottom: 3pt; }

  table.agenda { width: 100%; border-collapse: collapse; margin-bottom: 12pt; }
  table.agenda th, table.agenda td {
    border: 1px solid #000;
    padding: 5pt 7pt;
    text-align: left;
    vertical-align: top;
    font-size: 10.5pt;
  }

  table.agenda th { text-align: center; font-weight: 400; }
  .agenda-no { width: 28pt; text-align: center; }
  .agenda-topic { width: 95pt; }
  .subtopic { margin-bottom: 6pt; }
  .subtopic:last-child { margin-bottom: 0; }
  .subtopic-title { margin-bottom: 2pt; font-weight: 600; }
  .bullets { margin: 0 0 3pt 0; padding-left: 14pt; }
  .bullets li { margin-bottom: 2pt; }

  .results-intro { font-size: 10.5pt; margin-bottom: 6pt; }
  .results-list { padding-left: 16pt; font-size: 10.5pt; margin-top: 0; }
  .results-list li { margin-bottom: 3pt; }

  .attest {
    font-size: 10pt;
    margin-top: 15pt;
    margin-bottom: 20pt;
    line-height: 1.35;
  }

  .doc-photo-wrap { 
    text-align: center; 
    margin-top: 12pt;
    margin-bottom: 24pt; 
    width: 100%;
  }

  .doc-photo {
    width: 100%;
    max-height: 380pt;
    object-fit: cover;
  }

  table.sign-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 18pt;
  }

  table.sign-table td {
    border: none;
    text-align: left;
    width: 33.33%;
    vertical-align: top;
    padding: 0 4pt;
    font-size: 10pt;
  }

  .sign-name { font-weight: 700; }
  .sign-role { font-style: italic; margin-top: 2pt; font-size: 9pt; color: #444; }
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
  </div>

</body>
</html>`;
}