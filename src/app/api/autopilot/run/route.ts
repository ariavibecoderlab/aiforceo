// Autopilot AI Co-founder — streaming execution route.
//
// Security (same pattern as agent/route.ts §4.2 / §4.3):
//   - Auth re-derived from cookies; workspace_id never trusted from payload
//   - Admin client used for all DB writes
import { NextRequest } from "next/server";
import { z } from "zod";
import { createServerClient } from "@supabase/ssr";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAnthropic, ANTHROPIC_MODEL } from "@/lib/anthropic";
import type {
  AutopilotTaskType,
  AutopilotRunOutput,
} from "@/server/actions/autopilot";

const RequestSchema = z.object({
  workspaceId: z.string().uuid(),
  runId: z.string().uuid(),
  tasks: z
    .array(
      z.enum([
        "daily_brief",
        "social_post",
        "weekly_review",
        "competitor_check",
        "cash_alert",
        "content_idea",
      ]),
    )
    .min(1)
    .max(6),
});

function makeJson(body: object, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function buildCofounderSystemPrompt(ctx: {
  businessName: string;
  industry?: string;
  size?: string;
  primaryOffer?: string;
  targetCustomer?: string;
  challenges?: string[];
  goals90d?: string;
  brandVoiceSummary?: string;
  toneAttributes?: string[];
  wordsToUse?: string[];
  wordsToAvoid?: string[];
  kpiContext?: string;
}): string {
  const today = new Date().toLocaleDateString("en-MY", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kuala_Lumpur",
  });

  const profile = [
    "== Business profile ==",
    `Business name: ${ctx.businessName}`,
    `Industry: ${ctx.industry ?? "(not set)"}`,
    `Size: ${ctx.size ?? "(not set)"}`,
    `Primary offer: ${ctx.primaryOffer ?? "(not set)"}`,
    `Target customer: ${ctx.targetCustomer ?? "(not set)"}`,
    `Current challenges: ${ctx.challenges?.join(", ") ?? "(not set)"}`,
    `90-day goal: ${ctx.goals90d ?? "(not set)"}`,
  ].join("\n");

  const voice = [
    "== Brand voice ==",
    ctx.brandVoiceSummary ??
      "(no brand voice set — produce neutral, professional output)",
    `Tone: ${ctx.toneAttributes?.join(", ") ?? "(unset)"}`,
    `Use words like: ${ctx.wordsToUse?.join(", ") ?? "(unset)"}`,
    `Avoid words like: ${ctx.wordsToAvoid?.join(", ") ?? "(unset)"}`,
  ].join("\n");

  const kpiSection = ctx.kpiContext
    ? `== Live KPI data ==\n${ctx.kpiContext}`
    : "";

  const persona = `
== Your role: AI Co-founder / Autopilot ==
Today is ${today}.

You are the owner's silent AI Co-founder running the daily business autopilot. You have
full context of the business profile above and any live KPI data provided.

Your job: execute the requested tasks and return each as a structured, ready-to-use output.
Be direct, specific, and actionable — no fluff, no disclaimers, no "here are some ideas"
preambles. Write as if you are handing the owner something they can immediately act on.

Output format rules:
- Use markdown (headers, bullets, bold) for readability
- Numbers over adjectives wherever possible
- Every output must end with ONE clear next action for the owner
- Keep each task output self-contained so the owner can share it directly
`.trim();

  return [persona, profile, voice, kpiSection].filter(Boolean).join("\n\n");
}

