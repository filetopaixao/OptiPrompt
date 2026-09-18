"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CheckoutButton({ planSlug, label }: { planSlug: string; label: string }) {
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
        toast.error(data.error ?? "Checkout ainda não está disponível.");
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
    <Button className="w-full" onClick={handleClick} disabled={isLoading}>
      {isLoading && <Loader2 className="animate-spin" />}
      {label}
    </Button>
  );
}
