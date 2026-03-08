import { GeneratedOutput } from '../skills/types';

export type OutputPipelineFunction = (
  rawOutput: string,
  inputs: Record<string, any>,
) => Promise<GeneratedOutput>;
