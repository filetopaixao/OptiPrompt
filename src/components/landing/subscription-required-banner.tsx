import { AlertTriangle } from "lucide-react";

export function SubscriptionRequiredBanner() {
  return (
    <div className="border-b bg-amber-50 px-4 py-3 text-amber-900 sm:px-6 dark:bg-amber-950/40 dark:text-amber-200">
      <div className="mx-auto flex max-w-6xl items-center gap-2 text-sm">
        <AlertTriangle className="size-4 shrink-0" />
        <p>
          Identificamos que o seu pagamento não foi concluído. Escolha um plano abaixo e informe
          um cartão válido para desbloquear o OtimizaIA.{" "}
          <a href="#planos" className="font-medium underline underline-offset-2">
            Ver planos
          </a>
        </p>
      </div>
    </div>
  );
}
