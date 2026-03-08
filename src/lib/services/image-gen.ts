import { GoogleGenerativeAI } from "@google/generative-ai";

// ---------------------------------------------------------------------------
// Google Gemini client
// ---------------------------------------------------------------------------

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

// ---------------------------------------------------------------------------
// generateSlideImage
// ---------------------------------------------------------------------------

/**
 * Generate an image for a presentation slide using Gemini image generation.
 * Returns a Buffer containing the image data, or null on failure.
 */
export async function generateSlideImage(
  prompt: string
): Promise<Buffer | null> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        // @ts-expect-error - responseModalities is valid for image generation
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    const result = await model.generateContent(
      `Generate a professional, high-quality presentation slide image for: ${prompt}. ` +
        "The image should be clean, modern, and suitable for a business presentation. " +
        "Use a 16:9 aspect ratio composition. No text overlays."
    );

    const response = result.response;
    const candidates = response.candidates;

    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData) {
            return Buffer.from(part.inlineData.data, "base64");
          }
        }
      }
    }

    // Fallback: try fetching a stock image
    return await fetchStockImage(prompt);
  } catch (error) {
    console.error("[image-gen] generateSlideImage failed:", error);
    // Fallback to stock image
    return await fetchStockImage(prompt);
  }
}

// ---------------------------------------------------------------------------
// searchRelevantImage
// ---------------------------------------------------------------------------

/**
 * Generate a relevant business/corporate style image for the given query.
 * Uses Gemini first, then falls back to a stock photo fetch.
 */
export async function searchRelevantImage(
  query: string
): Promise<Buffer | null> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        // @ts-expect-error - responseModalities is valid for image generation
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    const result = await model.generateContent(
      `Create a professional corporate/business image related to: "${query}". ` +
        "Style: clean, modern, minimalist. Suitable for embedding in a PowerPoint slide. " +
        "No text. Photographic or high-quality illustration style."
    );

    const response = result.response;
    const candidates = response.candidates;

    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData) {
            return Buffer.from(part.inlineData.data, "base64");
          }
        }
      }
    }

    return await fetchStockImage(query);
  } catch (error) {
    console.error("[image-gen] searchRelevantImage failed:", error);
    return await fetchStockImage(query);
  }
}

// ---------------------------------------------------------------------------
// Stock image fallback
// ---------------------------------------------------------------------------

/**
 * Fetch a stock image from Unsplash source (no API key required).
 * Returns the image as a Buffer, or null on failure.
 */
