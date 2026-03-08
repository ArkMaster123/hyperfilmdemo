import { ProductGrid } from "@/components/product-grid";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background bg-grid">
      {/* Subtle radial gradient overlay */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.2_0.03_270/30%)_0%,transparent_60%)]" />

      <div className="relative mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-24">
        {/* Header / Hero */}
        <header className="mb-16 animate-fade-in">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-violet-500/15 ring-1 ring-violet-500/20">
              <Sparkles className="size-[18px] text-violet-500" />
            </div>
            <span className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              DigiForge
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            AI-Powered Digital
            <br />
            <span className="gradient-text">Product Studio</span>
          </h1>

          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
            Generate professional digital products in minutes. Choose a template
            below, provide your inputs, and let AI handle the rest.
          </p>
        </header>

        {/* Product Grid */}
        <section>
          <div className="mb-6 flex items-center gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              Templates
            </h2>
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground/60">
              7 available
            </span>
          </div>

          <ProductGrid />
        </section>

        {/* Footer */}
        <footer className="mt-24 flex items-center justify-between border-t border-border pt-6">
          <p className="text-xs text-muted-foreground/50">
            Built with AI agents
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
            <span className="inline-block size-1.5 rounded-full bg-emerald-500 animate-pulse-glow" />
            All systems operational
          </div>
        </footer>
      </div>
    </div>
  );
}
