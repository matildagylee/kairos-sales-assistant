# Cluely Teardown

Competitive/technical teardown for **Kairos** (Chrome side-panel sales copilot: live audio → Deepgram STT → LLM insight grounded in battlecards → real-time surfacing).

Cluely is the closest existing product. Goal: understand how it achieves low end-to-end latency and how it's architected so we can replicate it.

> **Legend:** `[FACT]` = stated by Cluely or directly observed by a reviewer. `[INFER]` = reasoned from behavior, the open-source clones, or general architecture of this class of tool. Cluely does not publish an engineering blog, so most stack details are `[INFER]`.

---

## Overview

- **What it is** `[FACT]` A desktop "invisible AI" that listens to a live conversation, reads your screen, and surfaces suggested answers/notes in an overlay only you can see. Current positioning: **"#1 Undetectable AI for Meetings"** — an undetectable AI notetaker + real-time answer engine.
- **Origin** `[FACT]` Grew out of **Interview Coder**, a LeetCode-cheating Chrome extension built early 2025 by Chungin "Roy" Lee and Neel Shanmugam (Columbia; both suspended). Cluely launched **Apr 20, 2025** with the tagline **"Cheat on Everything"** — 70K signups in week one.
- **Funding** `[FACT]` ~$5.3M seed (Abstract, Susa), then **$15M Series A from a16z**. In Mar 2026 Roy Lee publicly admitted the previously-touted **$7M ARR figure was inaccurate**.
- **Positioning shift** `[FACT]` Marketing has softened from overt "cheating" toward a legitimacy-friendly "meeting assistant / notetaker," while still selling the undetectable real-time-answer capability as the differentiator.
- **Primary use cases** `[FACT]` Technical interviews, **sales calls** (objection handling, talking points), and general meetings. Supports uploading your own files (resume, **sales playbooks**, product docs) that the model draws on — the direct analog to Kairos's battlecard grounding.

## Product surfaces

- **Desktop app** `[FACT]` macOS + Windows. This is the core product — a floating **overlay/widget** that renders suggestions on top of everything else.
- **Mobile app** `[FACT]` iOS + Android (a recorder for in-person meetings / voice memos), sold separately (~$8/week).
- **Dashboard (web)** `[FACT]` As of the Dec 2025 changelog, the real-time transcript + speaker labeling was **moved off the widget into a web Dashboard** to de-clutter the overlay. Interaction: hotkey **Cmd/Ctrl + Enter** ("Assist") triggers a suggestion; also has "What should I say?", follow-ups, and "Recap."
- **Undetectable overlay** `[FACT]` On the top tier, the overlay is rendered **at the GPU level, below the layer screen-share software captures**, so it's invisible to Zoom/Meet/Teams screen shares. Reviewers confirm this actually works. `[INFER]` Implemented via GPU compositor hooks (Metal on macOS, DirectX/DWM on Windows) — the same technique the open-source clones use.
- **No meeting recording** `[FACT]` Unlike Otter/Fireflies/tl;dv it does **not** record video; it produces prompts + post-call transcript/summary only.
- **CRM integrations** `[FACT]` Salesforce, HubSpot, Pipedrive, Zoho — pulls customer data into live calls.
- **Pricing** `[FACT]` Starter **$0** (capped) · Pro **$19.99/mo** (~$143.88/yr) · **Pro + Undetectability $149.99/mo** (undetectable overlay gated here) · Mobile **$8/wk**.

## Inferred architecture

