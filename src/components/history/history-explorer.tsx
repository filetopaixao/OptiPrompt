"use client";

import { useState } from "react";
import { GitCompare, History, Lock } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ExecutionDTO } from "@/types/execution";
import { ExecutionRow } from "./execution-row";
import { VersionCompareDialog } from "./version-compare-dialog";

export function HistoryExplorer({
  executions,
  canCompareVersions,
  showingTeamHistory = false,
  currentUserId,
}: {
  executions: ExecutionDTO[];
  canCompareVersions: boolean;
  /** true quando é a visão agregada do dono Enterprise (ver
   * listExecutionsForTeam) — inclui execuções da carteira de clientes. */
  showingTeamHistory?: boolean;
  /** Usado só pra destacar "Você" no badge de quem executou, na visão de
   * equipe (ver ExecutionRow). */
  currentUserId?: string;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  function toggleSelection(executionId: string) {
    setSelectedIds((current) => {
      if (current.includes(executionId)) {
        return current.filter((id) => id !== executionId);
      }
      if (current.length >= 2) {
        return [current[1], executionId];
      }
      return [...current, executionId];
    });
  }

  const selectedExecutions = executions.filter((execution) => selectedIds.includes(execution.id));

  if (executions.length === 0) {
    return (
      <div className="flex min-h-[24rem] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center text-muted-foreground">
        <History className="size-8" />
        <p className="text-sm">Nenhuma execução ainda. Rode uma comparação no Dashboard.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Histórico de execuções</h1>
          <p className="text-sm text-muted-foreground">
            {canCompareVersions
              ? "Selecione duas execuções para comparar versões do prompt e sua performance."
              : "Acompanhe suas execuções anteriores."}
            {showingTeamHistory && " Inclui execuções de toda a sua carteira de clientes."}
          </p>
        </div>
        {canCompareVersions ? (
          <Button
            disabled={selectedIds.length !== 2}
            onClick={() => setIsCompareOpen(true)}
            variant="default"
          >
            <GitCompare />
            Comparar versões ({selectedIds.length}/2)
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger
              render={
                <a
                  href="/app/billing"
                  className={buttonVariants({ variant: "outline" })}
                />
              }
            >
              <Lock />
              Comparar versões
            </TooltipTrigger>
            <TooltipContent>
              Disponível nos planos Agência (Pro) e Enterprise
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {executions.map((execution) => (
          <ExecutionRow
            key={execution.id}
            execution={execution}
            isSelected={selectedIds.includes(execution.id)}
            onToggle={() => toggleSelection(execution.id)}
            selectable={canCompareVersions}
            currentUserId={currentUserId}
          />
        ))}
      </div>

      {canCompareVersions && selectedExecutions.length === 2 && (
        <VersionCompareDialog
          open={isCompareOpen}
          onOpenChange={setIsCompareOpen}
          executionA={selectedExecutions[0]}
          executionB={selectedExecutions[1]}
        />
      )}
    </div>
  );
}
