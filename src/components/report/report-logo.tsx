"use client";

import { useEffect, useState } from "react";
import { ImageUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "optiprompt:agency-logo";

/**
 * Whitelabel simples: guarda o logo da agência no navegador (localStorage).
 * Sem sistema de conta ainda, então é por navegador, não por usuário — migrar
 * para o perfil da conta quando houver autenticação.
 */
export function ReportLogo() {
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    // localStorage só existe no cliente — precisa ler após o mount para não
    // divergir da renderização SSR (hidratação).
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLogo(localStorage.getItem(STORAGE_KEY));
    } catch {
      // localStorage indisponível (ex.: navegação privada) — segue sem logo.
    }
  }, []);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setLogo(dataUrl);
      try {
        localStorage.setItem(STORAGE_KEY, dataUrl);
      } catch {
        // Sem espaço/permissão de storage — o logo ainda aparece nesta sessão.
      }
    };
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    setLogo(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nada a fazer se o storage não estiver disponível.
    }
  }

  if (logo) {
    return (
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- data URL de upload local, não é um asset otimizável */}
        <img src={logo} alt="Logo da agência" className="h-10 max-w-40 object-contain" />
        <Button variant="ghost" size="icon-sm" className="print:hidden" onClick={removeLogo}>
          <X />
        </Button>
      </div>
    );
  }

  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground hover:bg-muted print:hidden">
      <ImageUp className="size-4" />
      Adicionar logo da agência
      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </label>
  );
}
