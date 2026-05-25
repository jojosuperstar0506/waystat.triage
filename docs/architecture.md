# Architecture

How the pieces fit together, and why each piece is shaped the way it is.

## The flow

```
Gmail inbox
     │
     ▼
[gmail_client.py]  ── fetches emails (live or fixture)
     │
     ▼
[db.upsert_email]  ── raw email persisted to Supabase
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│  TRIAGE PIPELINE (app/triage.py)                        │
│                                                          │
│   classifier.py   →  category + confidence + reasoning  │
│        │                                                 │
│        ▼                                                 │
│   extractor.py    →  structured fields (JSONB)          │
│        │                                                 │
│        ▼                                                 │
│   drafter.py      →  draft body + suggested action      │
│        │                                                 │
│        ▼                                                 │
│   prioritizer.py  →  score + needs_ryan + reasoning     │
└─────────────────────────────────────────────────────────┘
     │
     ▼
[db.write_triage_result]  ── one row per stage, joined by email_id
     │
     ▼
[triage_inbox view]  ── unified read model
     │
     ▼
Next.js dashboard  ── what Ryan sees
```

## Why the pipeline has four stages, not one

The naïve version is one big prompt: "here's an email, return JSON with classification, extraction, draft, and priority." It's faster to build. It's worse in every way that matters once you're trying to improve the system.

Independent stages give us:

- **Independent eval.** We can measure classifier accuracy without coupling it to drafting quality. When a draft is bad, we know whether it's because the classifier was wrong upstream or the drafter prompt needs work.
- **Independent iteration.** Tweaking the prioritizer prompt doesn't risk breaking classification. We can A/B test stages.
- **Better prompts.** Each stage's prompt can focus on one job and include examples specific to that job. Monolithic prompts get bloated and the model's attention degrades.
- **Selective re-runs.** Customer feedback that a classification was wrong → re-run classifier on that email, skip the rest if the new classification matches. Cheaper iteration loop.

The cost is more LLM calls per email (4 vs 1). At ~30 emails/day this is negligible; if we ever needed to scale, we could batch or cache.

## Why the data model splits each stage into its own table

Same reasoning as above, applied at the storage layer:

- We can re-run any stage and write a new row without touching the others.
- We can query "all emails where classification confidence was below 0.7 in the last week" without parsing JSON blobs.
- Each row has its own `model_version` and timestamp, so we can compare model versions cleanly (e.g., "did the v2 prompt improve action accuracy on support tickets?").
- The `human_feedback` table is symmetric — one row per email, linked by `email_id`. Building the labeled dataset is just inserting rows.

## Why JSONB for extracted fields

The fields that matter for a sales inquiry (company size, urgency signals, referral source) are different from a support ticket (issue type, severity, deadline). Forcing a single rigid schema means either:

- Schema is broad (every possible field as nullable column) → unwieldy, expensive joins, most columns null
- Schema is narrow → too lossy to be useful

JSONB lets each category have its own shape, indexed by GIN for the queries we actually run. The tradeoff: less compile-time safety on the field names. Mitigated by documenting the expected shapes per category in `pipeline/extractor.py` and validating in the Pydantic model.

## Why `needs_ryan` is a separate boolean instead of just a priority threshold

A priority score and a "needs Ryan personally" decision are different judgments. Some things are high priority but delegable (production outage → engineering). Some things are medium priority but only Ryan can handle (former colleague reaching out about a startup pitch). Collapsing them loses signal.

The dashboard surfaces `needs_ryan=true` items first; everything else is sorted by score within that group.

## Why we don't auto-send anything

Two reasons. First, the cost of a wrong send (sent to a customer in Ryan's voice, in a tone Ryan wouldn't have used, on a topic with stakes) is much higher than the cost of Ryan clicking "approve" on a good draft. The asymmetry favors human-in-the-loop.

Second, trust is the constraint. The system has to earn its way to more autonomy. Right now it drafts and routes. Once Ryan has clicked "approve" on 500 drafts and recorded feedback, we can identify which categories the system handles well enough to auto-send (probably auto-archive of pure noise first, then routine support acknowledgments, then never the personal stuff).

## Why fixture mode exists alongside live Gmail

Two reasons:

- **Demo reliability.** When showing this to someone, the demo inbox needs to have interesting emails in it. Fixture mode guarantees that.
- **Eval reproducibility.** The synthetic dataset is hand-labeled. Running eval against live mail would mean re-labeling every time, which kills the iteration loop.

The Gmail OAuth and ingestion code is fully real — it just reads from a fixture for the demo. Switching to live is a single parameter.

## What I'd change if I had another day

- Add embeddings to detect near-duplicate emails (e.g., five vendor pitches with the same template = one item, not five).
- Add a "thread context" stage that pulls in the rest of the email thread before classifying — current pipeline classifies each message in isolation, which can miss context.
- Add a feedback loop where the eval results actually update prompts (low-hanging fruit: surface confusion-matrix cells with > 1 miss as candidates for new few-shot examples).
- Move the prompt strings to versioned files outside the Python code so prompt changes don't require code deploys.