async function fetchStockImage(query: string): Promise<Buffer | null> {
  try {
    const sanitized = encodeURIComponent(
      query.replace(/[^a-zA-Z0-9 ]/g, " ").trim()
    );
    const url = `https://source.unsplash.com/800x600/?${sanitized}`;

    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) return null;

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Sanity check: must be a reasonable image size (> 1 KB)
    if (buffer.length < 1024) return null;

    return buffer;
  } catch (error) {
    console.error("[image-gen] fetchStockImage failed:", error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// buildImageQuery (retained from original)
// ---------------------------------------------------------------------------

/**
 * Generate a relevant image query from slide context.
 * Maps business topics to good stock photo / generation search terms.
 */
export function buildImageQuery(
  slideTitle: string,
  slideContext: string
): string {
  const combined = `${slideTitle} ${slideContext}`.toLowerCase();

  const mappings: [RegExp, string][] = [
    [/team|people|culture|hiring/, "business team office professional"],
    [/growth|revenue|scale|profit/, "business growth chart upward"],
    [/technolog|ai|machine|software|digital/, "technology innovation digital"],
    [/market|customer|audience|user/, "market research customers"],
    [/strategy|plan|roadmap|vision/, "business strategy planning"],
    [/product|launch|release|feature/, "product launch innovation"],
    [/data|analytics|metrics|dashboard/, "data analytics dashboard"],
    [/finance|funding|invest|capital/, "finance investment money"],
    [/design|creative|brand|visual/, "creative design workspace"],
    [/global|world|international|expand/, "global business world map"],
    [/sustain|green|environment|eco/, "sustainability green business"],
    [/partner|collaborat|alliance/, "business partnership handshake"],
    [/security|protect|safe|trust/, "cybersecurity protection digital"],
    [/cloud|server|infrastructure/, "cloud computing servers"],
    [/mobile|app|phone/, "mobile app technology"],
  ];

  for (const [pattern, query] of mappings) {
    if (pattern.test(combined)) return query;
  }

  return `business ${slideTitle.split(" ").slice(0, 3).join(" ")}`;
}

// ---------------------------------------------------------------------------
// generateDiagramSvg
// ---------------------------------------------------------------------------

type DiagramType =
  | "timeline"
  | "process"
  | "comparison"
  | "metrics"
  | "pyramid";

interface DiagramColors {
  accent: string;
  bg: string;
  text: string;
  muted: string;
}

interface DiagramData {
  items: string[];
  title?: string;
}

/**
 * Generate a premium SVG diagram for a business presentation.
 *
 * All diagrams are built programmatically (no AI) for pixel-perfect output
 * and consistent styling that matches the deck's colour scheme.
 */
export function generateDiagramSvg(
  type: DiagramType,
  data: DiagramData,
  colors: DiagramColors
): string {
  switch (type) {
    case "timeline":
      return buildTimeline(data, colors);
    case "process":
      return buildProcess(data, colors);
    case "comparison":
      return buildComparison(data, colors);
    case "metrics":
      return buildMetrics(data, colors);
    case "pyramid":
      return buildPyramid(data, colors);
    default:
      return buildProcess(data, colors);
  }
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const SVG_WIDTH = 800;
const SVG_HEIGHT = 450;
const FONT_FAMILY =
  "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

function svgOpen(width = SVG_WIDTH, height = SVG_HEIGHT): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`;
}

function defs(colors: DiagramColors): string {
  return `
  <defs>
    <filter id="shadow" x="-4%" y="-4%" width="108%" height="112%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="${colors.text}" flood-opacity="0.10"/>
    </filter>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.accent}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${colors.accent}" stop-opacity="0.75"/>
    </linearGradient>
  </defs>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxChars && current) {
      lines.push(current.trim());
      current = word;
    } else {
      current = current ? current + " " + word : word;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
}

// ---------------------------------------------------------------------------
// Timeline — horizontal line with alternating above/below milestone cards
// ---------------------------------------------------------------------------

function buildTimeline(data: DiagramData, c: DiagramColors): string {
  const items = data.items.slice(0, 8);
  const count = items.length;
  const padding = 60;
  const lineY = 220;
  const usableWidth = SVG_WIDTH - padding * 2;
  const gap = count > 1 ? usableWidth / (count - 1) : 0;

  let svg = svgOpen() + defs(c);

  // Background
  svg += `<rect width="${SVG_WIDTH}" height="${SVG_HEIGHT}" rx="12" fill="${c.bg}"/>`;

  // Title
  if (data.title) {
    svg += `<text x="${SVG_WIDTH / 2}" y="45" text-anchor="middle" font-family="${FONT_FAMILY}" font-size="20" font-weight="600" fill="${c.text}">${escapeXml(data.title)}</text>`;
  }

  // Horizontal line
  svg += `<line x1="${padding}" y1="${lineY}" x2="${SVG_WIDTH - padding}" y2="${lineY}" stroke="${c.muted}" stroke-width="3" stroke-linecap="round"/>`;

  items.forEach((item, i) => {
    const x = count === 1 ? SVG_WIDTH / 2 : padding + gap * i;
    const above = i % 2 === 0;

    // Connector
    const connY1 = above ? lineY - 40 : lineY + 40;
    svg += `<line x1="${x}" y1="${lineY}" x2="${x}" y2="${connY1}" stroke="${c.accent}" stroke-width="2"/>`;

    // Circle node
    svg += `<circle cx="${x}" cy="${lineY}" r="8" fill="${c.accent}" filter="url(#shadow)"/>`;
    svg += `<circle cx="${x}" cy="${lineY}" r="4" fill="${c.bg}"/>`;

    // Label box
    const boxW = Math.min(120, usableWidth / count + 10);
    const boxH = 50;
    const boxX = x - boxW / 2;
    const boxY = above ? connY1 - boxH - 5 : connY1 + 5;

    svg += `<rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" rx="8" fill="${c.bg}" stroke="${c.accent}" stroke-width="1.5" filter="url(#shadow)"/>`;

    const lines = wrapText(item, 14);
    const textStartY = boxY + boxH / 2 - ((lines.length - 1) * 14) / 2;
    lines.forEach((line, li) => {
      svg += `<text x="${x}" y="${textStartY + li * 14}" text-anchor="middle" font-family="${FONT_FAMILY}" font-size="11" font-weight="500" fill="${c.text}" dominant-baseline="central">${escapeXml(line)}</text>`;
    });
  });

  svg += "</svg>";
  return svg;
}

// ---------------------------------------------------------------------------
// Process — step boxes with arrows between them
// ---------------------------------------------------------------------------

function buildProcess(data: DiagramData, c: DiagramColors): string {
  const items = data.items.slice(0, 6);
  const count = items.length;
  const padding = 50;
  const boxH = 70;
  const arrowSize = 20;
  const usableWidth = SVG_WIDTH - padding * 2;
  const totalArrowSpace = (count - 1) * (arrowSize + 10);
  const boxW = (usableWidth - totalArrowSpace) / count;
  const centerY = SVG_HEIGHT / 2 + (data.title ? 15 : 0);

  let svg = svgOpen() + defs(c);
  svg += `<rect width="${SVG_WIDTH}" height="${SVG_HEIGHT}" rx="12" fill="${c.bg}"/>`;

  if (data.title) {
    svg += `<text x="${SVG_WIDTH / 2}" y="45" text-anchor="middle" font-family="${FONT_FAMILY}" font-size="20" font-weight="600" fill="${c.text}">${escapeXml(data.title)}</text>`;
  }

  items.forEach((item, i) => {
    const x = padding + i * (boxW + arrowSize + 10);
    const y = centerY - boxH / 2;

    // Box with gradient fill
    svg += `<rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="10" fill="url(#accentGrad)" filter="url(#shadow)"/>`;

    // Step number
    svg += `<text x="${x + boxW / 2}" y="${y + 22}" text-anchor="middle" font-family="${FONT_FAMILY}" font-size="11" font-weight="700" fill="${c.bg}" opacity="0.8">${i + 1}</text>`;

    // Label
    const lines = wrapText(item, 14);
    const startY = y + 40;
    lines.forEach((line, li) => {
      svg += `<text x="${x + boxW / 2}" y="${startY + li * 14}" text-anchor="middle" font-family="${FONT_FAMILY}" font-size="12" font-weight="500" fill="${c.bg}">${escapeXml(line)}</text>`;
    });

    // Arrow to next
    if (i < count - 1) {
      const arrowX = x + boxW + 5;
      const arrowY = centerY;
      svg += `<polygon points="${arrowX},${arrowY - 8} ${arrowX + arrowSize},${arrowY} ${arrowX},${arrowY + 8}" fill="${c.accent}" opacity="0.6"/>`;
    }
  });

  svg += "</svg>";
  return svg;
}

// ---------------------------------------------------------------------------
// Comparison — two-column layout with headers and bullet rows
// ---------------------------------------------------------------------------

function buildComparison(data: DiagramData, c: DiagramColors): string {
  const items = data.items.slice(0, 10);
  const half = Math.ceil(items.length / 2);
  const leftItems = items.slice(0, half);
  const rightItems = items.slice(half);

  const colWidth = 340;
  const padding = 40;
  const headerH = 44;
  const rowH = 38;
  const startY = data.title ? 80 : 50;

  const neededHeight =
    startY +
    headerH +
    Math.max(leftItems.length, rightItems.length) * rowH +
    40;
  const height = Math.max(SVG_HEIGHT, neededHeight);

  let svg = svgOpen(SVG_WIDTH, height) + defs(c);
  svg += `<rect width="${SVG_WIDTH}" height="${height}" rx="12" fill="${c.bg}"/>`;

  if (data.title) {
    svg += `<text x="${SVG_WIDTH / 2}" y="45" text-anchor="middle" font-family="${FONT_FAMILY}" font-size="20" font-weight="600" fill="${c.text}">${escapeXml(data.title)}</text>`;
  }

  // Centre divider
  svg += `<line x1="${SVG_WIDTH / 2}" y1="${startY}" x2="${SVG_WIDTH / 2}" y2="${height - 20}" stroke="${c.muted}" stroke-width="1" stroke-dasharray="6,4" opacity="0.5"/>`;

  // Two columns
  [
    { items: leftItems, x: padding, label: "A" },
    { items: rightItems, x: SVG_WIDTH / 2 + padding / 2, label: "B" },
  ].forEach((col) => {
    // Column header
    svg += `<rect x="${col.x}" y="${startY}" width="${colWidth}" height="${headerH}" rx="8" fill="${c.accent}" filter="url(#shadow)"/>`;
    svg += `<text x="${col.x + colWidth / 2}" y="${startY + headerH / 2 + 1}" text-anchor="middle" dominant-baseline="central" font-family="${FONT_FAMILY}" font-size="14" font-weight="600" fill="${c.bg}">${escapeXml(col.items[0] || col.label)}</text>`;

    // Rows (skip first item used as header)
    col.items.slice(1).forEach((item, i) => {
      const ry = startY + headerH + 8 + i * rowH;
      const isEven = i % 2 === 0;
      svg += `<rect x="${col.x}" y="${ry}" width="${colWidth}" height="${rowH - 4}" rx="6" fill="${isEven ? c.bg : c.muted}" opacity="${isEven ? 1 : 0.12}"/>`;
      svg += `<circle cx="${col.x + 16}" cy="${ry + (rowH - 4) / 2}" r="4" fill="${c.accent}"/>`;
      svg += `<text x="${col.x + 30}" y="${ry + (rowH - 4) / 2 + 1}" dominant-baseline="central" font-family="${FONT_FAMILY}" font-size="12" fill="${c.text}">${escapeXml(item)}</text>`;
    });
  });

  svg += "</svg>";
  return svg;
}

// ---------------------------------------------------------------------------
// Metrics — grid of cards with big numbers and labels
// ---------------------------------------------------------------------------

function buildMetrics(data: DiagramData, c: DiagramColors): string {
  const items = data.items.slice(0, 8);
  const count = items.length;
  const cols = count <= 2 ? count : count <= 4 ? 2 : count <= 6 ? 3 : 4;
  const rows = Math.ceil(count / cols);

  const padding = 50;
  const gapX = 20;
  const gapY = 20;
  const startY = data.title ? 75 : 40;
  const usableW = SVG_WIDTH - padding * 2;
  const usableH = SVG_HEIGHT - startY - 30;
  const cellW = (usableW - (cols - 1) * gapX) / cols;
  const cellH = (usableH - (rows - 1) * gapY) / rows;

  let svg = svgOpen() + defs(c);
  svg += `<rect width="${SVG_WIDTH}" height="${SVG_HEIGHT}" rx="12" fill="${c.bg}"/>`;

  if (data.title) {
    svg += `<text x="${SVG_WIDTH / 2}" y="45" text-anchor="middle" font-family="${FONT_FAMILY}" font-size="20" font-weight="600" fill="${c.text}">${escapeXml(data.title)}</text>`;
  }

  items.forEach((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = padding + col * (cellW + gapX);
    const y = startY + row * (cellH + gapY);

    // Card
    svg += `<rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" rx="12" fill="${c.bg}" stroke="${c.muted}" stroke-width="1" filter="url(#shadow)"/>`;

    // Accent bar at top
    svg += `<rect x="${x}" y="${y}" width="${cellW}" height="4" rx="2" fill="${c.accent}"/>`;

    // Parse "value | label" pattern, e.g. "95% | Accuracy"
    const parts = item.split("|").map((s) => s.trim());
    const value = parts[0] || item;
    const label = parts[1] || "";

    // Value (large)
    svg += `<text x="${x + cellW / 2}" y="${y + cellH * 0.48}" text-anchor="middle" dominant-baseline="central" font-family="${FONT_FAMILY}" font-size="${cellH > 120 ? 36 : 28}" font-weight="700" fill="${c.accent}">${escapeXml(value)}</text>`;

    // Label
    if (label) {
      svg += `<text x="${x + cellW / 2}" y="${y + cellH * 0.72}" text-anchor="middle" dominant-baseline="central" font-family="${FONT_FAMILY}" font-size="12" font-weight="500" fill="${c.muted}">${escapeXml(label)}</text>`;
    }
  });

  svg += "</svg>";
  return svg;
}

// ---------------------------------------------------------------------------
// Pyramid — stacked trapezoid layers, narrowest at top
// ---------------------------------------------------------------------------

function buildPyramid(data: DiagramData, c: DiagramColors): string {
  const items = data.items.slice(0, 6);
  const count = items.length;

  const padding = 80;
  const startY = data.title ? 70 : 40;
  const pyramidH = SVG_HEIGHT - startY - 30;
  const baseW = SVG_WIDTH - padding * 2;
  const layerGap = 4;
  const layerH = (pyramidH - (count - 1) * layerGap) / count;

  const tipX = SVG_WIDTH / 2;

  let svg = svgOpen() + defs(c);
  svg += `<rect width="${SVG_WIDTH}" height="${SVG_HEIGHT}" rx="12" fill="${c.bg}"/>`;

  if (data.title) {
    svg += `<text x="${SVG_WIDTH / 2}" y="45" text-anchor="middle" font-family="${FONT_FAMILY}" font-size="20" font-weight="600" fill="${c.text}">${escapeXml(data.title)}</text>`;
  }

  items.forEach((item, i) => {
    const y1 = startY + i * (layerH + layerGap);
    const y2 = y1 + layerH;

    // Width of trapezoid at top and bottom of this layer
    const topW = (baseW * (i + 0.3)) / count;
    const botW = (baseW * (i + 1.3)) / count;

    const topLeft = tipX - topW / 2;
    const topRight = tipX + topW / 2;
    const botLeft = tipX - botW / 2;
    const botRight = tipX + botW / 2;

    // Opacity: top layer is most vivid, fades slightly going down
    const opacity = 1 - i * (0.45 / count);

    svg += `<polygon points="${topLeft},${y1} ${topRight},${y1} ${botRight},${y2} ${botLeft},${y2}" fill="${c.accent}" opacity="${opacity.toFixed(2)}" stroke="${c.bg}" stroke-width="2" filter="url(#shadow)"/>`;

    // Label
    const textY = (y1 + y2) / 2;
    const lines = wrapText(item, 22);
    lines.forEach((line, li) => {
      svg += `<text x="${tipX}" y="${textY + (li - (lines.length - 1) / 2) * 16}" text-anchor="middle" dominant-baseline="central" font-family="${FONT_FAMILY}" font-size="13" font-weight="600" fill="${c.bg}">${escapeXml(line)}</text>`;
    });
  });

  svg += "</svg>";
  return svg;
}
