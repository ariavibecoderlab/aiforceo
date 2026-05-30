# Boardroom AI — Development Action Plan

> **Living document.** Updated after every sprint. All co-developers must check off items as they complete them and add a Decision Log entry (see `DECISION_LOG.md`) for any non-obvious choice made while implementing a task.
>
> **AI autonomy level:** Level 2 (SOP §11.3) — AI writes code and opens PRs; a human approves every merge to `main`.

---

## How to Use This Document

| Symbol | Meaning |
|--------|---------|
| `- [x]` | Done and verified |
| `- [ ]` | Not yet started |
| ✅ | Section complete |
| ⚠️ | Partially complete — see notes |
| ⏳ | Intentionally deferred |
| 🔴 | Blocker — cannot ship without this |

**Phases:**
- **Phase 0 — Foundation (v0.1 core):** The skeleton. Done.
- **Phase 1 — Ship-Ready (v0.1 launch):** What must be done before first paying customer.
- **Phase 2 — Growth (v0.2):** Post-launch features that drive retention and revenue.
- **Phase 3 — Scale (v0.3+):** Advanced platform features.

**File ownership convention:**
Every feature below lists the primary source files responsible for it. When you edit a file listed here, check the associated tasks and update their status.

---

## Phase 0 — Foundation (v0.1 Core) ✅

> All items in this phase are complete and verified. Do not modify without a Decision Log entry.

---

### 0.1 Authentication & Identity

**Core function:** Users can create accounts, sign in, and sign out securely.

#### 0.1.1 Sign-up flow
- [x] Email + password registration (`src/app/login/page.tsx`)
- [x] Password confirmation validation (min 8 chars, matching confirm)
- [x] Supabase `signUp()` call with redirect to `/api/auth/callback`
- [x] Email confirmation sent; user shown "Check your inbox" state
- [x] Immediate sign-in attempt after signup (bypasses confirmation when disabled)
- [x] Auto-profile creation via DB trigger `handle_new_user()` (`supabase/migrations/0001_init.sql`)

#### 0.1.2 Sign-in flow
- [x] Email + password sign-in (`src/app/login/page.tsx`)
- [x] `signInWithPassword()` via Supabase browser client
- [x] Friendly error messages (invalid credentials, unconfirmed email)
- [x] Redirect to `/dashboard` on success

#### 0.1.3 Forgot password flow
- [x] Email input page (`src/app/forgot-password/page.tsx`)
- [x] `resetPasswordForEmail()` sends reset link
- [x] Redirect URL: `/api/auth/callback?type=recovery`
- [x] Does not reveal whether email is registered (safe)

#### 0.1.4 Reset password flow
- [x] New password + confirm page (`src/app/reset-password/page.tsx`)
- [x] `updateUser({ password })` — requires valid session from reset link
- [x] Redirect to `/dashboard` on success

#### 0.1.5 Auth callback
- [x] `/api/auth/callback/route.ts` — exchanges code for session
- [x] Routes recovery flows to `/reset-password`
- [x] Checks workspace onboarding status; routes to `/onboarding` if incomplete
- [x] `next` param sanitised to same-origin only (`rawNext.startsWith("/")` guard) ← *fixed*

#### 0.1.6 Sign-out
- [x] `signOut()` server action (`src/server/actions/auth.ts`)
- [x] Clears session and redirects to `/login`
- [x] Called from Sidebar component

#### 0.1.7 Session management (edge middleware)
- [x] `src/middleware.ts` — runs on every request at the edge
- [x] `updateSession()` from `src/lib/supabase/middleware.ts` refreshes tokens
- [x] `PUBLIC_PATHS` allowlist: `/`, `/login`, `/pricing`, `/forgot-password`, `/reset-password`, API routes
- [x] All other routes gate-check for authenticated user
- [x] Returns 401 for unauthenticated API requests (not redirect)
- [x] Redirects unauthenticated page requests to `/login?next=[original-path]`

#### 0.1.8 Supabase client factory
- [x] `src/lib/supabase/browser.ts` — client-side (`"use client"` only)
- [x] `src/lib/supabase/server.ts` — server components, RLS-respecting reads
- [x] `src/lib/supabase/admin.ts` — service role, writes only (must be gated by `require*()`)
- [x] `src/lib/supabase/middleware.ts` — edge runtime, session refresh

#### 0.1.9 Auth guards (server-side)
- [x] `requireUser()` — throws if not authenticated (`src/lib/auth/require.ts`)
- [x] `requireWorkspaceOwner(workspaceId)` — re-derives ownership server-side, never trusts client
- [x] `requireAdmin()` — checks `profiles.is_admin = true` (`src/lib/auth/require-admin.ts`)

#### 0.1.10 Admin access
- [x] `is_admin` column on `profiles` table (`supabase/migrations/0004_add_is_admin.sql`)
- [x] `salam@brainybunch.com` set as admin in DB ← *set this session*

---

### 0.2 Workspace & Onboarding

**Core function:** User sets up their business context so every AI executive is briefed.

#### 0.2.1 Onboarding gate
- [x] Dashboard redirects to `/onboarding` if no workspace exists OR workspace `onboarded = false` ← *fixed*
- [x] Auth callback routes new users to `/onboarding`

