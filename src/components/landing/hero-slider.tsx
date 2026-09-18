"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CostSnapshotCard } from "./cost-snapshot-card";

const SLIDES = [
  { id: "live", label: "Painel ao vivo" },
  { id: "report", label: "Teste de prompt" },
] as const;

export function HeroSlider() {
  const [active, setActive] = useState(0);

  function goTo(index: number) {
    setActive((index + SLIDES.length) % SLIDES.length);
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        id="demo"
        className="relative h-[440px] scroll-mt-24 overflow-hidden rounded-2xl sm:h-[480px]"
      >
        <div
          className={cn(
            "absolute inset-0 h-full transition-opacity duration-300",
            active === 0 ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <CostSnapshotCard />
        </div>
        <div
          className={cn(
            "absolute inset-0 h-full overflow-hidden rounded-2xl border border-white/10 bg-white p-3 shadow-2xl shadow-black/40 transition-opacity duration-300 sm:p-4",
            active === 1 ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <div className="relative h-full w-full overflow-hidden rounded-lg">
            <Image
              src="/hero/prompt-test-workspace-v2.png"
              alt="Comparação de custo entre modelos de IA no painel do OptiPrompt"
              fill
              sizes="(max-width: 1024px) 100vw, 600px"
              className="object-contain"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => goTo(active - 1)}
          aria-label="Slide anterior"
          className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-background/80 p-1.5 text-foreground shadow-md backdrop-blur transition-colors hover:bg-background"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => goTo(active + 1)}
          aria-label="Próximo slide"
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-background/80 p-1.5 text-foreground shadow-md backdrop-blur transition-colors hover:bg-background"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="flex items-center justify-center gap-2">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => goTo(index)}
            aria-label={slide.label}
            className={cn(
              "h-1.5 rounded-full transition-all",
              active === index ? "w-6 bg-primary" : "w-1.5 bg-white/20",
            )}
          />
        ))}
      </div>
    </div>
  );
}
