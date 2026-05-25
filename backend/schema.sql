-- Waystation Triage System — Database Schema
-- Run this in the Supabase SQL Editor to create the full schema.
--
-- Design notes for reviewers:
--  • Each pipeline stage gets its own table, joined by email_id. This lets us
--    re-run any stage independently (e.g. tweak the classifier prompt and only
--    re-classify, without losing extractions or drafts).
--  • All pipeline outputs include a `model_version` and timestamp so we can
--    diff results when prompts change — a basic eval/experimentation primitive.
--  • The `human_feedback` table is the ground-truth layer. Every triage decision
--    is reviewable. Over time this becomes the labeled dataset that drives
--    prompt iteration and (eventually) fine-tuning.
--  • JSONB for extracted fields because the schema varies by category — a sales
--    inquiry has different relevant fields than a support ticket. Keeping this
--    flexible at the DB layer trades some query convenience for a much faster
--    iteration loop on what we extract.

-- Drop existing tables (idempotent setup for demo resets)
drop table if exists human_feedback cascade;
drop table if exists priority_scores cascade;
drop table if exists drafted_responses cascade;
drop table if exists extractions cascade;
drop table if exists classifications cascade;
drop table if exists emails cascade;

-- Raw emails / queue items as ingested from Gmail or internal sources
create table emails (
    id uuid primary key default gen_random_uuid(),
    gmail_message_id text unique not null,
    thread_id text,
    source text not null default 'external' check (source in ('external', 'internal')),
    channel text,  -- for internal: 'slack', 'internal_email', etc.
    from_address text not null,
    from_name text,
    from_role text,  -- only populated for internal items
    to_address text not null,
    subject text,
    body text,
    received_at timestamptz not null,
    ingested_at timestamptz not null default now()
);

create index emails_received_at_idx on emails (received_at desc);
create index emails_from_address_idx on emails (from_address);
create index emails_source_idx on emails (source);

-- Classification: what kind of item is this?
create table classifications (
    id uuid primary key default gen_random_uuid(),
    email_id uuid not null references emails(id) on delete cascade,
    source text not null check (source in ('external', 'internal')),
    category text not null,
    confidence numeric(3,2) check (confidence between 0 and 1),
    reasoning text,
    model_version text not null,
    classified_at timestamptz not null default now()
);

create index classifications_email_id_idx on classifications (email_id);
create index classifications_category_idx on classifications (category);
create index classifications_source_idx on classifications (source);

-- Extraction: structured fields pulled from the email body.
-- Schema varies by category, so we use JSONB.
-- Example shapes documented in extractor.py.
create table extractions (
    id uuid primary key default gen_random_uuid(),
    email_id uuid not null references emails(id) on delete cascade,
    fields jsonb not null default '{}'::jsonb,
    model_version text not null,
    extracted_at timestamptz not null default now()
);

create index extractions_email_id_idx on extractions (email_id);
create index extractions_fields_gin_idx on extractions using gin (fields);

-- Drafted responses + suggested next actions
create table drafted_responses (
    id uuid primary key default gen_random_uuid(),
    email_id uuid not null references emails(id) on delete cascade,
    draft_body text,
    suggested_action text not null,
    -- e.g. "reply_now", "route_to_cs", "schedule_meeting", "ignore",
    -- "personal_response_from_ryan", "delegate_to_bdr"
    action_reasoning text,
    confidence numeric(3,2) check (confidence between 0 and 1),
    model_version text not null,
    drafted_at timestamptz not null default now()
);

create index drafted_responses_email_id_idx on drafted_responses (email_id);

-- Priority scoring: how urgent + how much does Ryan need to touch this?
create table priority_scores (
    id uuid primary key default gen_random_uuid(),
    email_id uuid not null references emails(id) on delete cascade,
    score int check (score between 0 and 100),
    needs_ryan boolean not null default false,
    reasoning text,
    model_version text not null,
    scored_at timestamptz not null default now()
);

create index priority_scores_email_id_idx on priority_scores (email_id);
create index priority_scores_needs_ryan_idx on priority_scores (needs_ryan) where needs_ryan = true;

-- Human feedback: the ground-truth / eval layer.
-- This is how the system improves over time.
create table human_feedback (
    id uuid primary key default gen_random_uuid(),
    email_id uuid not null references emails(id) on delete cascade,
    correct_category text,        -- null if classification was right
    classification_correct boolean,
    response_quality int check (response_quality between 1 and 5),
    priority_correct boolean,
    notes text,
    reviewed_at timestamptz not null default now(),
    reviewed_by text
);

create index human_feedback_email_id_idx on human_feedback (email_id);

-- Convenience view: the full triage record for one item
create or replace view triage_inbox as
select
    e.id as email_id,
    e.gmail_message_id,
    e.source,
    e.channel,
    e.from_address,
    e.from_name,
    e.from_role,
    e.subject,
    e.body,
    e.received_at,
    c.category,
    c.confidence as classification_confidence,
    c.reasoning as classification_reasoning,
    x.fields as extracted_fields,
    d.draft_body,
    d.suggested_action,
    d.action_reasoning,
    p.score as priority_score,
    p.needs_ryan,
    p.reasoning as priority_reasoning,
    hf.classification_correct,
    hf.response_quality,
    hf.priority_correct
from emails e
left join classifications c on c.email_id = e.id
left join extractions x on x.email_id = e.id
left join drafted_responses d on d.email_id = e.id
left join priority_scores p on p.email_id = e.id
left join human_feedback hf on hf.email_id = e.id
order by p.score desc nulls last, e.received_at desc;
