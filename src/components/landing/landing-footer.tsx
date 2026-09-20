import { MessageCircle } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="flex flex-col items-center gap-3 border-t py-8 text-center text-xs text-muted-foreground">
      <a
        href="https://wa.me/5571999018102"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-primary"
      >
        <MessageCircle className="size-4" />
        Fale conosco no WhatsApp: (71) 99901-8102
      </a>
      <p>© {new Date().getFullYear()} OtimizaIA. Feito para agências que levam custo de IA a sério.</p>
    </footer>
  );
}
