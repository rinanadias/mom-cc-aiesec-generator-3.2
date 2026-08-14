"use client";

import { useState } from "react";
import { STAFF, EPS } from "@/lib/people";

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function emptySubtopic() {
  return { subtopic: "", bullets: [""] };
}
function emptyTopic() {
  return { topic: "", subtopics: [emptySubtopic()] };
}

export default function Home() {
  const [epName, setEpName] = useState("");
  const [notetakerName, setNotetakerName] = useState("");
  const [attendeeNames, setAttendeeNames] = useState([]);

  const [day, setDay] = useState(DAYS[0]);
  const [dateNum, setDateNum] = useState("");
  const [month, setMonth] = useState(MONTHS[0]);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [zoomLink, setZoomLink] = useState("");

  const [topics, setTopics] = useState([emptyTopic()]);
  const [results, setResults] = useState([""]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleAttendee(name) {
    setAttendeeNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }

  // ---- Topic / Subtopic / Bullet handlers ----
  function updateTopicText(ti, value) {
    setTopics((prev) => prev.map((t, i) => (i === ti ? { ...t, topic: value } : t)));
  }
  function addTopic() {
    setTopics((prev) => [...prev, emptyTopic()]);
  }
  function removeTopic(ti) {
    setTopics((prev) => prev.filter((_, i) => i !== ti));
  }
  function updateSubtopicText(ti, si, value) {
    setTopics((prev) =>
      prev.map((t, i) =>
        i !== ti
          ? t
          : {
              ...t,
              subtopics: t.subtopics.map((s, j) =>
                j === si ? { ...s, subtopic: value } : s
              ),
            }
      )
    );
  }
  function addSubtopic(ti) {
    setTopics((prev) =>
      prev.map((t, i) => (i === ti ? { ...t, subtopics: [...t.subtopics, emptySubtopic()] } : t))
    );
  }
  function removeSubtopic(ti, si) {
    setTopics((prev) =>
      prev.map((t, i) =>
        i === ti ? { ...t, subtopics: t.subtopics.filter((_, j) => j !== si) } : t
      )
    );
  }
  function updateBullet(ti, si, bi, value) {
    setTopics((prev) =>
      prev.map((t, i) =>
        i !== ti
          ? t
          : {
              ...t,
              subtopics: t.subtopics.map((s, j) =>
                j !== si
                  ? s
                  : { ...s, bullets: s.bullets.map((b, k) => (k === bi ? value : b)) }
              ),
            }
      )
    );
  }
  function addBullet(ti, si) {
    setTopics((prev) =>
      prev.map((t, i) =>
        i !== ti
          ? t
          : {
              ...t,
              subtopics: t.subtopics.map((s, j) =>
                j === si ? { ...s, bullets: [...s.bullets, ""] } : s
              ),
            }
      )
    );
  }
  function removeBullet(ti, si, bi) {
    setTopics((prev) =>
      prev.map((t, i) =>
        i !== ti
          ? t
          : {
              ...t,
              subtopics: t.subtopics.map((s, j) =>
                j !== si ? s : { ...s, bullets: s.bullets.filter((_, k) => k !== bi) }
              ),
            }
      )
    );
  }

  // ---- Meeting result handlers ----
  function updateResult(i, value) {
    setResults((prev) => prev.map((r, idx) => (idx === i ? value : r)));
  }
  function addResult() {
    setResults((prev) => [...prev, ""]);
  }
  function removeResult(i) {
    setResults((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  }

  function validate() {
    if (!epName) return "Pilih EP.";
    if (!notetakerName) return "Pilih General Notetaker.";
    if (!dateNum || !startTime || !endTime) return "Lengkapi tanggal & jam meeting.";
    return "";
  }

  async function handleGenerate() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setLoading(true);

    const payload = {
      epNames: [epName],
      notetakerName,
      attendeeNames,
      date: { day, date: dateNum, month, year },
      time: { start: startTime, end: endTime },
      zoomLink,
      topics,
      results,
      photoDataUrl: photoPreview,
    };

    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Gagal generate PDF");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `MoM_${epName}_${dateNum}${month}${year}.pdf`.replace(/\s+/g, "");
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      // Arahkan ke Sign.com di tab baru
      window.open("https://sign.com", "_blank");
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat generate PDF.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#1479DB] text-white px-6 py-5 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto">
          <div className="text-xs font-semibold tracking-wide uppercase opacity-80">
            AIESEC in Universitas Indonesia
          </div>
          <h1 className="text-xl font-bold mt-0.5">MoM Check-In Call Generator</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* EP */}
        <Section title="Exchange Participant" number="1" hint="Pilih 1">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {EPS.map((ep) => (
              <label
                key={ep.name}
                className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 text-sm cursor-pointer hover:border-[#1479DB] has-[:checked]:border-[#1479DB] has-[:checked]:bg-blue-50"
              >
                <input
                  type="radio"
                  name="ep"
                  checked={epName === ep.name}
                  onChange={() => setEpName(ep.name)}
                />
                <span className="text-slate-700">{ep.name}</span>
              </label>
            ))}
          </div>
        </Section>

        {/* General Notetaker */}
        <Section title="General Notetaker" number="2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {STAFF.map((s) => (
              <label
                key={s.name}
                className="flex items-start gap-2 border border-slate-200 rounded-lg px-3 py-2 cursor-pointer hover:border-[#1479DB] has-[:checked]:border-[#1479DB] has-[:checked]:bg-blue-50"
              >
                <input
                  type="radio"
                  name="notetaker"
                  className="mt-1"
                  checked={notetakerName === s.name}
                  onChange={() => setNotetakerName(s.name)}
                />
                <span>
                  <div className="text-sm font-medium text-slate-800">{s.name}</div>
                  <div className="text-xs text-slate-500">{s.title}</div>
                </span>
              </label>
            ))}
          </div>
        </Section>

        {/* Attendee lain */}
        <Section title="Attendee Lain yang Hadir" number="3" hint="Selain General Notetaker & EP">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {STAFF.filter((s) => s.name !== notetakerName).map((s) => (
              <Checkbox
                key={s.name}
                label={`${s.name} — ${s.title}`}
                checked={attendeeNames.includes(s.name)}
                onChange={() => toggleAttendee(s.name)}
              />
            ))}
          </div>
        </Section>

        {/* Info meeting */}
        <Section title="Info Meeting" number="4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <SelectField label="Hari" value={day} onChange={setDay} options={DAYS} />
            <InputField label="Tanggal" value={dateNum} onChange={setDateNum} placeholder="12" />
            <SelectField label="Bulan" value={month} onChange={setMonth} options={MONTHS} />
            <InputField label="Tahun" value={year} onChange={setYear} placeholder="2026" />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <InputField label="Jam Mulai (WIB)" value={startTime} onChange={setStartTime} placeholder="19.00" />
            <InputField label="Jam Selesai (WIB)" value={endTime} onChange={setEndTime} placeholder="20.00" />
          </div>
          <InputField label="Link Zoom" value={zoomLink} onChange={setZoomLink} placeholder="https://zoom.us/j/..." />
        </Section>

        {/* Meeting process */}
        <Section title="Meeting Process" number="5">
          <div className="space-y-4">
            {topics.map((t, ti) => (
              <div key={ti} className="border border-slate-200 rounded-lg p-4 bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm font-semibold"
                    placeholder={`Topic ${ti + 1}`}
                    value={t.topic}
                    onChange={(e) => updateTopicText(ti, e.target.value)}
                  />
                  {topics.length > 1 && (
                    <RemoveBtn onClick={() => removeTopic(ti)} />
                  )}
                </div>

                {t.subtopics.map((s, si) => (
                  <div key={si} className="ml-4 mb-3 pl-3 border-l-2 border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        className="flex-1 border border-slate-300 rounded px-3 py-1.5 text-sm"
                        placeholder={`Sub-topic ${si + 1} (opsional)`}
                        value={s.subtopic}
                        onChange={(e) => updateSubtopicText(ti, si, e.target.value)}
                      />
                      {t.subtopics.length > 1 && (
                        <RemoveBtn onClick={() => removeSubtopic(ti, si)} small />
                      )}
                    </div>
                    {s.bullets.map((b, bi) => (
                      <div key={bi} className="flex items-center gap-2 mb-1.5 ml-3">
                        <span className="text-slate-400">•</span>
                        <input
                          className="flex-1 border border-slate-300 rounded px-3 py-1.5 text-sm"
                          placeholder="Bullet point"
                          value={b}
                          onChange={(e) => updateBullet(ti, si, bi, e.target.value)}
                        />
                        {s.bullets.length > 1 && (
                          <RemoveBtn onClick={() => removeBullet(ti, si, bi)} small />
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addBullet(ti, si)}
                      className="ml-3 text-xs text-[#1479DB] font-medium mt-1"
                    >
                      + Tambah bullet
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addSubtopic(ti)}
                  className="ml-4 text-xs text-[#1479DB] font-medium"
                >
                  + Tambah sub-topic
                </button>
              </div>
            ))}
            <button
              onClick={addTopic}
              className="text-sm text-[#1479DB] font-semibold border border-dashed border-[#1479DB] rounded-lg px-4 py-2 w-full hover:bg-blue-50"
            >
              + Tambah Topic
            </button>
          </div>
        </Section>

        {/* Meeting result */}
        <Section title="Meeting Result" number="6">
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">{i + 1}.</span>
                <input
                  className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm"
                  placeholder="Poin kesimpulan"
                  value={r}
                  onChange={(e) => updateResult(i, e.target.value)}
                />
                {results.length > 1 && <RemoveBtn onClick={() => removeResult(i)} small />}
              </div>
            ))}
            <button onClick={addResult} className="text-xs text-[#1479DB] font-medium">
              + Tambah poin
            </button>
          </div>
        </Section>

        {/* Photo */}
        <Section title="Foto Dokumentasi" number="7">
          <input type="file" accept="image/*" onChange={handlePhotoChange} className="text-sm" />
          {photoPreview && (
            <img src={photoPreview} alt="preview" className="mt-3 rounded-lg border max-h-52 object-cover" />
          )}
        </Section>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-[#1479DB] hover:bg-[#0f63b3] disabled:opacity-60 text-white font-semibold rounded-lg py-3 text-sm transition"
        >
          {loading ? "Membuat PDF..." : "Generate PDF & Lanjut ke Sign.com"}
        </button>
      </main>
    </div>
  );
}

function Section({ title, number, hint, children }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-[#1479DB] font-bold text-sm">{number}.</span>
        <h2 className="font-semibold text-slate-800">{title}</h2>
        {hint && <span className="text-xs text-slate-400">({hint})</span>}
      </div>
      {children}
    </section>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 text-sm cursor-pointer hover:border-[#1479DB] has-[:checked]:border-[#1479DB] has-[:checked]:bg-blue-50">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="text-slate-700">{label}</span>
    </label>
  );
}

function InputField({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-500 mb-1 block">{label}</span>
      <input
        className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-500 mb-1 block">{label}</span>
      <select
        className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function RemoveBtn({ onClick, small }) {
  return (
    <button
      onClick={onClick}
      className={`text-red-500 hover:text-red-700 flex-shrink-0 ${small ? "text-xs" : "text-sm"}`}
      title="Hapus"
      type="button"
    >
      ✕
    </button>
  );
}
