"use client";

import { Button } from "@/components/ui/button";
import { Download, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface DownloadButtonProps {
  jobId: string;
  filename?: string;
}

export function DownloadButton({
  jobId,
  filename = "output",
}: DownloadButtonProps) {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = `/api/download/${jobId}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <Button
      onClick={handleDownload}
      size="lg"
      className={`w-full gap-2 h-11 font-medium transition-all duration-300 ${
        downloaded
          ? "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/20 ring-1 ring-emerald-500/20"
          : "bg-foreground text-background hover:bg-foreground/90"
      }`}
    >
      {downloaded ? (
        <>
          <CheckCircle2 className="size-4" />
          Downloaded
        </>
      ) : (
        <>
          <Download className="size-4" />
          Download {filename}
        </>
      )}
    </Button>
  );
}
