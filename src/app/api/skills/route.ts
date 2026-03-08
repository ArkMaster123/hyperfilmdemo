import { NextResponse } from "next/server";
import { getAllSkills } from "@/lib/skills/registry";

export async function GET() {
  const skills = getAllSkills();

  const metadata = skills.map(({ id, name, description, difficulty, icon, category }) => ({
    id,
    name,
    description,
    difficulty,
    icon,
    category,
  }));

  return NextResponse.json(metadata);
}
