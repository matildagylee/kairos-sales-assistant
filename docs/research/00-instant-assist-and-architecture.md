# Kairos — Instant Assist: How It Works + Recommended Architecture

This is the synthesis doc. It answers the core question ("how does Cluely's Assist feel instant, and how do we replicate it?") and records the recommended end-to-end architecture + latency budget. Detail lives in `01`–`04`; this is the top-level summary.

---

## Part 1 — Why "instant Assist" feels instant

The key insight: **the answer is generated live every time. Nothing about the *answer* is pre-computed or cached.** What makes it fast is that all the expensive *input* work is done ahead of time, and the *output* is kept tiny and streamed.

### A. Caching the INPUT, not the answer

When an LLM answers, latency splits into two phases:

1. **Prefill** — the model reads and processes the *entire prompt*. A 10,000-token prompt (all battlecards + positioning + running transcript) must be chewed through before word one of the answer. Big chunk of time-to-first-token (TTFT).
2. **Decode** — the model writes the answer token by token (this is what streaming shows).

**Prompt caching** (Anthropic `cache_control`; the same idea Cluely uses) saves the *result of the prefill work* for a repeated prefix. Next turn, the model does not re-read those 10,000 tokens — it reuses the stored internal state and only prefills what's **new**: the fresh question (~20 tokens).

Sequence when Assist fires:
- Context (battlecards + transcript) = already read + cached → **skipped**.
- New question = ~20 tokens → prefilled in milliseconds.
- Answer = **computed live**, streamed out.

It feels instant not because the question was predicted, but because the "read all the source material" step was already done. **We do not and cannot cache the response.**

### B. The MATERIAL is pre-loaded (so any question is answerable)

You can't predict the question, so keep **all possible source material in the context at all times**. The corpus is tiny (9 battlecards + 9 personas + 12 proof points), so it all fits in the prompt permanently. Whatever the rep asks, the facts are already present — no "go fetch the right doc" round-trip. (This pattern = **CAG, cache-augmented generation**: the whole corpus lives in a cached prompt, collapsing retrieval and generation into one call.)

Two input-side optimizations, neither touching the answer:
1. **Keep all source material in the prompt** → no retrieval delay.
2. **Cache that prefix** → model doesn't re-read it each turn → sub-second TTFT.

### C. Why the answer GENERATION (decode) is also fast

Caching only fixes prefill/TTFT. Decode speed comes from three separate levers:

1. **Write fewer tokens.** Decode time ≈ output-tokens × time-per-token. Cap to ~3 bullets / ~150 tokens (`max_tokens` ~150 + stop sequence). ~5× faster than an 800-token answer. "One move, 3 bullets" is a latency decision, not just UX.
2. **Higher-throughput model.** Haiku 4.5 for the live loop (fastest tok/s + lowest TTFT); Opus 4.8 only for end-of-call notes where latency is irrelevant.
3. **Stream + headline-first.** First token in ~200–450ms; instruct the model to emit the actionable "one move" line *first* so the rep reads it while the rest streams. Perceived latency = TTFT, not total generation time.

**Caveat:** do NOT enable extended thinking / reasoning for the live copilot — that's the "LLM deliberating" delay, adds seconds. Direct answering only. Deliberation is fine for post-call notes.

---

## Part 2 — Recommended architecture (the whole loop)

1. **Capture** — tab audio (prospect) + mic (rep) merged into 2 channels, downsampled to 16kHz in an AudioWorklet.
2. **STT** — Deepgram `nova-3`, `multichannel=true`, `interim_results=true`, `endpointing=300`, `utterance_end_ms=1000`, `no_delay=true`, streaming in the service worker. Speaker separation for free via channels. (Browser WebSocket can't set an `Authorization` header — use token-subprotocol auth or a short-lived key.)
3. **Gate (local, <5ms)** — JS keyword/regex on competitor names + objection phrases decides if a turn is insight-worthy and *speculatively pre-selects* the battlecard from partial transcripts *before* the turn ends. Never an LLM call.
4. **Answer** — one **prompt-cached** Claude call: entire corpus resident in the cached prefix, only the fresh turn uncached. Haiku 4.5 for the live loop, streamed. No vector DB (a needless 50–300ms hop for a corpus this small).
5. **Render** — skeleton chip fires on trigger in <50ms (hides all TTFT), then stream a "one move" headline first, expand-for-depth.
6. **Proxy** — route the Anthropic key through a thin backend that streams SSE back; don't ship `sk-ant-` in the extension.

### End-to-end latency budget (end-of-utterance → first on-screen insight)

| Stage | Budget |
|---|---|
| Turn-end / endpointing | 250–400 ms |
| Local gating | <5 ms |
| Retrieval | ~0 (corpus in cache) |
| Network | 30–80 ms |
| Cached Claude TTFT | 200–450 ms |
| **Total** | **~0.8–1.3s typical, ~1.5s p95** |

Design to **p95** — TTFT is the variance driver. Beats the closest published analog (Salesforce SalesCopilot at 2.8s over a 2,490-FAQ RAG corpus) because this corpus is ~80× smaller and needs no RAG. Cluely's real-world end-to-end is often 5–10s, so ~1.5s is a genuinely beatable bar.

---

## Gap vs current build

Kairos today regenerates on a ~30s timer with serial retrieve→generate. Moving to the cached + gated + streaming loop above is what turns it into an instant Assist.

## Source docs
- `01-cluely-teardown.md` (ctx: `research-cluely`)
- `02-deepgram-latency.md` (ctx: `research-deepgram`)
- `03-llm-latency.md` (ctx: `research-llm-latency`)
- `04-retrieval-and-pipeline.md` (ctx: `research-pipeline`)
