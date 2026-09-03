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

## 2026-08-05 — Knowledge expansion: customer stories + podcast + roadmap (branch `phase-knowledge-stories-roadmap`)
- **What:** Added three content sources to the baked knowledge base, wired into the copilot + notes prompts.
- **Customer stories (`data/customerstories.js`):** curated ~27 flagship stories from gorgias.com/customers (sitemap has ~100 unique; chose curated + richer over all-100-compact). Each has brand, vertical (aligned to the panel's vertical dropdown keys), segment, `prevHelpdesk` (tool they switched from), products, headline metric, a short challenge->result story, a real quote + link. Chosen for vertical / competitor / segment diversity so any prospect has a match. Kept `proofpoints.js` as the quick one-line-metric layer.
- **Podcast (`data/podcast.js`):** 6 Behind the Inbox episodes, lightweight (title, brand, theme, one takeaway, link), tagged as operator POV, not hard proof. Guest names were templated in page metadata so we left them out.
- **Roadmap (`data/roadmap.js`):** replaced the 3-item placeholder with the latest Notion refresh (2026-06-26), tiered into `shippedRecently`, `nextThreeMonths`, `horizon` (next/later). Internal PM names stripped; reframed in customer-benefit language. **Call-safety:** a `guidance` field + STYLE rule let the copilot reference shipped + next-3-months freely but NEVER promise or date `horizon` items (the Notion doc marks them "not for customer conversations").
- **Wiring:** new `<script>` tags in `sidepanel.html`; `knowledgeBase()` now includes `customerStories`, `podcast`, `roadmap` (object shape); two STYLE rules; a `matchingStory()` helper adds a "Customer story that fits this brand" suggestion chip when the vertical or competitor matches.
- **Why curated over all-100:** a live-call copilot needs glanceable, high-signal stories, not exhaustive coverage.
- **Status:** syntax-checked, all data files load clean, **awaiting Matilda's real test** (set a vertical/competitor, ask for a story + roadmap tease, confirm the right one is pulled and no over-promising). Not merged.

## 2026-08-05 — Redesign: Dark focus HUD (branch `phase-redesign-dark-hud`)
- **Trigger:** Matilda felt the light UI looked dated/plain (a white form).
- **Decision:** Restyle the panel as a **dark focus HUD** (chosen via AskUserQuestion over "refined light" and "Gorgias brand-forward"). Charcoal surface, brightened Gorgias violet `#9D7DF0` accent, glowing tab indicator, elevated cards. This intentionally **supersedes the 2026-07-31 "mirror Gaia light UI" decision** for the panel chrome. Rationale: sits better beside a dark Meet/Zoom window, reads as a premium copilot, and fixes the "dated" feel.
- **Follow-up (same session):** Matilda asked for **more gradient + glass**. Added a layered multi-radial violet/indigo gradient background (fixed-attachment) and **glassmorphism** (translucent `backdrop-filter` blur) on the header, controls, settings, cards, "Say this" panel, and composer.
- **Scope:** CSS-only (`src/sidepanel.css`); no markup or logic changes, so it composes with any branch. Kept every selector.
- **Details:** `color-scheme: dark` so native selects/scrollbars render dark; the black Gorgias logo is inverted to white via `filter: brightness(0) invert(1)` (renders correctly); `min-width:0` on grid inputs + `overflow-x:hidden` prevent select overflow at narrow panel widths. Verified via headless Chrome screenshot at ~400px (Chrome's default side-panel width).
- **Status:** syntax/visual-checked in headless render, **awaiting Matilda's real test** in the loaded extension. Not merged.

## 2026-09-03 — Redesign: Gorgias brand (coral), off Gaia
- **Trigger:** Matilda asked to move off the Gaia palette to non-Gaia Gorgias, "more modern and sleek."
- **Decision:** Replace the violet/Gaia HUD accent with the **Gorgias brand** — coral `#FF7A5A` (hover `#FF8E70`, deep `#E8542E`) as the single accent on Gorgias ink `#1A1E23`/`#14171B`. Text on coral is warm near-black ink, not white. This supersedes the 2026-08-05 "brightened Gorgias violet" accent decision.
- **Sleek pass:** removed the layered multi-radial violet glow + glassmorphism-everywhere; now flat solid surfaces, hairline borders, one soft card shadow, a single faint coral glow at the top. Radii tightened to 12px cards / 9px controls. Display font set to Inter Tight for the wordmark + card titles. Recording pulse simplified to a coral-free destructive ring.
- **Scope:** CSS-only (`src/sidepanel.css`); every selector kept, no markup/logic change. Verified JS/data carry no hardcoded colors.
- **Docs:** `docs/GAIA-THEME.md` replaced by `docs/THEME.md` (Gorgias brand tokens); README + roadmap updated off Gaia.
- **Status:** awaiting Matilda's real test in the loaded extension.
