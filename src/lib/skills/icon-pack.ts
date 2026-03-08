import { z } from 'zod';
import { SkillConfig } from './types';
import { createHtmlOutput } from '../output/html-pipeline';

const inputSchema = z.object({
  style: z
    .enum(['flat', 'outline', 'duotone', '3d'])
    .describe('Icon style'),
  theme: z
    .enum(['business', 'technology', 'nature', 'food', 'fitness', 'education'])
    .describe('Icon theme'),
  iconCount: z
    .number()
    .int()
    .min(4, 'Minimum 4 icons')
    .max(12, 'Maximum 12 icons')
    .default(6)
    .describe('Number of icons to generate'),
  accentColor: z
    .string()
    .default('#6366f1')
    .describe('Accent color for the icon set'),
});

const systemPrompt = `You are an expert icon designer who creates beautiful, consistent SVG icon sets. You output production-ready SVG icons that look like they were designed by a professional.

OUTPUT FORMAT: You must output ONLY valid HTML containing SVG elements. Do NOT include <!DOCTYPE>, <html>, <head>, or <body> tags. Start directly with the content.

STRUCTURE YOUR OUTPUT EXACTLY LIKE THIS:

1. Start with an <h1> title for the icon set (e.g., "Technology Icon Pack")
2. A <div class="intro"> paragraph describing the icon set style and theme
3. A <div class="icon-grid"> containing ALL the icons. For EACH icon, output:
   <div class="icon-item">
     <div class="icon-wrapper">
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
         <!-- SVG paths here -->
       </svg>
     </div>
     <p class="icon-label">Icon Name</p>
   </div>

CRITICAL STYLE RULES — CONSISTENCY IS KEY:
- ALL icons MUST use the EXACT SAME visual style — same stroke width, same color palette, same level of detail, same corner radius approach
- ALL icons MUST look like they belong in the same professional icon set
- Use the accent color provided by the user
- Icons should be relevant to the specified theme
- Keep icons simple, clean, and recognizable at small sizes
- Use proper SVG best practices: no inline styles, use attributes for colors

STYLE-SPECIFIC RULES:
- For "outline" style: Use stroke ONLY, NO fill (except "none"), stroke-width="2", stroke-linecap="round", stroke-linejoin="round". Think Feather Icons or Lucide.
- For "flat" style: Use filled shapes ONLY, NO strokes. Use the accent color and a slightly lighter/darker variant. Bold, geometric shapes.
- For "duotone" style: Use TWO tones of the accent color — the main color at full opacity and the same color at 0.3 opacity for secondary elements. This creates depth.
- For "3d" style: Use gradients and subtle shadows to create a 3D/isometric appearance. Use the accent color as the base with lighter and darker variants.

SVG REQUIREMENTS:
- Every <svg> must have xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"
- Keep paths clean and optimized
- Center all icon content within the 64x64 viewBox
- Leave ~4px padding from edges (keep content within 8-56 range roughly)

Do NOT include any markdown — output pure HTML only.
Do NOT wrap output in code fences or backticks.
Do NOT include any CSS or <style> tags — styling is handled externally.`;

export const iconPackSkill: SkillConfig = {
  id: 'icon-pack',
  name: 'Icon Pack Generator',
  description:
    'Generate consistent icon sets with AI. Creates professional SVG icons in flat, outline, duotone, or 3D styles across various themes.',
  difficulty: 'hard',
  icon: '✨',
  category: 'Design',
  inputSchema,
  systemPrompt,
  outputFormat: 'html',
  outputPipeline: async (rawHtml: string, inputs: Record<string, any>) => {
    const accentColor = inputs.accentColor || '#6366f1';
    const style = inputs.style || 'outline';
    const theme = inputs.theme || 'technology';

    // Inject icon-grid specific styles into the raw HTML before wrapping
    const iconStyles = `
<style>
  .icon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
  }

  .icon-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    transition: all 0.2s ease;
  }

  .icon-item:hover {
    border-color: ${accentColor}40;
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(-2px);
  }

  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    background: ${accentColor}10;
    border-radius: 16px;
    padding: 8px;
  }

  .icon-wrapper svg {
    width: 64px;
    height: 64px;
  }

  .icon-label {
    font-size: 0.8rem;
    font-weight: 500;
    color: #a1a1aa;
    text-align: center;
    margin: 0 !important;
  }

  .icon-meta {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 640px) {
    .icon-grid {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 1rem;
    }
    .icon-item {
      padding: 1rem 0.5rem;
    }
    .icon-wrapper {
      width: 64px;
      height: 64px;
      padding: 4px;
    }
    .icon-wrapper svg {
      width: 48px;
      height: 48px;
    }
  }
</style>`;

    const enhancedHtml = iconStyles + rawHtml;

    const title = `${theme.charAt(0).toUpperCase() + theme.slice(1)} ${style.charAt(0).toUpperCase() + style.slice(1)} Icon Pack`;

    // Use createHtmlOutput but with our enhanced HTML and custom title
    const result = await createHtmlOutput(enhancedHtml, { topic: title });
    // Override the filename for icon packs
    const filename = `icon-pack-${theme}-${style}.html`;
    return {
      ...result,
      filename,
    };
  },
};
