# 03 — Minimizing LLM Latency for the Live Sales-Call Copilot

Goal: transcribed turn arrives → call Claude with battlecard grounding → **first useful token < 1s, full answer ~1–2s**, rendered in a Chrome side panel.

The single biggest lever is **prompt caching** (the battlecards + system prompt become a cached prefix, so only the fresh turn is processed at full cost/latency), combined with **streaming** (perceived TTFT) and **a fast model** (Haiku 4.5 for the live loop). Everything below is built around those three.

---

## 1. TTFT & streaming

**Why streaming matters.** The wall-clock time to a *complete* answer is dominated by output token generation (tokens/sec × output length). Streaming doesn't make the model faster, but it collapses **perceived** latency: the rep sees words appear as they're generated instead of staring at a spinner for 1–2s. For a live copilot this is the difference between "usable mid-call" and "too slow."

- Use the SDK streaming helper (`client.messages.stream(...)` / `.stream()` in JS). It accumulates state and exposes an incremental text iterator plus `.finalMessage()` for the complete result.
- **TTFT** (time to the first streamed token) is driven mostly by input-prefill time. Prefill scales with *uncached* input tokens — which is exactly why caching the battlecard prefix (Section 2) is the primary TTFT win. Cache-hit prefills skip re-processing the large static prefix, so first token arrives dramatically sooner.
- **Render partial tokens in the side panel:** append each `text_delta` to a DOM node as it streams. Handle the stream events: `message_start` → `content_block_delta` (each `text_delta` = a chunk to append) → `message_stop`. In a Chrome extension, do the `fetch` in the background service worker with `stream: true` and post deltas to the side-panel via `chrome.runtime` messaging, or stream directly from the side panel's own context.
- **Pre-warm the cache** at panel open / call start with a `max_tokens: 0` request so the first *real* turn doesn't eat the cold cache-write latency (see Section 2).

Practical target: with a cached prefix + Haiku 4.5 + streaming, first token in the low-hundreds-of-ms range is realistic; a capped 3-bullet answer completes in ~1s.

---

## 2. Prompt caching design (the core optimization)

**How it works.** Caching is a **prefix match**. The API caches the exact byte prefix up to a `cache_control` breakpoint. Any byte change *anywhere* in the prefix invalidates everything after it. Render order is always `tools` → `system` → `messages`, so stable content must physically come first and the volatile transcript turn must come last.

- Cache reads cost **~0.1×** input price; cache writes **1.25×** (5-min TTL) or **2×** (1-hour TTL). Break-even is ~2 requests — trivially worth it here since every turn reuses the same battlecards.
- **TTL:** default 5 min (`{"type":"ephemeral"}`); `{"type":"ephemeral","ttl":"1h"}` for a 1-hour cache. A live call has near-continuous turns, so each turn keeps the cache warm — the default 5-min TTL is fine; add a re-warm only if there are >5-min gaps. For a whole-call safety margin, `ttl:"1h"` avoids any mid-call cold write.
- **Minimum cacheable prefix:** 4096 tokens for Haiku 4.5 / Opus 4.8; 2048 for Sonnet 4.6. Battlecards + positioning + system prompt will easily exceed this — good.
- **Max 4 breakpoints** per request.

### Message layout (put the breakpoint after the static block, transcript turn stays uncached)

```
system:  [ { type: "text",
             text: "<role + instructions + ALL battlecards + positioning>",
             cache_control: { type: "ephemeral", ttl: "1h" } } ]   ← cached prefix

messages: [ { role: "user",
              content: "<the fresh transcribed turn only>" } ]      ← NOT cached, differs every turn
```

- The system block (system prompt + every battlecard + positioning) is byte-identical every turn → cache **hit** after the first request.
- Only the new transcript turn is processed at full input price/latency.
- **Do NOT put anything volatile in the prefix** — no `Date.now()`, no call ID, no rep name interpolated into the system prompt, no unsorted JSON. Any of these silently invalidates the cache (`cache_read_input_tokens` stays 0). If per-call context (rep, prospect, deal stage) is needed, put it in the **user turn**, not the system prefix — or use a mid-conversation `{"role":"system"}` message (beta) so the cached prefix stays intact.

### Expected impact

