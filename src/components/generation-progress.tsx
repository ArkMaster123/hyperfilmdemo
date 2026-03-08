"use client";

import { useEffect, useRef, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Clock, Terminal } from "lucide-react";

export interface ProgressMessage {
  message: string;
  progress: number;
}

interface GenerationProgressProps {
  messages: ProgressMessage[];
  currentProgress: number; // 0-100
}

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export function GenerationProgress({
  messages,
  currentProgress,
}: GenerationProgressProps) {
  const logEndRef = useRef<HTMLDivElement>(null);
  const [elapsed, setElapsed] = useState(0);
  const [startTime] = useState(() => Date.now());

  // Auto-scroll to bottom of log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="flex flex-col gap-4 animate-fade-in rounded-xl border border-border bg-card/50 p-6">
      {/* Progress header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-500 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-violet-500" />
          </div>
          <span className="text-sm font-medium text-foreground/90">
            Generating...
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3" />
          {formatElapsed(elapsed)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-500 ease-out"
          style={{ width: `${currentProgress}%` }}
        />
        {currentProgress > 0 && currentProgress < 100 && (
          <div
            className="absolute top-0 h-full w-8 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"
            style={{ left: `${currentProgress - 4}%` }}
          />
        )}
      </div>

      {/* Log messages */}
      <div className="relative rounded-lg border border-border bg-background/50 p-4">
        <div className="mb-3 flex items-center gap-2 border-b border-border pb-2.5">
          <Terminal className="size-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            Build Log
          </span>
          <span className="ml-auto text-[10px] text-muted-foreground/50 tabular-nums">
            {Math.round(currentProgress)}%
          </span>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-1.5 font-mono text-xs">
          {messages.length === 0 && (
            <div className="flex items-center gap-2 text-muted-foreground/50">
              <div className="h-3 w-3 animate-spin rounded-full border border-muted-foreground/30 border-t-muted-foreground/70" />
              <span>Initializing...</span>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className="flex gap-2 animate-slide-in-log text-muted-foreground/80"
            >
              <span className="shrink-0 text-muted-foreground/40 select-none tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-foreground/70">{msg.message}</span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
