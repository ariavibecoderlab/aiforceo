// Cron route for morning brief generation.
// Called hourly by the Cloudflare cron Worker (wrangler-cron.jsonc).
// Protected by CRON_SECRET — never exposed to users.
//
// POST /api/cron/morning-brief  — scan all eligible workspaces and generate briefs
// GET  /api/cron/morning-brief  — dry run: list eligible workspaces without generating
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { generateMorningBrief, isTimeForBrief } from "@/lib/morning-brief";

function authOk(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET ?? "";
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!authOk(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();

  const { data: workspaces, error } = await admin
    .from("workspaces")
    .select("id, name, brief_timezone, brief_hour")
    .eq("morning_brief_enabled", true)
    .eq("onboarded", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const results = [];

  for (const ws of workspaces ?? []) {
    const tz   = ws.brief_timezone ?? "Asia/Kuala_Lumpur";
    const hour = ws.brief_hour     ?? 9;

    if (!isTimeForBrief(tz, hour)) {
      results.push({ workspaceId: ws.id, skipped: "wrong_hour" });
      continue;
    }

    // Check if Aria already produced a brief today for this workspace
    const { data: ariaConv } = await admin
      .from("conversations")
      .select("id")
      .eq("workspace_id", ws.id)
      .eq("agent_role", "aria")
      .maybeSingle();

    if (ariaConv) {
      const { data: alreadyDone } = await admin
        .from("messages")
        .select("id")
        .eq("workspace_id",    ws.id)
        .eq("conversation_id", ariaConv.id)
        .eq("role",            "assistant")
        .gte("created_at",     startOfDay.toISOString())
        .limit(1)
        .maybeSingle();

      if (alreadyDone) {
        results.push({ workspaceId: ws.id, skipped: "already_generated_today" });
        continue;
      }
    }

    const result = await generateMorningBrief(ws.id, ws.name);
    results.push(result);
  }

  return NextResponse.json({ processed: results.length, results });
}

// Dry-run: list eligible workspaces without generating briefs.
export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!authOk(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const { data: workspaces } = await admin
    .from("workspaces")
    .select("id, name, brief_timezone, brief_hour, morning_brief_enabled")
    .eq("morning_brief_enabled", true);

  return NextResponse.json({ eligible: workspaces ?? [] });
}
