import { describe, expect, it } from "vitest";
import { calculateSavings } from "../savings";

describe("calculateSavings", () => {
  it("bate com o exemplo de cálculo do pedido (R$2.500, 75%, 55%)", () => {
    const result = calculateSavings({
      monthlySpendInBRL: 2500,
      optimizablePercent: 75,
      expectedSavingsPercent: 55,
    });
    expect(result.optimizableSpendInBRL).toBe(1875);
    expect(result.estimatedMonthlySavingsInBRL).toBe(1031.25);
    expect(result.projectedMonthlySpendInBRL).toBe(1468.75);
    expect(result.estimatedAnnualSavingsInBRL).toBe(1031.25 * 12);
  });

  it("trata gasto zero sem dividir por zero nem gerar NaN", () => {
    const result = calculateSavings({
      monthlySpendInBRL: 0,
      optimizablePercent: 75,
      expectedSavingsPercent: 35,
    });
    expect(result).toEqual({
      monthlySpendInBRL: 0,
      optimizableSpendInBRL: 0,
      estimatedMonthlySavingsInBRL: 0,
      estimatedAnnualSavingsInBRL: 0,
      projectedMonthlySpendInBRL: 0,
    });
  });

  it("trata percentuais em 0% e 100% (limites)", () => {
    const zeroPercent = calculateSavings({
      monthlySpendInBRL: 1000,
      optimizablePercent: 0,
      expectedSavingsPercent: 50,
    });
    expect(zeroPercent.estimatedMonthlySavingsInBRL).toBe(0);
    expect(zeroPercent.projectedMonthlySpendInBRL).toBe(1000);

    const fullPercent = calculateSavings({
      monthlySpendInBRL: 1000,
      optimizablePercent: 100,
      expectedSavingsPercent: 100,
    });
    expect(fullPercent.estimatedMonthlySavingsInBRL).toBe(1000);
    expect(fullPercent.projectedMonthlySpendInBRL).toBe(0);
  });

  it("nunca deixa a economia superar o gasto otimizável (economia >100% seria ilógica)", () => {
    const result = calculateSavings({
      monthlySpendInBRL: 1000,
      optimizablePercent: 50,
      expectedSavingsPercent: 100,
    });
    expect(result.estimatedMonthlySavingsInBRL).toBeLessThanOrEqual(result.optimizableSpendInBRL);
  });

  it("trata valores negativos como zero em vez de gerar economia negativa", () => {
    const result = calculateSavings({
      monthlySpendInBRL: -500,
      optimizablePercent: -10,
      expectedSavingsPercent: -20,
    });
    expect(result.monthlySpendInBRL).toBe(0);
    expect(result.optimizableSpendInBRL).toBe(0);
    expect(result.estimatedMonthlySavingsInBRL).toBe(0);
    expect(result.projectedMonthlySpendInBRL).toBe(0);
  });

  it("trata NaN (campo vazio) como zero", () => {
    const result = calculateSavings({
      monthlySpendInBRL: Number.NaN,
      optimizablePercent: 75,
      expectedSavingsPercent: 35,
    });
    expect(result.monthlySpendInBRL).toBe(0);
    expect(result.estimatedMonthlySavingsInBRL).toBe(0);
  });

  it("satura percentuais acima de 100% em vez de projetar gasto negativo absurdo", () => {
    const result = calculateSavings({
      monthlySpendInBRL: 1000,
      optimizablePercent: 500,
      expectedSavingsPercent: 300,
    });
    expect(result.optimizableSpendInBRL).toBe(1000);
    expect(result.estimatedMonthlySavingsInBRL).toBe(1000);
    expect(result.projectedMonthlySpendInBRL).toBe(0);
  });

  it("lida com valores muito altos sem gerar Infinity ou NaN", () => {
    const result = calculateSavings({
      monthlySpendInBRL: 50_000_000,
      optimizablePercent: 80,
      expectedSavingsPercent: 40,
    });
    expect(Number.isFinite(result.estimatedMonthlySavingsInBRL)).toBe(true);
    expect(Number.isFinite(result.projectedMonthlySpendInBRL)).toBe(true);
    expect(result.estimatedMonthlySavingsInBRL).toBe(16_000_000);
  });

  it("arredonda pra centavos em vez de expor imprecisão de ponto flutuante", () => {
    const result = calculateSavings({
      monthlySpendInBRL: 999.99,
      optimizablePercent: 33,
      expectedSavingsPercent: 33,
    });
    // Verifica que o resultado tem no máximo 2 casas decimais.
    expect(Number.isInteger(result.estimatedMonthlySavingsInBRL * 100)).toBe(true);
    expect(Number.isInteger(result.projectedMonthlySpendInBRL * 100)).toBe(true);
  });
});
