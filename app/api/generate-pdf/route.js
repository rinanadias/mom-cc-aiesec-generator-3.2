import { NextResponse } from "next/server";
import { buildMomHtml } from "@/lib/buildHtml";

export const runtime = "nodejs";
export const maxDuration = 60;

async function getBrowser() {
  // Di Vercel (production/serverless) pakai chromium yang di-bundle @sparticuz/chromium.
  // Di lokal (development, ada Chrome/Chromium ter-install), pakai itu langsung biar cepat.
  const chromium = (await import("@sparticuz/chromium")).default;
  const puppeteer = await import("puppeteer-core");

  const isLocalDev = process.env.NODE_ENV === "development" && process.env.CHROME_PATH;

  const executablePath = isLocalDev
    ? process.env.CHROME_PATH
    : await chromium.executablePath();

  return puppeteer.launch({
    args: chromium.args,
    executablePath,
    headless: true,
  });
}

export async function POST(req) {
  try {
    const data = await req.json();
    const html = buildMomHtml(data);

    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });
    await browser.close();

    const epLabel = (data.epNames || []).join("_").replace(/\s+/g, "");
    const fileName = `MoM_${epLabel || "CheckIn"}_${data.date?.date || ""}${data.date?.month || ""}${data.date?.year || ""}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err) {
    console.error("PDF generation failed:", err);
    return NextResponse.json(
      { error: "Gagal generate PDF", detail: String(err?.message || err) },
      { status: 500 }
    );
  }
}
