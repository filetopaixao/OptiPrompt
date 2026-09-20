import { Lock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { ReactNode } from "react";

/**
 * Mostra o recurso de verdade (com dados reais) borrado ao fundo, com um
 * cadeado por cima — dá pra perceber que a funcionalidade existe e o que ela
 * faz, mas não dá pra ler nenhum número. Funciona bem melhor como incentivo
 * de upgrade do que simplesmente esconder a seção inteira.
 */
export function LockedFeatureCard({
  message,
  previewContent,
}: {
  message: string;
  previewContent: ReactNode;
}) {
  return (
    <div className="relative h-96 overflow-hidden rounded-xl">
      <div aria-hidden className="pointer-events-none h-full select-none overflow-hidden blur-md">
        {previewContent}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/45 p-6 text-center backdrop-blur-[1px]">
        <Lock className="size-6 text-muted-foreground" />
        <p className="text-sm font-semibold">Recurso bloqueado</p>
        <p className="max-w-xs text-sm text-muted-foreground">{message}</p>
        <a href="/app/billing" className={buttonVariants({ size: "sm" })}>
          Ver planos
        </a>
      </div>
    </div>
  );
}