#### 0.2.2 Onboarding wizard — 5-step structure
- [x] Step progress bar and step labels (`src/app/onboarding/page.tsx`)
- [x] Client-side step state machine (`useState` step 1–5)
- [x] Step 1 gated: requires `businessName.length > 0`
- [x] Step 2 gated: requires `voiceSample.length > 50`
- [x] Steps 3–5: intentionally ungated (all optional/UI-preview)

#### 0.2.3 Step 1 — Business Profile
- [x] Business name input
- [x] Industry select (7 options)
- [x] Team size chip selector (solo / 2–10 / 11–50 / 51–250 / 250+)
- [x] Primary offer input ("What's your main product or service?") ← *added*
- [x] Target customer input ("Who is your ideal customer?") ← *added*
- [x] Top-3 challenges chip selector (max 3)
- [x] 90-day goal textarea
- [x] Saved to `business_profiles` table via `saveOnboarding()` server action

#### 0.2.4 Step 2 — Brand Voice
- [x] Voice sample textarea (200–800 words ideal)
- [x] Raw sample saved immediately to `brand_voice.source_text`
- [x] Anthropic API call extracts: `voice_summary`, `tone_attributes`, `words_to_use`, `words_to_avoid`
- [x] Extraction runs with 8-second timeout (D-016); raw sample preserved on failure
- [x] Saved to `brand_voice` table

#### 0.2.5 Step 3 — P&L Snapshot
- [x] P&L text/CSV textarea
- [x] Saved to `financial_snapshots` if `pnlText.length >= 20`
- [x] Period auto-set to current month (known limitation — user cannot specify period)
- [ ] Allow user to specify period (e.g., "Q1 2026") — deferred to settings update

#### 0.2.6 Step 4 — Connector Picker (UI preview)
- [x] 10 connector chips displayed (Gmail, Stripe, Xero, QuickBooks, Meta, GA, WhatsApp, Slack, Notion, Calendly)
- [x] Visual toggle (chip selection) — not persisted (intentional — connectors are v0.2)

#### 0.2.7 Step 5 — Launch
- [x] 6 agent cards displayed with gradient avatars
- [x] Click agent → `saveOnboarding()` → redirect to `/agent/[role]`
- [x] "Go to dashboard" → `saveOnboarding()` → redirect to `/dashboard`
- [x] `saving` loading state prevents double-submit

#### 0.2.8 `saveOnboarding()` server action
- [x] Zod schema validates all inputs (`src/server/actions/onboarding.ts`)
- [x] `requireUser()` gate before any write
- [x] Creates workspace (name, slug, tier=trial, quota=100K, onboarded=true)
- [x] Upserts `business_profiles` (all 7 fields including primary_offer, target_customer)
- [x] Upserts `brand_voice` + triggers Anthropic extraction
- [x] Inserts `financial_snapshots` if P&L provided
- [x] Inserts trial token grant (100K) to `credit_ledger`

---

### 0.3 AI Agent System

**Core function:** Users chat with 6 AI executives, each with distinct expertise and their business context loaded.

#### 0.3.1 Agent roles (6 total)
- [x] **Eden** — CEO Advisor (strategy, decisions, daily brief) — `role: "ceo"`
- [x] **Felix** — CFO (P&L, cash flow, financial scenarios) — `role: "cfo"`
- [x] **Maya** — CMO (content, ads, brand voice) — `role: "cmo"`
- [x] **Owen** — COO (SOPs, operations, productivity) — `role: "coo"`
- [x] **Tariq** — CTO (tech audit, automations, security) — `role: "cto"`
- [x] **Aria** — Chief of Staff (cross-exec, briefings, open loops) — `role: "aria"`
- [x] `conversations.agent_role` constraint updated to include `cto` and `aria` (`0003_add_cto_aria_roles.sql`)

#### 0.3.2 Agent page
- [x] `/agent/[role]/page.tsx` — server component, validates role, loads workspace context
- [x] Redirects to `/onboarding` if workspace not found or not onboarded
- [x] Loads `remaining tokens` and `monthly quota` for CreditMeter
- [x] Passes context to `ChatClient` for rendering

#### 0.3.3 Chat client
- [x] `src/app/agent/[role]/ChatClient.tsx` — streams responses from `/api/chat/agent`
- [x] Message list with user/assistant roles
- [x] Quick-prompt chips per role (3–4 per agent, pre-defined)
- [x] Auto-scroll to latest message
- [x] Input field with send on Enter / button click
- [x] Loading/streaming indicator
- [x] CreditMeter displayed via Sidebar

#### 0.3.4 Agent chat API route (`/api/chat/agent`)
- [x] Auth check — returns 401 if unauthenticated
- [x] Validates `role` against allowed values
- [x] Loads workspace context (business_profile, brand_voice, financial_snapshots)
- [x] Detects Google Sheets URL in message and fetches sheet data via `fetchSheetByUrl()`
- [x] Loads persistent Google Sheets connector data via `buildSheetsContext()`
- [x] Checks `getRemainingTokens()` — returns 402 with upgrade message if quota exhausted
- [x] Fetches or creates conversation record for this workspace+role
- [x] Calls Anthropic `messages.stream()` with full message history + system prompt
- [x] Streams text deltas to client via `ReadableStream`
- [x] On stream complete: persists assistant message to `messages` table
- [x] Records token usage to `credit_ledger` via `recordUsage()`
- [x] Updates conversation `updated_at` and title (first exchange only)

