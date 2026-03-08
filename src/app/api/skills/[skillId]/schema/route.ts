import { NextRequest, NextResponse } from "next/server";
import { getSkill } from "@/lib/skills/registry";
import { zodToJsonSchema } from "@/lib/utils/zod-to-json";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ skillId: string }> }
) {
  const { skillId } = await params;

  const skill = getSkill(skillId);
  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  const schema = zodToJsonSchema(skill.inputSchema);
  return NextResponse.json(schema);
}
