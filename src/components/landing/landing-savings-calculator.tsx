"use client";

import { useRef, useState } from "react";
import { ArrowRight, Wallet } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatBRL } from "@/lib/format-currency";
import { calculateSavings } from "@/lib/calculators/savings";
import { trackEvent } from "@/lib/analytics/track-event";

/** Hipóteses iniciais, conservadoras e editáveis — NUNCA apresentadas como
 * promessa (ver aviso abaixo do resultado). Fáceis de ajustar aqui sem
 * mexer no restante do componente. */
const DEFAULT_MONTHLY_SPEND = 2500;
const DEFAULT_OPTIMIZABLE_PERCENT = 75;
const DEFAULT_SAVINGS_PERCENT = 35;

export function LandingSavingsCalculator() {
  const [monthlySpend, setMonthlySpend] = useState(DEFAULT_MONTHLY_SPEND);
  const [optimizablePercent, setOptimizablePercent] = useState(DEFAULT_OPTIMIZABLE_PERCENT);
  const [savingsPercent, setSavingsPercent] = useState(DEFAULT_SAVINGS_PERCENT);
  const hasStarted = useRef(false);

  function trackStartOnce() {
    if (hasStarted.current) return;
    hasStarted.current = true;
    trackEvent("calculator_started");
  }

  const result = calculateSavings({
    monthlySpendInBRL: monthlySpend,
    optimizablePercent,
    expectedSavingsPercent: savingsPercent,
  });

  function handleCalculationSeen() {
    trackEvent("calculator_value_shown", {
      monthlySpend,
      optimizablePercent,
      savingsPercent,
      estimatedMonthlySavings: result.estimatedMonthlySavingsInBRL,
    });
  }

  return (
    <section id="calculadora" className="scroll-mt-16 mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Calculadora de economia</h2>
        <p className="mt-2 text-muted-foreground">
          Hipóteses editáveis, cálculo instantâneo — sem chamar o OpenRouter, sem consumir crédito.
        </p>
      </div>

      <div className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="calc-spend">Gasto mensal com APIs de IA (R$)</Label>
            <Input
              id="calc-spend"
              type="number"
              min={0}
              value={monthlySpend}
              onFocus={trackStartOnce}
              onChange={(e) => setMonthlySpend(Math.max(0, Number(e.target.value) || 0))}
              onBlur={handleCalculationSeen}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="calc-optimizable">% do gasto afetado pela escolha do modelo</Label>
              <span className="text-sm font-medium tabular-nums">{optimizablePercent}%</span>
            </div>
            <input
              id="calc-optimizable"
              type="range"
              min={0}
              max={100}
              step={5}
              value={optimizablePercent}
              onFocus={trackStartOnce}
              onChange={(e) => setOptimizablePercent(Number(e.target.value))}
              onMouseUp={handleCalculationSeen}
              onTouchEnd={handleCalculationSeen}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="calc-savings">% de economia esperada após otimização</Label>
              <span className="text-sm font-medium tabular-nums">{savingsPercent}%</span>
            </div>
            <input
              id="calc-savings"
              type="range"
              min={0}
              max={75}
              step={5}
              value={savingsPercent}
              onFocus={trackStartOnce}
              onChange={(e) => setSavingsPercent(Number(e.target.value))}
              onMouseUp={handleCalculationSeen}
              onTouchEnd={handleCalculationSeen}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
            />
            <p className="text-xs text-muted-foreground">
              Hipótese conservadora e editável — não é uma promessa de resultado.
            </p>
          </div>

          <div className="rounded-xl border bg-muted/40 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Wallet className="size-4" />
              Estimativa
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Gasto atual estimado</dt>
                <dd className="font-semibold">{formatBRL(result.monthlySpendInBRL)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Parcela otimizável</dt>
                <dd className="font-semibold">{formatBRL(result.optimizableSpendInBRL)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Economia mensal estimada</dt>
                <dd className="font-semibold text-primary">
                  {formatBRL(result.estimatedMonthlySavingsInBRL)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Economia anual estimada</dt>
                <dd className="font-semibold text-primary">
                  {formatBRL(result.estimatedAnnualSavingsInBRL)}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">Gasto projetado após otimização</dt>
                <dd className="font-semibold">{formatBRL(result.projectedMonthlySpendInBRL)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">
              Estimativa; valide com um teste real dos seus prompts.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href="/cadastro"
              onClick={() => trackEvent("calculator_free_test_click")}
              className={buttonVariants({ size: "lg" })}
            >
              Testar meu prompt gratuitamente
              <ArrowRight />
            </a>
            <a href="#planos" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Ver quanto custa por modelo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
