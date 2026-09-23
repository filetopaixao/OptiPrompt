import { EmailVerificationBanner } from "@/components/dashboard/email-verification-banner";
import { UsageProgressBar } from "@/components/dashboard/usage-progress-bar";
import { UsageProvider } from "@/components/dashboard/usage-context";
import { UserMenu } from "@/components/dashboard/user-menu";
import { MainNav } from "@/components/layout/main-nav";
import { Logo } from "@/components/brand/logo";
import { requireActiveSubscription } from "@/lib/auth/require-active-subscription";
import { FREE_PLAN_SLUG } from "@/lib/plans/free-tier";

// Todo o grupo de rotas depende do usuário autenticado e do banco em tempo
// real (créditos, histórico) — nunca deve ser pré-renderizado estaticamente.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: LayoutProps<"/">) {
  const user = await requireActiveSubscription();
  // Link "Projetos" aparece pra qualquer plano ativo — só uma conta já
  // vinculada como colaboradora de outro projeto não gerencia os próprios.
  const showProjects = !user.isManagedAccount;

  return (
    <UsageProvider>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-6 border-b bg-background/80 px-4 backdrop-blur sm:px-6">
          <Logo href={false} />
          <MainNav showProjects={showProjects} />
          <div className="ml-auto flex items-center gap-4">
            <UsageProgressBar />
            <UserMenu
              email={user.email}
              name={user.name}
              planName={user.planName}
              isManagedAccount={user.isManagedAccount}
            />
          </div>
        </header>
        {user.planSlug === FREE_PLAN_SLUG && !user.emailVerified && <EmailVerificationBanner />}
        <main className="flex-1 bg-muted/30">{children}</main>
      </div>
    </UsageProvider>
  );
}
