import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ExecutionDTO } from "@/types/execution";
import { VersionComparePanel } from "./version-compare-panel";

interface VersionCompareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  executionA: ExecutionDTO;
  executionB: ExecutionDTO;
}

export function VersionCompareDialog({
  open,
  onOpenChange,
  executionA,
  executionB,
}: VersionCompareDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Comparação de versões</DialogTitle>
          <DialogDescription>
            Diferenças no prompt e na performance entre as duas execuções selecionadas.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[65vh] pr-4">
          <VersionComparePanel executionA={executionA} executionB={executionB} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
