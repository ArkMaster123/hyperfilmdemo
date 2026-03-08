import { NextRequest, NextResponse } from "next/server";
import { jobStore } from "@/lib/engine/job-store";
import { editDeckSlidesWithAgent } from "@/lib/services/pptx-agent-editor";
import { createPptxOutputFromSlides } from "@/lib/output/pptx-pipeline";
import { restoreAssets, type SerializedDeckAsset } from "@/lib/services/deck-tools";

type DeckMeta = {
  slides?: unknown;
  styleName?: unknown;
  companyName?: unknown;
  deckAssets?: unknown;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const jobId = String(body?.jobId || "").trim();
    const editPrompt = String(body?.editPrompt || "").trim();
    const targetSlideNumberRaw = body?.targetSlideNumber;
    const targetSlideNumber =
      typeof targetSlideNumberRaw === "number" && Number.isFinite(targetSlideNumberRaw)
        ? Math.max(1, Math.floor(targetSlideNumberRaw))
        : undefined;

    if (!jobId || !editPrompt) {
      return NextResponse.json(
        { error: "jobId and editPrompt are required" },
        { status: 400 }
      );
    }

    const job = jobStore.getJob(jobId);
    if (!job || job.status !== "complete" || !job.output) {
      return NextResponse.json(
        { error: "Job not found or not ready" },
        { status: 404 }
      );
    }

    if (job.output.contentType !== "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
      return NextResponse.json(
        { error: "This editor currently supports PPTX outputs only" },
        { status: 400 }
      );
    }

    const meta = (job.output.meta || {}) as DeckMeta;
    if (!Array.isArray(meta.slides)) {
      return NextResponse.json(
        { error: "Deck edit metadata is missing. Regenerate this deck once, then try editing again." },
        { status: 400 }
      );
    }

    jobStore.addEvent(jobId, {
      type: "progress",
      message: "Agent editor is updating the deck...",
      progress: 92,
    });

    if (Array.isArray(meta.deckAssets)) {
      restoreAssets(meta.deckAssets as SerializedDeckAsset[]);
    }

    const editedSlides = await editDeckSlidesWithAgent(
      meta.slides as Parameters<typeof editDeckSlidesWithAgent>[0],
      editPrompt,
      { targetSlideNumber }
    );
    const output = await createPptxOutputFromSlides(editedSlides, {
      style: typeof meta.styleName === "string" ? meta.styleName : "professional",
      companyName: typeof meta.companyName === "string" ? meta.companyName : "",
    });

    output.meta = {
      ...(output.meta || {}),
      deckAssets: Array.isArray(meta.deckAssets) ? meta.deckAssets : [],
    };

    jobStore.completeJob(jobId, output);
    jobStore.addEvent(jobId, {
      type: "complete",
      message: "Deck updated.",
      filename: output.filename,
      preview: output.preview,
      progress: 100,
    });

    return NextResponse.json({
      jobId,
      filename: output.filename,
      preview: output.preview,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
