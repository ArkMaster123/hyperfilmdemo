import { NextRequest, NextResponse } from "next/server";
import { generateProduct } from "@/lib/engine/orchestrator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { skillId, inputs } = body;

    if (!skillId || !inputs) {
      return NextResponse.json(
        { error: "skillId and inputs are required" },
        { status: 400 }
      );
    }

    const jobId = await generateProduct(skillId, inputs);
    return NextResponse.json({ jobId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
