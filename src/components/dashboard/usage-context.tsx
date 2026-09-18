"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { UsageSummary } from "@/lib/credits/usage-service";

interface UsageContextValue extends UsageSummary {
  isLoading: boolean;
  /** Refaz o fetch do saldo (usado no mount e como fallback). */
  refresh: () => Promise<void>;
  /** Aplica um saldo já conhecido (ex.: devolvido pela própria resposta de
   * /api/executions) sem precisar de um segundo round-trip ao servidor. */
  applyUsage: (usage: UsageSummary) => void;
}

const EMPTY_USAGE: UsageSummary = {
  creditsAvailable: 0,
  creditsTotal: 0,
  usagePercentage: 0,
  isOverLimit: false,
};

const UsageContext = createContext<UsageContextValue | null>(null);

export function UsageProvider({ children }: { children: ReactNode }) {
  const [usage, setUsage] = useState<UsageSummary>(EMPTY_USAGE);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/usage");
    if (!response.ok) return;
    const data = (await response.json()) as UsageSummary;
    setUsage(data);
    setIsLoading(false);
  }, []);

  const applyUsage = useCallback((data: UsageSummary) => {
    setUsage(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Busca inicial ao montar — não há Server Component aqui porque `refresh`
    // também precisa ser chamado imperativamente após cada execução.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  return (
    <UsageContext.Provider value={{ ...usage, isLoading, refresh, applyUsage }}>
      {children}
    </UsageContext.Provider>
  );
}

export function useUsageContext(): UsageContextValue {
  const context = useContext(UsageContext);
  if (!context) {
    throw new Error("useUsageContext deve ser usado dentro de <UsageProvider>.");
  }
  return context;
}