function buildTaskPrompt(
  task: AutopilotTaskType,
  businessName: string,
): string {
  const today = new Date();
  const isMonday = today.getDay() === 1;

  const prompts: Record<AutopilotTaskType, string> = {
    daily_brief: `
Generate the daily executive brief for ${businessName}.

Format:
## Daily Brief — [today's date]

**KPI Pulse**
[3-5 key metrics with status: on track / at risk / critical. Use any provided KPI data. If no data, flag that the owner should connect their KPI source.]

**Top 3 Priorities Today**
1. [Most urgent action]
2. [Second priority]
3. [Third priority]

**Decisions Needed**
[Any decisions the owner must make today — 1-3 items max]

**Risk Radar**
[1-2 risks on the horizon this week]

**Next action:** [Single most important thing to do in the next 60 minutes]
`.trim(),

    social_post: `
Create one LinkedIn post and one X/Twitter post for ${businessName} for today.

Base the content on the business profile, goals, and any KPI data provided. Posts should
reflect the brand voice and feel like they came from the founder personally.

Format:
## Social Posts — [today's date]

### LinkedIn
[Post text — 150-300 words, professional tone, story or insight, ends with a question or CTA]

### X / Twitter
[Post text — max 280 characters, punchy, no hashtag spam]

**Next action:** [Which post to publish first and when]
`.trim(),

    weekly_review: isMonday
      ? `
Generate the Monday weekly review for ${businessName}.

Format:
## Weekly Review — Week of [date]

**Revenue vs Target**
[Use KPI data if available. Show: target, actual, variance %, trend]

**Wins last week**
- [Win 1]
- [Win 2]
- [Win 3]

**Misses / Lessons**
- [What didn't land and why]

**Focus area this week**
[The single most important outcome to deliver this week]

**Team performance snapshot**
[Brief note on team output — hire/fire signals if any]

**Next action:** [The first thing to do this Monday morning]
`.trim()
      : `
Note: Full weekly reviews run on Mondays. Today's summary:

**Mid-week check-in**
[Brief status on this week's top priority — on track or off track and why]

**One adjustment needed**
[The single change the owner should make before the week ends]

**Next action:** [Immediate next step]
`.trim(),

    competitor_check: `
Simulate a competitor intelligence briefing for ${businessName}.

Based on what you know about the industry (${businessName}'s industry context), produce a
realistic competitor intelligence summary. Be honest that this is based on known market
patterns, not live web data.

Format:
## Competitor Intel — [today's date]

**Market signals this week**
[2-3 trends or moves typical competitors in this space are making]

**Competitor A**
[Hypothetical move / typical behaviour for a direct competitor — pricing, promotion, product]

**Competitor B**
[Second competitor or indirect threat]

**Opportunity gap**
[One gap in the market the owner could exploit right now]

**Next action:** [One specific response or counter-move]
`.trim(),

    cash_alert: `
Run a cash position and runway check for ${businessName}.

Use any KPI data provided. If monthly revenue and expenses are available, calculate runway.

Format:
## Cash Alert — [today's date]

**Cash position**
[Current balance or "No data connected — connect your accounting tool"]

**Burn rate**
[Monthly expenses or estimate]

**Runway**
[Months of runway = cash / monthly burn. Flag if < 3 months: CRITICAL. 3-6 months: WATCH. > 6 months: HEALTHY]

**Biggest cash risks**
1. [Risk 1]
2. [Risk 2]

**Revenue accelerators**
[1-2 immediate actions to bring cash in faster]

**Next action:** [If critical: emergency action. If healthy: growth action]
`.trim(),

    content_idea: `
Generate 3 high-value content ideas for ${businessName} this week.

Base ideas on the business profile, audience, goals, and brand voice. Each idea should
be immediately executable with no additional research needed.

Format:
## Content Ideas — [today's date]

### Idea 1: [Title]
**Format:** [Blog / Video / Reel / Email / Thread]
**Hook:** [Opening line or visual concept]
**Core message:** [What the audience will learn or feel]
**CTA:** [What you want them to do]
**Effort:** [Low / Medium / High]

### Idea 2: [Title]
[Same format]

### Idea 3: [Title]
[Same format]

**Next action:** [Which idea to create first and why]
`.trim(),
  };

  return prompts[task];
}

