# Retrieval & Real-Time Pipeline Architecture — Kairos Live Sales Copilot

Research date: 2026-07-31. Scope: retrieval strategy + end-to-end real-time loop for a Chrome-extension sales copilot. Corpus today: ~9 battlecards + 9 personas + 12 proof points (~30 docs) baked into JS.

---

## 1. Retrieval recommendation

**Verdict: the hypothesis holds. For a corpus of dozens of docs, local keyword/regex routing + a full-context prompt-cached LLM call beats a vector DB on latency, cost, and operational complexity. Do NOT stand up a vector DB.**

### The four approaches, ranked by end-of-utterance-to-retrieval-ready latency

| # | Approach | Retrieval latency | Network | Notes |
|---|----------|-------------------|---------|-------|
| 1 | **Local keyword/regex routing** (competitor names, objection phrases matched in JS) | **<1 ms** | none | Runs in-panel on the transcript turn. Zero infra. Picks the right card by string/pattern match. |
| 2 | **CAG — stuff everything, cached prompt, LLM picks** | **~0 ms retrieval** (cache read only) | 1 call (fused with generation) | No separate retrieval hop at all. Whole corpus (~30 docs) lives in a cached system prompt; the LLM selects and reasons in one pass. Prompt caching cuts TTFT and cost 80%+ on the cached prefix. Corpus is well under the "small stable corpus <500K tokens" CAG sweet spot. |
| 3 | **Client-side embeddings (transformers.js)** | **~40–90 ms** compute (after ~one-time model load) | none at query time | MiniLM-L6-v2 (384-dim, ~23 MB ONNX/WASM, WebGPU-accelerated). Brute-force cosine over dozens of vectors is trivially fast. But: first-load model download, main-thread blocking risk (needs a Web Worker), and it adds a whole subsystem to pick among 30 docs a regex already disambiguates. |
| 4 | **Hosted vector DB** (Pinecone/pgvector/etc.) | **~50–300 ms+** | +1 network round-trip | Adds an unavoidable network hop, embedding-API call, index sync, and ops burden. Justified only for large/fresh/per-tenant corpora and long-tail queries — none of which apply here. Refuted for this use case. |

### Recommended retrieval design (hybrid, no vector DB)

1. **Primary router = local keyword/pattern routing (approach 1).** Maintain a JS map of triggers → card IDs: competitor names/aliases ("Zendesk", "Gladly", "Klaviyo Customer Hub"), objection phrases ("too expensive", "already have", "integration", "security/SOC 2"), persona signals ("VP of CX", "founder"). Deterministic, auditable, 0 ms, and it is exactly how the corpus is structured (battlecard-per-competitor).
2. **Fallback / disambiguation = CAG (approach 2).** When the router is ambiguous or misses, don't retrieve — the entire ~30-doc corpus already sits in the **cached prompt**. The LLM sees everything and self-selects. So retrieval and generation collapse into one cached call; there is no separate retrieval latency to budget.
3. **Skip embeddings and vector DB entirely.** Revisit transformers.js only if the corpus grows past ~200–300 docs *and* keyword routing recall degrades. Revisit a hosted vector DB only if the corpus becomes large, per-customer, or freshness-sensitive.

**Why this wins:** the corpus is small, stable, and already keyed by competitor/objection. Keyword routing is O(0 ms) and picks the right card ~all the time on named-entity triggers; CAG covers the fuzzy tail with zero extra hops because the docs are already resident in cache. A vector DB would add 50–300 ms of network for a disambiguation problem `regex + a cached prompt` already solves.

---

## 2. Intent / trigger detection

**Question 1: is this turn insight-worthy?** **Question 2: which card applies?** Both should be answered locally, cheaply, on-device, before any LLM call fires.

### Options ranked

| Approach | Latency | Where | Verdict |
|----------|---------|-------|---------|
| **Local keyword/pattern matching** (regex over the turn: competitor names, objection lexicon, question markers "?", "how do you", "what about") | **<1 ms** | in-panel JS | **Primary trigger.** Same table as the retrieval router — one pass answers both "worthy?" and "which card?". Invisible to the rep. |
| **Fast small-model classifier** (fine-tuned MiniLM/DistilBERT intent head, or transformers.js zero-shot) | **~10–90 ms** on-device; ~100–300 ms if hosted | Web Worker or backend | Optional second gate for fuzzy objections a keyword misses (paraphrased pushback with no named entity). Adds a subsystem; defer unless keyword recall proves weak. |
| **LLM classifier call** | 200–600 ms + network | backend | **Avoid as a gate.** Every turn would pay an LLM round-trip just to decide whether to call the LLM. Don't. |

