import { Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import type { ReactNode } from "react";

/**
 * Placeholder pra recursos travados por plano — mantém o mesmo "peso" visual
 * do card real (título + ação no header) em vez de simplesmente sumir com a
 * seção, e ainda funciona como nudge de upgrade pra quem já está engajado
 * no dashboard.
 */
export function LockedFeatureCard({
  title,
  message,
  headerActions,
}: {
  title: string;
  message: string;
  headerActions?: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2 text-muted-foreground">
          <Lock className="size-4" />
          {title}
        </CardTitle>
        {headerActions && <div className="print:hidden">{headerActions}</div>}
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-3">
        <p className="text-sm text-muted-foreground">{message}</p>
        <a href="/app/billing" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Ver planos
        </a>
      </CardContent>
    </Card>
  );
}