- **Latency:** prefill of the large static prefix is skipped on every cached turn → the dominant driver of TTFT for a grounded prompt disappears. This is the main reason sub-second first-token is achievable.
- **Cost:** the cached battlecard prefix bills at ~0.1× on every turn after the first. For a prompt that's ~95% static battlecards and ~5% fresh turn, this is roughly a **~90% input-cost reduction** on the repeated portion.

### Verify

Check `usage.cache_read_input_tokens` > 0 on the 2nd+ turn. If it's 0, a silent invalidator is in the prefix — diff the rendered bytes between two turns.

### Pre-warm

At call/panel start, send one `max_tokens: 0` request with the battlecard system block + a throwaway user message, `cache_control` on the last system block. It runs prefill (writes the cache) and returns immediately — the first real turn then hits a warm cache. (`max_tokens:0` can't be combined with `stream:true`, `output_config.format`, or forced `tool_choice`.)

---

## 3. Model choice

Live copilot = fast model (Haiku); end-of-call notes = bigger model (Sonnet/Opus). Haiku 4.5 has the lowest TTFT and highest tokens/sec, and is more than capable for "spot the objection, surface the counter" when the battlecard is already in context.

| Model | Relative TTFT | Relative tok/s | Use-case |
|---|---|---|---|
| **Haiku 4.5** (`claude-haiku-4-5`) | Lowest (fastest) | Highest | **Live copilot** — every real-time turn. $1/$5 per 1M. 200K ctx (ample with cached battlecards). |
| **Sonnet 4.6** (`claude-sonnet-4-6`) | Medium | Medium | Fallback when a turn needs deeper reasoning (complex multi-objection). End-of-call summary if Opus is overkill. $3/$15. |
| **Opus 4.8** (`claude-opus-4-8`) | Highest (slowest) | Lowest | **End-of-call notes / recap / follow-up email** — not latency-sensitive, wants max quality. $5/$25. |

Notes:
- Exact TTFT/tok-s numbers aren't published as fixed SLAs and vary with load; the **ordering** (Haiku fastest → Opus slowest) is stable and is what to design around. Benchmark your own prompts with `count_tokens` + timing before locking in.
- Keep effort/thinking **off** for the live loop: Haiku 4.5 doesn't take the `effort` param, and you want no thinking latency. For end-of-call Opus notes, adaptive thinking is fine (not latency-sensitive).
- **Don't switch models mid-conversation** if you're relying on the cache — caches are model-scoped, so a Haiku→Sonnet swap re-writes the cache. Run the live loop entirely on Haiku; do the Opus recap as a separate call.

---

## 4. Output shaping (cut generation time)

Output generation is the largest chunk of wall-clock time, so **shorter output = faster answer.** Force terseness hard:

- **`max_tokens` low.** For "3 bullets," ~150–256 tokens is plenty. This caps worst-case generation time. (Hitting the cap truncates, so size it to your format, not lower.)
- **Instruct format in the system prompt:** "Reply with at most 3 bullets, ≤12 words each. No preamble, no 'Here is'." Terse output is the single easiest generation-time win.
- **Stop sequences:** set a stop sequence (e.g. a sentinel after the 3rd bullet, or `"\n\n"`) to halt generation early if the model tries to keep going.
- **Structured/JSON output tradeoff:** structured outputs (`output_config.format`) guarantee parseable output but add a one-time schema-compilation cost on first use (then cached 24h) and can slightly constrain generation. For a live copilot, **plain terse text bullets stream faster and render more naturally** than JSON. Use JSON only if the side panel needs typed fields (e.g. `{objection, counter, proof_point}`); if so, keep the schema tiny. Note: structured outputs are incompatible with assistant prefill.

---

## 5. Trigger strategy (when to fire the LLM)

Firing Claude on *every* utterance is the biggest source of wasted latency, cost, and UI noise. Gate it.

1. **Debounce turns.** Wait for a natural pause / end-of-turn from the transcription (e.g. 300–800ms of silence) before firing, so you send a complete thought, not a half-sentence. Cancel the pending call if more speech arrives.
2. **Only fire on meaningful turns.** Run a **cheap local classifier first** — keyword/regex/embedding match for competitor names (from `gorgias-competitors.csv`), pricing/objection phrases ("too expensive," "already use," "integration," "contract"), buying signals. Only escalate to the Claude call when the classifier flags the turn. This eliminates most calls entirely.
   - The classifier can be pure JS (keyword/trie match on the competitor + objection lexicon) for ~0ms, or a Haiku "is this an objection/competitor mention? yes/no" call with `max_tokens: 5` if you need semantic detection. Prefer local first.
3. **Speculative / parallel calls (optional).** For known high-value triggers you can fire the grounded call *and* a fallback in parallel, or pre-fetch the likely battlecard, but with caching + Haiku the round-trip is already fast enough that this is usually unnecessary complexity. Debounce + classifier gate gives the biggest win.
4. **De-dup.** Don't re-fire for the same competitor/objection already surfaced this call — track surfaced items and suppress repeats.

Net effect: the LLM fires only a handful of times per call, each on a complete meaningful turn, against a warm cache — keeping both latency and cost low.

---

## 6. Anthropic latency features + CORS notes

**Service tiers.** Anthropic has Standard, Priority, and Batch tiers (`service_tier` param). **Priority Tier capacity commitments are no longer available to purchase** (existing commitments honored through contract end). So the realistic path is **Standard tier** for the live copilot — Standard is best-effort but fine for interactive volume. **Batch** is 50% cheaper but async (up to 24h) — use it only for non-real-time work (bulk post-call analysis), never the live loop.

- There is currently **no separate "latency-optimized inference" SKU** to toggle for these models — latency is optimized via caching, model choice, output shaping, and streaming (Sections 1–4), not a flag. Standard tier + prompt caching + Haiku + streaming is the recipe.
- Retry `429`/`529` overloaded errors with backoff (the SDK does this automatically); for a live copilot, prefer a fast local fallback ("no insight this turn") over blocking the UI on a retry.

**CORS / calling directly from a Chrome extension.**
- The Messages API does support browser-origin calls, but doing so **requires exposing your API key in the client**, which is a serious security risk for a distributed extension — anyone can extract it. **Do not ship the raw `ANTHROPIC_API_KEY` in the extension.** Route calls through a **thin backend proxy** you control (holds the key, forwards the streamed response). This also lets you centralize the cache-warming, classifier, rate-limiting, and per-user auth.
- If you must call directly (internal-only tool, keys you control), Anthropic provides a browser-access opt-in header (`anthropic-dangerous-direct-browser-access: true`) to allow CORS from the browser — the name is deliberately a warning. Even then, the key exposure problem stands.
- **Streaming through a proxy:** have the proxy call the Messages API with `stream: true` and pipe the SSE/chunked response straight through to the extension (a serverless function or small Node/edge service can forward the `ReadableStream`). The extension consumes deltas exactly as if it called Anthropic directly, but the key never leaves your server.
- In the extension, do the network call from the **background service worker** (declare the proxy host in `host_permissions`), and stream deltas to the side panel via `chrome.runtime` messaging.

**Recommended architecture:** Chrome extension (transcription + local classifier + debounce + side-panel render) → your streaming proxy (holds key, cache-warm, retries) → Anthropic Messages API (Haiku 4.5, cached battlecard prefix, streamed, terse). End-of-call notes go to a separate Opus 4.8 call (or Batch tier for bulk).

---

## Sources

- Anthropic `claude-api` skill (bundled): streaming (`python/claude-api/streaming.md`), prompt caching design (`shared/prompt-caching.md` — prefix match, TTLs, minimums, pre-warming, silent invalidators, cache-hit verification), models & pricing (`shared/models.md`), model migration / effort & thinking (`shared/model-migration.md`), output shaping / structured outputs (`shared/tool-use-concepts.md`).
- Anthropic docs — Service tiers: https://platform.claude.com/docs/en/api/service-tiers (Priority Tier closed to new purchase; Standard/Batch).
- Anthropic docs — Prompt caching: https://platform.claude.com/docs/en/build-with-claude/prompt-caching (automatic vs explicit breakpoints, `cache_control`, TTLs).
- Indexed under ctx source label `research-llm-latency` (service-tiers + prompt-caching pages) — query with `ctx_search(..., source: "research-llm-latency")`.
