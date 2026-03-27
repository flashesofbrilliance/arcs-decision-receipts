-- ═══════════════════════════════════════════════════════════════
-- MONOMATH COMPILER — Supabase Schema
-- The Gravity Well / Collective Unconscious
--
-- Run this in the Supabase SQL Editor (or `supabase db push`).
-- Requires pgvector extension for semantic similarity search.
-- ═══════════════════════════════════════════════════════════════

-- ── Enable pgvector for embedding storage + similarity search ──
create extension if not exists vector;

-- ──────────────────────────────────────────────────────────────
-- TABLE: raw_signals
-- Every brain-dump coming in via Tally → n8n → /api/webhook
-- ──────────────────────────────────────────────────────────────
create table if not exists raw_signals (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  raw_text    text not null,
  source      text not null default 'tally'
                check (source in ('tally', 'manual', 'api')),
  metadata    jsonb,
  -- 1536-dim vector: OpenAI text-embedding-3-small compatible
  -- 3072-dim for text-embedding-3-large, 1024 for Claude embeddings
  embedding   vector(1536)
);

-- Index for fast similarity search (cosine distance)
create index if not exists raw_signals_embedding_idx
  on raw_signals using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Index for chronological feed
create index if not exists raw_signals_created_at_idx
  on raw_signals (created_at desc);

-- ──────────────────────────────────────────────────────────────
-- TABLE: refracted_outputs
-- Structured output from Claude API (via n8n): the 4 dimensions
-- ──────────────────────────────────────────────────────────────
create table if not exists refracted_outputs (
  id          uuid primary key default gen_random_uuid(),
  signal_id   uuid not null references raw_signals (id) on delete cascade,
  created_at  timestamptz not null default now(),

  -- The four refraction dimensions
  strategy    text,
  design      text,
  copy        text,
  code        text,

  -- Full raw JSON from n8n / Claude response (for auditing / replay)
  full_output jsonb,

  -- Embedding of the combined output for cross-signal retrieval
  embedding   vector(1536)
);

create index if not exists refracted_outputs_signal_id_idx
  on refracted_outputs (signal_id);

create index if not exists refracted_outputs_embedding_idx
  on refracted_outputs using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- ──────────────────────────────────────────────────────────────
-- TABLE: system_logs
-- Audit trail: signal received, compiled, annotated, synced, errors
-- ──────────────────────────────────────────────────────────────
create table if not exists system_logs (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  event_type  text not null,
  -- e.g. signal_received | signal_compiled | signal_annotated | error
  payload     jsonb,
  status      text not null default 'ok'
                check (status in ('ok', 'error', 'pending'))
);

create index if not exists system_logs_event_type_idx
  on system_logs (event_type);

create index if not exists system_logs_created_at_idx
  on system_logs (created_at desc);

-- ──────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- Disable for local dev; enable and configure policies in production.
-- ──────────────────────────────────────────────────────────────
alter table raw_signals      enable row level security;
alter table refracted_outputs enable row level security;
alter table system_logs       enable row level security;

-- Service-role key (used by n8n and server routes) bypasses RLS by default.
-- For anon/public reads, add policies as needed, e.g.:
-- create policy "anon read raw_signals"
--   on raw_signals for select using (true);

-- ──────────────────────────────────────────────────────────────
-- HELPER: semantic similarity search function
-- Usage: select * from match_signals('{"...vector..."}', 0.75, 10);
-- ──────────────────────────────────────────────────────────────
create or replace function match_signals (
  query_embedding vector(1536),
  match_threshold float default 0.75,
  match_count     int   default 10
)
returns table (
  id          uuid,
  raw_text    text,
  created_at  timestamptz,
  similarity  float
)
language sql stable
as $$
  select
    raw_signals.id,
    raw_signals.raw_text,
    raw_signals.created_at,
    1 - (raw_signals.embedding <=> query_embedding) as similarity
  from raw_signals
  where raw_signals.embedding is not null
    and 1 - (raw_signals.embedding <=> query_embedding) > match_threshold
  order by raw_signals.embedding <=> query_embedding
  limit match_count;
$$;
