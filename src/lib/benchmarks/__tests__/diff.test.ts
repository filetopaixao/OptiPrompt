import { describe, expect, it } from "vitest";
import { compareBenchmarkRuns, type BenchmarkResultLike } from "../diff";

function result(overrides: Partial<BenchmarkResultLike> = {}): BenchmarkResultLike {
  return {
    status: "SUCCESS",
    costInBRL: 0.01,
    latencyMs: 1000,
    manualQualityScore: 8,
    ...overrides,
  };
}

describe("compareBenchmarkRuns", () => {
  it("aprova quando não há limites configurados e nada muda", () => {
    const baseline = [result(), result()];
    const candidate = [result(), result()];
    const diff = compareBenchmarkRuns(baseline, candidate);
    expect(diff.verdict).toBe("APROVADO");
  });

  it("aprova uma queda de qualidade dentro do limite configurado", () => {
    const baseline = [result({ manualQualityScore: 8.7 })];
    const candidate = [result({ manualQualityScore: 8.5 })];
    const diff = compareBenchmarkRuns(baseline, candidate, { maxQualityDropPoints: 1 });
    expect(diff.verdict).toBe("APROVADO");
  });

  it("melhoria de custo e latência aprova mesmo com limite configurado", () => {
    const baseline = [result({ costInBRL: 0.021, latencyMs: 1800 })];
    const candidate = [result({ costInBRL: 0.009, latencyMs: 1400 })];
    const diff = compareBenchmarkRuns(baseline, candidate, {
      maxCostIncreasePercent: 20,
      maxLatencyIncreasePercent: 20,
    });
    expect(diff.verdict).toBe("APROVADO");
  });

  it("sinaliza atenção quando a queda de qualidade está perto do limite (exemplo do pedido)", () => {
    const baseline = [result({ manualQualityScore: 8.7 })];
    const candidate = [result({ manualQualityScore: 8.1 })];
    // Limite de 1 ponto; queda de 0.6 é 60% do limite — abaixo do gatilho de
    // atenção (70%). Ajusta o limite pra cair exatamente na faixa de atenção.
    const diff = compareBenchmarkRuns(baseline, candidate, { maxQualityDropPoints: 0.8 });
    expect(diff.verdict).toBe("ATENCAO");
    expect(diff.reasons.join(" ")).toContain("próximo do limite");
  });

  it("reprova quando o custo ultrapassa o limite máximo", () => {
    const baseline = [result({ costInBRL: 0.01 })];
    const candidate = [result({ costInBRL: 0.0142 })]; // +42%
    const diff = compareBenchmarkRuns(baseline, candidate, { maxCostIncreasePercent: 20 });
    expect(diff.verdict).toBe("REPROVADO");
    expect(diff.costDeltaPercent).toBeCloseTo(42, 0);
  });

  it("reprova quando a latência ultrapassa o limite máximo", () => {
    const baseline = [result({ latencyMs: 1000 })];
    const candidate = [result({ latencyMs: 2000 })]; // +100%
    const diff = compareBenchmarkRuns(baseline, candidate, { maxLatencyIncreasePercent: 50 });
    expect(diff.verdict).toBe("REPROVADO");
  });

  it("reprova quando a qualidade fica abaixo do mínimo absoluto", () => {
    const baseline = [result({ manualQualityScore: 8 })];
    const candidate = [result({ manualQualityScore: 5 })];
    const diff = compareBenchmarkRuns(baseline, candidate, { minQualityScore: 7 });
    expect(diff.verdict).toBe("REPROVADO");
  });

  it("reprova quando surgem novos erros (exemplo: JSON inválido em parte dos casos)", () => {
    const baseline = Array.from({ length: 25 }, () => result());
    const candidate = [
      ...Array.from({ length: 22 }, () => result()),
      ...Array.from({ length: 3 }, () => result({ status: "ERROR", manualQualityScore: null })),
    ];
    const diff = compareBenchmarkRuns(baseline, candidate);
    expect(diff.verdict).toBe("REPROVADO");
    expect(diff.reasons.join(" ")).toContain("3 de 25");
  });

  it("não reprova por taxa de erro que já existia na baseline", () => {
    const baseline = [result(), result({ status: "ERROR", manualQualityScore: null })];
    const candidate = [result(), result({ status: "ERROR", manualQualityScore: null })];
    const diff = compareBenchmarkRuns(baseline, candidate);
    expect(diff.verdict).toBe("APROVADO");
  });

  it("lida com listas vazias sem lançar exceção", () => {
    const diff = compareBenchmarkRuns([], []);
    expect(diff.verdict).toBe("APROVADO");
    expect(diff.baseline.total).toBe(0);
    expect(diff.costDeltaPercent).toBeNull();
  });

  it("trata custo/latência quando a baseline é zero (evita divisão por zero)", () => {
    const baseline = [result({ costInBRL: 0, latencyMs: 0 })];
    const candidate = [result({ costInBRL: 0.01, latencyMs: 500 })];
    const diff = compareBenchmarkRuns(baseline, candidate, { maxCostIncreasePercent: 10 });
    expect(diff.costDeltaPercent).toBeNull();
    expect(diff.verdict).toBe("APROVADO");
  });
});
