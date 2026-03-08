"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle, FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSkillById, difficultyConfig } from "@/lib/skills";
import { SkillForm, type FieldSchema } from "@/components/skill-form";
import { GenerationProgress } from "@/components/generation-progress";
import { OutputPreview } from "@/components/output-preview";
import { DownloadButton } from "@/components/download-button";

type PageState = "idle" | "loading-schema" | "generating" | "complete" | "error";

// Fallback fields if schema endpoint isn't available yet
const fallbackFields: FieldSchema[] = [
  {
    name: "topic",
    type: "string",
    label: "Topic / Subject",
    description: "What should this be about?",
    required: true,
  },
  {
    name: "style",
    type: "enum",
    label: "Style",
    description: "Choose a visual style",
    required: false,
    options: ["Professional", "Creative", "Minimal", "Bold"],
    defaultValue: "Professional",
  },
  {
    name: "description",
    type: "string",
    label: "Additional Details",
    description: "Any extra context or requirements",
    required: false,
  },
];

export default function SkillPage() {
  const params = useParams();
  const skillId = params.skillId as string;
  const skill = getSkillById(skillId);

  const [state, setState] = useState<PageState>("loading-schema");
  const [fields, setFields] = useState<FieldSchema[]>([]);
  const [messages, setMessages] = useState<{ message: string; progress: number }[]>([]);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [previewHtml, setPreviewHtml] = useState("");
  const [filename, setFilename] = useState("");
  const [jobId, setJobId] = useState("");
  const [error, setError] = useState("");
  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch schema on mount
  useEffect(() => {
    async function fetchSchema() {
      try {
        const res = await fetch(`/api/skills/${skillId}/schema`);
        if (!res.ok) throw new Error("Failed to load form schema");
        const data = await res.json();
        // The API returns FieldSchema[] directly (from zodToJsonSchema)
        setFields(Array.isArray(data) ? data : data.fields || []);
        setState("idle");
      } catch {
        setFields(fallbackFields);
        setState("idle");
      }
    }
    fetchSchema();
  }, [skillId]);

  const handleGenerate = useCallback(
    async (inputs: Record<string, unknown>) => {
      setState("generating");
      setMessages([]);
      setCurrentProgress(0);
      setPreviewHtml("");
      setError("");

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skillId, inputs }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to start generation");
        }

        const { jobId: newJobId } = await res.json();
        setJobId(newJobId);

        // Connect to SSE stream
        const es = new EventSource(`/api/stream/${newJobId}`);
        eventSourceRef.current = es;

        es.addEventListener("progress", (e) => {
          const data = JSON.parse(e.data);
          setMessages((prev) => [
            ...prev,
            { message: data.message, progress: data.progress },
          ]);
          setCurrentProgress(data.progress);
        });

        es.addEventListener("complete", (e) => {
          const data = JSON.parse(e.data);
          setPreviewHtml(data.previewHtml || "");
          setFilename(data.filename || "output.html");
          setCurrentProgress(100);
          setState("complete");
          es.close();
        });

        es.addEventListener("error", (e) => {
          if (e instanceof MessageEvent) {
            const data = JSON.parse(e.data);
            setError(data.message || "Generation failed");
          } else {
            setError("Connection lost during generation");
          }
          setState("error");
          es.close();
        });

        es.onerror = () => {
          setState((prev) => {
            if (prev === "generating") {
              setError("Connection lost during generation");
              return "error";
            }
            return prev;
          });
          es.close();
        };
      } catch (err) {
        setError(err instanceof Error ? err.message : "Generation failed");
        setState("error");
      }
    },
    [skillId]
  );

  const handleReset = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setState("idle");
    setMessages([]);
    setCurrentProgress(0);
    setPreviewHtml("");
    setError("");
    setJobId("");
    setFilename("");
  }, []);

  if (!skill) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background bg-grid">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.2_0.03_270/30%)_0%,transparent_60%)]" />
        <div className="relative text-center animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Skill Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The requested product template does not exist.
          </p>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="size-3.5" />
              Back to templates
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const diffConfig = difficultyConfig[skill.difficulty];

  return (
    <div className="relative min-h-screen bg-background bg-grid">
      {/* Radial gradient overlay */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.2_0.03_270/30%)_0%,transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-6 py-8 sm:px-8 sm:py-12">
        {/* Back navigation */}
        <nav className="mb-8 animate-fade-in">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to templates
          </Link>
        </nav>

        {/* Two-column layout */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left column -- Skill info + Form */}
          <div className="animate-fade-in">
            {/* Skill header */}
            <div className="mb-8">
              <div className="flex items-start gap-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-card ring-1 ring-white/[0.06] text-2xl shrink-0">
                  {skill.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                      {skill.name}
                    </h1>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${diffConfig.className}`}
                    >
                      {skill.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {skill.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Form card */}
            <div className="rounded-xl border border-border bg-card/50 p-6">
              {state === "loading-schema" ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                      <div className="h-9 w-full rounded-lg bg-muted animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                <SkillForm
                  fields={fields}
                  onSubmit={handleGenerate}
                  disabled={state === "generating"}
                />
              )}
            </div>
          </div>

          {/* Right column -- Preview / Progress / Empty state */}
          <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            {(state === "idle" || state === "loading-schema") && (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/20 p-8 text-center">
                <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-muted/40">
                  <FileText className="size-6 text-muted-foreground/50" />
                </div>
                <h3 className="text-sm font-medium text-foreground/80 mb-1">
                  Ready to generate
                </h3>
                <p className="text-xs text-muted-foreground/50 max-w-[240px]">
                  Fill in the details on the left and hit Generate to create
                  your digital product.
                </p>
              </div>
            )}

            {state === "generating" && (
              <GenerationProgress
                messages={messages}
                currentProgress={currentProgress}
              />
            )}

            {state === "complete" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-card/50 p-6">
                  <OutputPreview previewHtml={previewHtml} filename={filename} />
                </div>
                <DownloadButton jobId={jobId} filename={filename} />
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleReset}
                >
                  <RefreshCw className="size-3.5" />
                  Generate Again
                </Button>
              </div>
            )}

            {state === "error" && (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
                <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-destructive/10">
                  <AlertCircle className="size-6 text-destructive" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  Generation failed
                </h3>
                <p className="text-xs text-muted-foreground mb-6 max-w-[280px]">
                  {error}
                </p>
                <Button variant="outline" className="gap-2" onClick={handleReset}>
                  <RefreshCw className="size-3.5" />
                  Try again
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
