# Waystation Triage

A working prototype: AI inbox triage built against the same architectural pattern Waystation applies to procurement email. Email comes in → classified, structured, drafted, prioritized → human reviews exceptions.

Built to demonstrate, concretely, what "AI-native BizOps" looks like when applied to the workflows Ryan described owning today: pipeline reviews, customer check-ins, BDR coaching, contract workflows, recruiting screens.

---

## Why this exists

Ryan's job description called out two things specifically:

> "We expect you to be AI-native — not just using tools, but building automations before anyone asks."
> "Right now I'm personally running pipeline reviews, BDR coaching, customer check-ins, contract workflows, and recruiting screens. That's not the best use of my time."

This is one of those workflows. About 90 minutes a day of Ryan's time is currently spent triaging his inbox — deciding what needs his personal response, what to delegate, what to ignore. This prototype takes that time to under 15 minutes by:

1. **Ingesting** every email (Gmail API integration)
2. **Classifying** into 7 categories (sales, support, renewal/expansion, vendor pitch, recruiting, noise, edge case)
3. **Extracting** structured fields per category (e.g., for sales: company size, urgency signals, lead quality)
4. **Drafting** responses in Ryan's voice, or suggesting the right delegation target
5. **Prioritizing** — surfacing only what truly needs Ryan personally

The architectural pattern mirrors Waystation's own product: unstructured email → structured signal → action.

---

## What's in the box

```
backend/        Python + FastAPI. The AI pipeline + Supabase persistence + Gmail integration.
frontend/      Next.js dashboard. (Wired up; populated from the API.)
data/          30 hand-crafted synthetic emails + hand-labeled ground truth.
eval/          Eval framework — measures classification accuracy, priority calibration, action correctness.
docs/          Architecture notes.
```

The pipeline is built as four independent stages (`classifier.py`, `extractor.py`, `drafter.py`, `prioritizer.py`), each with its own prompt, schema, and tests. This means we can iterate on any one stage without breaking the others.

---

## Results on the synthetic dataset

Run `python eval/run_eval.py` to reproduce. Latest numbers:

| Metric | Score |
|---|---|
| Classification accuracy (30 emails, 7 categories) | _populated when eval runs_ |
| `needs_ryan` accuracy (the operationally critical flag) | _populated when eval runs_ |
| Priority score within expected range | _populated when eval runs_ |
| Suggested action exact match | _populated when eval runs_ |

**Where the system is currently weakest** (see `eval/eval_summary.md` for the latest run):
- Edge cases involving personal/professional ambiguity (former colleagues, dual-purpose emails)
- Distinguishing routine renewals from renewal-risk signals when the customer is polite about it
- Vendor pitches that are competently written and not obviously templated

These are the things I'd focus the next iteration on: more few-shot examples in the relevant prompts, and probably a second-pass review of low-confidence classifications.

---

## How to run it

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # then fill in keys
# Initialize Supabase
# Paste backend/schema.sql into the Supabase SQL editor and run
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local  # set NEXT_PUBLIC_API_URL
npm run dev
```

### Ingest emails + run pipeline

```bash
curl -X POST http://localhost:8000/ingest -H 'Content-Type: application/json' -d '{"mode": "fixture"}'
# or "mode": "live" once Gmail OAuth is set up
```

### Run eval

```bash
python eval/run_eval.py
# Outputs eval/results.json and eval/eval_summary.md
```

---

## Design decisions worth flagging

A few choices I made and would defend in conversation:

**1. Human-in-the-loop is the product, not a limitation.** The system drafts and routes; it does not auto-send. Ryan's voice on email matters, and the marginal time saved by auto-sending is small compared to the trust cost if it sends something wrong. The `needs_ryan` flag is biased toward false positives over false negatives.

**2. Four independent pipeline stages, not one monolithic prompt.** Each stage has its own prompt, schema, and eval target. This lets us debug, iterate, and improve any one stage in isolation. Monolithic LLM calls are faster to build and impossible to maintain.

**3. JSONB for extracted fields.** The structured fields that matter for a sales inquiry are different from a support ticket. Forcing a single rigid schema would either be too broad to be useful or too narrow to cover real cases. JSONB trades query convenience for iteration speed — and the trade is worth it at this stage.

**4. `human_feedback` table from day one.** This is how the system improves over time. Every classification, draft, and priority score can be reviewed and labeled. Over weeks, this becomes the dataset that drives prompt iteration (and, eventually, fine-tuning).

**5. Synthetic data, hand-labeled ground truth.** Could have used a real inbox but the synthetic dataset is more controlled and the labels are more defensible. Real data is the next step.

---

## What I'd build next

In rough priority order:

- **Live customer health scoring** — same pipeline pattern, applied to product usage + email sentiment + ticket volume → predictive churn signal before renewal conversations.
- **BDR coaching co-pilot** — every outbound email and call gets scored against a rubric automatically; BDR sees their week's coaching feedback Monday morning.
- **Pipeline review prep** — auto-generated 1-pager on every deal in the next pipeline review meeting (company background, deal stage history, last touch, recommended next action).
- **Contract diff system** — incoming contracts → extracted terms → diff vs. Waystation's standard → flagged deviations for legal review. Mirrors what Waystation does for customers, applied internally.

The pattern is the same in every case: unstructured input, structured signal, action queue, human-in-the-loop, eval framework. Once the muscle is built once, the next workflow is days of work, not weeks.

---

Built by Joanna Zhang for the Waystation BizOps interview. Questions, feedback, and disagreements welcome.
