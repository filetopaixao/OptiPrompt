"use client";

import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { getModelDefinition } from "@/types/models";
import type { ModelId } from "@/types/models";

interface PremiumWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  premiumModelIds: ModelId[];
  onConfirm: (dontWarnAgain: boolean) => void;
}

export function PremiumWarningDialog({
  open,
  onOpenChange,
  premiumModelIds,
  onConfirm,
}: PremiumWarningDialogProps) {
  const [dontWarnAgain, setDontWarnAgain] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TriangleAlert className="size-5 text-amber-500" />
            Modelos Premium selecionados
          </DialogTitle>
          <DialogDescription>
            Os modelos abaixo consomem significativamente mais créditos da plataforma que os
            modelos custo-benefício.
          </DialogDescription>
        </DialogHeader>

        <ul className="flex flex-col gap-1.5 rounded-md border bg-muted/30 p-3 text-sm">
          {premiumModelIds.map((modelId) => (
            <li key={modelId} className="font-medium">
              {getModelDefinition(modelId).label}
            </li>
          ))}
        </ul>

        <p className="text-sm font-medium">Deseja continuar mesmo assim?</p>

        <div className="flex items-center gap-2">
          <Checkbox
            id="dont-warn-again"
            checked={dontWarnAgain}
            onCheckedChange={(checked) => setDontWarnAgain(checked === true)}
          />
          <Label htmlFor="dont-warn-again" className="cursor-pointer font-normal text-muted-foreground">
            Não avisar novamente nesta sessão
          </Label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onConfirm(dontWarnAgain);
              onOpenChange(false);
            }}
          >
            Sim, executar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
