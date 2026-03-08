import PptxGenJS from 'pptxgenjs';
import { GeneratedOutput } from '../skills/types';
import { getAsset } from '../services/deck-tools';

/**
 * Embed an image or diagram asset on a PPTX slide.
 * Images are placed as background or half-width.
 * Diagrams are placed centered below the title.
 */
function embedAsset(
  slide: any,
  assetId: string | undefined,
  position: 'full' | 'right-half' | 'center-below-title'
) {
  if (!assetId) return;
  const asset = getAsset(assetId);
  if (!asset) return;

  const dataUri = `data:${asset.mimeType};base64,${asset.data.toString('base64')}`;

  switch (position) {
    case 'full':
      slide.addImage({ data: dataUri, x: 0, y: 0, w: '100%', h: '100%', sizing: { type: 'cover', w: 10, h: 5.63 } });
      break;
    case 'right-half':
      slide.addImage({ data: dataUri, x: 5.2, y: 0.8, w: 4.3, h: 3.8, sizing: { type: 'cover', w: 4.3, h: 3.8 }, rounding: true });
      break;
    case 'center-below-title':
      slide.addImage({ data: dataUri, x: 0.8, y: 1.3, w: 8.4, h: 3.5, sizing: { type: 'contain', w: 8.4, h: 3.5 } });
      break;
  }
}

interface SlideContent {
  type: 'title' | 'content' | 'two-column' | 'closing';
  title: string;
  subtitle?: string;
  body?: string;
  bullets?: string[];
  leftContent?: string[];
  rightContent?: string[];
  imageAssetId?: string;
  diagramAssetId?: string;
}

interface StyleConfig {
  bg: string;
  titleColor: string;
  bodyColor: string;
  accent: string;
  accentLight: string;
  subtitleColor: string;
}

const STYLES: Record<string, StyleConfig> = {
  professional: {
    bg: '#1a1a2e',
    titleColor: '#ffffff',
    bodyColor: '#c8c8d4',
    accent: '#4f46e5',
    accentLight: '#818cf8',
    subtitleColor: '#a5b4fc',
  },
  creative: {
    bg: '#0f172a',
    titleColor: '#f8fafc',
    bodyColor: '#cbd5e1',
    accent: '#8b5cf6',
    accentLight: '#c084fc',
    subtitleColor: '#d8b4fe',
  },
  minimal: {
    bg: '#ffffff',
    titleColor: '#111827',
    bodyColor: '#4b5563',
    accent: '#6366f1',
    accentLight: '#818cf8',
    subtitleColor: '#6b7280',
  },
  bold: {
    bg: '#18181b',
    titleColor: '#fafafa',
    bodyColor: '#a1a1aa',
    accent: '#ef4444',
    accentLight: '#f87171',
    subtitleColor: '#fca5a5',
  },
};

function parseSlides(rawOutput: string): SlideContent[] {
  // Strip markdown code fences if present
  let cleaned = rawOutput.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  // Try to extract JSON array from the output
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
  if (!arrayMatch) {
    throw new Error('Could not find a JSON array in the AI output. Expected an array of slide objects.');
  }

  const parsed = JSON.parse(arrayMatch[0]);

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('Parsed output is not a non-empty array of slides.');
  }

  return parsed.map((slide: any) => ({
    type: slide.type || 'content',
    title: slide.title || '',
    subtitle: slide.subtitle,
    body: slide.body,
    bullets: Array.isArray(slide.bullets) ? slide.bullets : undefined,
    leftContent: Array.isArray(slide.leftContent) ? slide.leftContent : undefined,
    rightContent: Array.isArray(slide.rightContent) ? slide.rightContent : undefined,
    imageAssetId: slide.imageAssetId,
    diagramAssetId: slide.diagramAssetId,
  }));
}

