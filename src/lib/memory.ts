// Agent memory system — structured, per-workspace, no embeddings required.
//
// Two entry points:
//   loadMemories()          — fast read at request time, runs in Promise.all
//   extractAndSaveMemories() — background write after stream completes, never awaited
//
// Extraction reuses the same Claude-call + 8s timeout + JSON-parse pattern as
// brand voice extraction in src/server/actions/onboarding.ts:77-115.
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAnthropic, ANTHROPIC_MODEL } from "@/lib/anthropic";

export type MemoryCategory =
  | "business_fact"
  | "decision"
  | "preference"
  | "concern"
  | "milestone";

export type AgentMemory = {
  id: string;
  workspace_id: string;
  category: MemoryCategory;
  content: string;
  source_agent: string | null;
  importance: 1 | 2 | 3;
  created_at: string;
  last_reinforced_at: string;
};

type RawExtracted = {
  category: MemoryCategory;
  content: string;
  importance: 1 | 2 | 3;
};

const VALID_CATEGORIES = new Set<MemoryCategory>([
  "business_fact",
  "decision",
  "preference",
  "concern",
  "milestone",
]);

const EXTRACTION_SYSTEM = `You are a memory extractor for an AI business advisor system.
You receive one user message and one AI assistant reply from a business conversation.
Your job: extract only concrete, reusable facts that would help future conversations.

Rules:
- Only extract facts explicitly stated, never inferred.
- Ignore pleasantries, greetings, generic questions ("thanks", "can you help", "what do you think").
- Each memory must be a single self-contained sentence (max 160 characters).
- Category options: business_fact | decision | preference | concern | milestone
  · business_fact  — factual update about the business not in the onboarding profile
  · decision       — strategic or operational decision made
  · preference     — how the owner wants the AI to communicate or behave
  · concern        — problem, fear, or worry the owner expressed
  · milestone      — past achievement mentioned
- Importance: 1=nice-to-know, 2=useful context, 3=critical (affects strategy or finances)
- Return a JSON array only. If nothing is worth remembering, return [].

JSON schema for each item:
{"category":"business_fact","content":"Owner hired 3 baristas in April 2026.","importance":2}`;

/**
 * Load the top N memories for a workspace, ranked by importance then recency.
 * Non-fatal — returns [] on any error.
 */
export async function loadMemories(
  workspaceId: string,
  limit = 12,
): Promise<AgentMemory[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("agent_memories")
    .select(
      "id, workspace_id, category, content, source_agent, importance, created_at, last_reinforced_at",
    )
    .eq("workspace_id", workspaceId)
    .order("importance", { ascending: false })
    .order("last_reinforced_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as AgentMemory[];
}

/**
 * Extract memories from a completed conversation turn and persist them.
 * Always call with `void` — never await. Silently swallows all errors.
 */
export async function extractAndSaveMemories(opts: {
  workspaceId: string;
  agentRole: string;
  userMessage: string;
  assistantMessage: string;
}): Promise<void> {
  try {
    const { workspaceId, agentRole, userMessage, assistantMessage } = opts;

    const anthropic = getAnthropic();

    const extraction = anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 400,
      system: EXTRACTION_SYSTEM,
      messages: [
        {
          role: "user",
          content: `USER: ${userMessage.slice(0, 2000)}\n\nASSISTANT: ${assistantMessage.slice(0, 2000)}`,
        },
      ],
    });

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("extraction timeout")), 6_000),
    );

    const out = await Promise.race([extraction, timeout]);
    const first = out.content[0];
    if (!first || first.type !== "text") return;

    const raw = first.text
      .replace(/^```(?:json)?/m, "")
      .replace(/```$/m, "")
      .trim();

    let items: RawExtracted[];
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      items = parsed
        .filter(
          (x): x is RawExtracted =>
            typeof x === "object" &&
            x !== null &&
            "category" in x &&
            "content" in x &&
            "importance" in x &&
            VALID_CATEGORIES.has((x as RawExtracted).category) &&
            typeof (x as RawExtracted).content === "string" &&
            (x as RawExtracted).content.length > 0 &&
            (x as RawExtracted).content.length <= 200 &&
            [1, 2, 3].includes((x as RawExtracted).importance),
        )
        .slice(0, 5); // max 5 memories per turn
    } catch {
      return;
    }

    if (items.length === 0) return;

    const admin = createSupabaseAdminClient();

    // Load existing memories for this workspace (for dedup check)
    const { data: existing } = await admin
      .from("agent_memories")
      .select("id, category, content, importance")
      .eq("workspace_id", workspaceId);

    const existingList = (existing ?? []) as {
      id: string;
      category: string;
      content: string;
      importance: number;
    }[];

    for (const item of items) {
      // Dedup: compare first 60 chars (case-insensitive) within same category
      const prefix = item.content.slice(0, 60).toLowerCase();
      const match = existingList.find(
        (e) =>
          e.category === item.category &&
          e.content.slice(0, 60).toLowerCase() === prefix,
      );

      if (match) {
        // Reinforce: bump last_reinforced_at and possibly importance
        await admin
          .from("agent_memories")
          .update({
            last_reinforced_at: new Date().toISOString(),
            importance: Math.min(3, Math.max(match.importance, item.importance)) as 1 | 2 | 3,
          })
          .eq("id", match.id);
      } else {
        await admin.from("agent_memories").insert({
          workspace_id: workspaceId,
          category: item.category,
          content: item.content,
          source_agent: agentRole,
          importance: item.importance,
        });
      }
    }

    // Enforce 150-memory cap: delete oldest low-importance excess rows
    const { data: allIds } = await admin
      .from("agent_memories")
      .select("id")
      .eq("workspace_id", workspaceId)
      .order("importance", { ascending: false })
      .order("last_reinforced_at", { ascending: false })
      .limit(150);

    if (allIds && allIds.length === 150) {
      // Get the 150th row's created_at to delete anything older + lower priority
      await admin
        .from("agent_memories")
        .delete()
        .eq("workspace_id", workspaceId)
        .not(
          "id",
          "in",
          `(${allIds.map((r: { id: string }) => `'${r.id}'`).join(",")})`,
        );
    }
  } catch {
    // Silently swallow — memory extraction must never crash the caller
  }
}
