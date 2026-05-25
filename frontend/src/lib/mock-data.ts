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
    gmail_message_id: "email_018",
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
    draft_body: null,
    suggested_action: "personal_response_from_ryan",
    action_reasoning:
      "Personal relationship + ambiguous intent. The cost of an off-tone AI draft outweighs the time savings; surface raw.",
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
];
