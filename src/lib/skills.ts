export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: Difficulty;
  color: string;
}

export const skills: Skill[] = [
  {
    id: "prompt-guide",
    name: "Prompt Guide Generator",
    description: "Generate step-by-step AI prompt guides for any platform",
    icon: "\u{1F4DD}",
    difficulty: "Easy",
    color: "emerald",
  },
  {
    id: "email-template",
    name: "Email Template Pack",
    description: "Create professional HTML email templates",
    icon: "\u{1F4E7}",
    difficulty: "Easy",
    color: "emerald",
  },
  {
    id: "content-calendar",
    name: "Content Calendar",
    description: "Build social media content calendars with post ideas",
    icon: "\u{1F4C5}",
    difficulty: "Easy",
    color: "emerald",
  },
  {
    id: "proposal-deck",
    name: "Proposal Deck",
    description: "Generate professional pitch decks as PowerPoint files",
    icon: "\u{1F4CA}",
    difficulty: "Medium",
    color: "amber",
  },
  {
    id: "brand-guidelines",
    name: "Brand Guidelines Kit",
    description: "Create comprehensive brand identity guides",
    icon: "\u{1F3A8}",
    difficulty: "Medium",
    color: "amber",
  },
  {
    id: "icon-pack",
    name: "Icon Pack Generator",
    description: "Generate consistent icon sets with AI",
    icon: "\u{2728}",
    difficulty: "Hard",
    color: "rose",
  },
  {
    id: "motion-graphics",
    name: "Motion Graphics Library",
    description: "Create animated SVG motion graphics",
    icon: "\u{1F3AC}",
    difficulty: "Hard",
    color: "rose",
  },
];

export const difficultyConfig: Record<
  Difficulty,
  { label: string; className: string }
> = {
  Easy: {
    label: "Easy",
    className: "bg-emerald-500/15 text-emerald-500 border-emerald-500/20",
  },
  Medium: {
    label: "Medium",
    className: "bg-amber-500/15 text-amber-500 border-amber-500/20",
  },
  Hard: {
    label: "Hard",
    className: "bg-rose-500/15 text-rose-500 border-rose-500/20",
  },
};

export function getSkillById(id: string): Skill | undefined {
  return skills.find((s) => s.id === id);
}
