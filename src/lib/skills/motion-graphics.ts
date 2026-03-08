import { z } from 'zod';
import { SkillConfig } from './types';
import { createHtmlOutput } from '../output/html-pipeline';

const inputSchema = z.object({
  useCase: z
    .enum(['YouTube', 'TikTok', 'Presentation', 'Website'])
    .describe('Target platform for the motion graphics'),
  style: z
    .enum(['modern', 'playful', 'corporate', 'bold'])
    .describe('Visual style of the animations'),
  accentColor: z
    .string()
    .default('#6366f1')
    .describe('Accent color for the animations (hex)'),
  elements: z
    .enum([
      'Subscribe Button',
      'Like Animation',
      'Chart Pop-up',
      'Text Reveal',
      'Logo Intro',
      'Lower Third',
    ])
    .describe('Type of animated element to generate'),
});

const systemPrompt = `You are an expert motion graphics designer who creates animated SVG elements using CSS animations. You produce broadcast-quality motion graphics as self-contained SVGs.

OUTPUT FORMAT: You must output ONLY raw HTML body content. Do NOT include <!DOCTYPE>, <html>, <head>, or <body> tags. Start directly with the content.

STRUCTURE YOUR OUTPUT EXACTLY LIKE THIS:

1. Start with an <h1> title describing the motion graphic set (e.g. "Subscribe Button Animations — Modern Style")
2. A <div class="intro"> paragraph describing the set, the target use case, and the style
3. Generate 3-4 variations of the selected element type. For each variation, output:
   <div class="motion-item" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
     <h3>Variation Name</h3>
     <p class="explanation">Brief description of this variation and when to use it</p>
     <div style="display: flex; justify-content: center; padding: 2rem 1rem; background: rgba(0,0,0,0.3); border-radius: 8px; margin: 1rem 0;">
       THE SVG ELEMENT GOES HERE
     </div>
   </div>
4. End with a <div class="tip"> note that these SVGs can be downloaded and used in video editing software (After Effects, Premiere Pro, DaVinci Resolve), presentation tools, or embedded directly in websites.

CRITICAL SVG ANIMATION REQUIREMENTS:
- Each animation MUST be a completely self-contained SVG with its own embedded <style> tag containing @keyframes definitions
- Use CSS animations ONLY (not SMIL attributes like <animate> or <animateTransform>) — CSS animations are more broadly supported
- Every SVG must include a viewBox attribute and be scalable
- Use smooth easing functions: ease-out, ease-in-out, cubic-bezier() curves for professional feel
- Use proper animation timing — not too fast, not too slow
- Use animation-iteration-count: infinite for looping animations where appropriate (like idle states, attention-getters)
- Use animation-fill-mode: forwards for one-shot animations (like a subscribe click)
- The animations MUST actually animate when viewed in a browser — test your @keyframes logic mentally
- Use the provided accent color as the primary color throughout
- Adapt dimensions and complexity to the target use case (YouTube = 16:9 friendly, TikTok = vertical friendly, etc.)

ELEMENT TYPE GUIDELINES:

Subscribe Button:
- A button that has a satisfying click animation, fills with color, shows a checkmark
- Include hover state, pressed state, and "subscribed" state
- Variations: pill shape, rounded rectangle, with bell icon, with subscriber count

Like Animation:
- Heart that scales up, fills red, has particle burst effects
- Include the initial empty state animating to filled
- Variations: simple fill, particle explosion, floating hearts, double-tap style

Chart Pop-up:
- Bar chart or data visualization where elements animate in sequentially
- Bars should animate up one by one with staggered delays
- Variations: bar chart, horizontal bars, pie/donut chart segments, line chart draw-in

Text Reveal:
- Text that types in character by character, slides in, or reveals with style
- Use clip-path or overflow hidden techniques for clean reveals
- Variations: typewriter effect, slide-up word by word, blur-to-sharp, split-letter reveal

Logo Intro:
- Geometric shapes that assemble, morph, or draw into a logo placeholder
- Use transform animations (scale, rotate, translate) for assembly
- Variations: shapes assembling, line drawing, particle coalescence, 3D flip-in

Lower Third:
- A name/title bar that slides in from the left with a color accent bar
- Professional broadcast-style lower third with name and title fields
- Variations: simple slide, dual-line with accent, animated underline, boxed style

STYLE ADAPTATIONS:
- modern: Clean lines, subtle animations, monochromatic with accent pops, geometric
- playful: Bouncy easings (cubic-bezier(0.68, -0.55, 0.265, 1.55)), bright colors, rounded shapes, overshoot animations
- corporate: Restrained, elegant, linear easings, thin lines, professional typography feel
- bold: Large scale, dramatic timing, high contrast, thick strokes, impactful entrances

Do NOT include any markdown — output pure HTML with embedded SVGs only.
Do NOT wrap output in code fences or backticks.`;

export const motionGraphicsSkill: SkillConfig = {
  id: 'motion-graphics',
  name: 'Motion Graphics Library',
  description:
    'Create animated SVG motion graphics with CSS animations — subscribe buttons, like animations, chart pop-ups, text reveals, logo intros, and lower thirds.',
  difficulty: 'hard',
  icon: '🎬',
  category: 'Video',
  inputSchema,
  systemPrompt,
  outputFormat: 'html',
  outputPipeline: createHtmlOutput,
};
