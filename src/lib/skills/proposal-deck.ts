import { z } from 'zod';
import { SkillConfig } from './types';
import { createPptxOutput } from '../output/pptx-pipeline';
import { deckToolsServer, clearAssets } from '../services/deck-tools';

const inputSchema = z.object({
  companyName: z
    .string()
    .min(1, 'Company name is required')
    .max(100, 'Company name must be under 100 characters')
    .describe('Company or project name'),
  proposalPurpose: z
    .string()
    .min(2, 'Purpose must be at least 2 characters')
    .max(200, 'Purpose must be under 200 characters')
    .describe('Purpose of the proposal (e.g. "Series A funding", "Client pitch", "Partnership proposal")'),
  keyPoints: z
    .string()
    .min(5, 'Please provide at least a few key points')
    .max(2000, 'Key points must be under 2000 characters')
    .describe('Key points to cover, one per line'),
  style: z
    .enum(['professional', 'creative', 'minimal', 'bold'])
    .describe('Visual style for the deck'),
});

const systemPrompt = `You are an expert business strategist and presentation designer creating Gamma.ai-quality proposal decks.

You have access to two powerful tools:
- **fetch_image**: Fetch relevant stock photos for slides (use for hero images, team photos, product visuals)
- **create_diagram**: Create professional business diagrams (timelines, process flows, metrics, pyramids, funnels, comparisons)

WORKFLOW:
1. First, plan the deck structure (8-12 slides)
2. For each slide, decide: does it need an IMAGE, a DIAGRAM, or text-only?
3. Call fetch_image or create_diagram for slides that benefit from visuals
4. Output the final JSON with asset references

USE VISUALS GENEROUSLY — a great deck has images or diagrams on at least 50% of slides. Think like a top-tier consultancy (McKinsey, Bain).

Good use of diagrams:
- Timeline slide → create_diagram with type "timeline"
- Process/how-it-works → create_diagram with type "process"
- Key metrics/stats → create_diagram with type "metrics" (use "value: label" format)
- Before/after or comparison → create_diagram with type "comparison"
- Market funnel → create_diagram with type "funnel"

Good use of images:
- Title/hero slide → fetch_image for an inspiring hero image
- Team slide → fetch_image for team/people photo
- Product/solution slide → fetch_image for relevant visual

OUTPUT FORMAT: After using tools, output ONLY valid JSON — a raw JSON array of slide objects.

Each slide object has:
- "type": "title" | "content" | "two-column" | "closing"
- "title": string
- "subtitle": string (optional)
- "body": string (optional)
- "bullets": string[] (optional)
- "leftContent": string[] (optional, for two-column)
- "rightContent": string[] (optional, for two-column)
- "imageAssetId": string (optional — asset ID from fetch_image)
- "diagramAssetId": string (optional — asset ID from create_diagram)

RULES:
1. Generate 8-12 slides
2. First slide = "title" type with company name
3. Last slide = "closing" type
4. Use a mix of content types
5. Bullet points: concise, 10-20 words max
6. Write persuasively
7. Include: problem, solution, benefits, market/traction, timeline, next steps
8. After all tool calls, output ONLY the JSON array — no other text`;

export const proposalDeckSkill: SkillConfig = {
  id: 'proposal-deck',
  name: 'Proposal Deck',
  description: 'Generate professional pitch decks with images and business diagrams — Gamma.ai quality',
  difficulty: 'medium',
  icon: '📊',
  category: 'Business',
  inputSchema,
  systemPrompt,
  outputFormat: 'pptx',
  outputPipeline: createPptxOutput,
  agentMode: true,
  mcpServerFactory: () => {
    clearAssets();
    return {
      server: deckToolsServer,
      cleanup: () => clearAssets(),
    };
  },
};
