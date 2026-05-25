# Waystation Triage — Frontend

Next.js 16 dashboard for the triage pipeline. Renders one row per email from the
`triage_inbox` view exposed by `GET /inbox`, with category badges, priority
scores, the `needs_ryan` flag, extracted fields, drafted responses, and a
feedback panel that writes back to `POST /feedback/{email_id}`.

## Run it

```bash
cp .env.local.example .env.local       # set NEXT_PUBLIC_API_URL if you have a backend
npm install
npm run dev                            # http://localhost:3000
```

Without `NEXT_PUBLIC_API_URL`, the dashboard renders bundled sample data
(`src/lib/mock-data.ts`) so the UI is demoable standalone. The header shows a
"Demo data" pill when this is the case. With the env var set, the pill flips
to "Live API" and the page hits FastAPI.

## How the pieces line up

```
src/
  app/
    page.tsx                  server component, fetches inbox, mounts dashboard
    actions.ts                server actions: submitFeedback, refreshInbox
    layout.tsx, globals.css   shell
  components/
    triage-dashboard.tsx      top-level client component; holds selection + filter state
    inbox-list.tsx            left pane: scrollable list, category badge, priority pill
    email-detail.tsx          right pane: body, reasoning, extracted fields, draft, feedback
    filter-bar.tsx            needs-ryan + per-category toggles
    extracted-fields.tsx      renders JSONB fields with per-type formatting
    draft-card.tsx            suggested draft with copy-to-clipboard
    feedback-panel.tsx        ground-truth capture: classification/priority/quality
    category-badge.tsx, action-badge.tsx, priority-pill.tsx
    ui/                       minimal Tailwind primitives (Badge, Button)
  lib/
    api.ts                    backend fetch with mock-data fallback
    types.ts                  TS mirrors of backend/app/models.py
    format.ts                 category/action label maps, relative time, etc.
    utils.ts                  cn() helper
    mock-data.ts              10 hand-crafted triage rows for the standalone demo
```

## Design choices worth flagging

- **Mock-data fallback is intentional.** The dashboard should demo on a laptop
  with nothing else running. Without it, "look at the UI" requires standing up
  Supabase + a backend API key, which is the wrong friction for a portfolio
  review. With `NEXT_PUBLIC_API_URL` set, real data wins automatically.
- **Server actions, not a Next route handler.** Feedback writes go through
  `src/app/actions.ts` so the API URL lives only on the server. No
  `NEXT_PUBLIC_*` URL is required for production deploys talking to a private
  backend.
- **`needs_ryan` is the primary axis, not just a sort field.** Header pill,
  list filter, avatar tint, and detail-pane badge all surface it. That mirrors
  the backend's design decision to keep `needs_ryan` as a separate boolean
  from the priority score.
- **No live timestamps in SSR.** `formatRelativeTime` runs client-only to
  avoid hydration mismatch on the "Xm ago" labels.
