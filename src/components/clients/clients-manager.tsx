"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Trash2, UserPlus, Users } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { createClientUser, removeClientUser } from "@/app/app/clients/actions";

interface ClientRow {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  mustChangePassword: boolean;
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

function CreateClientDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  function resetAndClose() {
    setOpen(false);
    setName("");
    setEmail("");
    setGeneratedPassword(null);
    setCopied(false);
  }

  function handleSubmit() {
    startTransition(async () => {
      const result = await createClientUser({ name, email });
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
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : resetAndClose())}>
      <DialogTrigger render={<Button />}>
        <UserPlus />
        Adicionar cliente
      </DialogTrigger>
      <DialogContent>
        {generatedPassword ? (
          <>
            <DialogHeader>
              <DialogTitle>Cliente criado</DialogTitle>
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
              <DialogTitle>Adicionar cliente</DialogTitle>
              <DialogDescription>
                Cria um login pra esse cliente acessar a plataforma usando os créditos e o plano
                da sua conta. Uma senha temporária é gerada e ele será obrigado a trocá-la no
                primeiro acesso.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="client-name">Nome</Label>
                <Input id="client-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="client-email">E-mail</Label>
                <Input
                  id="client-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit} disabled={isPending || !name || !email}>
                Criar acesso
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RemoveClientButton({ client }: { client: ClientRow }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await removeClientUser(client.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Acesso do cliente removido.");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon-sm" />}>
        <Trash2 />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remover cliente</DialogTitle>
          <DialogDescription>
            Isso apaga o login de <strong>{client.email}</strong> e todo o histórico de execuções
            dele. Não dá pra desfazer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
            Remover
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ClientsManager({ clients }: { clients: ClientRow[] }) {
  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="flex justify-end">
        <CreateClientDialog />
      </div>

      {clients.length === 0 ? (
        <div className="flex min-h-[16rem] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center text-muted-foreground">
          <Users className="size-8" />
          <p className="text-sm">Nenhum cliente ainda. Adicione o primeiro acesso acima.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {clients.map((client) => (
            <div
              key={client.id}
              className="flex items-center gap-4 rounded-lg border bg-card p-3"
            >
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{client.name || client.email}</span>
                  {client.mustChangePassword && (
                    <Badge variant="outline" className="text-xs">
                      Ainda não trocou a senha
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {client.email} · desde {dateFormatter.format(new Date(client.createdAt))}
                </p>
              </div>
              <RemoveClientButton client={client} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
