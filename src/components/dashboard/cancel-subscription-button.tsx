"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CancelSubscriptionButton({ currentPeriodEnd }: { currentPeriodEnd: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const periodEndLabel = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString("pt-BR")
    : "o fim do ciclo atual";

  async function handleConfirm() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/stripe/cancel-subscription", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? "Não foi possível cancelar a assinatura.");
        return;
      }

      toast.success("Cancelamento agendado. Você mantém acesso e seus créditos até lá.");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Erro de rede ao cancelar a assinatura.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" />}>Cancelar assinatura</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar assinatura</DialogTitle>
          <DialogDescription>
            Você continua com acesso total e os créditos do seu plano até <strong>{periodEndLabel}</strong>.
            Depois dessa data sua assinatura é encerrada e o acesso é bloqueado. Enquanto o cancelamento
            estiver agendado, não é possível comprar pacotes avulsos de crédito.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Voltar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className="animate-spin" />}
            Confirmar cancelamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
