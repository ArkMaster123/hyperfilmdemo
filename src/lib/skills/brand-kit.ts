import { z } from 'zod';
import { SkillConfig, GeneratedOutput } from './types';

const inputSchema = z.object({
  brandName: z
    .string()
    .min(1, 'Brand name is required')
    .max(100, 'Brand name must be under 100 characters')
    .describe('Brand name'),
  industry: z
    .string()
    .min(2, 'Industry must be at least 2 characters')
    .max(100, 'Industry must be under 100 characters')
    .describe('Industry'),
  brandValues: z
    .string()
    .min(2, 'Brand values must be at least 2 characters')
    .max(300, 'Brand values must be under 300 characters')
    .describe('Brand personality and values, comma separated'),
  existingColors: z
    .string()
    .max(200, 'Colors must be under 200 characters')
    .optional()
    .describe('Existing brand colors as hex codes, comma separated'),
});

const systemPrompt = `You are an expert brand strategist and visual identity designer. You create comprehensive, beautifully structured brand guidelines documents.

OUTPUT FORMAT: You must output ONLY raw HTML body content. Do NOT include <!DOCTYPE>, <html>, <head>, or <body> tags. Start directly with the content.

STRUCTURE YOUR OUTPUT EXACTLY LIKE THIS:

1. <h1> — the brand name followed by "Brand Guidelines"

2. <div class="brand-section">
     <h2>Brand Overview</h2>
     Include three subsections:
     <h3>Mission</h3> — a clear, inspiring mission statement
     <h3>Vision</h3> — a forward-looking vision statement
     <h3>Brand Story</h3> — a compelling narrative about the brand's origin, purpose, and what sets it apart
   </div>

3. <div class="brand-section">
     <h2>Color Palette</h2>
     <p>Brief explanation of the color strategy.</p>
     <div class="color-grid">
       For each color (5-6 total — primary, secondary, accent, and 2-3 neutrals), output:
       <div class="color-swatch-card">
         <div class="color-swatch" style="background-color: #HEXCODE;"></div>
         <div class="color-info">
           <strong>Color Role</strong> (e.g., "Primary", "Secondary", "Accent", "Neutral Dark", "Neutral Light")
           <span class="color-hex">#HEXCODE</span>
           <p>Brief note on when to use this color.</p>
         </div>
       </div>
     </div>
     If the user provided existing brand colors, incorporate those as the primary/secondary colors and build the rest of the palette around them. Otherwise, create a cohesive palette that fits the industry and brand values.
   </div>

4. <div class="brand-section">
     <h2>Typography</h2>
     Recommend 2-3 font pairings. For each font, output:
     <div class="font-pairing">
       <h3>Heading Font</h3>
       <p class="font-sample font-heading" style="font-family: 'FontName', sans-serif; font-size: 2rem;">The quick brown fox jumps over the lazy dog</p>
       <p>Describe where this font should be used and why it was chosen.</p>
     </div>
     <div class="font-pairing">
       <h3>Body Font</h3>
       <p class="font-sample font-body" style="font-family: 'FontName', sans-serif; font-size: 1.1rem;">The quick brown fox jumps over the lazy dog</p>
       <p>Describe where this font should be used and why it was chosen.</p>
     </div>
     <div class="font-pairing">
       <h3>Accent Font</h3>
       <p class="font-sample font-accent" style="font-family: 'FontName', monospace; font-size: 1rem;">The quick brown fox jumps over the lazy dog</p>
       <p>Describe where this font should be used and why it was chosen.</p>
     </div>
     Use real, well-known Google Fonts or system fonts. Style the sample text with the actual font-family so it renders differently.
   </div>

5. <div class="brand-section">
     <h2>Logo Usage</h2>
     <div class="logo-guidelines">
       <h3>Minimum Size</h3>
       <p>Specify minimum dimensions for print and digital.</p>
       <h3>Clear Space</h3>
       <p>Define the minimum clear space around the logo using a measurable unit (e.g., "equal to the height of the logomark").</p>
       <h3>Logo Dos and Don'ts</h3>
       <div class="dos-donts">
         <div class="do-item">✓ Use the logo on solid backgrounds with sufficient contrast</div>
         <div class="do-item">✓ Maintain the original aspect ratio when scaling</div>
         <div class="do-item">✓ Use approved color variations only</div>
         <div class="dont-item">✗ Do not stretch or distort the logo</div>
         <div class="dont-item">✗ Do not place on busy or low-contrast backgrounds</div>
         <div class="dont-item">✗ Do not alter the logo colors outside the brand palette</div>
         <div class="dont-item">✗ Do not add effects like drop shadows or outlines</div>
       </div>
     </div>
   </div>

6. <div class="brand-section">
     <h2>Tone of Voice</h2>
     <p>Describe the overall communication personality.</p>
     <h3>Brand Voice Attributes</h3>
     <p>List 3-4 key voice attributes with brief descriptions.</p>
     <h3>Writing Examples</h3>
     <div class="voice-example do-example">
       <strong>✓ Do write like this:</strong>
       <p>Provide a concrete example of on-brand copy.</p>
     </div>
     <div class="voice-example dont-example">
       <strong>✗ Don't write like this:</strong>
       <p>Provide a concrete example of off-brand copy.</p>
     </div>
     Include 2-3 pairs of do/don't examples covering different contexts (tagline, social media, customer support).
   </div>

7. <div class="brand-section">
     <h2>Visual Style</h2>
     <h3>Photography</h3>
     <p>Describe the photo style — lighting, composition, subjects, mood, color treatment.</p>
     <h3>Illustration</h3>
     <p>Describe the illustration approach — style, line weight, color usage, when to use illustrations vs photos.</p>
     <h3>Iconography</h3>
     <p>Describe icon style — filled vs outline, rounded vs sharp, sizing conventions.</p>
   </div>

QUALITY REQUIREMENTS:
- Make all content SPECIFIC to the brand name, industry, and values provided — not generic filler
- Color swatches must use actual hex codes in the inline style background-color
- Typography samples must use real font names in font-family
- Dos and don'ts must use ✓ and ✗ symbols
- Voice examples must feel authentic and distinct
- Do NOT include any markdown — output pure HTML only
- Do NOT wrap output in code fences or backticks
- Use semantic class names as specified above — the CSS depends on them

Write with the authority of a senior brand consultant delivering a premium brand guidelines package.`;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrapInBrandHtmlDocument(bodyContent: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #09090b;
      color: #e4e4e7;
      line-height: 1.7;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .document-wrapper {
      max-width: 920px;
      margin: 0 auto;
      padding: 3rem 2.5rem 4rem;
    }

    h1 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 2.75rem;
      font-weight: 700;
      color: #fafafa;
      margin-bottom: 1rem;
      letter-spacing: -0.03em;
      line-height: 1.15;
      background: linear-gradient(135deg, #fafafa 0%, #a78bfa 50%, #f472b6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    h2 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.75rem;
      font-weight: 600;
      color: #fafafa;
      margin-top: 0;
      margin-bottom: 1.25rem;
      letter-spacing: -0.02em;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid rgba(167, 139, 250, 0.25);
    }

    h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: #d4d4d8;
      margin-top: 1.5rem;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-size: 0.85rem;
    }

    p {
      margin-bottom: 1rem;
      color: #a1a1aa;
    }

    strong {
      color: #e4e4e7;
      font-weight: 600;
    }

    /* Brand Sections */
    .brand-section {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 2rem 2.25rem;
      margin-bottom: 2rem;
      transition: border-color 0.3s ease;
    }

    .brand-section:hover {
      border-color: rgba(167, 139, 250, 0.2);
    }

    /* Color Palette */
    .color-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.25rem;
      margin-top: 1.25rem;
    }

    .color-swatch-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      overflow: hidden;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }

    .color-swatch-card:hover {
      transform: translateY(-2px);
      border-color: rgba(255, 255, 255, 0.15);
    }

    .color-swatch {
      width: 100%;
      height: 120px;
      border-radius: 0;
    }

    .color-info {
      padding: 1rem 1.25rem;
    }

    .color-info strong {
      display: block;
      font-size: 0.95rem;
      color: #fafafa;
      margin-bottom: 0.25rem;
    }

    .color-hex {
      display: inline-block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      color: #a78bfa;
      background: rgba(167, 139, 250, 0.1);
      padding: 0.15em 0.5em;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }

    .color-info p {
      font-size: 0.85rem;
      color: #71717a;
      margin-bottom: 0;
      margin-top: 0.5rem;
    }

    /* Typography */
    .font-pairing {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 1.5rem 1.75rem;
      margin-bottom: 1rem;
      margin-top: 0.75rem;
    }

    .font-pairing h3 {
      margin-top: 0;
    }

    .font-sample {
      color: #fafafa !important;
      padding: 1rem 0;
      margin-bottom: 0.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .font-heading {
      font-size: 2rem !important;
      line-height: 1.2;
    }

    .font-body {
      font-size: 1.1rem !important;
      line-height: 1.7;
    }

    .font-accent {
      font-size: 0.95rem !important;
      letter-spacing: 0.02em;
    }

    /* Logo Usage */
    .logo-guidelines {
      margin-top: 0.5rem;
    }

    .dos-donts {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .do-item, .dont-item {
      padding: 0.75rem 1.25rem;
      border-radius: 10px;
      font-size: 0.95rem;
    }

    .do-item {
      background: rgba(34, 197, 94, 0.06);
      border: 1px solid rgba(34, 197, 94, 0.15);
      color: #86efac;
    }

    .dont-item {
      background: rgba(239, 68, 68, 0.06);
      border: 1px solid rgba(239, 68, 68, 0.15);
      color: #fca5a5;
    }

    /* Tone of Voice */
    .voice-example {
      border-radius: 10px;
      padding: 1.25rem 1.5rem;
      margin: 0.75rem 0;
    }

    .voice-example strong {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .voice-example p {
      margin-bottom: 0;
      font-style: italic;
      font-size: 0.95rem;
    }

    .do-example {
      background: rgba(34, 197, 94, 0.05);
      border-left: 3px solid #22c55e;
    }

    .do-example strong {
      color: #86efac;
    }

    .dont-example {
      background: rgba(239, 68, 68, 0.05);
      border-left: 3px solid #ef4444;
    }

    .dont-example strong {
      color: #fca5a5;
    }

    /* General utilities */
    ul, ol {
      padding-left: 1.5rem;
      margin-bottom: 1rem;
    }

    li {
      margin-bottom: 0.4rem;
      color: #a1a1aa;
    }

    li::marker {
      color: #7c3aed;
    }

    hr {
      border: none;
      height: 1px;
      background: rgba(255, 255, 255, 0.06);
      margin: 2.5rem 0;
    }

    .footer {
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      text-align: center;
      font-size: 0.8rem;
      color: #52525b;
    }

    @media (max-width: 640px) {
      .document-wrapper {
        padding: 1.5rem 1rem 2rem;
      }
      h1 {
        font-size: 2rem;
      }
      h2 {
        font-size: 1.35rem;
      }
      .color-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="document-wrapper">
    ${bodyContent}
    <div class="footer">Generated by DigiForge</div>
  </div>
</body>
</html>`;
}

async function createBrandHtmlOutput(
  rawHtml: string,
  inputs: Record<string, any>,
): Promise<GeneratedOutput> {
  const title = `${inputs.brandName} — Brand Guidelines`;
  const fullHtml = wrapInBrandHtmlDocument(rawHtml, title);
  const filename = `${inputs.brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-brand-guidelines.html`;

  return {
    filename,
    contentType: 'text/html',
    data: Buffer.from(fullHtml, 'utf-8'),
    preview: fullHtml,
  };
}

export const brandKitSkill: SkillConfig = {
  id: 'brand-kit',
  name: 'Brand Guidelines Kit',
  description:
    'Create comprehensive brand identity guides with color palettes, typography, logo usage rules, tone of voice, and visual style direction.',
  difficulty: 'medium',
  icon: '🎨',
  category: 'Branding',
  inputSchema,
  systemPrompt,
  outputFormat: 'html',
  outputPipeline: createBrandHtmlOutput,
};
