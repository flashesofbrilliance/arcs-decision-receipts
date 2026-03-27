# Monomath Compiler — Running TODO

> A living task doc. Updated after every session.
> Branch: `claude/arcs-system-setup-c0ap7`
> Last updated: 2026-03-27

---

## PHASE 1 — Scaffold ✅

- [x] Scaffold Next.js 16 app (`monomath-compiler/`)
- [x] Install `@supabase/supabase-js`
- [x] `globals.css` — void black, hex grid, Plié/Élevé animations
- [x] `app/layout.tsx` — JetBrains Mono, dark root layout
- [x] `app/page.tsx` — renders `<DashboardLayout />`
- [x] `components/DashboardLayout.tsx` — 3-column bento grid (25/50/25), state machine
- [x] `components/SignalStream.tsx` — left panel, waterfall of raw signals
- [x] `components/DysonCore.tsx` — center panel, glassmorphism card, Plié/Élevé visual states
- [x] `components/PrismView.tsx` — renders 4 dimension cards (Strategy/Design/Copy/Code)
- [x] `components/ExecutiveFunction.tsx` — right panel, tags, sync status, metadata
- [x] `app/api/webhook/route.ts` — Drop Zone: Tally + n8n webhook receiver → Supabase insert
- [x] `app/api/signals/route.ts` — GET /api/signals (poll feed) + POST (annotate)
- [x] `lib/types.ts` — TypeScript types for all entities
- [x] `lib/supabase.ts` — Supabase client (browser + server)
- [x] `supabase/schema.sql` — tables: raw_signals, refracted_outputs, system_logs + pgvector
- [x] `n8n/workflow-blueprint.json` — full pipeline: Tally → classify → Claude refract → Supabase
- [x] `.env.example` — documented env vars

---

## PHASE 2 — Live Data + Real Refraction 🔲

- [ ] **Supabase project setup**: Create project at supabase.com, run `schema.sql`
- [ ] **Wire `.env.local`**: Fill in `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] **n8n import**: Import `n8n/workflow-blueprint.json`, set Anthropic + Supabase credentials
- [ ] **Tally form**: Create form with a single long-text "Brain dump" field, set webhook to n8n URL
- [ ] **End-to-end test**: Submit Tally form → verify signal appears in Signal Stream → click → PrismView renders
- [ ] **RLS policies**: Add Supabase Row Level Security policies for production (read-only anon access)
- [ ] **Vercel deploy**: `vercel --prod` from `monomath-compiler/`, set env vars in Vercel dashboard

---

## PHASE 3 — Phase Lock (Semantic Memory) 🔲

- [ ] **Embedding pipeline**: Add embedding step in n8n after Claude refraction (OpenAI `text-embedding-3-small` or Anthropic embeddings)
- [ ] **Similarity search UI**: Add "Related Signals" panel in `ExecutiveFunction` using `match_signals()` RPC
- [ ] **Lexicon drift detection**: Compare new signal embedding against user's past signals; flag if confidence < threshold (generic regression warning)
- [ ] **Timeline view**: Add `/timeline` page showing signal history as a scrollable vertical river
- [ ] **Search**: Full-text + vector hybrid search across all past signals

---

## PHASE 4 — Board of Advisors 🔲

- [ ] **Advisor routing**: Extend n8n Switch node to route `decision`-classified signals to a separate "Board of Advisors" workflow
- [ ] **Multi-persona refraction**: Run the same signal through 3–5 distinct advisor personas (e.g. Operator, Strategist, Devil's Advocate, User Advocate)
- [ ] **Advisor cards**: New React component `AdvisorPanel.tsx` rendering each advisor's take side-by-side
- [ ] **Confidence scoring**: Each advisor outputs a confidence % + one risk flag

---

## PHASE 5 — Zoom Orchestrator 🔲

- [ ] **Problem routing**: `problem`-classified signals route to Zoom Orchestrator workflow
- [ ] **Root cause tree**: Claude breaks problem into 3 levels (symptom → mechanism → root cause)
- [ ] **Action queue**: Generated list of next actions with priority scores, surfaced in `ExecutiveFunction`

---

## NOTES & DECISIONS

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-27 | Used Next.js 16 + Tailwind v4 | Scaffolded by create-next-app@latest; Tailwind v4 uses CSS-native theme config |
| 2026-03-27 | Simulation mode in Phase 1 | Real Claude refraction runs in n8n, not Next.js. UI shows mock output until n8n is wired. |
| 2026-03-27 | pgvector 1536 dims | Compatible with OpenAI text-embedding-3-small; easy to swap for 3072-dim or Anthropic embeddings |
| 2026-03-27 | RLS disabled by default | Service role key in n8n bypasses RLS. Enable + configure policies before public launch. |
