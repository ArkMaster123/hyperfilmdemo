import Anthropic from '@anthropic-ai/sdk';
import { SkillConfig } from '../skills/types';
import { jobStore } from './job-store';
import { snapshotAssets } from '../services/deck-tools';

export async function executeSkill(
  jobId: string,
  skill: SkillConfig,
  inputs: Record<string, any>,
): Promise<void> {
  jobStore.addEvent(jobId, {
    type: 'progress',
    message: `Starting ${skill.name}...`,
    progress: 5,
  });

  // Build user message from inputs
  const userMessage = Object.entries(inputs)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  if (skill.agentMode && skill.mcpServerFactory) {
    await executeAgentSkill(jobId, skill, inputs, userMessage);
  } else {
    await executeSimpleSkill(jobId, skill, inputs, userMessage);
  }
}

/**
 * Simple skill — direct Claude API streaming, no tools.
 * Used for HTML-output skills (prompt guide, emails, calendar, etc.)
 */
async function executeSimpleSkill(
  jobId: string,
  skill: SkillConfig,
  inputs: Record<string, any>,
  userMessage: string,
): Promise<void> {
  const client = new Anthropic();

  jobStore.addEvent(jobId, {
    type: 'progress',
    message: 'Generating content...',
    progress: 10,
  });

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
      if (accumulated.length - lastProgressAt > 500) {
        lastProgressAt = accumulated.length;
        const progress = Math.min(80, 20 + Math.floor((accumulated.length / 4000) * 60));
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

    const output = await skill.outputPipeline(rawOutput, inputs);

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

/**
 * Agent skill — uses Claude Agent SDK with MCP tools.
 * The agent autonomously decides when to fetch images, create diagrams, etc.
 */
async function executeAgentSkill(
  jobId: string,
  skill: SkillConfig,
  inputs: Record<string, any>,
  userMessage: string,
): Promise<void> {
  let cleanup: (() => void) | undefined;

  try {
    // Dynamic import to avoid loading Agent SDK for simple skills
    const { query } = await import('@anthropic-ai/claude-agent-sdk');

    const { server, cleanup: serverCleanup } = skill.mcpServerFactory!();
    cleanup = serverCleanup;

    jobStore.addEvent(jobId, {
      type: 'progress',
      message: 'Agent is planning the deck...',
      progress: 10,
    });

    let lastOutput = '';
    let toolCallCount = 0;

    for await (const message of query({
      prompt: `${skill.systemPrompt}\n\n---\n\nUser request:\n${userMessage}`,
      options: {
        mcpServers: { "deck-tools": server },
        allowedTools: [
          "mcp__deck-tools__fetch_image",
          "mcp__deck-tools__create_diagram",
        ],
        maxTurns: 15,
        model: 'sonnet',
        systemPrompt: skill.systemPrompt,
      },
    })) {
      if (message.type === 'assistant' && message.message?.content) {
        for (const block of message.message.content) {
          if ('text' in block && block.text) {
            lastOutput = block.text;
            const progress = Math.min(75, 15 + toolCallCount * 10);
            jobStore.addEvent(jobId, {
              type: 'progress',
              message: `Agent is writing slides...`,
              progress,
            });
          }
          if ('name' in block) {
            toolCallCount++;
            const toolName = (block as any).name || 'tool';
            if (toolName.includes('fetch_image')) {
              jobStore.addEvent(jobId, {
                type: 'progress',
                message: `Fetching image for slide...`,
                progress: Math.min(80, 20 + toolCallCount * 8),
              });
            } else if (toolName.includes('create_diagram')) {
              jobStore.addEvent(jobId, {
                type: 'progress',
                message: `Creating business diagram...`,
                progress: Math.min(80, 20 + toolCallCount * 8),
              });
            }
          }
        }
      }

      if (message.type === 'result' && message.subtype === 'success') {
        if (message.result) {
          lastOutput = String(message.result);
        }
      }
    }

    if (!lastOutput) {
      throw new Error('Agent produced no output');
    }

    jobStore.addEvent(jobId, {
      type: 'progress',
      message: 'Building PPTX file...',
      progress: 85,
    });

    const output = await skill.outputPipeline(lastOutput, inputs);

    if (skill.id === 'proposal-deck') {
      output.meta = {
        ...(output.meta || {}),
        deckAssets: snapshotAssets(),
      };
    }

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
  } finally {
    if (cleanup) cleanup();
  }
}
