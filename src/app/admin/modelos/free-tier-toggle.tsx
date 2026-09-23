"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleFreeTierModel } from "./actions";

export function FreeTierToggle({ modelId, active }: { modelId: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleChange(checked: boolean) {
    startTransition(async () => {
      const result = await toggleFreeTierModel(modelId, checked);
      if (!result.ok) toast.error(result.error);
    });
  }

  return (
    <Checkbox
      checked={active}
      disabled={isPending}
      onCheckedChange={(checked) => handleChange(checked === true)}
    />
  );
}