#### 0.3.5 System prompt builder
- [x] `buildSystemPrompt()` in `src/lib/prompts/index.ts`
- [x] Injects: business name, industry, size, primary offer, target customer, challenges, 90-day goal
- [x] Injects: brand voice summary, tone attributes, words to use/avoid
- [x] Injects: latest P&L snapshot if available
- [x] Injects: Google Sheets context if connector active
- [x] Each role has a distinct persona definition (name, title, focus areas, communication style)

#### 0.3.6 ProspectChat (unauthenticated landing page demo)
- [x] `src/app/_components/ProspectChat.tsx` — renders on landing page
- [x] Streams from `/api/chat/prospect` (no auth required)
- [x] Soft rate limit: max 20 messages per session
- [x] Returns 429 if limit hit with "Sign up to continue" message
- [x] Does not save messages to DB
- [x] CSS variables used match `globals.css` definitions

---

### 0.4 Credit & Token System

**Core function:** Token usage is tracked per workspace, enforced before AI calls, and displayed to the user.

#### 0.4.1 Token ledger (append-only)
- [x] `credit_ledger` table with `delta_tokens` (positive = credit, negative = debit)
- [x] `reason` field: `"monthly_reset"` | `"trial_grant"` | `"topup"` | `"chat"` | `"admin_grant"`
- [x] `stripe_invoice_id` stored for Stripe-triggered grants (idempotency)
- [x] RLS: workspace owner can SELECT only; all writes via service role

#### 0.4.2 Token tiers
- [x] `TIER_MONTHLY_TOKENS` in `src/lib/credits.ts`:
  - `trial`: 100,000 tokens
  - `starter`: 500,000 tokens
  - `growth`: 2,000,000 tokens
  - `scale`: 8,000,000 tokens

#### 0.4.3 Monthly auto-reset
- [x] `getRemainingTokens()` checks for `monthly_reset` grant this calendar month
- [x] Auto-inserts grant if not found (workspace self-resets on first dashboard/agent visit)
- [x] Concurrent insert race safely ignored (try/catch)
- [x] `tokens_remaining()` Postgres function (SECURITY DEFINER, pinned search_path) computes remaining

#### 0.4.4 Quota enforcement
- [x] `getRemainingTokens()` called before every Anthropic API call
- [x] Returns HTTP 402 with upgrade message if `remaining <= 0`
- [x] Token count extracted from Anthropic streaming events (`input_tokens` + `output_tokens`)
- [x] `recordUsage()` inserts negative delta after each successful response

#### 0.4.5 Credit meter UI
- [x] `src/app/_components/CreditMeter.tsx` — shows remaining / quota bar
- [x] Colour-coded: green > 50%, amber 20–50%, red < 20%
- [x] "Top up" label displayed (links to `/pricing`)
- [x] Shown in Sidebar on all agent and dashboard pages

#### 0.4.6 Admin token operations
- [x] `adminGrantTokens()` — manually credits tokens (`src/server/actions/admin.ts`)
- [x] `adminChangeTier()` — updates tier AND `monthly_token_quota` ← *fixed*
- [x] `grantMonthlyQuota()` — idempotent via `stripeInvoiceId` check ← *fixed*

---

### 0.5 Dashboard

**Core function:** Central overview of workspace activity, agent usage, and business KPIs.

#### 0.5.1 Server data loading
- [x] `getCurrentWorkspace()` — resolves active workspace from cookie + fallback
- [x] Agent conversation stats (count, last active, MTD message count)
- [x] Latest assistant message per agent (for "last output" preview)
- [x] Active connectors count
- [x] Saved KPIs loaded from `workspace_kpis`
- [x] Group KPIs for multi-workspace comparison (if owner has >1 workspace)

#### 0.5.2 Dashboard UI
- [x] `DashboardClient` — 6 agent cards with stats
- [x] KPI tracker (editable inline, saves to `workspace_kpis`)
- [x] Credit meter (remaining tokens / monthly quota)
- [x] Connected data sources count
- [x] Group view — compare KPIs across workspaces (if applicable)
- [x] Quick-launch buttons to each agent

#### 0.5.3 Sidebar & navigation
- [x] `src/app/_components/Sidebar.tsx` — fixed left rail
- [x] Links to all 6 agents, dashboard, connectors, settings
- [x] WorkspaceSwitcher — switch between workspaces (cookie-based)
- [x] CreditMeter at bottom
- [x] Sign-out button

---

### 0.6 Settings

**Core function:** Users can update their business profile, brand voice, P&L, and view subscription status.

- [x] Business profile tab — edit all Step 1 fields
- [x] Brand voice tab — re-paste sample, triggers Anthropic re-extraction
- [x] Financials tab — paste new P&L snapshot
- [x] Subscription tab — shows tier, quota, usage, link to upgrade
- [x] Team tab — "Coming Soon" placeholder
- [x] All saves via `updateProfile()` server action (`src/server/actions/settings.ts`)
- [x] `revalidatePath()` after every save to refresh server-component data

---

### 0.7 Connectors Page

**Core function:** Users connect external data sources to enrich agent context.

- [x] `ConnectorsClient` — connector cards with status badges
- [x] Google Sheets — OAuth connect/disconnect button; "Test" button
- [x] QuickBooks — OAuth connect/disconnect button
- [x] Custom API — URL + auth header form
- [x] 7 "Coming Soon" connectors displayed (Gmail, Xero, Meta, GA, WhatsApp, Slack, Notion)
- [x] `connectors` table stores `provider`, `status`, `access_token`, `refresh_token`, `expires_at`, `metadata`
- [x] Unique constraint `(workspace_id, provider)` for upsert safety (`0005_connector_unique.sql`)

