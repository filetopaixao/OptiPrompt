import { NextResponse } from "next/server";
import { getBillingOwnerId } from "@/lib/auth/billing-owner";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { getUsageSummary } from "@/lib/credits/usage-service";

export async function GET() {
  const userId = await getCurrentUserId();
  const billingOwnerId = await getBillingOwnerId(userId);
  const usage = await getUsageSummary(billingOwnerId);
  return NextResponse.json(usage);
}
