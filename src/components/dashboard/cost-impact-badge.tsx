import { Badge } from "@/components/ui/badge";
import { classifyCostImpact, type CostImpact } from "@/lib/credits/credit-converter";
import { cn } from "@/lib/utils";

const IMPACT_LABEL: Record<CostImpact, string> = {
  low: "Custo baixo",
  medium: "Custo médio",
  high: "Custo alto",
};

const IMPACT_CLASSNAME: Record<CostImpact, string> = {
  low: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400",
  medium: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  high: "border-transparent bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-400",
};

/** Impacto de custo visual — nunca exibe R$, apenas a classificação (regra de negócio). */
export function CostImpactBadge({ estimatedCostInCredits }: { estimatedCostInCredits: number }) {
  const impact = classifyCostImpact(estimatedCostInCredits);
  return <Badge className={cn(IMPACT_CLASSNAME[impact])}>{IMPACT_LABEL[impact]}</Badge>;
}