export async function POST(req: NextRequest): Promise<Response> {
  // 1. Auth — re-derived from cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } },
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return makeJson({ error: "Unauthorized" }, 401);

  // 2. Parse + validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return makeJson({ error: "Invalid JSON" }, 400);
  }
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) return makeJson({ error: "Bad input" }, 400);
  const { workspaceId, runId, tasks } = parsed.data;

  const admin = createSupabaseAdminClient();

  // 3. Verify workspace ownership (never trust workspaceId from payload alone)
  const { data: workspace } = await admin
    .from("workspaces")
    .select("id, name, tier")
    .eq("id", workspaceId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!workspace) return makeJson({ error: "Unauthorized" }, 401);

  // 4. Verify the run belongs to this workspace
  const { data: run } = await admin
    .from("autopilot_runs")
    .select("id, workspace_id, status")
    .eq("id", runId)
    .eq("workspace_id", workspace.id)
    .maybeSingle();
  if (!run) return makeJson({ error: "Run not found" }, 404);

  // 5. Load workspace context in parallel
  const [{ data: profile }, { data: voice }, { data: kpiRow }] =
    await Promise.all([
      admin
        .from("business_profiles")
        .select(
          "industry, size, challenges, goals_90d, primary_offer, target_customer",
        )
        .eq("workspace_id", workspace.id)
        .maybeSingle(),
      admin
        .from("brand_voice")
        .select("voice_summary, tone_attributes, words_to_use, words_to_avoid")
        .eq("workspace_id", workspace.id)
        .maybeSingle(),
      // Try to load saved KPIs — stored as a single kpi_data jsonb blob
      admin
        .from("workspace_kpis")
        .select("kpi_data")
        .eq("workspace_id", workspace.id)
        .maybeSingle(),
    ]);

  // kpi_data is a free-form jsonb object saved from the dashboard KPI form
  const kpiData =
    kpiRow?.kpi_data != null &&
    typeof kpiRow.kpi_data === "object" &&
    !Array.isArray(kpiRow.kpi_data)
      ? (kpiRow.kpi_data as Record<string, unknown>)
      : null;

  const kpiContext = kpiData
    ? Object.entries(kpiData)
        .filter(([, v]) => v != null && v !== "")
        .map(([k, v]) => `${k}: ${String(v)}`)
        .join("\n")
    : undefined;

  const system = buildCofounderSystemPrompt({
    businessName: workspace.name as string,
    industry: profile?.industry ?? undefined,
    size: profile?.size ?? undefined,
    primaryOffer: profile?.primary_offer ?? undefined,
    targetCustomer: profile?.target_customer ?? undefined,
    challenges: profile?.challenges ?? undefined,
    goals90d: profile?.goals_90d ?? undefined,
    brandVoiceSummary: voice?.voice_summary ?? undefined,
    toneAttributes: voice?.tone_attributes ?? undefined,
    wordsToUse: voice?.words_to_use ?? undefined,
    wordsToAvoid: voice?.words_to_avoid ?? undefined,
    kpiContext,
  });

  // 6. Stream task outputs — one Anthropic call per task, yield NDJSON lines
  const encoder = new TextEncoder();
  const anthropic = getAnthropic();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const collectedOutputs: AutopilotRunOutput[] = [];

      for (const task of tasks) {
        const taskPrompt = buildTaskPrompt(task, workspace.name as string);
        let taskOutput = "";

        try {
          const anthropicStream = anthropic.messages.stream({
            model: ANTHROPIC_MODEL,
            max_tokens: 1200,
            system,
            messages: [{ role: "user", content: taskPrompt }],
          });

          for await (const event of anthropicStream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              taskOutput += event.delta.text;
            }
          }
        } catch (err) {
          taskOutput = `Error running ${task}: ${err instanceof Error ? err.message : String(err)}`;
        }

        collectedOutputs.push({ task, output: taskOutput });

        // Emit one NDJSON line per completed task so the client can render incrementally
        const line =
          JSON.stringify({
            task,
            output: taskOutput,
          } satisfies AutopilotRunOutput) + "\n";
        controller.enqueue(encoder.encode(line));
      }

      // 7. Persist the completed run (non-fatal if it fails)
      try {
        await admin
          .from("autopilot_runs")
          .update({
            status: "done",
            outputs: collectedOutputs,
            tasks,
          })
          .eq("id", runId);
      } catch {
        // Non-fatal — run row is already visible, outputs just won't persist
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache, no-store",
    },
  });
}
