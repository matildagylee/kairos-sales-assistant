# Kairos

Kairos is a Chrome **side panel** that rides along on live sales calls (Google Meet or any page). It gives reps a Claude-powered copilot grounded in the live Notion battlecards, plus **auto-generated call notes** transcribed from the call audio. Styled to mirror the **Gaia UI** design system (Inter, Gorgias purple), with the Gorgias logo.

## What it does
- **Copilot chat** — ask anything in plain language; answers come back as tight bullets, cite the exact Notion battlecard (with link + last-updated date), and never invent facts.
- **Proactive battlecard** — pick a competitor and it instantly shows the card and your opening play, tailored to the brand + persona.
- **Proof points by vertical** — pick the brand's vertical to surface a matching Gorgias customer proof point (brand + metric + gorgias.com case-study link).
- **Live call notes** — records the call audio (call + your mic), transcribes it with Deepgram, and auto-writes notes every ~30s: summary, customer pain, objections (each linked to the battlecard that answers it), competitors mentioned, proof point to send, action items, next step. Copy to your CRM.

## Load it (unpacked)
1. Open `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. Click **Load unpacked** → select this `sales-call-companion` folder
4. Click the Gorgias icon in the toolbar → the side panel docks on the right

## First-time setup (⚙ gear)
- **Anthropic API key** (`sk-ant-...`) — powers the copilot + notes. [Get one](https://console.anthropic.com/settings/keys).
- **Deepgram API key** — transcribes the call for notes (free tier). [Get one](https://console.deepgram.com/).
- **Model** — Opus 4.8 (default), Sonnet 4.6, or Haiku 4.5 for speed.

Both keys are stored locally in your browser only and sent nowhere except Anthropic / Deepgram.

## Using it on a call
1. Set the **brand**, **vertical**, **competitor**, **persona** up top.
2. **Copilot tab:** ask questions or tap a suggestion chip.
3. **Call Notes tab:** click **Start notes** when you join (a "make participants aware" banner appears — disclosure is expected and required in some regions). Notes build live; **Copy** when done.

## Content (all from your sources, baked in)
- `data/battlecards.js` — 9 Notion battlecards (Zendesk, Kustomer, Gladly, Siena, Yuma, Digital Genius, Klaviyo, Intercom, Richpanel), each with `notionUrl` + `lastEdited`.
- `data/foundation.js` — 9 personas + positioning from `gorgias-foundation/`.
- `data/proofpoints.js` — 12 real customer proof points from gorgias.com/customers, by vertical.
- `data/roadmap.js` — roadmap talking points + fallback objections.

**Refresh:** say **"resync battlecards"**, **"resync foundation"**, or **"resync proof points"** after updating the sources.

## Project structure
```
manifest.json          MV3 config (side panel, tabCapture, Anthropic + Deepgram hosts)
README.md
src/
  background.js        opens the side panel on icon click
  sidepanel.html/.css/.js   panel UI, copilot, and notes engine
data/
  battlecards.js foundation.js proofpoints.js roadmap.js
assets/icons/
  gorgias-logo.png
docs/
  decision-log.md      running record of decisions
  GAIA-THEME.md         extracted Gaia UI design tokens
```

## Design
Mirrors `gorgias/gaia` → `gaia_ui` (see `docs/GAIA-THEME.md`): Inter font, Gorgias purple `#7B52D9`, 10px cards / 8px controls, soft shadows. Logo is the standard Gorgias logo.
