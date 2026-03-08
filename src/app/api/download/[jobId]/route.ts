import { NextRequest } from "next/server";
import { jobStore } from "@/lib/engine/job-store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  const job = jobStore.getJob(jobId);
  if (!job || job.status !== "complete" || !job.output) {
    return new Response(JSON.stringify({ error: "Job not found or not ready" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const contentType = job.output.contentType ?? "application/octet-stream";
  const filename = job.output.filename ?? `${jobId}.bin`;

  return new Response(new Uint8Array(job.output.data), {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
