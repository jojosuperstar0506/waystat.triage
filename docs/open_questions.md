# Open questions — frontend v2

Things in `scope_update_v2.md` (and adjacent backend code) that I want a call
on before I commit a tradeoff. Numbered for easy reference.

---

## 1. `from_name` is inconsistent for internal items

Slack-channel internal items put the **display name** in the `from` field
(e.g. `"from": "Brandon Kim"`, no `from_name`), while `internal_email` items
use the same shape as external emails (`from: "lisa.park@waystationai.com"`,
`from_name: "Lisa Park"`). Once it lands in the DB, `from_address` will hold
"Brandon Kim" for those rows — not an email address.

The display logic in `inbox-list.tsx` and `email-detail.tsx` currently does
`from_name ?? from_address`, which still renders correctly. But the
`<email@x.com>` line in the detail header would show "<Brandon Kim>" for
Slack items, which is wrong.

**Proposed call:** detect Slack-channel items in the UI and suppress the
`<address>` line for them. Show `from_role` ("Eng Lead") next to the name
instead. **Confirm?**

---

## 2. Cross-source links (the email_018 ↔ internal_004 case)

The scope doc calls out connecting `internal_004` (Marcus's MountainPeak
escalation) to `email_018` (Lisa Huang's API access follow-up) as an
optional but high-value feature. There's no `linked_to` field in the
fixtures; the link is implicit in the body.

Three ways to surface it, in order of how much engineering I'd justify:

- **(a) Manual link map in the mock data.** Hardcode `linked_items: ["email_018"]`
  on `internal_004` in `mock-data.ts`. Fastest. Honest about it being a
  v2-demo feature, not a real ML signal. Surface in the detail panel as
  "Connected to: [Lisa Huang — Re: Re: Re: API access...]"
- **(b) Heuristic detection in the frontend.** Build a small matcher: look
  for company-name or person-name overlap between `extracted_fields` across
  items, and link items that share both. Works on real data too, but the
  fixtures don't all have `customer_company` extracted yet (and we'd be
  doing pipeline-style work in the UI).
- **(c) Backend extension.** Add a `related_items` field to the
  `triage_inbox` view, populated by a small linker. Right thing, but
  out of scope for tonight.

**Proposed call:** ship (a) for the demo. Pin a TODO that says "real
implementation goes in the backend linker". **Confirm?**

---

## 3. Sort order: needs_ryan pin vs. score-desc

Scope doc step 2: "Items sorted by priority_score descending, needs_ryan=true
pinned to top." The SQL view in `schema.sql:155` sorts only by
`priority_score DESC, received_at DESC` — needs_ryan is not pinned at the
DB level.

That's actually fine — pinning client-side keeps the SQL view simple and
lets the frontend control the ordering policy. But it means a 78-score
needs_ryan item will appear *above* a 96-score item that doesn't need Ryan.
For the Lisa Park renewal (96, needs_ryan=true) vs. Kavita Reddy
(78, needs_ryan=true) case, both are pinned — fine. But it does mean an
internal_fyi at score 12 with needs_ryan=true would jump above a 95 sales
inquiry without it.

**Proposed call:** pin needs_ryan=true within the same priority *band*
rather than absolutely. Concretely: sort by `(needs_ryan ? 1 : 0)` then
`priority_score desc`, which is the absolute pin scope describes. I think
that's actually what the scope wants — the doc says "the cross-source
comparison IS the product" and `needs_ryan` is a stronger signal than score.
Going with absolute pin unless you say otherwise.

---

## 4. Channel rendering for the `[#channel-name]` prefixes

Internal item subjects all start with bracketed channel tags:
`[#eng-decisions]`, `[DM]`, `[#sales]`, `[#finance]`, `[#eng]`. These are
real signal — they distinguish a public channel post from a DM.

Two options:
- **(a) Strip from subject, show as a separate channel-context chip.**
  Cleaner visual. Loses the literal `[#name]` rendering the scope doc
  mentions wanting to preserve.
- **(b) Leave inline.** Matches the doc's "preserve formatting cues"
  ask, but the subject line becomes visually busy.

**Proposed call:** (a) — extract the bracket prefix, render as a small
gray chip next to the channel icon ("Slack · #eng-decisions"). The
literal `[#xxx]` still shows up in the email body display. **Confirm?**

---

## 5. Suggested time investment in the summary header

Scope doc step 5 wants "estimated 45 min" in the queue summary. Nothing in
the backend produces a time estimate — there's no `estimated_minutes`
field on any model.

Three options:
- **(a) Derive heuristically in the UI.** Sum a small per-suggested-action
  estimate (e.g. `personal_response_from_ryan: 5min`, `auto_archive: 0min`,
  `delegate_*: 1min` for the routing decision). Easy. Honest if I label
  it as an estimate.
- **(b) Drop it from the summary.** Show counts only.
- **(c) Add it to the backend.** Right thing; out of scope tonight.

**Proposed call:** (a). Surface it as "Est. ~45 min" with a tooltip
explaining the heuristic. **Confirm?**

---

## 6. "Today" filter

Scope doc §"What's still open" asks whether to add a "today" filter. All
fixtures are dated 2026-05-25, so the filter is invisible on the demo.

**Proposed call:** skip for now. Add a TODO. The summary header already
implies "today" (single-day fixture). **Confirm?**

---

## 7. Empty state for `needs_ryan=true` filter

Scope doc §"What's still open" lists this. Two options:
- **(a) "All clear" celebratory state.** Doc warns against gradients and
  "cute illustrations". A clean checkmark + one-liner is the right read.
- **(b) Auto-fallback to "showing everything".**

**Proposed call:** (a) — small "Nothing needs you right now." text in a
neutral card, no illustration, no animation. The user can clear the
filter manually. **Confirm?**

---

## 8. Where does `internal_fyi` live visually?

It's category 14, light blue / low priority. The scope doc says it
"should fade visually." Options for how:
- **(a) Reduced opacity on the whole card** (opacity-60). Quickest read.
- **(b) Same as everything else but no avatar tint, lighter text color.**
  Preserves accessibility better.

**Proposed call:** (b). `opacity-60` makes things look broken to a CEO
who'll spend 30 seconds. Confirm?

---

## Things I'm NOT asking about (going with my read of the scope)

- **Tailwind v4, no shadcn dep.** Already built that way. The scope says
  "Tailwind + shadcn/ui as agreed" but we agreed to skip the shadcn CLI
  earlier this session — the existing primitives in `components/ui/` follow
  the shadcn idiom but without the dep. Flagging in case you want to
  reverse that.
- **Mobile responsiveness.** Scope says nice-to-have, not required. I'll
  keep the existing md: breakpoint but won't actively build for mobile.
- **The cross-source comparison being the default view.** Default = all,
  segregation only via explicit filter. Building that.
