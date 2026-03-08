import { z } from 'zod';
import { SkillConfig } from './types';
import { createHtmlOutput } from '../output/html-pipeline';

const inputSchema = z.object({
  topic: z
    .string()
    .min(2, 'Topic must be at least 2 characters')
    .max(100, 'Topic must be under 100 characters')
    .describe('Topic for the prompt guide'),
  platform: z
    .enum(['ChatGPT', 'Midjourney', 'DALL-E', 'Stable Diffusion', 'Claude'])
    .describe('AI platform'),
  style: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .describe('Skill level'),
  promptCount: z
    .number()
    .int()
    .min(5, 'Minimum 5 prompts')
    .max(15, 'Maximum 15 prompts')
    .default(10)
    .describe('Number of prompts to generate'),
});

const systemPrompt = `You are an expert AI prompt engineer and technical writer. You create beautifully structured, highly actionable prompt guides.

OUTPUT FORMAT: You must output ONLY raw HTML body content. Do NOT include <!DOCTYPE>, <html>, <head>, or <body> tags. Start directly with the content.

STRUCTURE YOUR OUTPUT EXACTLY LIKE THIS:

1. Start with an <h1> title for the guide
2. A <div class="intro"> paragraph introducing the guide, the platform, and who it's for
3. A series of numbered prompt sections. For each prompt, output:
   <div class="card">
     <h3><span class="prompt-number">N</span> Prompt Title</h3>
     <div class="prompt-text">The actual prompt text the user should copy and use</div>
     <p class="explanation">Explanation of what this prompt does and why it works</p>
     <div class="tip">A practical tip for getting the best results with this prompt</div>
   </div>
4. End with a brief closing section with next steps

QUALITY REQUIREMENTS:
- Every prompt must be REAL, SPECIFIC, and IMMEDIATELY USABLE (not generic placeholders)
- Include platform-specific syntax and features (e.g., Midjourney parameters like --ar, --v, --style)
- Tailor complexity to the specified skill level
- Make prompts progressively more sophisticated
- Include concrete examples with the topic woven in
- Each prompt should teach a different technique or approach
- Do NOT include any markdown — output pure HTML only
- Do NOT wrap output in code fences or backticks

Write with authority and clarity. Make the reader feel like they're learning from an expert.`;

export const promptGuideSkill: SkillConfig = {
  id: 'prompt-guide',
  name: 'AI Prompt Guide',
  description:
    'Generate a professional prompt engineering guide with actionable prompts, explanations, and tips for any AI platform.',
  difficulty: 'easy',
  icon: '📝',
  category: 'Writing',
  inputSchema,
  systemPrompt,
  outputFormat: 'html',
  outputPipeline: createHtmlOutput,
};
