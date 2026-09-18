import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-4">
          <a href="#planos" className="text-sm text-muted-foreground hover:text-foreground">
            Planos
          </a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground">
            FAQ
          </a>
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
            Entrar
          </Link>
          <a href="#planos" className={buttonVariants({ size: "sm" })}>
            Assinar agora
          </a>
        </nav>
      </div>
    </header>
  );
}
