import { AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { MODEL_CATALOG, type Provider } from "@/types/models";
import { FreeTierToggle } from "./free-tier-toggle";

export const dynamic = "force-dynamic";

const PROVIDER_LABELS: Record<Provider, string> = {
  OPENAI: "OpenAI",
  ANTHROPIC: "Anthropic",
  GOOGLE: "Google",
  MARITACA: "Maritaca AI",
  GROQ: "Groq",
  DEEPSEEK: "DeepSeek",
  MISTRAL: "Mistral",
  META: "Meta",
};

const RECOMMENDED_ACTIVE_COUNT = 5;

export default async function AdminModelosPage() {
  await requireAdmin();

  const freeTierModels = await prisma.freeTierModel.findMany();
  const activeByModelId = new Map(freeTierModels.map((row) => [row.modelId, row.active]));
  const activeCount = freeTierModels.filter((row) => row.active).length;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Modelos no plano Free</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Marque quais modelos do catálogo ficam disponíveis pra quem está no plano Free (1
          execução/dia). Recomendado: cerca de {RECOMMENDED_ACTIVE_COUNT} modelos baratos ou
          médios, representativos de provedores diferentes — evite deixar os modelos mais caros
          liberados aqui.
        </p>
      </div>

      {activeCount === 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          <AlertTriangle className="size-4 shrink-0" />
          Nenhum modelo ativo — ninguém no plano Free consegue rodar uma execução agora.
        </div>
      )}
      {activeCount > 0 && activeCount !== RECOMMENDED_ACTIVE_COUNT && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
          <AlertTriangle className="size-4 shrink-0" />
          {activeCount} modelo{activeCount === 1 ? "" : "s"} ativo{activeCount === 1 ? "" : "s"} —
          o recomendado é {RECOMMENDED_ACTIVE_COUNT}.
        </div>
      )}

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <th className="w-12 px-3 py-2 text-left font-medium">Free</th>
              <th className="px-3 py-2 text-left font-medium">Modelo</th>
              <th className="px-3 py-2 text-left font-medium">Provedor</th>
              <th className="px-3 py-2 text-left font-medium">Tier</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {MODEL_CATALOG.map((model) => (
              <tr key={model.id}>
                <td className="px-3 py-2">
                  <FreeTierToggle modelId={model.id} active={activeByModelId.get(model.id) ?? false} />
                </td>
                <td className="px-3 py-2 font-medium">{model.label}</td>
                <td className="px-3 py-2 text-muted-foreground">{PROVIDER_LABELS[model.provider]}</td>
                <td className="px-3 py-2 text-muted-foreground">
                  {model.tier === "PREMIUM" ? "Premium" : "Custo-benefício"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
