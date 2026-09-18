import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { getUsageSummary } from "@/lib/credits/usage-service";

export async function GET() {
  const userId = await getCurrentUserId();
  const usage = await getUsageSummary(userId);
  return NextResponse.json(usage);
}
