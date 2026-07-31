# Kairos — Decision Log

A running record of the choices we made and why. Newest at the bottom.

## 2026-07-31 — Product & scope
- **What:** Kairos is a Chrome MV3 **side-panel** extension: an AI sales copilot AEs use *during live calls*.
- **Why side panel (not a floating overlay):** docks beside Google Meet, stays put, doesn't cover the call.

## 2026-07-31 — The "brain"
- **Decision:** Real **Claude** chat via the Anthropic API, called directly from the panel. Default model `claude-opus-4-8`, switchable to Sonnet/Haiku for speed.
- **Why:** A true chatbot needs an LLM. Direct browser call keeps it a no-backend prototype; the key stays local.

## 2026-07-31 — Call notes capture
- **Decision:** Capture **tab audio + mic**, transcribe with **Deepgram** (streaming WebSocket), regenerate notes every **~30s**.
- **Considered:** Google Meet live captions (no key, Meet-only). Rejected for v1 because Deepgram works on any call platform and the free tier is generous.
- **Cost/consent:** Needs a Deepgram key (free tier). A "make participants aware" banner shows while recording.

## 2026-07-31 — Content sourcing (baked in, not live)
- **Decision:** Battlecards, personas/positioning, and proof points are **baked into JS files**, refreshed on command ("resync battlecards / foundation / proof points").
- **Why:** A browser extension can't safely hold a Notion token. Baking + resync = no secrets, works offline on a call.
- **Sources:** Notion Knowledge Base (9 battlecards), `gorgias-foundation/` (9 personas + positioning), gorgias.com/customers (12 proof points by vertical).

## 2026-07-31 — Design
- **Decision:** Mirror the **Gaia UI** design system (`gorgias/gaia` → `gaia_ui`): Inter font, Gorgias purple `#7B52D9`, 10px cards / 8px controls, soft shadows. Tokens in `docs/GAIA-THEME.md`.
- **Logo:** Standard **Gorgias logo** (reverted from the Gaia logo).
- **Name:** **Kairos**.

## 2026-07-31 — Repo & structure
- **Repo:** `matildagylee/kairos-sales-assistant`, **private** (contains internal battlecards + customer data).
- **Structure:** `src/` (UI + service worker), `data/` (content), `assets/icons/`, `docs/`, `manifest.json` + `README.md` at root.

## 2026-07-31 — Output format for live calls (v1, on `output-quality` branch)
- **Problem:** The battlecard showed ~8 lines. Too much to read mid-call.
- **Principle:** AEs glance for <2 seconds. Show **one move**, everything else one tap away.
- **Battlecard:** one-line "Say this" + collapsed chips (Why we win / Weakness / Discovery) that expand on tap.
- **AI chat answers:** hard cap at **3 short bullets**.
- **Style (all output):** plain language, no jargon, no em dashes, cite + link the source Notion card, add a vertical-matched proof point when relevant.
- **Status:** being iterated on the `output-quality` branch.

## 2026-07-31 — Ways of working
- **Phases:** each phase = its own branch (+ worktree). A phase is done only when Matilda confirms via a real test.
- **Merge control:** always ask Matilda "merge to main? yes/no" at the end of a phase; never merge without a yes, so she can revert.
- **Strategic decisions:** always use the AskUserQuestion tool for phase/roadmap/scope choices.
- **Decision logging:** auto-log every decision here as we make it; if unsure whether to log something, ask.
- Added `CLAUDE.md` (working agreement) and `planning/roadmap.md` (living roadmap).

## 2026-07-31 — Phase 2 kickoff: Latency
- **Goal:** AE gets an easy, quick answer during a live call.
- **Done criterion:** Matilda plays a Gong call, the model runs and returns a quick usable answer.
- **Pending input:** Matilda's latency research (to read before scoping the approach).
