import { query } from '@anthropic-ai/claude-agent-sdk';
import { getAsset } from './deck-tools';

export interface PptxSlideSpec {
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

const EDITOR_SYSTEM_PROMPT = `You are a presentation editor. You only edit deck JSON.

Input:
- Original slides JSON array
- Edit request from user

Task:
- Return ONLY a valid JSON array of slides
- Preserve structure and slide count unless request asks otherwise
- Keep existing asset IDs unless request asks to swap visuals
- Keep each bullet concise and consultant-style
- Never add markdown fences or commentary`;

function parseSlides(raw: string): PptxSlideSpec[] {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
  if (!arrayMatch) throw new Error('Could not parse edited slides JSON array');
  const parsed = JSON.parse(arrayMatch[0]);
  if (!Array.isArray(parsed)) throw new Error('Edited output is not a JSON array');
  return parsed as PptxSlideSpec[];
}

export async function editDeckSlidesWithAgent(
  originalSlides: PptxSlideSpec[],
  editPrompt: string,
  options?: { targetSlideNumber?: number },
): Promise<PptxSlideSpec[]> {
  let lastOutput = '';

  const targetHint =
    typeof options?.targetSlideNumber === 'number' && options.targetSlideNumber > 0
      ? `\n\nFocus this edit on slide #${options.targetSlideNumber} unless the request explicitly asks to change other slides.`
      : '';

  for await (const message of query({
    prompt: `${EDITOR_SYSTEM_PROMPT}\n\nOriginal slides JSON:\n${JSON.stringify(originalSlides, null, 2)}\n\nEdit request:\n${editPrompt}${targetHint}`,
    options: {
      model: 'sonnet',
      maxTurns: 4,
      allowedTools: [],
      systemPrompt: EDITOR_SYSTEM_PROMPT,
    },
  })) {
    if (message.type === 'assistant' && message.message?.content) {
      for (const block of message.message.content) {
        if ('text' in block && block.text) {
          lastOutput = block.text;
        }
      }
    }
    if (message.type === 'result' && message.subtype === 'success' && message.result) {
      lastOutput = String(message.result);
    }
  }

  if (!lastOutput) throw new Error('Editor agent produced no output');

  const edited = parseSlides(lastOutput);

  for (const slide of edited) {
    if (slide.imageAssetId && !getAsset(slide.imageAssetId)) {
      delete slide.imageAssetId;
    }
    if (slide.diagramAssetId && !getAsset(slide.diagramAssetId)) {
      delete slide.diagramAssetId;
    }
  }

  return edited;
}
