"use client";

import { useState } from "react";
import { Sparkles, Send, Loader2, Wand2, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AgentMessage = {
  role: "user" | "assistant";
  text: string;
};

interface DeckAgentPanelProps {
  jobId: string;
  canEdit: boolean;
  onEdited: (data: { preview: string; filename: string }) => void;
}

const QUICK_EDITS = [
  "Tighten all slide copy for executive audience",
  "Make the tone more confident and less fluffy",
  "Rewrite the title slide headline to be punchier",
  "Compress each slide to max 3 bullets",
];

export function DeckAgentPanel({ jobId, canEdit, onEdited }: DeckAgentPanelProps) {
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      role: "assistant",
      text: "I can edit your deck like Gamma-style follow-up. Ask for tone, copy, structure, or slide-specific changes.",
    },
  ]);
  const [prompt, setPrompt] = useState("");
  const [targetSlide, setTargetSlide] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  const submitEdit = async (value?: string) => {
    if (!canEdit || isEditing) return;
    const editPrompt = (value ?? prompt).trim();
    if (!editPrompt) return;

    setError("");
    setIsEditing(true);
    setMessages((prev) => [...prev, { role: "user", text: editPrompt }]);

    try {
      const parsedTarget = Number.parseInt(targetSlide, 10);
      const payload: Record<string, unknown> = {
        jobId,
        editPrompt,
      };
      if (Number.isFinite(parsedTarget) && parsedTarget > 0) {
        payload.targetSlideNumber = parsedTarget;
      }

      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(String(data?.error || "Failed to edit deck"));
      }

      onEdited({
        preview: String(data.preview || ""),
        filename: String(data.filename || "output.pptx"),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Updated. I applied those changes and regenerated the deck.",
        },
      ]);
      setPrompt("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to edit deck";
      setError(msg);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: `I hit an error: ${msg}` },
      ]);
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <aside className="rounded-xl border border-border bg-card/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-violet-400" />
          <h3 className="text-sm font-semibold">Agent</h3>
        </div>
      </div>

      {!canEdit && (
        <p className="mb-3 text-xs text-muted-foreground">
          Generate a PPTX first to enable deck editing.
        </p>
      )}

      <div className="mb-3 max-h-56 space-y-2 overflow-y-auto rounded-lg border border-border bg-background/40 p-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`rounded-md px-2 py-1.5 text-xs ${
              msg.role === "user"
                ? "ml-5 bg-violet-500/15 text-violet-100"
                : "mr-5 bg-muted/60 text-foreground/90"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {QUICK_EDITS.map((q) => (
          <button
            key={q}
            type="button"
            disabled={!canEdit || isEditing}
            onClick={() => submitEdit(q)}
            className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 px-2 py-1 text-[10px] text-violet-300 hover:bg-violet-500/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Wand2 className="size-3" />
            {q}
          </button>
        ))}
      </div>

      <div className="mb-2 flex items-center gap-2">
        <ListOrdered className="size-3.5 text-muted-foreground" />
        <Input
          value={targetSlide}
          onChange={(e) => setTargetSlide(e.target.value)}
          placeholder="Optional: slide #"
          className="h-8 bg-background text-xs"
          disabled={!canEdit || isEditing}
        />
      </div>

      <div className="flex gap-2">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask to edit this deck..."
          className="h-9 bg-background"
          disabled={!canEdit || isEditing}
        />
        <Button
          type="button"
          size="sm"
          className="h-9 gap-2"
          disabled={!canEdit || isEditing || !prompt.trim()}
          onClick={() => submitEdit()}
        >
          {isEditing ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
          {isEditing ? "Editing" : "Send"}
        </Button>
      </div>

      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </aside>
  );
}
