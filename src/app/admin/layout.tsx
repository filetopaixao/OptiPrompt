import Link from "next/link";
import { LogOut, ShieldAlert } from "lucide-react";
import { signOut } from "@/lib/auth/auth";
import { requireAdmin } from "@/lib/auth/require-admin";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const NAV_LINKS = [
  { href: "/admin/usuarios", label: "Usuários" },
  { href: "/admin/creditos", label: "Créditos" },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="flex flex-col gap-3 border-b bg-background px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-5 text-primary" />
          <span className="font-semibold">OtimizaIA — Painel interno</span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
            className="ml-auto"
          >
            <Button type="submit" variant="ghost" size="sm">
              <LogOut />
              Sair
            </Button>
          </form>
        </div>
        <nav className="flex gap-4 text-sm font-medium text-muted-foreground">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={cn("hover:text-foreground")}>
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