function addTitleSlide(pptx: PptxGenJS, slide: SlideContent, style: StyleConfig, companyName: string) {
  const s = pptx.addSlide();
  s.background = { color: style.bg.replace('#', '') };

  // Accent bar at top
  s.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.08,
    fill: { color: style.accent.replace('#', '') },
  });

  // Title
  s.addText(slide.title, {
    x: 0.8,
    y: 1.8,
    w: 8.4,
    h: 1.5,
    fontSize: 36,
    fontFace: 'Arial',
    bold: true,
    color: style.titleColor.replace('#', ''),
    align: 'center',
    valign: 'middle',
  });

  // Subtitle
  if (slide.subtitle) {
    s.addText(slide.subtitle, {
      x: 1.5,
      y: 3.4,
      w: 7,
      h: 0.8,
      fontSize: 18,
      fontFace: 'Arial',
      color: style.subtitleColor.replace('#', ''),
      align: 'center',
      valign: 'middle',
    });
  }

  // Company name at bottom
  if (companyName) {
    s.addText(companyName, {
      x: 0.8,
      y: 4.6,
      w: 8.4,
      h: 0.5,
      fontSize: 14,
      fontFace: 'Arial',
      color: style.accentLight.replace('#', ''),
      align: 'center',
      valign: 'middle',
    });
  }

  // Bottom accent bar
  s.addShape(pptx.ShapeType.rect, {
    x: 3.5,
    y: 4.35,
    w: 3,
    h: 0.04,
    fill: { color: style.accent.replace('#', '') },
  });
}

function addContentSlide(pptx: PptxGenJS, slide: SlideContent, style: StyleConfig) {
  const s = pptx.addSlide();
  s.background = { color: style.bg.replace('#', '') };

  // If there's a diagram or image, use split layout
  const hasVisual = slide.diagramAssetId || slide.imageAssetId;
  const textWidth = hasVisual ? 4.5 : 8.8;

  // Left accent bar
  s.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.06,
    h: '100%',
    fill: { color: style.accent.replace('#', '') },
  });

  // Title
  s.addText(slide.title, {
    x: 0.6,
    y: 0.3,
    w: textWidth,
    h: 0.7,
    fontSize: 28,
    fontFace: 'Arial',
    bold: true,
    color: style.titleColor.replace('#', ''),
  });

  // Divider line under title
  s.addShape(pptx.ShapeType.rect, {
    x: 0.6,
    y: 1.05,
    w: 2,
    h: 0.03,
    fill: { color: style.accent.replace('#', '') },
  });

  // Embed visual on right half if available
  if (slide.diagramAssetId) {
    embedAsset(s, slide.diagramAssetId, 'right-half');
  } else if (slide.imageAssetId) {
    embedAsset(s, slide.imageAssetId, 'right-half');
  }

  // Body text or bullets
  const contentY = 1.3;
  const contentH = 3.8;

  if (slide.bullets && slide.bullets.length > 0) {
    const textItems = slide.bullets.map((bullet) => ({
      text: bullet,
      options: {
        fontSize: 16,
        fontFace: 'Arial',
        color: style.bodyColor.replace('#', ''),
        bullet: { type: 'bullet' as const, color: style.accentLight.replace('#', '') },
        paraSpaceAfter: 8,
      },
    }));
    s.addText(textItems, {
      x: 0.8,
      y: contentY,
      w: hasVisual ? 4.0 : 8.4,
      h: contentH,
      valign: 'top',
    });
  } else if (slide.body) {
    s.addText(slide.body, {
      x: 0.8,
      y: contentY,
      w: hasVisual ? 4.0 : 8.4,
      h: contentH,
      fontSize: 16,
      fontFace: 'Arial',
      color: style.bodyColor.replace('#', ''),
      valign: 'top',
      paraSpaceAfter: 6,
    });
  }
}

function addTwoColumnSlide(pptx: PptxGenJS, slide: SlideContent, style: StyleConfig) {
  const s = pptx.addSlide();
  s.background = { color: style.bg.replace('#', '') };

  // Top accent bar
  s.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.06,
    fill: { color: style.accent.replace('#', '') },
  });

  // Title
  s.addText(slide.title, {
    x: 0.6,
    y: 0.3,
    w: 8.8,
    h: 0.7,
    fontSize: 28,
    fontFace: 'Arial',
    bold: true,
    color: style.titleColor.replace('#', ''),
  });

  // Divider line
  s.addShape(pptx.ShapeType.rect, {
    x: 0.6,
    y: 1.05,
    w: 2,
    h: 0.03,
    fill: { color: style.accent.replace('#', '') },
  });

  const colY = 1.3;
  const colH = 3.8;

  // Left column
  if (slide.leftContent && slide.leftContent.length > 0) {
    const leftItems = slide.leftContent.map((item) => ({
      text: item,
      options: {
        fontSize: 15,
        fontFace: 'Arial',
        color: style.bodyColor.replace('#', ''),
        bullet: { type: 'bullet' as const, color: style.accentLight.replace('#', '') },
        paraSpaceAfter: 6,
      },
    }));
    s.addText(leftItems, {
      x: 0.6,
      y: colY,
      w: 4.1,
      h: colH,
      valign: 'top',
    });
  }

  // Vertical divider
  s.addShape(pptx.ShapeType.rect, {
    x: 4.9,
    y: 1.3,
    w: 0.02,
    h: 3.5,
    fill: { color: style.accent.replace('#', ''), transparency: 75 },
  });

  // Right column
  if (slide.rightContent && slide.rightContent.length > 0) {
    const rightItems = slide.rightContent.map((item) => ({
      text: item,
      options: {
        fontSize: 15,
        fontFace: 'Arial',
        color: style.bodyColor.replace('#', ''),
        bullet: { type: 'bullet' as const, color: style.accentLight.replace('#', '') },
        paraSpaceAfter: 6,
      },
    }));
    s.addText(rightItems, {
      x: 5.2,
      y: colY,
      w: 4.1,
      h: colH,
      valign: 'top',
    });
  }
}

