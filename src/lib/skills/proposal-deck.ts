import { z } from 'zod';
import { SkillConfig } from './types';
import { createPptxOutput } from '../output/pptx-pipeline';

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

const systemPrompt = `You are an expert business strategist and presentation designer. You create compelling, well-structured proposal decks.

OUTPUT FORMAT: You must output ONLY valid JSON. No markdown, no code fences, no explanation — just a raw JSON array.

The JSON must be an array of slide objects. Each slide object has these fields:
- "type": one of "title", "content", "two-column", or "closing"
- "title": string — the slide heading
- "subtitle": string (optional) — a subtitle or tagline
- "body": string (optional) — paragraph text for the slide
- "bullets": string[] (optional) — array of bullet point strings
- "leftContent": string[] (optional, for two-column type) — bullet points for left column
- "rightContent": string[] (optional, for two-column type) — bullet points for right column

RULES:
1. Generate 8-12 slides total
2. The first slide MUST be type "title" with the company name and proposal purpose
3. The last slide MUST be type "closing" (e.g. "Thank You", "Next Steps", or "Let's Connect")
4. Use a mix of "content" and "two-column" slides for the body
5. Each bullet point should be concise but substantive (10-20 words max)
6. Include slides covering: problem/opportunity, solution, key benefits, market/traction, team/capabilities, timeline, and ask/next steps as appropriate
7. Write persuasively — this is a proposal meant to convince
8. Tailor the tone and content to the stated purpose
9. Do NOT include any text outside the JSON array
10. Ensure the JSON is valid and parseable

Example output structure:
[
  {"type":"title","title":"Acme Corp","subtitle":"Series A Funding Proposal"},
  {"type":"content","title":"The Opportunity","bullets":["Market is growing at 25% YoY","Current solutions leave gaps in X","Our approach uniquely solves Y"]},
  {"type":"two-column","title":"Our Solution","leftContent":["Feature A does X","Feature B does Y"],"rightContent":["Benefit 1","Benefit 2"]},
  {"type":"closing","title":"Thank You","subtitle":"Let's build the future together","bullets":["email@company.com","www.company.com"]}
]`;

export const proposalDeckSkill: SkillConfig = {
  id: 'proposal-deck',
  name: 'Proposal Deck',
  description:
    'Generate professional pitch decks as PowerPoint files. Creates polished, persuasive presentations with consistent styling and smart layouts.',
  difficulty: 'medium',
  icon: '\u{1F4CA}',
  category: 'Business',
  inputSchema,
  systemPrompt,
  outputFormat: 'pptx',
  outputPipeline: createPptxOutput,
};
