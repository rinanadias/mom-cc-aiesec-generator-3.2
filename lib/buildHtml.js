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
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body {
    font-family: Calibri, 'Segoe UI', Arial, sans-serif;
    color: #000;
    margin: 0;
    font-size: 12px;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 20mm 18mm;
    position: relative;
    page-break-after: always;
  }
  .page:last-child { page-break-after: auto; }

  /* ---------- COVER ---------- */
  .cover-logo {
    height: 46px;
    width: auto;
    margin-bottom: 160px;
    display: block;
  }
  .cover-title-block { text-align: right; margin-top: 240px; }
  .cover-title {
    color: #00B0F0;
    font-size: 27px;
    font-weight: 600;
    line-height: 1.35;
    margin: 0 0 10px 0;
  }
  .cover-recorded {
    font-size: 13px;
    margin-top: 14px;
  }
  .cover-recorded-name {
    font-weight: 600;
  }
  .cover-abstract-label {
    color: #00B0F0;
    font-size: 15px;
    font-weight: 700;
    margin-top: 70px;
  }
  .cover-abstract {
    font-size: 12px;
    margin-top: 6px;
  }
  .cover-footer {
    margin-top: 70px;
    text-align: right;
  }
  .cover-footer b { font-size: 13px; }
  .cover-footer div { font-size: 11px; color: #333; }

  /* ---------- BODY PAGE ---------- */
  .doc-header {
    font-size: 11px;
    padding-bottom: 8px;
    border-bottom: 1px solid #333;
    margin-bottom: 18px;
    text-align: center;
    font-style: italic;
    color: #00B0F0;
  }
  .doc-header .brand { font-weight: 700; font-style: normal; color: #000; }

  h2.section {
    color: #00B0F0;
    font-size: 16px;
    font-weight: 700;
    margin: 20px 0 10px 0;
  }

  table.grid {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 10px;
  }
  table.grid th, table.grid td {
    border: 1px solid #000;
    padding: 8px 10px;
    text-align: left;
    vertical-align: middle;
    font-size: 11.5px;
  }
  table.grid th { font-weight: 700; text-align: center; }
  td.check { text-align: center; width: 32px; }

  .kv-row { font-size: 11.5px; margin-bottom: 3px; }
  .kv-row .kv-label { display: inline-block; width: 145px; }

  .countdown-date { font-weight: 600; font-size: 11.5px; margin-bottom: 3px; }

  table.agenda { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
  table.agenda th, table.agenda td {
    border: 1px solid #000;
    padding: 8px 10px;
    text-align: left;
    vertical-align: top;
    font-size: 11.5px;
  }
  table.agenda th { text-align: center; font-weight: 700; }
  .agenda-no { width: 30px; text-align: center; }
  .agenda-topic { width: 100px; }
  .subtopic { margin-bottom: 10px; }
  .subtopic:last-child { margin-bottom: 0; }
  .subtopic-title { margin-bottom: 4px; }
  .bullets { margin: 0 0 4px 0; padding-left: 18px; }
  .bullets li { margin-bottom: 4px; }

  .results-intro { font-size: 11.5px; margin-bottom: 8px; }
  .results-list { padding-left: 20px; font-size: 11.5px; }
  .results-list li { margin-bottom: 5px; }

  .attest {
    font-size: 11.5px;
    margin-top: 16px;
    margin-bottom: 20px;
  }

  .doc-photo-wrap { text-align: center; margin-bottom: 30px; }
  .doc-photo {
    max-width: 320px;
    max-height: 220px;
    object-fit: cover;
  }

  table.sign-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 30px;
  }
  table.sign-table td {
    border: none;
    text-align: center;
    width: 33.33%;
    vertical-align: top;
    padding: 0 8px;
    font-size: 11.5px;
  }
  .sign-name { font-weight: 700; }
  .sign-role { font-style: italic; margin-top: 2px; }
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