---

### 0.8 Admin Panel

**Core function:** Internal team can manage all customer workspaces.

- [x] `/admin` route — gated by `requireAdmin()` (checks `profiles.is_admin`)
- [x] Admin dashboard — overview stats
- [x] `/admin/customers` — list all workspaces with search
- [x] `/admin/customers/[id]` — individual customer detail page
- [x] `adminChangeTier()` — changes tier + updates `monthly_token_quota` ← *fixed*
- [x] `adminGrantTokens()` — manual credit with reason note
- [x] `adminSetOnboarded()` — toggle onboarded flag

---

### 0.9 Landing Page & Marketing

**Core function:** Convert visitors into signups.

- [x] Root `/` — full marketing page (hero, agent showcase, how-it-works, founding member CTA)
- [x] `/pricing` — plan comparison with Stripe checkout CTAs
- [x] `/login` — sign in / create account tabs
- [x] `/forgot-password`, `/reset-password` — password recovery
- [x] `ProspectChat` demo widget on landing page
- [x] `robots.ts` — blocks crawlers from app routes
- [x] `sitemap.ts` — public pages indexed
- [x] OG / Twitter social card — `opengraph-image.tsx` (Next.js `ImageResponse`) ← *added*
- [x] SEO metadata in `layout.tsx`

---

### 0.10 Database Schema & Migrations

- [x] `0001_init.sql` — all 9 core tables, RLS, `is_owner()`, `tokens_remaining()`, `handle_new_user()` trigger, self-test
- [x] `0002_lock_definer_fns.sql` — revoke public EXECUTE on SECURITY DEFINER functions
- [x] `0003_add_cto_aria_roles.sql` — expand `conversations.agent_role` constraint
- [x] `0004_add_is_admin.sql` — `profiles.is_admin` column
- [x] `0005_connector_unique.sql` — unique constraint on `connectors(workspace_id, provider)`
- [x] `workspace_kpis` table — KPI storage for dashboard (confirmed live)
- [x] All migrations synced (local ↔ remote `supabase migration list` clean)

---

### 0.11 Infrastructure & CI

- [x] `pnpm typecheck` — TypeScript strict, must pass
- [x] `pnpm lint` — ESLint, must pass
- [x] `pnpm test` — Vitest, 12 tests, must pass
- [x] `pnpm build` — Next.js production build, must pass
- [x] `.github/workflows/ci.yml` — all 4 gates on every push; merge blocked on failure
- [x] `CLAUDE.md` — Claude Code project guide (architecture rules, file map, workflow)

---

## Phase 1 — Ship-Ready (v0.1 Launch) 🔴

> Everything needed before the first paying customer. Must be done before going live.

---

### 1.1 Stripe Integration 🔴

**Core function:** Users can pay for access; tokens and tier updated automatically on payment.

#### 1.1.1 Stripe account setup
- [ ] Create Stripe account (test mode first)
- [ ] Enable all required payment methods (card, FPX for MY market)
- [ ] Configure Stripe tax settings if applicable

#### 1.1.2 Create Stripe products & prices
- [ ] **Setup Fee** — one-time payment (e.g., RM 97 or USD 29)
  - [ ] Create product in Stripe Dashboard
  - [ ] Copy price ID → `STRIPE_PRICE_SETUP`
- [ ] **Starter plan** — monthly subscription (500K tokens/mo)
  - [ ] Create product + recurring price
  - [ ] Copy price ID → `STRIPE_PRICE_STARTER`
- [ ] **Growth plan** — monthly subscription (2M tokens/mo)
  - [ ] Create product + recurring price
  - [ ] Copy price ID → `STRIPE_PRICE_GROWTH`
- [ ] **Scale plan** — monthly subscription (8M tokens/mo)
  - [ ] Create product + recurring price
  - [ ] Copy price ID → `STRIPE_PRICE_SCALE`
- [ ] **Top-up** — one-time token pack (200K tokens)
  - [ ] Create product + one-time price
  - [ ] Copy price ID → `STRIPE_PRICE_TOPUP`

#### 1.1.3 Configure webhook
- [ ] In Stripe Dashboard → Webhooks → Add endpoint
  - [ ] URL: `https://[your-domain]/api/stripe/webhook`
  - [ ] Events to listen for: `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`
- [ ] Copy webhook signing secret → `STRIPE_WEBHOOK_SECRET`
- [ ] For local dev: install `stripe listen --forward-to localhost:3001/api/stripe/webhook`

#### 1.1.4 Environment variables
- [ ] Set `STRIPE_SECRET_KEY` (test: `sk_test_...` | live: `sk_live_...`)
- [ ] Set `STRIPE_WEBHOOK_SECRET` (`whsec_...`)
- [ ] Set all 5 `STRIPE_PRICE_*` variables
- [ ] Update `.env.local` for dev
- [ ] Set in Cloudflare Pages env vars for production

