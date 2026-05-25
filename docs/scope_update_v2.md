# Scope Update — Cross-Source Triage

**Status**: Backend already updated to reflect this scope. Frontend still in progress.
**Last updated**: 2026-05-25

---

## What changed and why

The original prototype handled external email only — customer inquiries, prospect demos, support tickets, vendor pitches, recruiting, noise. That was the right place to start, but it misses what makes BizOps prioritization actually hard.

BizOps doesn't get hard when only customers are emailing. It gets hard when a customer outage, a board pre-meeting question, an engineer blocked on a build-vs-buy call, and a direct report asking for a career conversation all land in the same hour. The skill being tested — for both this prototype and (eventually) the candidate exercise this becomes — is **cross-source prioritization judgment**: do you correctly weigh internal asks against external asks when both are competing for the CEO's time today?

So the system now ingests both:

- **External items** (30): inbound email to the CEO — customers, prospects, vendors, recruiters, noise. Unchanged from before.
- **Internal items** (15): Slack DMs, internal email threads, team escalations. New.

Each item carries a `source` field (`"external"` | `"internal"`) and a category from an expanded 14-category set (7 external + 7 internal). The priority scorer is now cross-source aware: an internal item that blocks 6 engineers can outrank a single sales inquiry.

## What you need to know to keep building

### 1. The new categories

**External** (unchanged): `sales_inquiry`, `customer_support`, `renewal_expansion`, `vendor_pitch`, `recruiting`, `noise`, `edge_case`

**Internal** (new):
- `eng_decision` — build-vs-buy, architecture, vendor selection
- `internal_escalation` — pricing exceptions, customer escalations needing CEO call
- `direct_report_request` — 1:1 requests, feedback asks, career conversations
- `board_communication` — board/investor substantive asks
- `finance_decision` — runway, fundraise, capital allocation
- `hr_decision` — offer signoffs, terminations, role changes
- `internal_fyi` — updates with no decision required

### 2. The new data layout

```
data/
├── synthetic_emails.json              # 30 external items (existing)
├── synthetic_internal_items.json      # 15 internal items (new)
├── ground_truth_labels.json           # labels for external (existing)
└── ground_truth_labels_internal.json  # labels for internal (new)
```

Internal items have these extra fields:
- `source: "internal"`
- `channel: "slack" | "internal_email"` (medium it came in on)
- `from_role`: sender's role at Waystation (used for UI badges)

### 3. The backend changes (already done)

- `backend/app/models.py` — added `ItemSource` type, expanded `EmailCategory`, added `source` to `ClassificationResult`
- `backend/app/pipeline/classifier.py` — system prompt rewritten to handle both sources and 14 categories
- `backend/app/pipeline/extractor.py` — added extraction guides for all 7 internal categories
- `backend/app/pipeline/prioritizer.py` — system prompt rewritten for cross-source scoring with explicit guidance on when internal outranks external (and vice versa)
- `backend/schema.sql` — `emails` table has `source`, `channel`, `from_role`; `classifications` table has `source`
- `backend/app/db.py` — `upsert_email` and `write_triage_result` persist the new fields
- `backend/app/gmail_client.py` — `fetch_emails_fixture` now merges both fixture files
- `eval/run_eval.py` — reports per-source metrics in addition to overall

### 4. The frontend changes (your work)

The dashboard must handle both sources cleanly. The user (a hypothetical CEO) needs to be able to:

**Quickly distinguish source.** Each item card needs a visual marker — an icon, a left-border color, a badge — so the user can scan their queue and see "5 internal, 3 external need my attention." Internal items should also show the channel (Slack vs. email) and the sender's role.

**Sort by priority across sources.** Default view: all items sorted by `priority_score` descending, with `needs_ryan=true` items pinned to the top. Do NOT segregate internal and external by default — the whole point is cross-source comparison. The user should be able to *filter* to one source if they want, but the default is mixed.

**See cross-source analytics.** The dashboard should show, somewhere visible, a small summary: "Today's queue: X external, Y internal. Z need your attention. Suggested time investment: ~N minutes." This is the BizOps win — surfacing the time-allocation picture.

**Render category badges appropriately.** Internal categories should use different colors than external (suggested: blue family for internal, warm-tone family for external) so visual distinction is immediate. `internal_escalation` and `internal_fyi` are very different items — different urgency colors.

**Show channel context for internal items.** A Slack DM looks different from an internal email — display the channel icon. The body text in the detail view should preserve formatting cues (the existing fixtures have `[#eng-decisions]` etc. — preserve those visually).

### 5. Updated category list — UI implications

| Category | Color suggestion | Notes |
|---|---|---|
| `sales_inquiry` | green | high-intent prospects |
| `customer_support` | orange | active customers |
| `renewal_expansion` | red if churn risk, green if expansion | depends on extracted signal_type |
| `vendor_pitch` | grey | usually deprioritized |
| `recruiting` | purple | candidates |
| `noise` | light grey | usually hidden |
| `edge_case` | yellow | ambiguous |
| `eng_decision` | blue | technical fork |
| `internal_escalation` | red | someone is blocked |
| `direct_report_request` | teal | relationship-based |
| `board_communication` | indigo | governance |
| `finance_decision` | dark green | capital |
| `hr_decision` | purple | personnel |
| `internal_fyi` | light blue | informational, low priority |

These are suggestions, not requirements — your design judgment wins where it conflicts.

### 6. API endpoints — what to consume

The FastAPI server (`backend/app/main.py`) exposes:

- `POST /ingest` — runs the pipeline; pass `{"mode": "fixture"}` for now
- `GET /inbox?limit=100` — returns the full triaged queue from the `triage_inbox` view
- `GET /inbox/{email_id}` — full detail on one item
- `POST /feedback/{email_id}` — record human review (use for the "was this triage correct?" UI)

Every row from `/inbox` now includes the new fields: `source`, `channel`, `from_role`. Use them.

## What's still open

A few things I haven't fully nailed down, that you should make calls on (or surface for review):

1. **Should internal `from_address` parsing handle `@waystationai.com` automatically?** Right now the pipeline trusts the `source` field in the fixture. For live Gmail, we'd want to detect internal emails by domain. Probably a small helper in `gmail_client.py` — flag if you build it.

2. **Should the dashboard have a "today" filter vs. show everything?** The fixtures all have May 25 timestamps. In real use, the queue would accumulate over days. Worth a date filter.

3. **Channel badges for internal items.** Slack vs. internal email is real signal — a Slack DM is more casual, an internal email is more formal. Reflect this in the UI somehow.

4. **Empty state when nothing needs Ryan.** When the system filters to `needs_ryan=true` and there's nothing, what does the dashboard say? "All clear" with a small celebration is one option; "Here's the rest of the queue" is another.

## How to verify the changes are working

Once you've pulled latest:

```bash
# Run the smoke test — should now include internal items
cd backend && python ../eval/smoke_test.py  # may need a small update to include internal examples
```

```bash
# Run the full eval — should report source accuracy too
python eval/run_eval.py
# Check eval/eval_summary.md for the per-source breakdown
```

Look for: source accuracy >95% (this is an easy call for the model), classification accuracy similar to before on external categories, and reasonable accuracy (maybe 75-85% to start) on internal categories since they're new.

---

If anything in here is unclear or you hit a real blocker, leave a comment in `docs/open_questions.md` (create it if it doesn't exist) and I'll address it on my next pass.
