# Kairos — Roadmap

Living plan. Each phase is a branch; a phase is done only when Matilda confirms via a real test. Nothing merges to `main` without an explicit yes.

Status key: ✅ done · 🔧 in progress · ⏭ next · 💡 backlog (needs validation)

---

## ✅ Phase 0 — Foundation (on `main`)
- Chrome MV3 side panel, Claude copilot, proactive battlecard, proof points, live call notes (Deepgram).
- Content baked from Notion battlecards, gorgias-foundation, gorgias.com/customers.
- Structured folder; mirrors Gaia UI design.

## ✅ Phase 1 — Output quality (branch `output-quality`, NOT yet merged)
- One-move battlecard + tap-to-expand chips; AI-tightened bullets.
- Copilot answers capped to 3 bullets; scoped knowledge base; default Sonnet 4.6.
- Live-transcript relevance; hardened sourcing/trust.
- **Pending:** Matilda's test + merge decision.

## 🔧 Phase 2 — Latency (branch: `latency`, being set up)
- **Goal:** the AE gets an easy, quick answer during a live call.
- **Done criterion (Matilda's test):** play a Gong call, the model runs and returns a quick, usable answer. Phase concludes only when that works.
- **Inputs:** Matilda's latency research (to be read before scoping).
- Likely levers (to validate against the research): streaming time-to-first-token, faster default model, smaller/scoped prompts, prompt caching, pre-warming, cutting redundant calls.

---

## 💡 Backlog (candidate future phases — to validate with Matilda)
- **Auto-detect context:** pull brand/competitor/persona from the call instead of manual dropdowns.
- **Proactive surfacing:** detect objections/competitor mentions in the transcript and auto-surface the right card, unprompted.
- **CRM export:** push call notes to HubSpot (or Gong) in one click.
- **Multi-platform:** support Zoom / other call tools, not just Meet.
- **Content freshness:** auto-resync battlecards/proof points from Notion on a schedule.
- **Team distribution:** package for the sales team (shared config, no per-rep key setup).
- **Usage analytics:** track what reps actually use to improve the content.

---

## Decisions
See `docs/decision-log.md` for the full record of what we decided and why.
