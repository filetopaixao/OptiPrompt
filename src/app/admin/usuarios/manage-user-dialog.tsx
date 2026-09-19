"use client";

import { useState, useTransition } from "react";
import type { SubscriptionStatus } from "@prisma/client";
import { Settings2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adjustBonusCredits, adjustCurrentCredits, resetUserCycle, updateUserAccess } from "./actions";

const STATUS_OPTIONS: { value: SubscriptionStatus; label: string }[] = [
  { value: "ACTIVE", label: "Ativa" },
  { value: "PAST_DUE", label: "Em atraso" },
  { value: "CANCELED", label: "Cancelada" },
  { value: "INACTIVE", label: "Inativa" },
];

export function ManageUserDialog({
  user,
  plans,
}: {
  user: {
    id: string;
    email: string;
    planId: string;
    subscriptionStatus: SubscriptionStatus;
    bonusCredits: number;
    creditsAvailable: number;
    creditsTotal: number;
  };
  plans: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [planId, setPlanId] = useState(user.planId);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>(
    user.subscriptionStatus,
  );
  const [bonusAmount, setBonusAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSaveAccess() {
    startTransition(async () => {
      const result = await updateUserAccess({ userId: user.id, planId, subscriptionStatus });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Acesso atualizado.");
      setOpen(false);
    });
  }

  function handleResetCycle() {
    startTransition(async () => {
      const result = await resetUserCycle(user.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Consumo do ciclo zerado.");
    });
  }

  function handleAdjustBonus() {
    const amount = Number(bonusAmount);
    startTransition(async () => {
      const result = await adjustBonusCredits({ userId: user.id, amount });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`Limite máximo (avulso) agora: ${result.newBonusCredits!.toLocaleString("pt-BR")}.`);
      setBonusAmount("");
    });
  }

  function handleAdjustCurrent() {
    const amount = Number(currentAmount);
    startTransition(async () => {
      const result = await adjustCurrentCredits({ userId: user.id, amount });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`Disponível agora: ${result.newCreditsAvailable!.toLocaleString("pt-BR")}.`);
      setCurrentAmount("");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Settings2 />
        Gerenciar
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerenciar acesso</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Plano</Label>
            <Select value={planId} onValueChange={(value) => setPlanId(value ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sem plano">
                  {(value: string | null) => plans.find((plan) => plan.id === value)?.name ?? "Sem plano"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Status da assinatura</Label>
            <Select
              value={subscriptionStatus}
              onValueChange={(value) => setSubscriptionStatus(value as SubscriptionStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: SubscriptionStatus | null) =>
                    STATUS_OPTIONS.find((option) => option.value === value)?.label ?? ""
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSaveAccess} disabled={isPending} className="mt-1">
            Salvar acesso
          </Button>
        </div>

        <div className="flex flex-col gap-2 border-t pt-4">
          <Label>
            Créditos disponíveis agora{" "}
            <span className="font-normal text-muted-foreground">
              (atual: {user.creditsAvailable.toLocaleString("pt-BR")} de{" "}
              {user.creditsTotal.toLocaleString("pt-BR")})
            </span>
          </Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Ex.: 5000 ou -5000"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              disabled={isPending || !currentAmount}
              onClick={handleAdjustCurrent}
            >
              Aplicar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Muda o saldo do ciclo atual sem tocar no teto. Positivo dá mais crédito agora, negativo
            tira — não passa do limite máximo.
          </p>
        </div>

        <div className="flex flex-col gap-2 border-t pt-4">
          <Label>
            Limite máximo (avulso){" "}
            <span className="font-normal text-muted-foreground">
              (atual: {user.bonusCredits.toLocaleString("pt-BR")})
            </span>
          </Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Ex.: 5000 ou -5000"
              value={bonusAmount}
              onChange={(e) => setBonusAmount(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              disabled={isPending || !bonusAmount}
              onClick={handleAdjustBonus}
            >
              Aplicar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Aumenta ou reduz o teto de créditos do usuário (soma ao plano). Negativo remove crédito
            avulso já concedido.
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" disabled={isPending} onClick={handleResetCycle}>
            Zerar consumo do ciclo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
