import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <SlidersHorizontal className="size-5 text-primary" />
          OptiPrompt
        </Link>
        <nav className="flex items-center gap-4">
          <a href="#planos" className="text-sm text-muted-foreground hover:text-foreground">
            Planos
          </a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground">
            FAQ
          </a>
          <a href="#planos" className={buttonVariants({ size: "sm" })}>
            Assinar agora
          </a>
        </nav>
      </div>
    </header>
  );
}
