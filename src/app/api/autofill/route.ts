import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSkill } from "@/lib/skills/registry";

export async function POST(req: NextRequest) {
  try {
    const { skillId, filledFields, allFieldNames } = await req.json();

    if (!skillId || !filledFields || !allFieldNames) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const skill = getSkill(skillId);
    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    const emptyFields = allFieldNames.filter(
      (name: string) => !filledFields[name] || filledFields[name] === ""
    );

    if (emptyFields.length === 0) {
      return NextResponse.json({ suggestions: {} });
    }

    const client = new Anthropic();

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: `You are a creative assistant helping users fill out forms for generating digital products. Based on the context provided, suggest compelling, professional values for the empty fields. Return ONLY valid JSON with field names as keys and suggested values as strings. Be creative and specific — not generic.`,
      messages: [
        {
          role: "user",
          content: `Product type: ${skill.name}
Description: ${skill.description}

Fields already filled in:
${Object.entries(filledFields)
  .filter(([, v]) => v && v !== "")
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}

Empty fields that need suggestions:
${emptyFields.map((f: string) => `- ${f}`).join("\n")}

Return JSON with suggestions for ONLY the empty fields. Make them relevant to what's already been filled in.`,
        },
      ],
    });

    const text = message.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("");

    // Extract JSON from response
    let suggestions: Record<string, string> = {};
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      }
    } catch {
      return NextResponse.json({ suggestions: {} });
    }

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