#### 1.1.5 Checkout flow (already coded — just needs real price IDs)
- [x] `createCheckoutSession()` server action (`src/server/actions/billing.ts`)
- [x] Passes `workspace_id` and `plan` as Stripe session metadata
- [x] Includes setup fee line item if not yet paid (`setup_fee_paid = false`)
- [x] Redirects to Stripe Checkout hosted page
- [ ] **Test end-to-end:** click "Start Starter plan" → Stripe test card → confirm webhook fires → workspace tier updated → tokens granted

#### 1.1.6 Webhook handler (already coded — just needs real secret)
- [x] `checkout.session.completed` → update tier + quota + grant tokens (idempotent)
- [x] `invoice.paid` → grant monthly renewal tokens (idempotent via invoice ID)
- [x] `customer.subscription.deleted` → downgrade to trial
- [ ] **Test:** use Stripe CLI to replay each event and verify DB state

#### 1.1.7 Top-up purchase flow
- [ ] Add top-up checkout option to settings or pricing page
- [ ] Create `createTopupCheckoutSession()` server action
- [ ] Handle `checkout.session.completed` with `mode=payment` for top-up
- [ ] Call `grantTopup()` with tokens and invoice ID
- [ ] Update credit meter UI to reflect new balance

---

### 1.2 Production Deployment

#### 1.2.1 Cloudflare Workers deployment
- [ ] Run `pnpm cf:build` (OpenNext Cloudflare build)
- [ ] Run `pnpm cf:preview` (local Workers preview — verify it boots)
- [ ] Run `pnpm cf:deploy` (deploy to Cloudflare)
- [ ] Verify all routes load on production URL

