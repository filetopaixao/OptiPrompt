"use client";

import Image from "next/image";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CostProjection } from "@/components/dashboard/cost-projection";
import type { ExecutionDTO } from "@/types/execution";
import { ReportLogo } from "./report-logo";
import { ReportResultCard } from "./report-result-card";
import { ReportVerdict } from "./report-verdict";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" });

export function ReportView({
  execution,
  allowWhitelabelLogo,
}: {
  execution: ExecutionDTO;
  allowWhitelabelLogo: boolean;
}) {
  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-10 print:p-0">
      <div className="mb-4 flex justify-end print:hidden">
        <Button onClick={() => window.print()}>
          <Printer />
          Imprimir / Salvar PDF
        </Button>
      </div>

      <header className="mb-8 flex items-start justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Image src="/logo-icon.png" alt="" width={16} height={16} />
            OptiPrompt — Relatório de comparação
          </div>
          <h1 className="mt-1 text-xl font-semibold">{execution.promptName}</h1>
          <p className="text-sm text-muted-foreground">
            Executado em {dateFormatter.format(new Date(execution.createdAt))}
          </p>
        </div>
        {allowWhitelabelLogo && <ReportLogo />}
      </header>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Veredito
        </h2>
        <ReportVerdict results={execution.results} />
      </section>

      <section className="mb-8 flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Prompt testado
        </h2>
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="mb-1 text-xs font-medium text-muted-foreground">System prompt</p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {execution.systemPrompt || "(vazio)"}
          </p>
        </div>
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="mb-1 text-xs font-medium text-muted-foreground">User message</p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{execution.userMessage}</p>
        </div>
      </section>

      <section className="mb-8 flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Respostas por modelo
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {execution.results.map((result) => (
            <ReportResultCard key={result.id} result={result} />
          ))}
        </div>
      </section>

      <section className="mb-8 break-inside-avoid">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Projeção financeira
        </h2>
        <CostProjection results={execution.results} priority="price" />
      </section>

      <section className="break-inside-avoid">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Comparação de velocidade
        </h2>
        <CostProjection results={execution.results} priority="speed" />
      </section>

      <footer className="mt-10 border-t pt-4 text-center text-xs text-muted-foreground">
        Gerado por OptiPrompt — optiprompt.dev
      </footer>
    </div>
  );
}