### Recommended trigger logic
- **Debounce on turn boundaries, not partials.** Fire detection only on a *finalized* Deepgram transcript turn (use Deepgram's `is_final` / `speech_final` / endpointing), and debounce ~250–400 ms of silence so mid-sentence partials don't spam the router.
- **Two-tier gate:** (1) keyword/pattern hit → immediately eligible; (2) if no keyword hit but the turn ends in a question directed at the rep, optionally run the small-model classifier. Only turns passing the gate proceed to the LLM.
- **Cooldown/dedup:** suppress re-firing the same card within an N-second window to avoid flooding the rep with the same battlecard on a back-and-forth.

Intent classifiers routinely run sub-millisecond (keyword) to tens of ms (small transformer) and are effectively invisible in the loop; the LLM call is the only stage worth a real latency budget.

---

## 3. Real-time loop architecture

### Where each stage runs

- **Audio capture + Deepgram STT streaming** → **service worker** (persistent, survives panel focus changes, holds the WebSocket to Deepgram). Streaming STT returns partials continuously so nothing waits on end-of-utterance to start.
- **Trigger detection + keyword routing** → **in-panel JS** (or a Web Worker off the main thread) — pure string ops on the finalized turn, <1 ms, no network.
- **LLM insight generation** → **backend / edge proxy** (never call Claude directly from the extension: hides the API key, enables prompt-cache reuse across turns, co-locates near the model). Streams tokens back over SSE/WebSocket.
- **Render** → **in-panel React/DOM**, updated token-by-token.

### Pipelining — overlap, don't serialize

The whole point of hitting ~1.5 s is that STT, retrieval, and LLM are **not strictly serial**:

- STT streams **while the prospect is still talking** → its incremental cost at end-of-turn is near-zero (the transcript is already ~complete when they stop).
- Keyword routing runs the instant a partial contains a trigger token — the right card can be **pre-selected before the turn even ends** (speculative retrieval), then confirmed on `speech_final`.
- The prompt is **pre-warmed**: the full corpus lives in a cached system prompt, so the LLM call pays only the small per-turn suffix, not re-ingesting 30 docs each time.
- LLM **streams tokens** → the rep sees the first words of the insight long before the full answer is generated (TTFT is what they feel, not total generation time).

### Text stage diagram

```
[Prospect speaks] ──audio──▶ (service worker) ──WS──▶ Deepgram STT
                                                   │  (streaming partials, continuous)
                                                   ▼
      ┌───────────────── partial transcript ───────────────┐
      │  (in-panel JS)  keyword/regex router runs on EACH   │
      │  partial → SPECULATIVELY pre-selects candidate card │
      └───────────────────────────┬────────────────────────┘
                                   │ Deepgram speech_final (turn end)
                                   ▼
              [Trigger gate]  keyword hit? question? cooldown ok?
                   │ no → drop (no LLM call)
                   │ yes
                   ▼
   Confirm card from router  ──(card already in cached prompt; no retrieval hop)──┐
                                                                                  ▼
                                          (backend proxy) ── Claude, prompt-CACHED corpus
                                                                                  │  stream SSE
                                   ┌──────────────────────────────────────────────┘
                                   ▼
        (in-panel) skeleton chip appears INSTANTLY on trigger ──▶ tokens stream in
                   "one move" headline first ──▶ expand on demand
```

### How the incumbents structure this
- **Cluely** — translucent always-on-device overlay; listens to system audio + screen, never joins the call as a bot, surfaces prompts *while the rep speaks*. Model for the non-intrusive, low-latency, on-device UX.
- **Salesforce SalesCopilot (arXiv 2603.21416)** — closest published analog: streaming STT → LLM-based question detection → RAG over a structured product DB → dashboard render. Reports **~2.8 s mean response time**, 100% question-detection, 14× faster than manual CRM lookup — over a *2,490-FAQ* corpus. Kairos's corpus is ~80× smaller, so its retrieval stage should be far cheaper (keyword + cache, not RAG), making the ~1.5 s target realistic.
- **Gong / Fireflies / Otter / Attention** — mostly **post-call or near-real-time** transcription + analysis; heavier async pipelines, not sub-2s in-call nudges. Kairos is deliberately closer to the Cluely/SalesCopilot real-time end of the spectrum.

---

## 4. Streaming UX — make it *feel* instant

Perceived latency ≠ actual latency. Levers, in order of impact:

1. **Instant skeleton on trigger (before any token).** The moment the keyword gate fires, render a card shell / shimmer chip ("Handling: *Zendesk pricing objection*…"). This claims the screen in <50 ms and hides the entire LLM TTFT.
2. **Stream partial tokens.** Render Claude's tokens as they arrive. The rep reads the first line while generation continues — TTFT (~200–400 ms) is the only delay they perceive, not full completion.
3. **"One move" first, then expand.** Generate and show a single punchy headline (the counter-move / one-liner) first; put proof points, stats, and the full talk track behind an expand/"more" affordance. The rep gets a usable answer in one glance; depth is opt-in.
4. **Progressive disclosure ordering.** Structure the prompt so the model emits headline → key stat → talk-track, in that order, so the most-actionable text streams first.
5. **Speculative pre-render.** Because the router can pre-select a card from partials, optimistically show the *static* card content (from the local JS corpus) instantly, then let the LLM stream the *tailored* insight on top. Static content needs zero LLM wait.
6. **Never block the main thread** — STT and any classifier run in the service worker / Web Worker so the panel stays responsive.

---

## 5. End-to-end latency budget

Target: **~1.5 s from end-of-utterance to first on-screen insight.** Because STT streams during speech and the corpus is cache-resident, the only stages on the critical path after the prospect stops talking are endpointing, the trigger gate, and LLM TTFT.

| Stage | Budget | Runs where | Notes |
|-------|--------|-----------|-------|
| Audio capture → Deepgram partials | overlapped (≈0 at turn end) | service worker → Deepgram WS | Streams *during* speech; transcript ~complete when prospect stops. Not on the post-utterance critical path. |
| Turn-end detection (endpointing / debounce) | **250–400 ms** | Deepgram `speech_final` + local debounce | Biggest fixed cost; trades responsiveness vs. cutting the prospect off. Tunable. |
| Trigger gate + keyword routing | **<5 ms** | in-panel JS | Often already done speculatively on partials → effectively 0. |
| Retrieval | **~0 ms** | — | No hop: card is in the cached prompt (or pre-selected from static corpus). |
| Network: extension → backend proxy | **30–80 ms** | edge | Co-locate proxy near the rep region + near the model. |
| **LLM TTFT (prompt-cached)** | **200–450 ms** | backend → Claude | Cache read on the ~30-doc corpus; only the small per-turn suffix is fresh. Dominant model cost. |
| Skeleton render | **<50 ms** (fires at trigger, hides everything after it) | in-panel | Perceived start ≪ everything below it. |
| First streamed tokens → visible insight | **50–150 ms** after TTFT | in-panel | Token stream renders incrementally. |
| **Total, end-of-utterance → first on-screen insight** | **~0.8–1.3 s typical, ~1.5 s p95** | | Comfortably inside target. Skeleton makes *perceived* start ~300–450 ms. |

**p95 discipline:** design to p95, not the demo average. LLM TTFT is the variance driver (p50 ~500 ms can spike to ~2.2 s p95). Mitigate with prompt caching (already assumed), a smaller/faster model tier for the first "one move," provider fallback, and the skeleton that decouples *perceived* latency from TTFT variance.

---

## 6. Sources

- AlterSquare — *Building a Production Voice Agent: The Latency Budget Nobody Talks About*: https://altersquare.io/blog/production-voice-agent-latency-budget
- The Prompt Bench — *Latency Budgets for Real-Time Voice* (600 ms classical-pipeline breakdown): https://thepromptbench.com/voice-and-realtime/latency-budgets-for-realtime-voice/
- LiveKit — *Voice Agent Architecture: STT, LLM, TTS Pipelines Explained* (streaming vs sequential, per-stage targets): https://livekit.com/blog/voice-agent-architecture-stt-llm-tts-pipelines-explained
- Retell AI — *How Real-Time Voice AI Actually Works*: https://www.retellai.com/blog/how-real-time-voice-ai-works-stt-llm-tts
- PromptHub — *RAG vs. Cache-Augmented Generation* (CAG for small stable corpora, prompt-cache latency): https://www.prompthub.us/blog/retrieval-augmented-generation-vs-cache-augmented-generation
- FutureAGI — *RAG vs CAG: Choosing Cache-Augmented Generation in 2026*: https://futureagi.com/blog/rag-vs-cag-cache-augmented-generation-2026/
- SitePoint — *Building a Privacy-Preserving RAG System in the Browser* (transformers.js, MiniLM, client-side vectors): https://www.sitepoint.com/browser-based-rag-private-docs/
- MachineLearningMastery — *Semantic Search with Transformers.js* (in-browser embedding query times, brute-force limits): https://machinelearningmastery.com/building-semantic-search-with-transformers-js-and-sentence-embeddings/
- Salesforce AI Research — *Enterprise Sales Copilot: Real-Time AI Support with Automatic Information Retrieval in Live Sales Calls* (arXiv 2603.21416; streaming STT + LLM question detection + RAG, 2.8 s response): https://arxiv.org/html/2603.21416
- Cluely — AI sales copilot (always-on-device overlay UX): https://www.cluelyai.com/
- Intent Detection in the Age of LLMs (classifier vs LLM latency trade-offs): https://arxiv.org/html/2410.01627v1
