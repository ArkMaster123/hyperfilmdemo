import { getSkill } from '../skills/registry';
import { jobStore } from './job-store';
import { executeSkill } from './executor';

export async function generateProduct(
  skillId: string,
  inputs: Record<string, any>,
): Promise<string> {
  const skill = getSkill(skillId);
  if (!skill) throw new Error(`Unknown skill: ${skillId}`);

  // Validate inputs
  const result = skill.inputSchema.safeParse(inputs);
  if (!result.success) {
    throw new Error(
      `Invalid inputs: ${result.error.issues.map((i: any) => i.message).join(', ')}`,
    );
  }

  const jobId = jobStore.createJob(skillId);

  // Fire and forget — don't await
  executeSkill(jobId, skill, result.data).catch((err) => {
    jobStore.failJob(jobId, err.message);
    jobStore.addEvent(jobId, { type: 'error', message: err.message });
  });

  return jobId;
}
