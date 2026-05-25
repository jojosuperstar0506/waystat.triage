import type { TriagedEmail } from "./types";

// Realistic mock triage results derived from data/synthetic_emails.json.
// Used when NEXT_PUBLIC_API_URL is not configured so the dashboard demos
// without a running backend. Real pipeline output will replace this once
// the API is wired up.

export const MOCK_INBOX: TriagedEmail[] = [
  {
    email_id: "mock-001",
    gmail_message_id: "email_005",
    from_address: "j.alvarez@brightline.co",
    from_name: "Jennifer Alvarez",
    subject: "Re: Waystation onboarding — issue with COA extraction",
    body:
      "Ryan,\n\nFollowing up from our Slack thread yesterday. The COA extraction is still misreading the lot numbers on our Cargill canola oil shipments. Specifically:\n\n- Lot 4471-G-2025 is being captured as \"4471-6-2025\"\n- The expiration date column is sometimes pulling the manufacture date instead\n\nThis is a problem because our QA team is now flagging it as a data integrity issue and threatening to revert to the manual process. We have a SQF audit in 6 weeks and I really don't want to be debugging this then.\n\nCan someone on your end take a look? Happy to share more sample COAs if helpful.\n\nThanks,\nJen",
    received_at: "2026-05-25T11:30:00-07:00",
    category: "customer_support",
    classification_confidence: 0.96,
    classification_reasoning:
      "Existing customer reporting a concrete, reproducible bug in COA extraction with a stated deadline (SQF audit in 6 weeks) and a churn risk (QA threatening to revert).",
    extracted_fields: {
      customer_company: "Brightline Bakery",
      issue_type: "data_extraction_error",
      affected_feature: "COA lot/expiration parsing",
      severity: "high",
      deadline_mentioned: "SQF audit in ~6 weeks",
      has_attachments_referenced: true,
    },
    draft_body:
      "Jen — thanks for the detailed repro. Loop'ing in Priya from engineering now; she'll look at the OCR confusion on the G/6 character and the column mapping for expiration vs. manufacture date.\n\nCan you forward 3–4 representative COAs (including one that mis-parsed) to support@waystation.ai? We'll have a fix in staging this week and confirmed in your account before the SQF audit window.\n\nNot going to let this be the thing that pushes you back to manual.\n\nRyan",
    suggested_action: "personal_response_from_ryan",
    action_reasoning:
      "Existing customer + churn signal + named QA threat means Ryan should respond personally even though the underlying fix is delegated to engineering.",
    priority_score: 94,
    needs_ryan: true,
    priority_reasoning:
      "High-revenue existing customer with a stated churn trigger and a hard external deadline. Personal Ryan touch materially lowers churn risk here.",
    classification_correct: null,
    response_quality: null,
    priority_correct: null,
  },
  {
    email_id: "mock-002",
    gmail_message_id: "email_001",
    from_address: "sarah.chen@verdantfoods.com",
    from_name: "Sarah Chen",
    subject: "Procurement automation — Verdant Foods",
    body:
      "Hi Ryan,\n\nFound you via Eric Andersen at TSG (he speaks highly). I'm Director of Procurement at Verdant Foods — we're a $180M plant-based brand, mostly retail through Whole Foods, Sprouts, and a growing Costco footprint.\n\nWe're drowning in supplier emails. Three buyers, ~140 active SKUs across ingredients and packaging, and our quote tracking lives in three different spreadsheets and one buyer's head. We've looked at SAP Ariba and Coupa and neither is built for our scale or our workflow.\n\nA few of our peers mentioned Waystation. Would love a 30-min intro to see if there's a fit. I'm also bringing our Head of R&D into the conversation because COA tracking is its own nightmare.\n\nNext two weeks are open on my end — let me know what works.\n\nSarah",
    received_at: "2026-05-25T08:14:00-07:00",
    category: "sales_inquiry",
    classification_confidence: 0.97,
    classification_reasoning:
      "Inbound from a qualified decision-maker (Director of Procurement) at a target-size company with a warm referral, explicit pain, and a stated competitive evaluation context.",
    extracted_fields: {
      company_name: "Verdant Foods",
      company_size_estimate: "$180M revenue, plant-based CPG",
      sender_role: "Director of Procurement",
      stated_need: "Supplier email triage + quote tracking across 140 SKUs",
      urgency_signals: ["currently drowning in supplier email", "wants to move in next two weeks"],
      mentioned_competitors: ["SAP Ariba", "Coupa"],
      referral_source: "Eric Andersen, TSG",
    },
    draft_body:
      "Sarah — thanks for reaching out, and please tell Eric he gets the credit.\n\nVerdant is exactly the shape of company Waystation is built for. The pattern you described — quote tracking spread across spreadsheets and one buyer's head — is the workflow we replace on day one, and the Costco-velocity stuff is where the ROI math gets interesting.\n\nI'd love 30 minutes. Looking at next week, Tuesday 5/26 at 11am PT or Wednesday 5/27 at 2pm PT both work. Happy to include your Head of R&D — COA tracking is one of the two demos I'll bring.\n\nRyan",
    suggested_action: "draft_for_ryan_review",
    action_reasoning:
      "Qualified inbound at target ICP via warm referral. Worth Ryan's personal touch on the reply, but the draft is good enough that he can send with minor edits.",
    priority_score: 92,
    needs_ryan: true,
    priority_reasoning:
      "Top-of-funnel deal at target size with a warm referral source. Quick personal response here has outsized expected pipeline value.",
    classification_correct: null,
    response_quality: null,
    priority_correct: null,
  },
  {
    email_id: "mock-003",
    gmail_message_id: "email_003",
    from_address: "patricia.holloway@kindersnack.com",
    from_name: "Patricia Holloway",
    subject: "RFP — Procurement platform evaluation, KinderSnack Brands",
    body:
      "Mr. Caldbeck,\n\nKinderSnack Brands is conducting a formal evaluation of procurement and supplier management platforms. Following internal discussions and a recommendation from our Board, Waystation AI has been included on our shortlist.\n\nAttached please find our RFP document. Key items requiring response:\n\n1. Pricing for 50-seat deployment, multi-entity (we operate 4 brands)\n2. SOC 2 Type II and any other relevant compliance certifications\n3. Integration capabilities with NetSuite and SAP S/4HANA\n4. Reference customers in the $200M-$1B revenue range\n5. Implementation timeline and professional services scope\n\nResponses due by June 15. Please confirm receipt and indicate intent to respond.\n\nBest regards,\nPatricia Holloway\nVP Strategic Sourcing | KinderSnack Brands",
    received_at: "2026-05-24T16:23:00-07:00",
    category: "sales_inquiry",
    classification_confidence: 0.93,
    classification_reasoning:
      "Formal RFP from a multi-brand CPG company in the upper end of our ICP. Procurement-led evaluation with a hard deadline.",
    extracted_fields: {
      company_name: "KinderSnack Brands",
      company_size_estimate: "Multi-brand CPG, 4 operating brands, mid-market",
      sender_role: "VP Strategic Sourcing",
      stated_need: "50-seat multi-entity procurement platform; NetSuite + SAP S/4HANA integration",
      urgency_signals: ["RFP response due June 15"],
      mentioned_competitors: [],
      referral_source: "Board recommendation",
    },
    draft_body:
      "Patricia — thanks for including Waystation in the evaluation. Confirming receipt and our intent to respond.\n\nA full RFP response is in motion on our side. Before we send formal responses, would it be possible to schedule a 30-minute working session this week with you (and whoever owns the NetSuite + S/4HANA integration questions on your end)? RFPs answered cold typically miss the most important context, and I'd rather invest the time upfront.\n\nI'll have our completed response to you by Wednesday 6/10, leaving five days for any follow-up questions before your 6/15 deadline.\n\nRyan Caldbeck\nCEO, Waystation AI",
    suggested_action: "draft_for_ryan_review",
    action_reasoning:
      "Formal RFP from an ICP-fit account. Acknowledgment + scope-clarifying meeting request before formal response is the right play, and the draft proposes both.",
    priority_score: 88,
    needs_ryan: true,
    priority_reasoning:
      "Multi-brand CPG with active procurement evaluation and a hard deadline. CEO acknowledgment matters; cold RFP responses underperform.",
    classification_correct: null,
    response_quality: null,
    priority_correct: null,
  },
  {
    email_id: "mock-004",
    gmail_message_id: "email_007",
    from_address: "lisa@harvestlane.com",
    from_name: "Lisa Park",
    subject: "Heads up — considering a pause on the renewal",
    body:
      "Ryan,\n\nWanted to flag this directly rather than have it come from procurement. We're up for renewal in August and the leadership team has been talking about whether we want to continue.\n\nTo be clear, the product works. Our buyers use it. The issue is that we're going through a broader cost review and every SaaS contract is being scrutinized. I'm pushing for us to renew but I need a stronger ROI story than 'people like using it.'\n\nCould we set up time to talk through usage data and any case studies that might help? Specifically anything you have on quote cycle time reduction would help — that's the metric our CFO cares about.\n\nNo immediate panic, but I wanted to give you a real heads up.\n\nLisa\nVP Operations | HarvestLane Foods",
    received_at: "2026-05-23T14:11:00-07:00",
    category: "renewal_expansion",
    classification_confidence: 0.95,
    classification_reasoning:
      "Existing customer signaling renewal risk politely but unmistakably. Frame is positive on product but raises a concrete ROI ask tied to a CFO-led review.",
    extracted_fields: {
      customer_company: "HarvestLane Foods",
      signal_type: "renewal_risk",
      seat_change: null,
      contract_value_impact_estimate: "Full renewal at risk if ROI story is weak",
      key_quotes: [
        "considering a pause on the renewal",
        "going through a broader cost review",
        "I'm pushing for us to renew but I need a stronger ROI story",
      ],
    },
    draft_body:
      "Lisa — thank you for getting in front of this directly. Appreciate it.\n\nLet's get time on the calendar this week. I'll bring quote cycle time before/after data from your account specifically, plus two CFO-facing case studies (one mid-market CPG with a similar cost-review trigger). I'll also pull seat-level engagement data — useful both for the ROI story and for spotting any users who'd benefit from a quick refresh.\n\nThursday 5/28 at 10am PT or Friday 5/29 at 1pm PT — does either work?\n\nRyan",
    suggested_action: "personal_response_from_ryan",
    action_reasoning:
      "Renewal-risk signal from VP-level champion. Ryan needs to personally own this — the trust signal of CEO engagement is exactly what tips the CFO conversation.",
    priority_score: 96,
    needs_ryan: true,
    priority_reasoning:
      "Highest-leverage email in the inbox: a champion-flagged renewal risk where a 30-min Ryan touch can swing the entire ACV.",
    classification_correct: null,
    response_quality: null,
    priority_correct: null,
  },
  {
    email_id: "mock-005",
    gmail_message_id: "email_002",
    from_address: "marcus@craftbevco.com",
    from_name: "Marcus Wright",
    subject: "quick q on pricing",
    body:
      "hey saw your post on linkedin about the procurement intelligence stuff. we're a small beverage company (~$8M rev) and i'm the cofounder/coo, basically doing everything ops related myself. how much does this cost? also is there a free tier or something for early stage? appreciate any info\n\nmarcus",
    received_at: "2026-05-25T09:42:00-07:00",
    category: "sales_inquiry",
    classification_confidence: 0.82,
    classification_reasoning:
      "Inbound interest but well below ICP. Cofounder of an $8M rev company asking about pricing and a free tier — useful to route, not to engage personally.",
    extracted_fields: {
      company_name: "CraftBevCo",
      company_size_estimate: "~$8M revenue, sub-ICP",
      sender_role: "Cofounder / COO",
      stated_need: "Procurement help; pricing-sensitive",
      urgency_signals: [],
      mentioned_competitors: [],
      referral_source: "LinkedIn post",
    },
    draft_body:
      "Hi Marcus — thanks for reaching out.\n\nWaystation is currently focused on companies in the $50M+ revenue range where the supplier email volume justifies a dedicated platform. We don't have a free tier today, and below ~$25M our pricing doesn't pencil for either side.\n\nFor your stage, I'd point you at a few simpler tools that might fit better — happy to share a short list if useful. And we'll keep your info in our list to revisit as you scale.\n\nRyan",
    suggested_action: "delegate_to_bdr",
    action_reasoning:
      "Below-ICP inbound. Polite kick-back with optional tool recommendations belongs with the BDR team, not Ryan.",
    priority_score: 24,
    needs_ryan: false,
    priority_reasoning:
      "Sub-ICP and unlikely to convert; a BDR response within 24h is fine. No personal Ryan touch required.",
    classification_correct: null,
    response_quality: null,
    priority_correct: null,
  },
  {
    email_id: "mock-006",
    gmail_message_id: "email_011",
    from_address: "kavita.reddy@northstartalent.com",
    from_name: "Kavita Reddy",
    subject: "Sr Forward Deployed Engineer candidate — strong fit",
    body:
      "Hi Ryan,\n\nFollowing up on the Sr FDE search. I've got one candidate I'd like to put in front of you directly: Daniel Okafor, currently a TL at Ramp on the supplier-onboarding team. Ex-Stripe before that. The thing I think you'll like — he spent 18 months as the first eng hire at a YC seed company before Stripe, so he's done the 0→1 hat-on-fire work as well as the scale-up work.\n\nHe's only doing two interview loops and we're one of them. Would love to get him on your calendar this week or next while he's still on the market.\n\nCV attached.\n\nKavita\nNorthstar Talent",
    received_at: "2026-05-25T07:50:00-07:00",
    category: "recruiting",
    classification_confidence: 0.94,
    classification_reasoning:
      "Recruiter outreach from a known external partner with a specific named candidate for an open role. Clear next-action requested.",
    extracted_fields: {
      role_targeted: "Sr Forward Deployed Engineer",
      candidate_or_recruiter: "recruiter",
      candidate_summary:
        "Daniel Okafor — TL at Ramp (supplier onboarding), ex-Stripe, first eng hire at a YC seed before Stripe",
      notable_credentials: ["Ramp TL", "Stripe", "0→1 experience at YC seed company"],
    },
    draft_body:
      "Kavita — strong on paper, and the 0→1 + scale-up combo is exactly what I'm looking for.\n\nI'd like to do a 30-min intro this week before we put him into the formal loop. Wednesday or Thursday afternoon work — let me know what he has open.\n\nRyan",
    suggested_action: "personal_response_from_ryan",
    action_reasoning:
      "Senior eng hire is one of the few categories Ryan asked to stay in the loop on personally. Direct candidate intro decision is his call.",
    priority_score: 78,
    needs_ryan: true,
    priority_reasoning:
      "Active senior eng hire, candidate is in-market with limited availability. 24h response window is the right urgency.",
    classification_correct: null,
    response_quality: null,
    priority_correct: null,
  },
  {
    email_id: "mock-007",
    gmail_message_id: "email_006",
    from_address: "outreach@apolloai.io",
    from_name: "Tyler from Apollo",
    subject: "Quick question, Ryan",
    body:
      "Hi Ryan,\n\nNoticed Waystation AI has been growing fast — congrats on the recent traction!\n\nI'm reaching out because we help companies like yours scale outbound 3-5x using AI-powered prospecting and intent data. Companies like {{company_name_1}} and {{company_name_2}} have seen tremendous results.\n\nWorth a 15-min chat next week? I have Tues 10am or Thurs 2pm open.\n\nBest,\nTyler\n\nP.S. — Happy to send over a quick Loom showing exactly how we'd approach Waystation's GTM.",
    received_at: "2026-05-25T06:30:00-07:00",
    category: "vendor_pitch",
    classification_confidence: 0.99,
    classification_reasoning:
      "Unmistakable cold outbound: unsubstituted template variables (`{{company_name_1}}`), generic value prop, generic time-slot ask.",
    extracted_fields: {
      vendor_name: "Apollo",
      product_category: "Outbound prospecting / sales intelligence",
      claims: ["3-5x outbound scale", "AI-powered prospecting", "intent data"],
      looks_like_spam: true,
    },
    draft_body: null,
    suggested_action: "auto_archive",
    action_reasoning:
      "Template variables left unsubstituted in the body. No engagement warranted; safe to archive.",
    priority_score: 4,
    needs_ryan: false,
    priority_reasoning: "Pure outbound spam; zero Ryan time should be spent on this.",
    classification_correct: null,
    response_quality: null,
    priority_correct: null,
  },
  {
    email_id: "mock-008",
    gmail_message_id: "email_004",
    from_address: "support-noreply@stripe.com",
    from_name: "Stripe",
    subject: "Your Stripe payout of $47,829.14 is on its way",
    body:
      "Hi Ryan,\n\nYour scheduled payout of $47,829.14 was initiated today and should arrive in your bank account in 2 business days.\n\nView payout details: https://dashboard.stripe.com/payouts/po_1Ozx...\n\nThanks for using Stripe.\nThe Stripe Team",
    received_at: "2026-05-25T07:00:00-07:00",
    category: "noise",
    classification_confidence: 0.98,
    classification_reasoning:
      "Transactional notification from Stripe. Informational; no action required from Ryan.",
    extracted_fields: { noise_subtype: "transactional" },
    draft_body: null,
    suggested_action: "auto_archive",
    action_reasoning: "Routine transactional notification; archive.",
    priority_score: 2,
    needs_ryan: false,
    priority_reasoning: "Pure transactional noise.",
    classification_correct: null,
    response_quality: null,
    priority_correct: null,
  },
  {
    email_id: "mock-009",
    gmail_message_id: "mock-edge-michael-tao",
    from_address: "michael.t@parsleyfields.com",
    from_name: "Michael Tao",
    subject: "Catching up — and a thought",
    body:
      "Ryan,\n\nIt's been a while. I left Greylock last year and have been doing some independent advising while figuring out what's next. Following Waystation with interest — the procurement angle is one I've been bullish on for a couple of years.\n\nNot a pitch, but I'd love to grab dinner next time you're in SF and trade notes. I'm also helping a couple of CPG operators on supply-chain stuff and there might be intro value both ways.\n\nMichael",
    received_at: "2026-05-24T19:02:00-07:00",
    category: "edge_case",
    classification_confidence: 0.71,
    classification_reasoning:
      "Personal-professional ambiguity: former VC contact, framed as personal but with explicit intro-value hint. Not cleanly sales, not cleanly noise.",
    extracted_fields: {
      why_unusual:
        "Mixes personal catch-up with professional intro offer. Sender is a former VC the system doesn't have history on.",
      plausible_categories: ["edge_case", "sales_inquiry (indirect)"],
      recommended_handling:
        "Surface to Ryan for personal judgment; do not auto-draft a sales-y reply.",
    },
    draft_body:
      "Michael — good to hear from you. I'll be in SF Tue–Thu next week. Tuesday dinner works on my end if you're free; otherwise Thursday lunch. Drop me a couple of times that work.\n\nRyan",
    suggested_action: "personal_response_from_ryan",
    action_reasoning:
      "Personal relationship + ambiguous intent. Draft is short and intentionally non-committal on the professional thread — surfaces the relationship without forcing a frame.",
    priority_score: 62,
    needs_ryan: true,
    priority_reasoning:
      "Network maintenance with someone in Ryan's orbit. Worth a personal reply this week.",
    classification_correct: null,
    response_quality: null,
    priority_correct: null,
  },
  {
    email_id: "mock-010",
    gmail_message_id: "email_022",
    from_address: "noreply@github.com",
    from_name: "GitHub",
    subject: "[waystation/platform] PR #4127 ready for review",
    body:
      "@ryan-caldbeck requested your review on PR #4127: Add idempotency keys to supplier-sync job runner.\n\nView it on GitHub: https://github.com/waystation/platform/pull/4127",
    received_at: "2026-05-25T05:14:00-07:00",
    category: "noise",
    classification_confidence: 0.97,
    classification_reasoning: "Automated GitHub notification. Real but not email-actionable.",
    extracted_fields: { noise_subtype: "github_notification" },
    draft_body: null,
    suggested_action: "auto_archive",
    action_reasoning: "GitHub handles its own review flow; no email response is meaningful.",
    priority_score: 8,
    needs_ryan: false,
    priority_reasoning: "Notification-class noise; review happens on GitHub, not via email.",
    classification_correct: null,
    response_quality: null,
    priority_correct: null,
  },

  {
    email_id: "mock-011",
    gmail_message_id: "email_018",
    from_address: "lisa.huang@mountainpeak.com",
    from_name: "Lisa Huang",
    subject: "Re: Re: Re: API access for our BI tool",
    body:
      "Ryan,\n\nFollowing up again on this. We've been asking for API access to pull our Waystation data into our internal BI dashboard (Looker) for over a month now. Our last update from your team (Apr 18) said it was \"on the roadmap for Q2.\"\n\nQ2 ends in 5 weeks. Can someone give me a real status update? Our CFO is asking and I'm running out of stalling answers.\n\nNot trying to be difficult but this is becoming a real friction point. We renewed the contract partly on the expectation of this integration.\n\nLisa\n\nLisa Huang | Head of Operations | MountainPeak Foods",
    received_at: "2026-05-25T08:55:00-07:00",
    source: "external",
    category: "customer_support",
    classification_confidence: 0.93,
    classification_reasoning:
      "Existing customer escalating an unmet commitment (API access). Fourth follow-up; tone is restrained but the renewal-trigger language is explicit.",
    extracted_fields: {
      customer_company: "MountainPeak Foods",
      issue_type: "commitment_slip",
      affected_feature: "API access for Looker BI integration",
      severity: "high",
      deadline_mentioned: "Q2 ends in 5 weeks",
      has_attachments_referenced: false,
      churn_signal: "Renewed the contract partly on the expectation of this integration",
    },
    draft_body:
      "Lisa — you're right to push, and I owe you a real answer.\n\nWe're committing to option (2): beta access on a limited endpoint set, shipping within 7 days. That gets your Looker integration live for the data your CFO is asking about, with full API parity in Q3 (real timeline this time, not aspirational).\n\nMarcus will own the rollout. Expect a kickoff invite from him today and the first endpoint specs by end of week.\n\nThank you for sticking with us — the renewal trust isn't lost on me.\n\nRyan",
    suggested_action: "personal_response_from_ryan",
    action_reasoning:
      "Customer is on follow-up #4 with a stated renewal trigger. Marcus already escalated internally (see internal_004); Ryan needs to own the external reply once the decision is made. Draft commits to the beta-access option scoped by CS.",
    priority_score: 93,
    needs_ryan: true,
    priority_reasoning:
      "Renewal-anchored commitment slip from a champion. Same root cause as the OCR build-vs-buy fork — eng capacity is the constraint.",
    classification_correct: null,
    response_quality: null,
    priority_correct: null,
    linked_items: ["internal_004"], // Marcus's CS escalation about this exact thread
  },

  // ─────────────────────────────────────────────────────────────────────
  // Internal queue items (v2 scope).
  //
  // Sourced from data/synthetic_internal_items.json. Triage outputs here
  // are hand-written to look like what the prioritizer would plausibly
  // emit — the goal is a sharp demo, not pretending the pipeline ran.
  // The v2 prioritizer should be cross-source aware: a board pre-meeting
  // question and a senior eng offer can outrank a high-quality sales
  // inquiry on the same day.
  // ─────────────────────────────────────────────────────────────────────

  {
    email_id: "mock-int-001",
    gmail_message_id: "internal_001",
    from_address: "Brandon Kim",
    from_name: "Brandon Kim",
    subject: "[#eng-decisions] Build vs buy OCR for COA extraction",
    body:
      "@ryan need a call on this today if possible. We're at a fork — either we keep investing in our in-house COA extraction (last sprint got us to 91% accuracy on canola/oil COAs but the lot-number issue Jen flagged at Brightline is a structural problem with our current approach), or we license AWS Textract + a thin wrapper layer (~$3.2k/mo at our volume, would get us to ~96% accuracy on those edge cases). Sprint plan for next 2 weeks depends on this. I'm leaning buy but it's your call — we'd be giving up some IP defensibility. Don't want to start work in either direction until you weigh in. Free anytime after 11.",
    received_at: "2026-05-25T09:18:00-07:00",
    source: "internal",
    channel: "slack",
    from_role: "Eng Lead",
    category: "eng_decision",
    classification_confidence: 0.96,
    classification_reasoning:
      "Build-vs-buy fork with a hard sprint deadline. Decision blocks the next two weeks of eng capacity; explicitly waiting on Ryan.",
    extracted_fields: {
      decision_type: "build_vs_buy",
      options: ["Continue in-house OCR (91% accuracy, structural lot-number bug)", "License AWS Textract (~$3.2k/mo, ~96% accuracy)"],
      sprint_impact: "Blocks next 2 weeks of eng capacity in either direction",
      stakeholders_blocked: ["Brandon", "eng team (3)"],
      recommendation_from_sender: "buy",
      ip_tradeoff: "Buying gives up some defensibility",
      decision_window: "Today if possible",
    },
    draft_body:
      "Buy. Pull the trigger on Textract — the structural lot-number bug is exactly the kind of thing we shouldn't be debugging during a customer's SQF audit window. IP defensibility on commodity OCR isn't where I want to compete; the moat is the workflow on top.\n\n2pm sync to walk through cost framing and scope what \"thin wrapper layer\" actually means before we sign. Calendar invite incoming.\n\nRyan",
    suggested_action: "personal_response_from_ryan",
    action_reasoning:
      "Architecture/spend decision that gates engineering capacity. Not delegable; the IP-vs-velocity tradeoff is CEO-level. Draft makes the call and commits to a sync to align on execution.",
    priority_score: 91,
    needs_ryan: true,
    priority_reasoning:
      "Blocks 3 engineers for 2 weeks. The structural OCR bug is also what's threatening the Brightline relationship — same root cause as mock-001 above.",
    classification_correct: null,
    response_quality: null,
    priority_correct: null,
    linked_items: ["email_005"], // Jen Alvarez's COA extraction issue
  },

  {
    email_id: "mock-int-002",
    gmail_message_id: "internal_002",
    from_address: "lisa.park@waystationai.com",
    from_name: "Lisa Park",
    subject: "Need pricing approval — Golden Bear Snacks (smaller deal but strategic)",
    body:
      "Hi Ryan,\n\nFollowing up on Mike Dawson's email from earlier — Golden Bear Snacks wants 9 seats but our minimum is 10. The deal is $X ARR and on its own that's not the strategic value.\n\nThe strategic value: their COO sits on the board of the Premium Snacks Association alongside three CEOs in our ICP. Lisa from KinderSnack actually mentioned them in their RFP as a peer reference they'd want to talk to.\n\nMy recommendation: approve the 9-seat exception with a written note that future 10+ pricing kicks in if they expand. Need your call by EOD — they want to sign before the long weekend.\n\nLisa",
    received_at: "2026-05-25T10:34:00-07:00",
    source: "internal",
    channel: "internal_email",
    from_role: "Senior AE",
    category: "internal_escalation",
    classification_confidence: 0.94,
    classification_reasoning:
      "Pricing-exception escalation with a hard same-day deadline and a stated strategic rationale (network effect through Premium Snacks Association).",
    extracted_fields: {
      escalation_type: "pricing_exception",
      requested_exception: "9-seat deal vs. 10-seat minimum",
      strategic_rationale: "COO on Premium Snacks Assoc. board with 3 ICP CEOs; named as a peer reference in KinderSnack RFP",
      recommendation_from_sender: "Approve with written escalator at 10+ seats",
      decision_window: "EOD today",
    },
    draft_body:
      "Lisa — approved. Send the exception note exactly as you scoped it: 9 seats now, standard 10+ pricing kicks in at expansion. Cite the KinderSnack reference angle in the close note so they know the strategic value is real on our side too.\n\nNice catch on the board-overlap.\n\nRyan",
    suggested_action: "draft_for_ryan_review",
    action_reasoning:
      "Pricing approval is Ryan's call but the recommendation is well-reasoned and the draft just needs a one-line edit before sending.",
    priority_score: 89,
    needs_ryan: true,
    priority_reasoning:
      "Same-day deadline + named strategic angle (KinderSnack RFP peer reference). Costs 2 minutes of Ryan's time and unlocks both the immediate deal and the network play.",
    classification_correct: null,
    response_quality: null,
    priority_correct: null,
    linked_items: ["email_003"], // KinderSnack RFP
  },

  {
    email_id: "mock-int-003",
    gmail_message_id: "internal_004",
    from_address: "marcus.chen@waystationai.com",
    from_name: "Marcus Chen",
    subject: "MountainPeak — Lisa Huang escalation, need your input",
    body:
      "Ryan,\n\nLisa Huang at MountainPeak just emailed you (and copied me) about the API access situation. This is the 4th time she's followed up. She's not wrong — we told her Q2 and we're going to miss it.\n\nI need your guidance on what to actually commit to. Options:\n  1. Hard date in next 2 weeks (would require eng to pull 1 person off the OCR work)\n  2. Beta access with limited endpoints (could ship in 1 week, would buy us 30 days)\n  3. Honest 'Q3, here's why' (risks the renewal)\n\nShe renewed partly on this. I want to give her a real answer today.\n\nMarcus",
    received_at: "2026-05-25T09:55:00-07:00",
    source: "internal",
    channel: "internal_email",
    from_role: "Customer Success Lead",
    category: "internal_escalation",
    classification_confidence: 0.97,
    classification_reasoning:
      "Customer escalation routed via CS. Renewal risk is explicit, options are scoped, decision needed today.",
    extracted_fields: {
      escalation_type: "customer_commitment_slip",
      customer_company: "MountainPeak",
      follow_up_count: 4,
      stakeholders_blocked: ["Lisa Huang (customer)", "Marcus (CS)"],
      options: [
        "Hard 2-wk date (pulls 1 eng off OCR)",
        "Beta access in 1 week, buys 30 days",
        "Honest Q3 — renewal at risk",
      ],
      renewal_at_risk: true,
      decision_window: "Today",
    },
    draft_body:
      "Marcus — go with option (2). Beta access, limited endpoints, ship in 7 days. That buys Lisa a real win and us 30 days to land full parity in Q3.\n\nLock in before you reply to her:\n  • Endpoint scope — the 5 endpoints that cover her Looker BI use case, nothing else\n  • Written Q3 commitment with a specific date, not a quarter\n  • You own it, weekly check-in with her until full parity ships\n\nI'm not pulling anyone off the OCR work. We're going Textract anyway (see my reply to Brandon), which frees the capacity.\n\nSend me your draft to Lisa before it goes out.\n\nRyan",
    suggested_action: "personal_response_from_ryan",
    action_reasoning:
      "Renewal at risk + 4th follow-up + customer who renewed partly on this commitment. Marcus needs Ryan's call. Draft makes the call and routes execution back to Marcus with explicit guardrails.",
    priority_score: 95,
    needs_ryan: true,
    priority_reasoning:
      "Active renewal-risk signal from a customer who renewed on this exact promise. The eng tradeoff (pull 1 person off OCR work — see mock-int-001) is Ryan's to make. Same root cause connects to email_018 from Lisa directly.",
    classification_correct: null,
    response_quality: null,
    priority_correct: null,
    linked_items: ["email_018"], // Lisa Huang's external follow-up
  },

  {
    email_id: "mock-int-004",
    gmail_message_id: "internal_005",
    from_address: "j.weatherspoon@summitventures.com",
    from_name: "James Weatherspoon",
    subject: "Board prep — couple of questions on the May materials",
    body:
      "Ryan,\n\nReviewed the board deck draft. Two questions I'd like to discuss before Thursday's meeting so we don't burn the live time:\n\n1. The net retention number — is the 118% including the Harvest House situation? If so what does it look like ex-them?\n\n2. On the headcount plan, you have 18 by year-end. What's the rationale for two BDRs vs one BDR + one CS person, given where the funnel constraints actually are?\n\nNo rush on a written reply — happy to discuss on a quick call before Thursday if easier. I have 30 min Wed 2pm.\n\nJames",
    received_at: "2026-05-25T07:22:00-07:00",
    source: "internal",
    channel: "internal_email",
    from_role: "Board Member (Summit Ventures)",
    category: "board_communication",
    classification_confidence: 0.99,
    classification_reasoning:
      "Board member with substantive pre-meeting questions on retention math and headcount plan. Time-bounded by Thursday board meeting.",
    extracted_fields: {
      sender_role: "Board Member",
      firm: "Summit Ventures",
      meeting_context: "May board meeting, Thursday",
      topics: ["Net retention calc (Harvest House inclusion)", "Headcount plan (2 BDRs vs 1 BDR + 1 CS)"],
      decision_window: "Before Thursday; James offered Wed 2pm for a call",
      response_quality_required: "high",
    },
    draft_body:
      "James — both good catches.\n\n1. The 118% NRR is including Harvest House. Ex-them it's 109%, which I'd argue is the more honest number to anchor on. I'll re-cut the slide to show both with a one-line note on the methodology.\n\n2. The 2-BDR call is a bet that pipeline coverage is the binding constraint through Q3 (we're consistently below 3x in the mid-market segment). I want to walk through the funnel data with you live — Wed 2pm works.\n\nSee you Wednesday.\n\nRyan",
    suggested_action: "draft_for_ryan_review",
    action_reasoning:
      "Board member with high-judgment questions. Draft answers the math directly but Ryan should review the framing — this is exactly the kind of communication that shapes how the board reads the deck on Thursday.",
    priority_score: 88,
    needs_ryan: true,
    priority_reasoning:
      "Pre-board prep with a 48-hour window. Ryan-only conversation; getting the framing right here removes friction from a critical 60-minute meeting.",
    classification_correct: null,
    response_quality: null,
    priority_correct: null,
  },

  {
    email_id: "mock-int-005",
    gmail_message_id: "internal_007",
    from_address: "kate.donovan@waystationai.com",
    from_name: "Kate Donovan",
    subject: "Senior Eng candidate from HMST — need your call by Friday",
    body:
      "Hi Ryan,\n\nThe candidate Rachel Osei pitched last week (Priya, the Flexport engineer) did her loop yesterday. Strong yes from everyone she met — Brandon especially thinks she'd be a force multiplier on the eng team. Offer would be at the top of the band: $X base + Y equity.\n\nShe has a competing offer from Anthropic that closes Friday. We need a decision by Thursday EOD to make the offer in time.\n\nCould you do a 20-min closer call with her tomorrow (Tuesday)? She specifically asked to talk to you about the long-term product vision.\n\nKate",
    received_at: "2026-05-25T13:15:00-07:00",
    source: "internal",
    channel: "internal_email",
    from_role: "Head of Talent",
    category: "hr_decision",
    classification_confidence: 0.95,
    classification_reasoning:
      "Senior eng offer signoff with a hard external deadline (competing Anthropic offer closes Friday). Candidate specifically asked for CEO time.",
    extracted_fields: {
      role: "Senior Engineer",
      candidate: "Priya (referred via Rachel Osei, ex-Flexport)",
      loop_outcome: "Strong yes — Brandon flagged force-multiplier",
      offer_band: "Top of band: $X base + Y equity",
      competing_offer: "Anthropic, closes Friday",
      decision_window: "Thursday EOD",
      candidate_ask: "20-min closer call about long-term product vision",
    },
    draft_body:
      "Kate — yes on the offer, top of band as scoped. Get the paperwork ready.\n\nTuesday 4pm works for the closer call. Send the calendar invite with the LinkedIn + loop notes attached so I can prep.\n\nRyan",
    suggested_action: "draft_for_ryan_review",
    action_reasoning:
      "Senior eng hire is one of the categories Ryan keeps in his loop. The 20-min closer is the right asymmetric investment.",
    priority_score: 84,
    needs_ryan: true,
    priority_reasoning:
      "Competing offer closes Friday; candidate explicitly asked for Ryan time. Losing the candidate to Anthropic is a ~3-month setback on the eng plan.",
    classification_correct: null,
    response_quality: null,
    priority_correct: null,
  },

  {
    email_id: "mock-int-006",
    gmail_message_id: "internal_006",
    from_address: "Sarah Wu",
    from_name: "Sarah Wu",
    subject: "[DM] cash position update + a question",
    body:
      "Ryan, the May numbers are looking solid — we're at $X ARR with the new Verdant and Coastal Collective deals booked. Cash position is healthy through Q1 2027 at current burn.\n\nQuestion for you: with the additional CS hire we discussed plus the senior eng candidate from HMST, we'd push that to Q3 2026. Are we comfortable, or do you want to start informal raise conversations? Not urgent but want to align before I update the board deck.",
    received_at: "2026-05-25T11:02:00-07:00",
    source: "internal",
    channel: "slack",
    from_role: "Head of Finance (fractional)",
    category: "finance_decision",
    classification_confidence: 0.93,
    classification_reasoning:
      "Runway / capital-allocation question framed for the board-deck update. Connects directly to the senior eng offer in mock-int-005.",
    extracted_fields: {
      decision_type: "runway_signal",
      current_runway: "Through Q1 2027",
      runway_after_proposed_hires: "Q3 2026",
      proposed_hires: ["1 CS", "1 Senior Engineer (Priya)"],
      ask: "Comfortable, or start informal raise conversations?",
      tied_to_artifact: "May board deck",
      decision_window: "Before board deck update (this week)",
    },
    draft_body:
      "Sarah — comfortable with Q3 '26 runway as long as the eng hire pulls forward the revenue we're already building toward. Don't start raise conversations yet but update the board deck with both scenarios (with and without the hires) so we're transparent.\n\nLet's revisit informally at the July check-in.\n\nRyan",
    suggested_action: "draft_for_ryan_review",
    action_reasoning:
      "Capital-allocation decision is CEO-level. The draft is directionally right; Ryan should confirm the 'no raise yet' framing before it lands in board materials.",
    priority_score: 76,
    needs_ryan: true,
    priority_reasoning:
      "Affects the board narrative and ties to the senior-eng-hire decision in mock-int-005. Not urgent today but needs to be aligned before Sarah updates the deck.",
    classification_correct: null,
    response_quality: null,
    priority_correct: null,
    linked_items: ["internal_007"], // ties to the senior eng hire
  },

  {
    email_id: "mock-int-007",
    gmail_message_id: "internal_012",
    from_address: "kate.donovan@waystationai.com",
    from_name: "Kate Donovan",
    subject: "Offer letter for new CS hire — needs your sig",
    body:
      "Hi Ryan,\n\nOffer letter for Maya Chen (the CS hire we discussed last Friday) is ready in DocuSign. Standard terms we agreed on. She's expecting it today and we'd lose her if we don't send by EOD — she's deciding between us and one other role.\n\nLink in DocuSign. Should take 90 seconds.\n\nKate",
    received_at: "2026-05-25T15:22:00-07:00",
    source: "internal",
    channel: "internal_email",
    from_role: "Head of Talent",
    category: "hr_decision",
    classification_confidence: 0.97,
    classification_reasoning:
      "Routine offer signoff for an already-agreed hire. Standard terms; the work is just the signature.",
    extracted_fields: {
      role: "CS hire",
      candidate: "Maya Chen",
      terms: "Standard, previously agreed",
      decision_window: "EOD today",
      effort_required: "90 seconds in DocuSign",
    },
    draft_body: "Kate — signed. Send it.\n\nRyan",
    suggested_action: "personal_response_from_ryan",
    action_reasoning:
      "Offer signature is Ryan-only but the decision is already made. This is a 90-second action, not a deliberation. One-line confirmation reply.",
    priority_score: 71,
    needs_ryan: true,
    priority_reasoning:
      "Same-day deadline + irreversible cost if missed (lose the candidate). Tiny time investment, high regret cost if dropped.",
    classification_correct: null,
    response_quality: null,
    priority_correct: null,
  },

  {
    email_id: "mock-int-008",
    gmail_message_id: "internal_003",
    from_address: "Dani Rivera",
    from_name: "Dani Rivera",
    subject: "[DM] feedback on the new cold email template?",
    body:
      "Hey Ryan — when you have a sec, I drafted a new cold email template for the procurement-leader persona based on the messaging from your podcast interview. I've A/B tested two versions on a small batch (n=40) and one is getting a 23% reply rate which is the highest we've seen. Want your eyes on it before I roll it out to the whole BDR team next week. No rush, but ideally by Wednesday so I can brief the team Thursday standup.",
    received_at: "2026-05-25T08:47:00-07:00",
    source: "internal",
    channel: "slack",
    from_role: "BDR Lead",
    category: "direct_report_request",
    classification_confidence: 0.91,
    classification_reasoning:
      "Direct report request for review on a creative artifact. Soft deadline, clear scope, low-stakes if delayed a day.",
    extracted_fields: {
      request_type: "review_artifact",
      artifact: "Cold email template (procurement-leader persona)",
      test_signal: "23% reply rate at n=40, highest team has seen",
      decision_window: "Wednesday (briefs team Thursday standup)",
      reversibility: "high — easy to iterate after rollout",
    },
    draft_body:
      "Dani — drop it in #sales-templates and I'll leave notes by EOD Wednesday. The 23% number is great; let's make sure the framing on the second paragraph doesn't oversell.\n\nRyan",
    suggested_action: "draft_for_ryan_review",
    action_reasoning:
      "Direct report request that Ryan should engage with personally — even short feedback is the signal that the BDR team's work matters to him.",
    priority_score: 58,
    needs_ryan: true,
    priority_reasoning:
      "Not urgent but the BDR team's morale and the rollout next week both benefit from a same-week response. Cheap to handle in a 5-min review.",
    classification_correct: null,
    response_quality: null,
    priority_correct: null,
  },

  {
    email_id: "mock-int-009",
    gmail_message_id: "internal_013",
    from_address: "Brandon Kim",
    from_name: "Brandon Kim",
    subject: "[#eng-decisions] Vendor question — going with Supabase or Postgres on RDS for analytics db",
    body:
      "@ryan small question — for the new analytics database (separate from our prod db) we're trying to decide between Supabase and Postgres on RDS. Supabase is cheaper and faster to set up, RDS is more 'enterprise' looking which might matter for our SOC 2. I have a small preference for Supabase given speed of iteration but happy either way. Want to make the call this week so we can start building the customer-facing dashboards next sprint.",
    received_at: "2026-05-25T11:45:00-07:00",
    source: "internal",
    channel: "slack",
    from_role: "Eng Lead",
    category: "eng_decision",
    classification_confidence: 0.88,
    classification_reasoning:
      "Vendor-selection eng decision. Stakes are smaller than the OCR fork (analytics-only DB) and the sender has a stated lean.",
    extracted_fields: {
      decision_type: "vendor_selection",
      options: ["Supabase (cheaper, faster setup)", "Postgres on RDS (enterprise-looking, possibly SOC 2 relevant)"],
      sprint_impact: "Gates customer-facing dashboards next sprint",
      stakeholders_blocked: ["Brandon"],
      recommendation_from_sender: "Supabase (mild)",
      decision_window: "This week",
    },
    draft_body:
      "Brandon — go Supabase. SOC 2 doesn't care which managed Postgres you use; it cares about your access controls and backup posture. Pick speed of iteration.\n\nRyan",
    suggested_action: "draft_for_ryan_review",
    action_reasoning:
      "Low-stakes decision with a clear recommendation from the sender. Draft commits to the call so Brandon can unblock.",
    priority_score: 44,
    needs_ryan: false,
    priority_reasoning:
      "Brandon has a lean and there's no real downside in either direction. Ryan can sign off in a one-liner; not a needs_ryan item by itself.",
    classification_correct: null,
    response_quality: null,
    priority_correct: null,
  },

  {
    email_id: "mock-int-010",
    gmail_message_id: "internal_010",
    from_address: "Marcus Chen",
    from_name: "Marcus Chen",
    subject: "[DM] Can we grab 30 min this week? Want to talk about my role scope",
    body:
      "Hey Ryan — when you have time, would love to grab 30 min this week. Nothing urgent or alarming, just want to talk through some thoughts on where my role is going as we scale and where I think I can add more value. Happy to do it whenever works for you.",
    received_at: "2026-05-24T17:48:00-07:00",
    source: "internal",
    channel: "slack",
    from_role: "Customer Success Lead",
    category: "direct_report_request",
    classification_confidence: 0.93,
    classification_reasoning:
      "Career / role-scope conversation request from a direct report. Polite framing, no urgent trigger — but exactly the kind of ask that becomes a problem if ignored.",
    extracted_fields: {
      request_type: "career_conversation",
      framing: "Role scope and added value as we scale",
      urgency_self_described: "None ('nothing urgent or alarming')",
      decision_window: "This week",
      reversibility: "low — ignoring this signals priority",
    },
    draft_body:
      "Marcus — yes, let's do it. Calendly link incoming for a 30-min this Thursday or Friday afternoon. Bring a one-pager of where you think you can add more value; I'll come with where I want CS to be in 6 months.\n\nRyan",
    suggested_action: "schedule_meeting",
    action_reasoning:
      "Direct-report request that's about retention as much as scope. Booking it this week — not 'when I get to it' — is the signal.",
    priority_score: 64,
    needs_ryan: true,
    priority_reasoning:
      "Polite ceiling-ask from a key direct report. Cheap to handle (30 min on the calendar), expensive to ignore. Ties to the broader CS scope-up discussion from Marcus's MountainPeak escalation.",
    classification_correct: null,
    response_quality: null,
    priority_correct: null,
  },

  {
    email_id: "mock-int-011",
    gmail_message_id: "internal_008",
    from_address: "Ben Rodriguez",
    from_name: "Ben Rodriguez",
    subject: "[#eng] FYI Mailgun webhook fix shipped",
    body:
      "FYI — the Mailgun webhook timeout issue from #1247 is fixed and deployed. Brightline and Northern Brewing back to normal ingestion as of 11:45am. Postmortem doc going up tomorrow but the gist: rate limiter on our side was conflating two different webhook event types. No customer data was lost. Not urgent for you but flagging since both of those are active accounts.",
    received_at: "2026-05-25T12:30:00-07:00",
    source: "internal",
    channel: "slack",
    from_role: "Senior Engineer",
    category: "internal_fyi",
    classification_confidence: 0.98,
    classification_reasoning: "Pure FYI from engineering. No decision needed.",
    extracted_fields: {
      update_type: "incident_resolution",
      systems_affected: ["Mailgun webhook ingestion"],
      customers_affected: ["Brightline", "Northern Brewing"],
      resolution_time: "11:45am",
      data_loss: false,
      postmortem_eta: "Tomorrow",
    },
    draft_body: null,
    suggested_action: "auto_archive",
    action_reasoning:
      "FYI item — no response needed. Worth Ryan scanning the postmortem when it goes up, but not today and not as a queue item.",
    priority_score: 14,
    needs_ryan: false,
    priority_reasoning: "Low-stakes informational. Should fade visually.",
    classification_correct: null,
    response_quality: null,
    priority_correct: null,
  },

  {
    email_id: "mock-int-012",
    gmail_message_id: "internal_015",
    from_address: "Sarah Wu",
    from_name: "Sarah Wu",
    subject: "[#finance] Q1 financials are in the shared drive whenever you have a minute",
    body:
      "FYI Q1 financials are finalized and in /Finance/2026/Q1. Top line: revenue tracking 8% ahead of plan, OpEx 4% under plan, net burn $X. Nothing surprising. Whenever you want to dig in let me know but no decisions needed.",
    received_at: "2026-05-24T16:30:00-07:00",
    source: "internal",
    channel: "slack",
    from_role: "Head of Finance (fractional)",
    category: "internal_fyi",
    classification_confidence: 0.96,
    classification_reasoning:
      "Pure FYI on finalized Q1 financials. Sender explicitly says no decisions needed.",
    extracted_fields: {
      update_type: "financial_close",
      period: "Q1 2026",
      headline: "Revenue +8% vs plan, OpEx -4% vs plan",
      data_location: "/Finance/2026/Q1",
    },
    draft_body: null,
    suggested_action: "auto_archive",
    action_reasoning: "Pure FYI. Ryan can read at leisure; not queue-worthy.",
    priority_score: 9,
    needs_ryan: false,
    priority_reasoning: "Informational. Should fade visually.",
    classification_correct: null,
    response_quality: null,
    priority_correct: null,
  },
];
