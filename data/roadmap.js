// Static content the panel falls back on. Competitor cards live in battlecards.js
// (from Notion); personas + positioning live in foundation.js (from gorgias-foundation).
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
  // Roadmap talking points.
  roadmap: [
    { item: "Voice — phone support built for ecommerce, inside Gorgias", timing: "Available now" },
    { item: "AI Agent — Shopping Assistant (pre-sale) + Support Agent (post-sale)", timing: "Available now" },
    { item: "AI Journeys — outbound conversational SMS & retention (formerly Engage)", timing: "2027" }
  ]
};
