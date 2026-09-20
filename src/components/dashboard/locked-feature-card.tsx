import { Lock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { ReactNode } from "react";

/**
 * Mostra um preview (com dados de EXEMPLO, nunca os reais do usuário — ver
 * chamada em dashboard-workspace.tsx) levemente borrado ao fundo, com um
 * cadeado por cima nomeando o recurso bloqueado. Dá pra perceber o que a
 * funcionalidade faz sem revelar número nenhum de verdade — importante
 * porque um blur é só CSS: quem abrir o DevTools e remover a classe via
 * inspecionar elemento veria o conteúdo por trás dele. Por isso o preview
 * nunca pode carregar os dados reais da execução, só uma amostra fake.
 */
export function LockedFeatureCard({
  featureName,
  message,
  previewContent,
}: {
  featureName: string;
  message: string;
  previewContent: ReactNode;
}) {
  return (
    <div className="relative h-96 overflow-hidden rounded-xl">
      <div aria-hidden className="pointer-events-none h-full select-none overflow-hidden blur-sm">
        {previewContent}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/30 p-6">
        {/* Fundo opaco só no bloco de texto — o preview borrado tem cores
         * fortes (barras do gráfico) que atravessavam um overlay só
         * semi-transparente e sujavam a leitura da mensagem. */}
        <div className="flex flex-col items-center gap-2 rounded-xl bg-background p-5 text-center shadow-lg ring-1 ring-foreground/10">
          <Lock className="size-6 text-muted-foreground" />
          <p className="text-sm font-semibold">{featureName} bloqueada</p>
          <p className="max-w-xs text-sm text-muted-foreground">{message}</p>
          <a href="/app/billing" className={buttonVariants({ size: "sm" })}>
            Ver planos
          </a>
        </div>
      </div>
    </div>
  );
}
