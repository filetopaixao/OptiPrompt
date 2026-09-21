"use client";

import { useState, useTransition } from "react";
import { Check, Copy, FolderPlus, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  createCollaboratorUser,
  createProject,
  removeCollaboratorUser,
  removeProject,
} from "@/app/app/projects/actions";

interface MemberRow {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  mustChangePassword: boolean;
}

interface ProjectRow {
  id: string;
  name: string;
  members: MemberRow[];
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  function resetAndClose() {
    setOpen(false);
    setName("");
  }

  function handleSubmit() {
    startTransition(async () => {
      const result = await createProject({ name });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      resetAndClose();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : resetAndClose())}>
      <DialogTrigger render={<Button />}>
        <FolderPlus />
        Novo projeto
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo projeto</DialogTitle>
          <DialogDescription>
            Colaboradores adicionados a este projeto compartilham histórico entre si, mas não com
            outros projetos.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="project-name">Nome do projeto</Label>
          <Input
            id="project-name"
            placeholder="Ex.: Cliente Acme"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isPending || !name.trim()}>
            Criar projeto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RemoveProjectButton({ project }: { project: ProjectRow }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await removeProject(project.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Projeto removido.");
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
          <DialogTitle>Remover projeto</DialogTitle>
          <DialogDescription>
            Isso apaga o projeto <strong>{project.name}</strong>, os logins de{" "}
            {project.members.length} colaborador{project.members.length === 1 ? "" : "es"} e todo o
            histórico de execuções deles. Não dá pra desfazer.
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

function AddCollaboratorDialog({ projectId }: { projectId: string }) {
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
      const result = await createCollaboratorUser({ projectId, name, email });
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
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <UserPlus />
        Adicionar colaborador
      </DialogTrigger>
      <DialogContent>
        {generatedPassword ? (
          <>
            <DialogHeader>
              <DialogTitle>Colaborador criado</DialogTitle>
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
              <DialogTitle>Adicionar colaborador</DialogTitle>
              <DialogDescription>
                Cria um login pra esse colaborador acessar a plataforma usando os créditos e o
                plano da sua conta, com histórico compartilhado com os demais colaboradores deste
                projeto. Uma senha temporária é gerada e ele será obrigado a trocá-la no primeiro
                acesso.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="collaborator-name">Nome</Label>
                <Input id="collaborator-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="collaborator-email">E-mail</Label>
                <Input
                  id="collaborator-email"
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

function RemoveCollaboratorButton({ member }: { member: MemberRow }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await removeCollaboratorUser(member.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Acesso do colaborador removido.");
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
          <DialogTitle>Remover colaborador</DialogTitle>
          <DialogDescription>
            Isso apaga o login de <strong>{member.email}</strong> e todo o histórico de execuções
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

export function ProjectsManager({ projects }: { projects: ProjectRow[] }) {
  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="flex justify-end">
        <CreateProjectDialog />
      </div>

      {projects.length === 0 ? (
        <div className="flex min-h-[16rem] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center text-muted-foreground">
          <Users className="size-8" />
          <p className="text-sm">Nenhum projeto ainda. Crie o primeiro acima.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{project.name}</CardTitle>
                  <RemoveProjectButton project={project} />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {project.members.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum colaborador ainda neste projeto.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {project.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-4 rounded-lg border bg-card p-3"
                      >
                        <div className="flex flex-1 flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">
                              {member.name || member.email}
                            </span>
                            {member.mustChangePassword && (
                              <Badge variant="outline" className="text-xs">
                                Ainda não trocou a senha
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {member.email} · desde {dateFormatter.format(new Date(member.createdAt))}
                          </p>
                        </div>
                        <RemoveCollaboratorButton member={member} />
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-start">
                  <AddCollaboratorDialog projectId={project.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
