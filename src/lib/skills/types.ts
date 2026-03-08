import { z } from 'zod';

export interface SkillConfig {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
  category: string;
  inputSchema: z.ZodObject<any>;
  systemPrompt: string;
  outputFormat: 'html' | 'pptx' | 'zip' | 'png-zip' | 'svg-zip';
  outputPipeline: (rawOutput: string, inputs: Record<string, any>) => Promise<GeneratedOutput>;
  /** If true, this skill uses the Claude Agent SDK with tools instead of simple message streaming */
  agentMode?: boolean;
  /** MCP server config for agent-mode skills — provides tools the agent can call */
  mcpServerFactory?: () => { server: any; cleanup: () => void };
}

export interface GeneratedOutput {
  filename: string;
  contentType: string;
  data: Buffer;
  preview: string; // HTML string for in-browser preview
}

export interface JobEvent {
  type: 'progress' | 'preview' | 'complete' | 'error';
  message?: string;
  progress?: number;
  preview?: string;
  filename?: string;
  jobId?: string;
}

export interface Job {
  id: string;
  skillId: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  events: JobEvent[];
  output?: GeneratedOutput;
  error?: string;
  createdAt: Date;
}
