import Anthropic from '@anthropic-ai/sdk';
import { SkillConfig } from '../skills/types';
import { jobStore } from './job-store';

export async function executeSkill(
  jobId: string,
  skill: SkillConfig,
  inputs: Record<string, any>,
): Promise<void> {
  const client = new Anthropic(); // uses ANTHROPIC_API_KEY env

  jobStore.addEvent(jobId, {
    type: 'progress',
    message: `Starting ${skill.name}...`,
    progress: 10,
  });

  // Build user message from inputs
  const userMessage = Object.entries(inputs)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  try {
    const stream = client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8192,
      system: skill.systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    let accumulated = '';
    let lastProgressAt = 0;

    stream.on('text', (text) => {
      accumulated += text;
      // Emit progress every ~500 chars
      if (accumulated.length - lastProgressAt > 500) {
        lastProgressAt = accumulated.length;
        const progress = Math.min(
          80,
          20 + Math.floor((accumulated.length / 4000) * 60),
        );
        jobStore.addEvent(jobId, {
          type: 'progress',
          message: `Generating content... (${accumulated.length} chars)`,
          progress,
        });
      }
    });

    const finalMessage = await stream.finalMessage();
    const rawOutput = finalMessage.content
      .map((b) => (b.type === 'text' ? b.text : ''))
      .join('');

    jobStore.addEvent(jobId, {
      type: 'progress',
      message: 'Processing output...',
      progress: 85,
    });

    // Run output pipeline
    const output = await skill.outputPipeline(rawOutput, inputs);

    // Complete — include preview in the complete event
    jobStore.completeJob(jobId, output);
    jobStore.addEvent(jobId, {
      type: 'complete',
      message: 'Done!',
      filename: output.filename,
      preview: output.preview,
      progress: 100,
    });
  } catch (error: any) {
    jobStore.failJob(jobId, error.message);
    jobStore.addEvent(jobId, { type: 'error', message: error.message });
  }
}
