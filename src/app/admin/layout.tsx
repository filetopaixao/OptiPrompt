import { ShieldAlert } from "lucide-react";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="flex items-center gap-2 border-b bg-background px-4 py-4 sm:px-6">
        <ShieldAlert className="size-5 text-primary" />
        <span className="font-semibold">OptiPrompt — Painel interno</span>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