#### 1.2.2 Cloudflare environment variables
- [ ] Set `NEXT_PUBLIC_APP_URL` = production domain
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Set secrets via `pnpm wrangler secret put`:
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `ANTHROPIC_API_KEY`
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`
  - [ ] `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_GROWTH`, `STRIPE_PRICE_SCALE`, `STRIPE_PRICE_SETUP`, `STRIPE_PRICE_TOPUP`

#### 1.2.3 Domain configuration
- [ ] Set custom domain in Cloudflare Pages
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Update Supabase Auth → Site URL to production domain
- [ ] Add production domain to Supabase Auth → Redirect URLs
- [ ] Add production domain to Stripe webhook endpoint

#### 1.2.4 Supabase production hardening
- [ ] Run Supabase Security Advisor — confirm zero ERROR-level findings
- [ ] Auth → Email → "Confirm email" ON, "Secure email change" ON
- [ ] Auth → "Leaked password protection" ON
- [ ] Enable Point-in-Time Recovery (Supabase Pro plan)
- [ ] Verify SMTP (Supabase or custom) delivers emails in production

#### 1.2.5 Pre-ship checklist
- [ ] Complete `docs/PRESHIP_CHECKLIST.md` — every line checked off
- [ ] Stripe switched from test mode to live keys
- [ ] One full end-to-end test on production URL (sign up → onboard → chat → pay)

---

## Phase 2 — Growth (v0.2) ⏳

> Post-launch. Prioritised by impact on retention and revenue.

---

### 2.1 Google Sheets — Live Data (90% built, needs activation)

**Core function:** Felix (CFO) and other agents can read live spreadsheet data.

#### 2.1.1 Google Cloud project setup
- [ ] Create Google Cloud project
- [ ] Enable Google Sheets API + Google Drive API
- [ ] Create OAuth 2.0 credentials (Web application)
  - [ ] Authorised redirect URI: `[domain]/api/connectors/google/callback`
- [ ] Set env vars: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

#### 2.1.2 OAuth flow (already coded in `src/server/actions/connectors.ts`)
- [x] `getGoogleSheetsAuthUrl()` — generates OAuth URL
- [x] `/api/connectors/google/callback` — exchanges code for tokens, stores in `connectors` table
- [x] `disconnectConnector()` — deletes connector row
- [ ] **Test:** connect a Google Sheet → verify tokens saved to DB

#### 2.1.3 Data fetch & context injection (already coded)
- [x] `getValidAccessToken()` — auto-refreshes expired tokens (`src/lib/google-sheets.ts`)
- [x] `buildSheetsContext()` — reads all sheets for this workspace → formatted context string
- [x] `fetchSheetByUrl()` — fetches sheet from a URL mentioned in a chat message
- [x] Agent route injects sheets context into system prompt automatically
- [ ] **Test:** send message with a Google Sheets URL → verify agent reads the data
- [ ] **Test:** connect sheet connector → verify agent has context without explicit URL

#### 2.1.4 Connector UI
- [x] Connect/Disconnect button in `ConnectorsClient`
- [x] "Test connection" button → `/api/connectors/sheets/test`
- [ ] Show which sheets are connected (list sheet names/URLs)
- [ ] Handle expired token gracefully in UI (show "Reconnect" instead of error)

---

### 2.2 QuickBooks — Live Financial Data

**Core function:** Felix (CFO) can read real P&L and cash flow data from QuickBooks.

#### 2.2.1 Intuit developer setup
- [ ] Create Intuit Developer account
- [ ] Create app → get `QUICKBOOKS_CLIENT_ID`, `QUICKBOOKS_CLIENT_SECRET`
- [ ] Set redirect URI: `[domain]/api/connectors/quickbooks/callback`
- [ ] Set env vars: `QUICKBOOKS_CLIENT_ID`, `QUICKBOOKS_CLIENT_SECRET`

#### 2.2.2 OAuth flow (already coded)
- [x] `getQuickBooksAuthUrl()` — generates OAuth URL
- [x] `/api/connectors/quickbooks/callback` — exchanges code, stores tokens + `realm_id`
- [ ] **Test:** connect QuickBooks sandbox → verify tokens + realm_id saved to DB

#### 2.2.3 Token refresh (needs building)
- [ ] Create `getValidQBOAccessToken()` in a new `src/lib/quickbooks.ts`
  - [ ] Check `expires_at` against current time
  - [ ] Call Intuit refresh token endpoint if expired
  - [ ] Update `connectors` table with new tokens + `expires_at`

#### 2.2.4 Data fetching (needs building)
- [ ] `fetchQBOProfitLoss(workspaceId)` — call Intuit Reports API
- [ ] `fetchQBOCashFlow(workspaceId)` — call Intuit Reports API
- [ ] `buildQBOContext()` — format P&L and cash flow as context string
- [ ] Inject `buildQBOContext()` into agent system prompt (alongside Sheets context)

---

### 2.3 Scheduled Morning Briefs

**Core function:** Users receive a daily AI-generated brief at a set time, no prompt needed.

#### 2.3.1 Cloudflare Cron trigger
- [ ] Add cron schedule to `wrangler.jsonc` (e.g., `"0 1 * * *"` for 9am MYT = 1am UTC)
- [ ] Create `/api/cron/morning-brief/route.ts` handler
- [ ] Gate with `CRON_SECRET` env var (verify Cloudflare sends the secret)

#### 2.3.2 Brief generation
- [ ] For each onboarded workspace:
  - [ ] Load workspace context (business profile, brand voice, recent KPIs, agent stats)
  - [ ] Call Aria agent to generate brief (covering: yesterday's activity, open loops, today's priorities)
  - [ ] Respect token quota — skip if remaining < 10K
  - [ ] Save brief as an Aria conversation + message in DB

#### 2.3.3 Delivery
- [ ] Send brief via email (Resend or Supabase SMTP)
  - [ ] HTML email template with Boardroom AI branding
  - [ ] "Open Aria →" CTA linking to `/agent/aria`
- [ ] Optional: in-app notification badge on Aria card in dashboard

#### 2.3.4 User controls
- [ ] Settings toggle: "Enable daily morning brief"
- [ ] Time preference: pick delivery time (store in `workspaces` or new `workspace_preferences` table)
- [ ] Add `morning_brief_enabled` and `brief_time_utc` columns to `workspaces` via migration

---

### 2.4 Multi-Workspace UI

**Core function:** A user with multiple businesses (workspaces) can switch and manage them from the UI.

> Schema already supports this. 3 workspaces exist in DB. `WorkspaceSwitcher` component exists.

#### 2.4.1 Workspace creation UI
- [x] `/workspaces/page.tsx` exists — needs full implementation
- [ ] "Create new workspace" button → mini wizard (subset of onboarding: just name + industry)
- [ ] `createWorkspace()` server action already exists (`src/server/actions/workspaces.ts`)
- [ ] After creation, redirect to onboarding for the new workspace

#### 2.4.2 Workspace switcher
- [x] `WorkspaceSwitcher` component in Sidebar
- [x] `switchWorkspace()` action sets `ACTIVE_WS_COOKIE`
- [ ] Dropdown shows all workspace names + current tier badge
- [ ] "Manage workspaces" link to `/workspaces`

#### 2.4.3 Workspace deletion
- [ ] `deleteWorkspace()` server action (with confirmation gate)
- [ ] Cascades cleanly via DB `ON DELETE CASCADE` (already configured)
- [ ] Cannot delete last workspace (guard in server action)

---

### 2.5 Team Seats & Invites

**Core function:** Multiple team members can access the same workspace.

#### 2.5.1 Schema changes
- [ ] Migration: `workspace_members` table (`workspace_id`, `user_id`, `role: owner|member`, `invited_by`, `created_at`)
- [ ] RLS: members can SELECT workspace data; only owner can INSERT/DELETE
- [ ] Update `requireWorkspaceOwner()` to also check `workspace_members`

#### 2.5.2 Invite flow
- [ ] `inviteTeamMember(email)` server action
- [ ] Send invite email with a signed invite link
- [ ] Accept invite → creates profile + `workspace_members` row
- [ ] Settings → Team tab → invite form (currently "Coming Soon")

#### 2.5.3 Member management
- [ ] List members on Settings → Team
- [ ] Remove member action
- [ ] Transfer ownership action (owner only)

---

### 2.6 Token Top-up Purchase

**Core function:** Users can buy additional tokens mid-month without upgrading their plan.

- [ ] Add "Buy 200K tokens — RM 9" button to Settings → Subscription tab
- [ ] `createTopupCheckoutSession()` server action
  - [ ] Stripe `mode: "payment"` with `STRIPE_PRICE_TOPUP`
  - [ ] Metadata: `workspace_id`, `type: "topup"`, `tokens: 200000`
- [ ] Webhook: handle `checkout.session.completed` where `type === "topup"`
  - [ ] Call `grantTopup(workspaceId, 200000, session.id)`
- [ ] Credit meter refreshes after successful top-up
- [ ] Success redirect back to agent or dashboard

---

### 2.7 PWA & Mobile Polish

- [ ] Add `manifest.json` to `/public/`
  - [ ] App name, icons (192px, 512px), theme colour, background colour
  - [ ] `display: "standalone"`, `start_url: "/dashboard"`
- [ ] Add `<link rel="manifest">` to `layout.tsx`
- [ ] Test "Add to Home Screen" on iOS and Android
- [ ] Mobile-optimise Sidebar (hamburger menu / bottom nav on small screens)
- [ ] Test all agent pages on mobile viewport (375px width)

---

### 2.8 Observability & Error Tracking

- [ ] Add Sentry (referenced in `ARCHITECTURE.md` but not yet integrated)
  - [ ] `@sentry/nextjs` package
  - [ ] `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
  - [ ] Set `SENTRY_DSN` env var
  - [ ] Verify error events appear in Sentry dashboard
