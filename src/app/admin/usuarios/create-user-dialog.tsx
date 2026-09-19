"use client";

import { useState, useTransition } from "react";
import { Check, Copy, UserPlus } from "lucide-react";
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
import { createFreeUser } from "./actions";

export function CreateUserDialog({ plans }: { plans: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const [initialCredits, setInitialCredits] = useState("0");
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  function resetAndClose() {
    setOpen(false);
    setName("");
    setEmail("");
    setPlanId(plans[0]?.id ?? "");
    setInitialCredits("0");
    setGeneratedPassword(null);
    setCopied(false);
  }

  function handleSubmit() {
    startTransition(async () => {
      const result = await createFreeUser({
        name,
        email,
        planId,
        initialCredits: Number(initialCredits) || 0,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setGeneratedPassword(result.password ?? null);
    });
  }

  async function handleCopyPassword() {
    if (!generatedPassword) return;
    await navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) resetAndClose();
        else setOpen(true);
      }}
    >
      <DialogTrigger render={<Button />}>
        <UserPlus />
        Criar usuário
      </DialogTrigger>
      <DialogContent>
        {generatedPassword ? (
          <>
            <DialogHeader>
              <DialogTitle>Usuário criado</DialogTitle>
              <DialogDescription>
                Envie essa senha temporária para {email}. Ela só é exibida uma vez.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
              <code className="flex-1 text-sm">{generatedPassword}</code>
              <Button type="button" variant="ghost" size="icon-sm" onClick={handleCopyPassword}>
                {copied ? <Check className="text-primary" /> : <Copy />}
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={resetAndClose}>Concluir</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Criar usuário com acesso grátis</DialogTitle>
              <DialogDescription>
                Cria a conta já ativa, sem passar pelo Stripe. Uma senha temporária é gerada
                automaticamente e o usuário será obrigado a trocá-la no primeiro login.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="create-user-name">Nome</Label>
                <Input id="create-user-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="create-user-email">E-mail</Label>
                <Input
                  id="create-user-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Plano</Label>
                <Select value={planId} onValueChange={(value) => setPlanId(value ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um plano">
                      {(value: string | null) =>
                        plans.find((plan) => plan.id === value)?.name ?? "Selecione um plano"
                      }
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
                <Label htmlFor="create-user-credits">Créditos extras (avulsos, não vencem)</Label>
                <Input
                  id="create-user-credits"
                  type="number"
                  min={0}
                  value={initialCredits}
                  onChange={(e) => setInitialCredits(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit} disabled={isPending || !name || !email || !planId}>
                Criar usuário
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
