import { getCurrentUserId } from "@/lib/auth/current-user";
import { Logo } from "@/components/brand/logo";
import { ChangePasswordForm } from "./change-password-form";

export const dynamic = "force-dynamic";

export default async function TrocarSenhaPage() {
  await getCurrentUserId();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-sm rounded-xl border bg-background p-8 shadow-sm">
        <Logo className="mb-6" />
        <h1 className="text-xl font-semibold tracking-tight">Defina uma nova senha</h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">
          Sua conta foi criada com uma senha provisória. Escolha uma nova senha para continuar.
        </p>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
