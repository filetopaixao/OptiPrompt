"use server";

import { revalidatePath } from "next/cache";
import type { CreditProvider } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function markProviderAllocationsCompleted(provider: CreditProvider): Promise<void> {
  await requireAdmin();

  await prisma.providerCreditAllocation.updateMany({
    where: { provider, status: "PENDING" },
    data: { status: "COMPLETED", completedAt: new Date() },
  });

  revalidatePath("/admin/creditos");
}
