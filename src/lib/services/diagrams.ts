/**
 * Business diagram generator — creates SVG diagrams for PPTX slides.
 * Programmatic SVG (no AI) for pixel-perfect, consistent output.
 */

interface DiagramColors {
  accent: string;
  accentLight: string;
  bg: string;
  text: string;
  muted: string;
}

export type DiagramType = "timeline" | "process" | "comparison" | "metrics" | "pyramid" | "funnel";

export function generateDiagramSvg(
  type: DiagramType,
  items: string[],
  colors: DiagramColors,
  title?: string
): string {
  switch (type) {
    case "timeline":
      return timelineDiagram(items, colors, title);
    case "process":
      return processDiagram(items, colors, title);
    case "comparison":
      return comparisonDiagram(items, colors, title);
    case "metrics":
      return metricsDiagram(items, colors, title);
    case "pyramid":
      return pyramidDiagram(items, colors, title);
    case "funnel":
      return funnelDiagram(items, colors, title);
    default:
      return processDiagram(items, colors, title);
  }
}

function timelineDiagram(items: string[], c: DiagramColors, title?: string): string {
  const w = 800, h = 300;
  const padding = 60;
  const lineY = title ? 160 : 140;
  const spacing = (w - padding * 2) / Math.max(items.length - 1, 1);

  let nodes = "";
  items.forEach((item, i) => {
    const x = padding + i * spacing;
    const isTop = i % 2 === 0;
    const textY = isTop ? lineY - 50 : lineY + 65;
    const lineToNode = isTop ? lineY - 20 : lineY + 20;

    nodes += `
      <line x1="${x}" y1="${lineY}" x2="${x}" y2="${lineToNode}" stroke="${c.accent}" stroke-width="2" />
      <circle cx="${x}" cy="${lineY}" r="8" fill="${c.accent}" />
      <circle cx="${x}" cy="${lineY}" r="4" fill="${c.bg}" />
      <text x="${x}" y="${textY}" text-anchor="middle" fill="${c.text}" font-family="Arial" font-size="12" font-weight="600">
        ${escSvg(item.length > 25 ? item.slice(0, 25) + "..." : item)}
      </text>
    `;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
    <rect width="${w}" height="${h}" fill="${c.bg}" rx="12" />
    ${title ? `<text x="${w / 2}" y="40" text-anchor="middle" fill="${c.text}" font-family="Arial" font-size="18" font-weight="700">${escSvg(title)}</text>` : ""}
    <line x1="${padding}" y1="${lineY}" x2="${w - padding}" y2="${lineY}" stroke="${c.accent}" stroke-width="3" stroke-linecap="round" />
    ${nodes}
  </svg>`;
}

function processDiagram(items: string[], c: DiagramColors, title?: string): string {
  const w = 800, h = 250;
  const boxW = 130, boxH = 60;
  const startY = title ? 100 : 80;
  const totalWidth = items.length * boxW + (items.length - 1) * 40;
  const startX = (w - totalWidth) / 2;

  let boxes = "";
  items.forEach((item, i) => {
    const x = startX + i * (boxW + 40);

    // Box with rounded corners
    boxes += `
      <rect x="${x}" y="${startY}" width="${boxW}" height="${boxH}" rx="10" fill="${c.accent}22" stroke="${c.accent}" stroke-width="2" />
      <text x="${x + boxW / 2}" y="${startY + boxH / 2 + 5}" text-anchor="middle" fill="${c.text}" font-family="Arial" font-size="11" font-weight="600">
        ${escSvg(item.length > 18 ? item.slice(0, 18) + "..." : item)}
      </text>
      <text x="${x + boxW / 2}" y="${startY - 12}" text-anchor="middle" fill="${c.muted}" font-family="Arial" font-size="10">Step ${i + 1}</text>
    `;

    // Arrow between boxes
    if (i < items.length - 1) {
      const arrowX = x + boxW + 5;
      const arrowY = startY + boxH / 2;
      boxes += `
        <line x1="${arrowX}" y1="${arrowY}" x2="${arrowX + 30}" y2="${arrowY}" stroke="${c.accent}" stroke-width="2" marker-end="url(#arrow)" />
      `;
    }
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
    <defs>
      <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
        <path d="M0,0 L10,5 L0,10 Z" fill="${c.accent}" />
      </marker>
    </defs>
    <rect width="${w}" height="${h}" fill="${c.bg}" rx="12" />
    ${title ? `<text x="${w / 2}" y="40" text-anchor="middle" fill="${c.text}" font-family="Arial" font-size="18" font-weight="700">${escSvg(title)}</text>` : ""}
    ${boxes}
  </svg>`;
}

function comparisonDiagram(items: string[], c: DiagramColors, title?: string): string {
  const w = 800, h = 300;
  const half = Math.ceil(items.length / 2);
  const leftItems = items.slice(0, half);
  const rightItems = items.slice(half);
  const startY = title ? 80 : 50;

  let content = "";

  // Left column header
  content += `<text x="200" y="${startY}" text-anchor="middle" fill="${c.accent}" font-family="Arial" font-size="14" font-weight="700">BEFORE</text>`;
  content += `<line x1="80" y1="${startY + 10}" x2="320" y2="${startY + 10}" stroke="${c.accent}44" stroke-width="1" />`;

  leftItems.forEach((item, i) => {
    const y = startY + 35 + i * 35;
    content += `
      <circle cx="90" cy="${y}" r="4" fill="${c.accent}" opacity="0.5" />
      <text x="105" y="${y + 4}" fill="${c.muted}" font-family="Arial" font-size="12">${escSvg(item)}</text>
    `;
  });

  // Divider
  content += `<line x1="400" y1="${startY - 10}" x2="400" y2="${h - 30}" stroke="${c.accent}" stroke-width="2" stroke-dasharray="6,4" />`;

  // Right column header
  content += `<text x="600" y="${startY}" text-anchor="middle" fill="${c.accentLight}" font-family="Arial" font-size="14" font-weight="700">AFTER</text>`;
  content += `<line x1="480" y1="${startY + 10}" x2="720" y2="${startY + 10}" stroke="${c.accentLight}44" stroke-width="1" />`;

  rightItems.forEach((item, i) => {
    const y = startY + 35 + i * 35;
    content += `
      <circle cx="490" cy="${y}" r="4" fill="${c.accentLight}" />
      <text x="505" y="${y + 4}" fill="${c.text}" font-family="Arial" font-size="12" font-weight="600">${escSvg(item)}</text>
    `;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
    <rect width="${w}" height="${h}" fill="${c.bg}" rx="12" />
    ${title ? `<text x="${w / 2}" y="35" text-anchor="middle" fill="${c.text}" font-family="Arial" font-size="18" font-weight="700">${escSvg(title)}</text>` : ""}
    ${content}
  </svg>`;
}

function metricsDiagram(items: string[], c: DiagramColors, title?: string): string {
  const w = 800, h = 250;
  const cols = Math.min(items.length, 4);
  const cardW = 160, cardH = 100;
  const totalW = cols * cardW + (cols - 1) * 20;
  const startX = (w - totalW) / 2;
  const startY = title ? 80 : 60;

  let cards = "";
  items.slice(0, 4).forEach((item, i) => {
    const x = startX + i * (cardW + 20);
    const parts = item.split(":").map((s) => s.trim());
    const value = parts[0] || item;
    const label = parts[1] || "";

    cards += `
      <rect x="${x}" y="${startY}" width="${cardW}" height="${cardH}" rx="10" fill="${c.accent}15" stroke="${c.accent}44" stroke-width="1" />
      <text x="${x + cardW / 2}" y="${startY + 45}" text-anchor="middle" fill="${c.accent}" font-family="Arial" font-size="28" font-weight="800">${escSvg(value)}</text>
      ${label ? `<text x="${x + cardW / 2}" y="${startY + 70}" text-anchor="middle" fill="${c.muted}" font-family="Arial" font-size="11">${escSvg(label)}</text>` : ""}
    `;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
    <rect width="${w}" height="${h}" fill="${c.bg}" rx="12" />
    ${title ? `<text x="${w / 2}" y="40" text-anchor="middle" fill="${c.text}" font-family="Arial" font-size="18" font-weight="700">${escSvg(title)}</text>` : ""}
    ${cards}
  </svg>`;
}

function pyramidDiagram(items: string[], c: DiagramColors, title?: string): string {
  const w = 800, h = 320;
  const startY = title ? 70 : 40;
  const levels = items.length;
  const maxW = 500, levelH = 45;

  let shapes = "";
  items.forEach((item, i) => {
    const ratio = (i + 1) / levels;
    const lw = maxW * ratio;
    const x = (w - lw) / 2;
    const y = startY + i * levelH;
    const opacity = 1 - i * 0.15;

    shapes += `
      <rect x="${x}" y="${y}" width="${lw}" height="${levelH - 5}" rx="6" fill="${c.accent}" opacity="${opacity}" />
      <text x="${w / 2}" y="${y + (levelH - 5) / 2 + 5}" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="600">${escSvg(item)}</text>
    `;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
    <rect width="${w}" height="${h}" fill="${c.bg}" rx="12" />
    ${title ? `<text x="${w / 2}" y="35" text-anchor="middle" fill="${c.text}" font-family="Arial" font-size="18" font-weight="700">${escSvg(title)}</text>` : ""}
    ${shapes}
  </svg>`;
}

function funnelDiagram(items: string[], c: DiagramColors, title?: string): string {
  const w = 800, h = 300;
  const startY = title ? 65 : 35;
  const levels = items.length;
  const maxW = 600, levelH = 42;

  let shapes = "";
  items.forEach((item, i) => {
    const ratio = 1 - (i * 0.7) / levels;
    const lw = maxW * ratio;
    const x = (w - lw) / 2;
    const y = startY + i * levelH;
    const opacity = 1 - i * 0.12;

    shapes += `
      <rect x="${x}" y="${y}" width="${lw}" height="${levelH - 6}" rx="8" fill="${c.accent}" opacity="${opacity}" />
      <text x="${w / 2}" y="${y + (levelH - 6) / 2 + 5}" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="600">${escSvg(item)}</text>
    `;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
    <rect width="${w}" height="${h}" fill="${c.bg}" rx="12" />
    ${title ? `<text x="${w / 2}" y="35" text-anchor="middle" fill="${c.text}" font-family="Arial" font-size="18" font-weight="700">${escSvg(title)}</text>` : ""}
    ${shapes}
  </svg>`;
}

function escSvg(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * Convert SVG string to PNG buffer for PPTX embedding
 */
export async function svgToBuffer(svg: string): Promise<Buffer> {
  return Buffer.from(svg, "utf-8");
}
