import { SkillConfig } from './types';
import { promptGuideSkill } from './prompt-guide';
import { emailTemplatesSkill } from './email-templates';
import { contentCalendarSkill } from './content-calendar';
import { iconPackSkill } from './icon-pack';
import { motionGraphicsSkill } from './motion-graphics';
import { brandKitSkill } from './brand-kit';
import { proposalDeckSkill } from './proposal-deck';

const skills = new Map<string, SkillConfig>();

export function registerSkill(skill: SkillConfig) {
  skills.set(skill.id, skill);
}

export function getSkill(id: string): SkillConfig | undefined {
  return skills.get(id);
}

export function getAllSkills(): SkillConfig[] {
  return Array.from(skills.values());
}

// Also export skill metadata for the frontend (without system prompts/pipelines)
export function getSkillMeta(id: string) {
  const s = skills.get(id);
  if (!s) return undefined;
  return {
    id: s.id,
    name: s.name,
    description: s.description,
    difficulty: s.difficulty,
    icon: s.icon,
    category: s.category,
  };
}

export function getAllSkillsMeta() {
  return Array.from(skills.values()).map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    difficulty: s.difficulty,
    icon: s.icon,
    category: s.category,
  }));
}

// Register built-in skills
registerSkill(promptGuideSkill);
registerSkill(emailTemplatesSkill);
registerSkill(contentCalendarSkill);
registerSkill(iconPackSkill);
registerSkill(motionGraphicsSkill);
registerSkill(brandKitSkill);
registerSkill(proposalDeckSkill);
