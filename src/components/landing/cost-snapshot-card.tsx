import { Activity, Receipt, Timer } from "lucide-react";
import type { ReactNode } from "react";

interface MetricRowProps {
  label: string;
  value: string;
  icon?: ReactNode;
  tone: "warning" | "positive";
}

function MetricRow({ label, value, icon, tone }: MetricRowProps) {
  const valueColor = tone === "warning" ? "text-rose-300" : "text-emerald-300";
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <dt className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className={`shrink-0 font-semibold ${valueColor}`}>{value}</dd>
    </div>
  );
}

/**
 * Card visual do Hero — ilustração estática de como o painel compara custo e
 * latência entre modelos (não é um widget interativo com inputs reais).
 */
export function CostSnapshotCard() {
  return (
    <div className="h-full rounded-2xl border border-white/10 bg-card/60 p-6 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Activity className="size-4" />
        Raio-X de Custo em Tempo Real
      </div>

      <div className="flex flex-col gap-3">
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
          <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-rose-400">
            <Receipt className="size-3.5" />
            gpt-4o · OpenAI
          </p>
          <dl className="flex flex-col gap-2">
            <MetricRow tone="warning" label="Custo por chamada" value="R$ 0,18" />
            <MetricRow
              tone="warning"
              icon={<Timer className="size-3.5" />}
              label="Latência média"
              value="2.4s"
            />
          </dl>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-400">
            <Receipt className="size-3.5" />
            claude-3-5-sonnet · Anthropic
          </p>
          <dl className="flex flex-col gap-2">
            <MetricRow tone="positive" label="Custo por chamada" value="R$ 0,06" />
            <MetricRow
              tone="positive"
              icon={<Timer className="size-3.5" />}
              label="Latência média"
              value="850ms"
            />
          </dl>
        </div>
      </div>
    </div>
  );
}
