// Static content the panel falls back on. Competitor cards live in battlecards.js
// (from Notion); personas + positioning live in foundation.js; customer stories in customerstories.js.
//
// ROADMAP: distilled from the Notion "Roadmap Refresh / GTM Summary" (latest refresh 2026-06-26).
// Internal PM/lead names are intentionally stripped. Framed in customer-benefit language.
// CALL-SAFETY: `shippedRecently` and `nextThreeMonths` are safe to reference on a call.
// `horizon` items are exploratory bets, NOT commitments — never promise them or give dates to a prospect.
// Re-run "resync roadmap" to refresh.
window.SALES_DATA = {
  // Generic objections shown when no competitor is selected.
  objections: [
    {
      objection: "\"Your AI will sound like a bot / hurt our brand.\"",
      response: "AI Agent learns your brand voice and is governed by quality scoring and coaching. You control tone, guardrails, and handoff. It reads as your best agent, not a bot."
    },
    {
      objection: "\"Switching helpdesks is too painful.\"",
      response: "Most brands are live in days, not months. We import macros and history, and the Shopify-native timeline makes agents productive day one."
    },
    {
      objection: "\"AI is too expensive / unpredictable.\"",
      response: "AI Agent resolves 60%+ of tickets and lowers cost-to-serve, so it pays for itself, and it drives revenue via pre-sale assistance rather than being just a cost line."
    }
  ],

  roadmap: {
    updated: "2026-06-26",
    source: "Notion — Roadmap Refresh / GTM Summary (latest refresh)",
    guidance: "shippedRecently and nextThreeMonths are safe to reference on a live call. horizon items are exploratory bets, NOT commitments — do not promise them or give a prospect a date.",

    // Live now / shipped in the last ~6 weeks. Safe to reference with confidence.
    shippedRecently: [
      { item: "Gorgias MCP (GA)", benefit: "First-party MCP server connects Gorgias to any MCP-capable AI client (Claude, Cursor, ChatGPT)." },
      { item: "Skills", benefit: "Intent-driven AI Agent configuration by use case, with a personalized transition plan per account." },
      { item: "Gaia (open beta)", benefit: "Merchant-facing AI coaching copilot: reads your tickets, drafts Skills and guidance, and wires up Actions." },
      { item: "Actions Platform", benefit: "Connect an app once and every available action is unlocked, with clear signals when one fails." },
      { item: "AI Agent V3 (Evoli) beta scaled", benefit: "Next-gen AI architecture across Support, Actions, and Sales: stronger guidance adherence, lower latency and cost." },
      { item: "AI & Automation Analytics 2.0 (GA)", benefit: "Rebuilt AI reports with saved views, channel and store filters, and a documented metric glossary." },
      { item: "Metrics audit complete", benefit: "All 115 customer-facing metrics audited with clear definitions, so teams can trust every number." },
      { item: "RCS v0 (AI Journey)", benefit: "Outbound quick replies, cards, and carousels: conversation-first messaging, not just plain SMS." },
      { item: "New pricing tiers", benefit: "Right-sized Helpdesk, Voice, and AI Agent tiers so brands buy the plan that fits." },
      { item: "AI Agent free trial at the Enable step", benefit: "Configure and test AI Agent free in a playground before the 14-day trial even starts." }
    ],

    // Targeted for the next ~3 months. Tease-able as coming soon; avoid hard dates.
    nextThreeMonths: [
      { item: "AI Agent V3 (Evoli) GA", benefit: "Full rollout of the next-gen AI architecture to all accounts, focused on latency and cost." },
      { item: "Skills GA", benefit: "Intent-driven AI Agent configuration reaches general availability." },
      { item: "Gaia Coaching Copilot", benefit: "A merchant-facing AI teammate that drafts Skills and guidance and wires up Actions, turning weeks of setup into hours." },
      { item: "AI Agent on Instagram & Facebook DMs", benefit: "The same AI Agent that handles email, chat, and voice now automates social DMs (beta over summer, launch in fall)." },
      { item: "Helpdesk 2.0 responsive UI", benefit: "Mobile and tablet layouts for ticket view, timeline, and preview." },
      { item: "AI Journey segmentation foundations (CDP v0.5)", benefit: "Native audience segmentation and identity for outbound targeting, built inside Gorgias." },
      { item: "Copilot Onboarding", benefit: "In-product onboarding to activate AI Agent self-serve." }
    ],

    // Exploratory. INTERNAL framing only — never promise on a call.
    horizon: {
      next: [
        "Support Copilot: an agent-side assistant that drafts and acts alongside your team",
        "Gaia for Analytics: chat with your data plus proactive anomaly detection",
        "Helpdesk 3.0 (AI-native ticketing): Gaia reads context, answers, and takes ticket actions",
        "Always-on AI outbound radar: an opportunity finder for AI Journey",
        "AI Vision beyond MVP: image-native support for damaged, missing, and warranty cases",
        "AI Agent on TikTok DMs and WhatsApp"
      ],
      later: [
        "Full AI Agent autonomy plus a memory primitive; a global AI Copilot layer across Gorgias",
        "Analytics Voice-of-Customer / revenue intelligence: topic and sentiment trends tied to revenue",
        "AI Journey lifecycle orchestration and email-led Klaviyo displacement once SMS is proven",
        "Enterprise billing (parent-child accounts) and non-Shopify commerce platforms (e.g. Salesforce Commerce)"
      ]
    }
  }
};
