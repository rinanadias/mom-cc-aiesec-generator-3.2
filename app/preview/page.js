import { buildMomHtml } from "@/lib/buildHtml";

export default function PreviewPage() {
  const samplePhotoUrl = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='350' viewBox='0 0 600 350'><rect width='600' height='350' fill='%231e1e1e'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff' font-family='sans-serif' font-size='24'>Dokumentasi Zoom Meeting</text></svg>";

  const dummyData = {
    epNames: ["Nandya Fadilla"],
    notetakerName: "Rona Mary Sibuea",
    attendeeNames: ["Syarifaziva Alika Wulandari", "Dreama Jesica"],
    date: { day: "Senin", date: "12", month: "Januari", year: "2026" },
    time: { start: "07.00", end: "09.00" },
    zoomLink: "hhhhhhhhhhhhhhhhhhhhhhhhhhhhh",
    topics: [
      {
        topic: "ajjjjjjjjjjjjjjjjjjjjjjjj",
        subtopics: [
          {
            subtopic: "ajjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj",
            bullets: [
              "ajjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj",
              "ajjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj"
            ]
          }
        ]
      }
    ],
    results: [
      "ahahahahahahahahahahhaha",
      "ahhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh hhhhhhhhhhhhhhhhhhhhhhhhhhhhh hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh hhhhhhhhhhhhhhhhhhhhhhhhhhhhh hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh"
    ],
    photoDataUrl: samplePhotoUrl
  };

  // Murni mengambil HTML asli tanpa tambahan CSS luar
  const htmlContent = buildMomHtml(dummyData);

  return (
    <iframe
      srcDoc={htmlContent}
      style={{
        width: "100vw",
        height: "100vh",
        border: "none",
        margin: 0,
        padding: 0
      }}
    />
  );
}