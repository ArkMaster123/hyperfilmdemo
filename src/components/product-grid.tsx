"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { skills, difficultyConfig } from "@/lib/skills";
import { ArrowRight } from "lucide-react";

const iconColorMap: Record<string, string> = {
  emerald: "text-emerald-400 bg-emerald-500/10 ring-emerald-500/20",
  amber: "text-amber-400 bg-amber-500/10 ring-amber-500/20",
  rose: "text-rose-400 bg-rose-500/10 ring-rose-500/20",
};

export function ProductGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {skills.map((skill, index) => {
        const Icon = skill.icon;
        const iconClasses = iconColorMap[skill.color] || iconColorMap.emerald;

        return (
          <Link
            key={skill.id}
            href={`/skill/${skill.id}`}
            className={`group animate-fade-in-up stagger-${index + 1}`}
          >
            <Card className="relative h-full border-0 bg-card/50 ring-1 ring-white/[0.06] transition-all duration-300 hover:ring-white/[0.12] hover:bg-card/80 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div
                    className={`flex size-10 items-center justify-center rounded-lg ring-1 ${iconClasses}`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${difficultyConfig[skill.difficulty].className}`}
                  >
                    {skill.difficulty}
                  </span>
                </div>
                <CardTitle className="mt-3 text-[15px] font-semibold text-foreground/95 group-hover:text-foreground transition-colors">
                  {skill.name}
                </CardTitle>
                <CardDescription className="text-[13px] leading-relaxed text-muted-foreground/80">
                  {skill.description}
                </CardDescription>
              </CardHeader>
              <CardFooter className="border-0 bg-transparent pt-0 pb-4 px-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto gap-1.5 text-xs text-muted-foreground group-hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  Generate
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
