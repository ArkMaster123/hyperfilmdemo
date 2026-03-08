"use client";

import { useRef, useEffect } from "react";
import { Eye, Maximize2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OutputPreviewProps {
  previewHtml: string;
  filename?: string;
}

export function OutputPreview({
  previewHtml,
  filename = "output.html",
}: OutputPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && previewHtml) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(previewHtml);
        doc.close();
      }
    }
  }, [previewHtml]);

  const openFullscreen = () => {
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(previewHtml);
      win.document.close();
    }
  };

  const contentType = filename.split(".").pop()?.toUpperCase() || "HTML";

  return (
    <div className="flex flex-col gap-3 animate-fade-in">
      {/* Success indicator */}
      <div className="flex items-center gap-2 text-emerald-500">
        <CheckCircle2 className="size-4" />
        <span className="text-sm font-medium">Generation complete</span>
      </div>

      {/* Preview header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="size-3.5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground/90">
            Preview
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            {contentType}
          </span>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={openFullscreen}
            title="Open in new tab"
          >
            <Maximize2 className="size-3" />
          </Button>
        </div>
      </div>

      {/* File info */}
      <div className="flex items-center gap-2 rounded-md bg-muted/30 px-3 py-1.5">
        <div className="size-1.5 rounded-full bg-emerald-500" />
        <span className="font-mono text-xs text-muted-foreground">
          {filename}
        </span>
      </div>

      {/* Preview frame */}
      <div className="relative overflow-hidden rounded-lg border border-border bg-white shadow-sm">
        <iframe
          ref={iframeRef}
          title="Output preview"
          className="h-[420px] w-full"
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
}
