import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { listExecutionsForUser } from "@/lib/executions/list-executions";

export async function GET() {
  const userId = await getCurrentUserId();
  const executions = await listExecutionsForUser(userId);
  return NextResponse.json({ executions });
}