- [ ] Cloudflare Workers Analytics — review dashboard after first 100 users
- [ ] Add structured logging to server actions (workspace ID + action name on errors)
- [ ] Daily reconciliation job: Stripe subscription state vs workspace tier (v0.2 promise per Architecture doc)

---

## Phase 3 — Scale (v0.3+) ⏳

> Long-horizon features. Do not start until v0.2 is stable and metrics are healthy.

---

### 3.1 Additional Connectors

- [ ] **Gmail** — read recent threads for context injection
- [ ] **Xero** — accounting data (similar to QuickBooks)
- [ ] **Meta Ads** — campaign performance for Maya (CMO)
- [ ] **Google Analytics** — web traffic for Maya
- [ ] **Slack** — send agent outputs to Slack channels
- [ ] **Notion** — read/write pages for COO workflows
- [ ] **Calendly** — meeting context for Aria (Chief of Staff)
- [ ] **WhatsApp Business API** — agent responses via WhatsApp (v0.3 milestone)

---

### 3.2 Long-Term Memory (pgvector)

**Core function:** Agents remember key facts, decisions, and context across sessions.

- [ ] Enable `pgvector` extension in Supabase
- [ ] Migration: `agent_memories` table (`workspace_id`, `agent_role`, `content`, `embedding vector(1536)`, `created_at`)
- [ ] After each conversation: extract key facts → embed → store
- [ ] On each new chat: retrieve top-K relevant memories → inject into system prompt
- [ ] `src/lib/memory.ts` — `storeMemory()`, `retrieveRelevantMemories()`
- [ ] Memory management UI in Settings (view / delete stored facts)

---

### 3.3 Custom Agent Builder

**Core function:** Users can create custom AI agents beyond the default 6.

- [ ] `/agents/new` — agent builder UI (name, avatar, focus area, custom system prompt)
- [ ] Migration: `custom_agents` table (`workspace_id`, `name`, `system_prompt`, `avatar_color`)
- [ ] Custom agents appear in Sidebar alongside default 6
- [ ] Custom agents follow same credit/streaming/persistence pattern

---

### 3.4 Output Marketplace

- [ ] Users can publish agent outputs as templates
- [ ] Browse templates by industry + role
- [ ] One-click "Use this template" → populates quick-prompt

---

### 3.5 Affiliate Program

- [ ] Unique referral links per workspace
- [ ] Track signups via referral
- [ ] Commission credit (tokens or cash) on first payment by referred user

---

### 3.6 Localization

- [ ] `next-intl` or `react-i18next` setup
- [ ] Malay (Bahasa Malaysia) — priority language for MY market
- [ ] Arabic — Middle East expansion
- [ ] Language selector in Settings

---

### 3.7 Done-For-You (DFY) Tier

- [ ] Separate pricing tier (high-touch, managed service)
- [ ] Dedicated Boardroom AI team sets up the workspace
- [ ] Weekly async "board meeting" outputs delivered by email
- [ ] Custom SLA and support channel

---

## Appendix A — Environment Variables Reference

