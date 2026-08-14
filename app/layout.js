import "./globals.css";

export const metadata = {
  title: "MoM Check-In Call Generator | AIESEC in UI",
  description: "Generator MoM Check-In Call untuk Outgoing Global Talent AIESEC in Universitas Indonesia",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
