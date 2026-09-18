import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

/** Gate do painel interno (/admin) — não é uma feature de cliente, então não
 * usa requireActiveSubscription. Acesso por allowlist de e-mail (sem sistema
 * de papéis ainda) via env ADMIN_EMAILS. */
export async function requireAdmin(): Promise<void> {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();

  if (!email || !ADMIN_EMAILS.includes(email)) {
    redirect("/login");
  }
}
