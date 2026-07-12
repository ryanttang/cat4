import QRCode from "qrcode";

type GenerateAmbassadorCardInput = {
  name: string;
  territory?: string | null;
  qrUrl: string;
  vanityUrl: string;
  photoUrl?: string | null;
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function generateAmbassadorCardPng(
  input: GenerateAmbassadorCardInput
): Promise<Buffer> {
  const qrSvg = await QRCode.toString(input.qrUrl, {
    type: "svg",
    margin: 1,
    width: 360,
  });

  const qrInner = qrSvg.replace(/<\?xml[^>]*\?>/, "").replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "");

  const subtitle = input.territory ? `CAT4 Ambassador · ${input.territory}` : "CAT4 Brand Ambassador";
  const displayUrl = input.vanityUrl.replace(/^https?:\/\//, "");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
  <rect width="1080" height="1080" fill="#0B1220"/>
  <rect x="60" y="60" width="960" height="960" rx="48" fill="#111827" stroke="#2563EB" stroke-width="4"/>
  <text x="540" y="180" text-anchor="middle" fill="#60A5FA" font-family="Arial, sans-serif" font-size="42" font-weight="700">CAT4</text>
  <text x="540" y="280" text-anchor="middle" fill="#F8FAFC" font-family="Arial, sans-serif" font-size="52" font-weight="700">${escapeXml(input.name)}</text>
  <text x="540" y="340" text-anchor="middle" fill="#94A3B8" font-family="Arial, sans-serif" font-size="28">${escapeXml(subtitle)}</text>
  <g transform="translate(360, 390)">
    <rect width="360" height="360" fill="#FFFFFF" rx="24"/>
    ${qrInner}
  </g>
  <text x="540" y="840" text-anchor="middle" fill="#CBD5E1" font-family="Arial, sans-serif" font-size="24">Scan to connect</text>
  <text x="540" y="890" text-anchor="middle" fill="#60A5FA" font-family="Arial, sans-serif" font-size="30">${escapeXml(displayUrl)}</text>
</svg>`;

  const sharp = (await import("sharp")).default;
  return sharp(Buffer.from(svg)).png().toBuffer();
}