Cluely has published no architecture docs. The most reliable window into "how this class of product is built" is the open-source clones that were reverse-engineered / forked from the same lineage: **`pickle-com/glass`** (a.k.a. "Glass," the open-source Cluely) and its upstream **`cheating-daddy`** (Soham's GPLv3 project that Glass was caught forking). Their design is the best proxy for Cluely's.

- **Client shell** `[INFER]` Electron desktop app (Glass is Electron; Cluely behaves identically — always-on-top transparent window, global hotkeys, tray). A native layer handles audio capture + the undetectable window.
- **Audio capture** `[INFER]` Captures **both** streams: your **mic** (you) and **system/loopback audio** (the other party). On macOS via a CoreAudio tap / ScreenCaptureKit audio; Glass added a **Rust** audio layer to cleanly separate mic vs system audio and do echo cancellation (`aec` submodule). This dual-stream capture is what lets it caption the *other* speaker without a meeting bot.
- **STT** `[INFER / mixed]` The lineage streams audio to a cloud STT for low-latency partial transcripts. cheating-daddy/Glass wire up **Deepgram (Nova-family, streaming)** and/or **Gemini Live** and/or Whisper; the pattern is streaming interim results, then acting on `is_final`. Reviewers describe Cluely's transcription as English-first and error-prone (see Weaknesses), consistent with a streaming cloud STT tuned for speed over accuracy. *No public confirmation of which STT Cluely itself uses.*
- **LLM** `[INFER]` Cloud frontier model (reviewers say "GPT-4-class"; clones support GPT-4o, Gemini, Claude, and local LLMs via BYOK). Cluely has never confirmed its provider. `[INFER]` Likely multi-model, routing simple turns to a fast/cheap model and "Assist" to a stronger one.
- **Screen context** `[FACT]` Reads the screen via **OCR** (e.g., the coding question, a slide, a resume) and feeds it alongside the transcript. `[INFER]` Periodic screenshot → OCR (or a vision model) → text injected into the prompt. Some reviewers call this a **"context-stitching engine"** that fuses the audio stream + screen text into one prompt.
- **Grounding** `[FACT]` User-uploaded files (playbooks/docs) + CRM records are retrieved into the prompt — a RAG-style grounding layer. Direct analog to Kairos battlecards.
- **Pipeline shape** `[INFER]` `dual-audio capture → streaming STT (interim + final) → on turn-final, assemble prompt (transcript window + OCR screen text + retrieved playbook/CRM) → streaming LLM completion → tokens rendered into the GPU overlay`.

## Latency techniques (key section)

**Reality check first** `[FACT]`: Cluely **advertises ~300 ms** response latency, but independent testers (Business Insider; multiple reviewers; a dedicated LinkJob "how I fixed Cluely lag" writeup) report **5–10 seconds** (some 7–12 s) between a question being asked and a suggestion appearing — worst under pressure. So the 300 ms is best-case time-to-first-token under ideal conditions, not real end-to-end. Kairos should target *observed* latency, not a headline number.

Concrete techniques this architecture uses (or should use) to minimize end-to-end latency, audio→transcription→LLM→on-screen:

1. **Streaming STT with interim results** `[INFER]` — Don't wait for the speaker to finish. Consume partial/interim hypotheses continuously so the transcript is ready the instant the turn ends. Deepgram streaming (Nova) exposes `interim` + `is_final` + `SpeechStarted`/endpointing events; act on endpoint detection, not a fixed silence timer.
2. **VAD / endpointing to fire early** `[INFER]` — Use voice-activity + utterance-end events to detect the *end of the counterparty's turn* and kick off LLM inference immediately, rather than a conservative silence window. This is the single biggest lever on perceived latency.
3. **Streaming LLM completion (token-by-token)** `[FACT — Cluely changelog]` — Cluely's own changelog cites adding **"streaming (reduced time to first token)"** and states **"Live insights latency now ~40% faster on average."** Render tokens into the overlay as they arrive so the rep sees the first words in a few hundred ms, not after the full answer.
4. **Minimize time-to-first-token, not total generation** `[INFER]` — Optimize for TTFT (first useful words on screen) because the human only needs the opening to start talking. Short, punchy outputs; cap max tokens.
5. **Prompt kept small + pre-assembled** `[INFER]` — Keep a rolling transcript window (not the whole call), pre-embed/pre-retrieve playbook + CRM context so retrieval isn't on the hot path. Only the newest turn is appended at request time.
6. **Speculative / pre-fetch on partials** `[INFER]` — Begin drafting a suggestion from interim transcript before the turn fully ends, then reconcile on final. (Trades cost/occasional waste for latency.)
7. **Persistent warm connections** `[INFER]` — Long-lived streaming sockets to STT and LLM (no per-request TCP/TLS handshake), keeping the model "warm" to avoid cold-start.
8. **Two-tier model routing** `[INFER]` — Fast small model for continuous "live insights"/notes; escalate to a stronger model only on explicit **Cmd+Enter Assist**. Explains why passive insights feel quicker than on-demand answers.
9. **OCR off the hot path** `[INFER]` — Screen OCR runs on a slower cadence and is cached, so it never blocks the audio→answer loop.
10. **GPU-composited rendering** `[FACT/INFER]` — Rendering into the GPU overlay is cheap and doesn't fight the OS window manager, so display isn't a bottleneck once tokens arrive.

**Takeaway for Kairos:** the winning latency recipe is *streaming everywhere* (STT interim results + LLM token streaming), *fire on endpoint/VAD not silence-timeout*, *pre-retrieve battlecards off the hot path*, *optimize TTFT with short outputs*, and *warm persistent connections*. Cluely's real-world 5–10 s lag is a beatable bar; their own gains came specifically from adding LLM streaming.

## Weaknesses

- **Latency in practice** `[FACT]` 5–10 s (up to 12 s) real-world vs 300 ms advertised; worst at high-pressure moments. Long enough that interviewers notice eyes drifting to read.
- **Transcription accuracy** `[FACT]` Cluely claims 95%; a Trustpilot reviewer reported ~20% useful; general reports 60–80%. English-first, weak multilingual, no auto language detection.
- **Hallucination** `[FACT]` Generates confident nonsense when context is thin — dangerous in a live sales/interview setting.
- **Data breach** `[FACT]` Mid-2025, **83,000+ users** exposed (interview transcripts + screenshots) after admin credentials were left in a public GitHub repo. Major trust liability given the app captures your whole screen.
- **Trust / ethics / brand** `[FACT]` "Cheating" origin, CEO caught overstating $7M ARR, expelled-from-Columbia backstory; compliance certs self-attested/unverified. Reviewers (tl;dv) frame it as reputationally toxic for legitimate B2B use.
- **Billing complaints** `[FACT]` Trustpilot: refund runarounds, AI-only support denying refunds, billing after cancellation, surprise annual auto-charges.
- **Undetectability is paywalled** `[FACT]` The signature GPU-invisible overlay only works on the **$149.99/mo** tier.
- **Copycat-prone moat** `[FACT]` Fully cloned open-source in days (Glass/cheating-daddy). "Velocity is the moat, not the tech" — the architecture is not defensible.

## Sources

- https://cluely.com/ (product site — positioning, surfaces, hotkeys)
- https://docs.cluely.com/changelog (Cluely changelog — streaming/TTFT + "live insights 40% faster", transcript→Dashboard, mobile)
- https://www.finalroundai.com/blog/what-is-cluely-ai (how it works, OCR + audio + LLM, breach, pricing, origin)
- https://www.finalroundai.com/blog/cluely-ai-problems-review (issues/failures review)
- https://tldv.io/blog/cluely-review/ (deep review — latency, accuracy, GPU overlay, pricing table, ethics)
- https://www.linkjob.ai/hub/cluely-high-latency/ (first-hand "Cluely lag" testing — 7–12 s delays)
- https://github.com/pickle-com/glass (Glass — open-source Cluely clone; Electron, Rust audio, multi-LLM, Gemini)
- https://github.com/Natively-AI-assistant/natively-cluely-ai-assistant (Natively — clone; Deepgram Nova-3 + GPT-4o + Whisper stack references, stealth mode, local RAG/BYOK)
- https://github.com/Neurl-LLC/voice_ai_stack_deepgram (reference: Mic→Deepgram Nova-3→GPT-4o pipeline, ≤3000 ms round-trip pattern)
- https://quasa.io/media/the-ai-cheating-assistant-drama-cluely-s-meteoric-rise-pickle-s-open-source-clone-and-a-code-theft-scandal (Glass/cheating-daddy fork scandal)
- https://www.designwhine.com/interview-cluely-founder-roy-lee/ (Roy Lee founder interview)
- https://www.inc.com/leila-sheridan/an-a16z-backed-startup-that-helps-people-cheat-on-job-interviews-just-got-caught-in-a-7-million-lie-the-ceo-was-sweating/91313070 ($7M ARR admission)
- https://www.reddit.com/r/Cluely/ (user reports — mixed real-world latency/success)