function addClosingSlide(pptx: PptxGenJS, slide: SlideContent, style: StyleConfig, companyName: string) {
  const s = pptx.addSlide();
  s.background = { color: style.bg.replace('#', '') };

  // Accent bar at bottom
  s.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 5.15,
    w: '100%',
    h: 0.08,
    fill: { color: style.accent.replace('#', '') },
  });

  // Title (e.g. "Thank You")
  s.addText(slide.title, {
    x: 0.8,
    y: 1.5,
    w: 8.4,
    h: 1.2,
    fontSize: 36,
    fontFace: 'Arial',
    bold: true,
    color: style.titleColor.replace('#', ''),
    align: 'center',
    valign: 'middle',
  });

  // Subtitle / contact info
  if (slide.subtitle) {
    s.addText(slide.subtitle, {
      x: 1.5,
      y: 2.8,
      w: 7,
      h: 0.7,
      fontSize: 18,
      fontFace: 'Arial',
      color: style.subtitleColor.replace('#', ''),
      align: 'center',
      valign: 'middle',
    });
  }

  // Body / bullets for contact details
  if (slide.bullets && slide.bullets.length > 0) {
    s.addText(
      slide.bullets.map((b) => ({
        text: b,
        options: {
          fontSize: 14,
          fontFace: 'Arial',
          color: style.bodyColor.replace('#', ''),
          align: 'center' as const,
          paraSpaceAfter: 4,
        },
      })),
      {
        x: 2,
        y: 3.4,
        w: 6,
        h: 1.5,
        valign: 'top',
      },
    );
  } else if (slide.body) {
    s.addText(slide.body, {
      x: 2,
      y: 3.4,
      w: 6,
      h: 1.5,
      fontSize: 14,
      fontFace: 'Arial',
      color: style.bodyColor.replace('#', ''),
      align: 'center',
      valign: 'top',
    });
  }

  // Company name
  if (companyName) {
    s.addText(companyName, {
      x: 0.8,
      y: 4.5,
      w: 8.4,
      h: 0.5,
      fontSize: 12,
      fontFace: 'Arial',
      color: style.accentLight.replace('#', ''),
      align: 'center',
      valign: 'middle',
    });
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function generateSlidePreviewHtml(slides: SlideContent[], style: StyleConfig, companyName: string): string {
  const slideHtmlParts = slides.map((slide, idx) => {
    let inner = '';

    switch (slide.type) {
      case 'title':
        inner = `
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;">
            <div style="width:100%;height:4px;background:${style.accent};position:absolute;top:0;left:0;"></div>
            <h2 style="font-size:18px;font-weight:700;color:${style.titleColor};margin:0 0 8px;">${escapeHtml(slide.title)}</h2>
            ${slide.subtitle ? `<p style="font-size:11px;color:${style.subtitleColor};margin:0 0 12px;">${escapeHtml(slide.subtitle)}</p>` : ''}
            <div style="width:60px;height:2px;background:${style.accent};margin:4px auto;"></div>
            ${companyName ? `<p style="font-size:9px;color:${style.accentLight};margin-top:12px;">${escapeHtml(companyName)}</p>` : ''}
          </div>`;
        break;

      case 'closing':
        inner = `
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;">
            <h2 style="font-size:16px;font-weight:700;color:${style.titleColor};margin:0 0 6px;">${escapeHtml(slide.title)}</h2>
            ${slide.subtitle ? `<p style="font-size:10px;color:${style.subtitleColor};margin:0 0 8px;">${escapeHtml(slide.subtitle)}</p>` : ''}
            ${slide.body ? `<p style="font-size:9px;color:${style.bodyColor};margin:4px 0;">${escapeHtml(slide.body)}</p>` : ''}
            ${slide.bullets ? slide.bullets.map((b) => `<p style="font-size:8px;color:${style.bodyColor};margin:2px 0;">${escapeHtml(b)}</p>`).join('') : ''}
            <div style="width:100%;height:4px;background:${style.accent};position:absolute;bottom:0;left:0;"></div>
          </div>`;
        break;

      case 'two-column':
        inner = `
          <div style="position:relative;height:100%;padding:10px;">
            <div style="width:100%;height:3px;background:${style.accent};position:absolute;top:0;left:0;"></div>
            <h3 style="font-size:13px;font-weight:700;color:${style.titleColor};margin:6px 0 4px;">${escapeHtml(slide.title)}</h3>
            <div style="width:40px;height:2px;background:${style.accent};margin-bottom:6px;"></div>
            <div style="display:flex;gap:8px;">
              <div style="flex:1;">
                ${(slide.leftContent || []).map((item) => `<p style="font-size:8px;color:${style.bodyColor};margin:2px 0;padding-left:8px;border-left:2px solid ${style.accentLight};">${escapeHtml(item)}</p>`).join('')}
              </div>
              <div style="width:1px;background:${style.accent}30;"></div>
              <div style="flex:1;">
                ${(slide.rightContent || []).map((item) => `<p style="font-size:8px;color:${style.bodyColor};margin:2px 0;padding-left:8px;border-left:2px solid ${style.accentLight};">${escapeHtml(item)}</p>`).join('')}
              </div>
            </div>
          </div>`;
        break;

      default: // content
        inner = `
          <div style="position:relative;height:100%;padding:10px;">
            <div style="width:3px;height:100%;background:${style.accent};position:absolute;left:0;top:0;"></div>
            <h3 style="font-size:13px;font-weight:700;color:${style.titleColor};margin:0 0 4px;padding-left:6px;">${escapeHtml(slide.title)}</h3>
            <div style="width:40px;height:2px;background:${style.accent};margin-left:6px;margin-bottom:6px;"></div>
            ${
              slide.bullets
                ? `<ul style="list-style:none;padding-left:12px;margin:0;">${slide.bullets.map((b) => `<li style="font-size:8px;color:${style.bodyColor};margin:3px 0;position:relative;padding-left:10px;"><span style="position:absolute;left:0;color:${style.accentLight};">&#8226;</span>${escapeHtml(b)}</li>`).join('')}</ul>`
                : slide.body
                  ? `<p style="font-size:9px;color:${style.bodyColor};padding-left:6px;line-height:1.5;">${escapeHtml(slide.body)}</p>`
                  : ''
            }
          </div>`;
        break;
    }

    return `<div style="width:320px;height:180px;background:${style.bg};border-radius:6px;overflow:hidden;position:relative;box-shadow:0 2px 8px rgba(0,0,0,0.3);flex-shrink:0;">
      ${inner}
      <div style="position:absolute;bottom:4px;right:8px;font-size:7px;color:${style.bodyColor}60;">${idx + 1}</div>
    </div>`;
  });

  return `<div style="display:flex;flex-wrap:wrap;gap:16px;padding:20px;justify-content:center;background:#0a0a0a;min-height:100%;border-radius:8px;">
    ${slideHtmlParts.join('\n')}
  </div>`;
}

export async function createPptxOutput(rawOutput: string, inputs: Record<string, any>): Promise<GeneratedOutput> {
  const slides = parseSlides(rawOutput);
  const styleName = inputs.style || 'professional';
  const style = STYLES[styleName] || STYLES.professional;
  const companyName = inputs.companyName || '';

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'DigiForge';
  pptx.title = `${companyName || 'Proposal'} Deck`;

  for (const slide of slides) {
    switch (slide.type) {
      case 'title':
        addTitleSlide(pptx, slide, style, companyName);
        break;
      case 'two-column':
        addTwoColumnSlide(pptx, slide, style);
        break;
      case 'closing':
        addClosingSlide(pptx, slide, style, companyName);
        break;
      default:
        addContentSlide(pptx, slide, style);
        break;
    }
  }

  const buffer = (await pptx.write({ outputType: 'nodebuffer' })) as Buffer;

  const safeName = (companyName || 'proposal').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const preview = generateSlidePreviewHtml(slides, style, companyName);

  return {
    filename: `${safeName}-deck.pptx`,
    contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    data: buffer,
    preview,
  };
}
