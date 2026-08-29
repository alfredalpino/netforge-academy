import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../public/icons");

const background = "#0c0f14";
const accent = "#3b82f6";
const foreground = "#e8eaed";

function buildSvg(size, maskable = false) {
  const padding = maskable ? Math.round(size * 0.2) : Math.round(size * 0.12);
  const inner = size - padding * 2;
  const radius = Math.round(inner * 0.18);
  const center = size / 2;
  const nodeRadius = inner * 0.08;
  const ringRadius = inner * 0.28;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${background}"/>
  <rect x="${padding}" y="${padding}" width="${inner}" height="${inner}" rx="${radius}" fill="#141820" stroke="${accent}" stroke-width="${Math.max(2, size * 0.012)}"/>
  <circle cx="${center}" cy="${center}" r="${ringRadius}" fill="none" stroke="${accent}" stroke-width="${Math.max(3, size * 0.018)}" opacity="0.85"/>
  <circle cx="${center - ringRadius * 0.55}" cy="${center - ringRadius * 0.2}" r="${nodeRadius}" fill="${foreground}"/>
  <circle cx="${center + ringRadius * 0.55}" cy="${center - ringRadius * 0.2}" r="${nodeRadius}" fill="${foreground}"/>
  <circle cx="${center}" cy="${center + ringRadius * 0.65}" r="${nodeRadius}" fill="${accent}"/>
  <line x1="${center - ringRadius * 0.55}" y1="${center - ringRadius * 0.2}" x2="${center + ringRadius * 0.55}" y2="${center - ringRadius * 0.2}" stroke="${foreground}" stroke-width="${Math.max(2, size * 0.01)}" opacity="0.7"/>
  <line x1="${center - ringRadius * 0.55}" y1="${center - ringRadius * 0.2}" x2="${center}" y2="${center + ringRadius * 0.65}" stroke="${foreground}" stroke-width="${Math.max(2, size * 0.01)}" opacity="0.7"/>
  <line x1="${center + ringRadius * 0.55}" y1="${center - ringRadius * 0.2}" x2="${center}" y2="${center + ringRadius * 0.65}" stroke="${foreground}" stroke-width="${Math.max(2, size * 0.01)}" opacity="0.7"/>
  <text x="${center}" y="${padding + inner * 0.22}" text-anchor="middle" fill="${foreground}" font-family="system-ui, sans-serif" font-size="${Math.round(size * 0.11)}" font-weight="700">NF</text>
</svg>`;
}

async function writePng(name, size, maskable = false) {
  const svg = buildSvg(size, maskable);
  const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
  await fs.writeFile(path.join(outDir, name), buffer);
}

await fs.mkdir(outDir, { recursive: true });
await writePng("icon-192.png", 192);
await writePng("icon-512.png", 512);
await writePng("icon-maskable-512.png", 512, true);
console.log("Generated PWA icons in public/icons");
