"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function UpgradeButton({ planSlug, disabled }: { planSlug: string; disabled?: boolean }) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? "Não foi possível iniciar o checkout.");
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch {
      toast.error("Erro de rede ao iniciar o checkout.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button className="w-full" onClick={handleClick} disabled={disabled || isLoading}>
      {isLoading && <Loader2 className="animate-spin" />}
      {disabled ? "Plano atual" : "Assinar este plano"}
    </Button>
  );
}