| Variable | Required by | Where to get it |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_APP_URL` | All | Set to your domain |
| `NEXT_PUBLIC_SUPABASE_URL` | All | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Server writes | Supabase → Settings → API |
| `ANTHROPIC_API_KEY` | Agent chat | console.anthropic.com |
| `ANTHROPIC_MODEL` | Agent chat | Default: `claude-sonnet-4-6` |
| `STRIPE_SECRET_KEY` | Billing | Stripe Dashboard → API keys |
| `STRIPE_WEBHOOK_SECRET` | Webhook | Stripe → Webhooks → signing secret |
| `STRIPE_PRICE_SETUP` | Billing | Stripe → Products |
| `STRIPE_PRICE_STARTER` | Billing | Stripe → Products |
| `STRIPE_PRICE_GROWTH` | Billing | Stripe → Products |
| `STRIPE_PRICE_SCALE` | Billing | Stripe → Products |
| `STRIPE_PRICE_TOPUP` | Billing (v0.2) | Stripe → Products |
| `GOOGLE_CLIENT_ID` | Connectors (v0.2) | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Connectors (v0.2) | Google Cloud Console |
| `QUICKBOOKS_CLIENT_ID` | Connectors (v0.2) | Intuit Developer |
| `QUICKBOOKS_CLIENT_SECRET` | Connectors (v0.2) | Intuit Developer |
| `SENTRY_DSN` | Observability (v0.2) | sentry.io |
| `CRON_SECRET` | Morning briefs (v0.2) | Generate a random secret |

---

## Appendix B — Database Tables Reference

| Table | Purpose | Phase |
|-------|---------|-------|
| `profiles` | 1:1 with auth.users | v0.1 ✅ |
| `workspaces` | Business unit, tier, quota, Stripe IDs | v0.1 ✅ |
| `business_profiles` | Industry, offer, target customer, challenges, goals | v0.1 ✅ |
| `brand_voice` | AI-extracted tone, vocabulary, summary | v0.1 ✅ |
| `financial_snapshots` | P&L text + AI analysis per period | v0.1 ✅ |
| `connectors` | OAuth tokens per provider | v0.1 ✅ (UI only until v0.2) |
| `conversations` | One per workspace per agent role | v0.1 ✅ |
| `messages` | Chat history with token counts | v0.1 ✅ |
| `credit_ledger` | Append-only token ledger | v0.1 ✅ |
| `workspace_kpis` | KPI tracker data | v0.1 ✅ |
| `workspace_members` | Team seats | v0.2 |
| `agent_memories` | pgvector semantic memory | v0.3 |
| `custom_agents` | User-defined agents | v0.3 |

---

## Appendix C — File Map (Key Files Only)

```
src/
├── middleware.ts                    Route protection (edge)
├── app/
│   ├── layout.tsx                   Root layout + metadata
│   ├── opengraph-image.tsx          Auto OG image (1200×630)
│   ├── page.tsx                     Landing page
│   ├── login/page.tsx               Sign in / Sign up
│   ├── onboarding/page.tsx          5-step wizard (client)
│   ├── dashboard/page.tsx           Dashboard (server)
│   ├── agent/[role]/
│   │   ├── page.tsx                 Agent page (server)
│   │   └── ChatClient.tsx           Streaming chat (client)
│   ├── connectors/
│   │   ├── page.tsx                 Connectors page (server)
│   │   └── ConnectorsClient.tsx     Connector cards (client)
│   ├── settings/
│   │   ├── page.tsx                 Settings page (server)
│   │   └── SettingsClient.tsx       Settings tabs (client)
│   ├── admin/
│   │   ├── layout.tsx               Admin gate (requireAdmin)
│   │   ├── page.tsx                 Admin overview
│   │   ├── customers/
│   │   │   ├── page.tsx             Customer list
│   │   │   ├── CustomersClient.tsx  Customer list (client)
│   │   │   └── [id]/page.tsx        Customer detail
│   │   └── settings/page.tsx        Admin API settings
│   ├── api/
│   │   ├── auth/callback/route.ts   Auth + password reset callback
│   │   ├── chat/
│   │   │   ├── agent/route.ts       Authenticated agent streaming
│   │   │   └── prospect/route.ts    Unauthenticated demo chat
│   │   ├── stripe/webhook/route.ts  Stripe event handler
│   │   └── connectors/
│   │       ├── google/callback/     Google OAuth callback
│   │       ├── quickbooks/callback/ QuickBooks OAuth callback
│   │       └── sheets/test/         Google Sheets test endpoint
│   └── _components/
│       ├── Sidebar.tsx              Left navigation
│       ├── CreditMeter.tsx          Token usage bar
│       ├── WorkspaceSwitcher.tsx    Workspace dropdown
│       └── ProspectChat.tsx         Landing page demo chat
├── server/actions/
│   ├── auth.ts                      signOut
│   ├── onboarding.ts                saveOnboarding
│   ├── chat.ts                      sendChatMessage
│   ├── billing.ts                   createCheckoutSession
│   ├── dashboard.ts                 saveKPIs, loadKPIs
│   ├── settings.ts                  updateProfile
│   ├── connectors.ts                connect/disconnect OAuth
│   ├── workspaces.ts                createWorkspace, switchWorkspace
│   └── admin.ts                     adminChangeTier, adminGrantTokens
└── lib/
    ├── anthropic.ts                 Anthropic client singleton
    ├── credits.ts                   Token ledger, getRemainingTokens, recordUsage
    ├── stripe.ts                    Stripe client, PRICE_IDS, PlanId
    ├── workspace.ts                 getCurrentWorkspace
    ├── google-sheets.ts             OAuth, token refresh, data fetch
    ├── export.ts                    PDF/Word export helpers
    ├── prompts/index.ts             Persona definitions, buildSystemPrompt
    ├── auth/
    │   ├── require.ts               requireUser, requireWorkspaceOwner
    │   └── require-admin.ts         requireAdmin
    └── supabase/
        ├── browser.ts               Client-side Supabase
        ├── server.ts                Server-side RLS-respecting
        ├── admin.ts                 Service role writes
        └── middleware.ts            Edge session refresh
```

---

## Appendix D — PR & Contribution Rules

1. **One PR per small unit of work** — branch → PR → CI green → human review → merge
2. **CI must be green** — all 4 gates (`typecheck`, `lint`, `test`, `build`) must pass before merge
3. **Pre-Ship Checklist** — run `docs/PRESHIP_CHECKLIST.md` for any user-facing change
4. **Decision Log** — add a `D-XXX` entry to `docs/DECISION_LOG.md` for any non-obvious architectural choice
5. **No direct commits to `main`** — all changes via PR
6. **Migrations are append-only** — never DROP or ALTER existing columns without CEO sign-off
7. **Secrets never in code** — use `.env.local` for dev, Cloudflare Secrets for production
8. **Every write via admin client** — after a `require*()` guard (SOP §4.2); never trust `workspace_id` from client
