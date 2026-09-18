import { SlidersHorizontal } from "lucide-react";
import { UsageProgressBar } from "@/components/dashboard/usage-progress-bar";
import { UsageProvider } from "@/components/dashboard/usage-context";
import { MainNav } from "@/components/layout/main-nav";
import { requireActiveSubscription } from "@/lib/auth/require-active-subscription";

// Todo o grupo de rotas depende do usuário autenticado e do banco em tempo
// real (créditos, histórico) — nunca deve ser pré-renderizado estaticamente.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: LayoutProps<"/">) {
  await requireActiveSubscription();

  return (
    <UsageProvider>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-6 border-b bg-background/80 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <SlidersHorizontal className="size-5 text-primary" />
            OptiPrompt
          </div>
          <MainNav />
          <div className="ml-auto">
            <UsageProgressBar />
          </div>
        </header>
        <main className="flex-1 bg-muted/30">{children}</main>
      </div>
    </UsageProvider>
  );
}
