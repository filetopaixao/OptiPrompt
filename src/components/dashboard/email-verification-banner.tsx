"use client";

import { useState, useTransition } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { resendVerificationEmail } from "@/lib/email/resend-verification-action";

/** Só aparece pra conta do plano Free com e-mail ainda não confirmado (ver
 * DashboardLayout) — a execução diária do Free exige e-mail confirmado
 * (ver checkFreeTierExecutionAllowed), então esse aviso explica por que o
 * botão "Executar comparação" vai recusar até o usuário confirmar. */
export function EmailVerificationBanner() {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  function handleResend() {
    startTransition(async () => {
      const result = await resendVerificationEmail();
      if (result.ok) {
        setSent(true);
        toast.success("E-mail de confirmação reenviado.");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="border-b bg-amber-50 px-4 py-3 text-amber-900 sm:px-6 dark:bg-amber-950/40 dark:text-amber-200">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 text-sm">
        <Mail className="size-4 shrink-0" />
        <p className="flex-1">
          Confirme seu e-mail para liberar sua execução gratuita diária. Verifique sua caixa de entrada.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleResend}
          disabled={isPending || sent}
          className="h-7 border-amber-300 bg-transparent text-xs text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-950"
        >
          {sent ? "E-mail reenviado" : "Reenviar e-mail"}
        </Button>
      </div>
    </div>
  );
}
