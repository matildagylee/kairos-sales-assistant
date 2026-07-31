# Deepgram Streaming STT — Minimum-Latency Config for a Real-Time Sales-Call Copilot

Goal: get transcripts + turn boundaries out of Deepgram's live WebSocket API as fast as possible, feeding an LLM, from a Chrome extension capturing tab audio (prospect) + mic (rep).

TL;DR: Use **Nova-3** on `/v1/listen` with `interim_results=true`, `endpointing=300`, `utterance_end_ms=1000`, `vad_events=true`, `no_delay=true`, `linear16 @ 16kHz`, and **`multichannel=true`** (rep = channel 0 mic, prospect = channel 1 tab) instead of diarization. For the lowest possible end-of-turn latency, consider **Flux** (`/v2/listen`) which replaces endpointing/utterance-end with a model-integrated turn detector. Send small (~50–100 ms / ~1600–3200 byte) `linear16` frames continuously.

---

## 1. Recommended low-latency config (parameter table)

| Parameter | Recommended value | What it does / latency rationale |
|---|---|---|
| `model` | `nova-3` | Deepgram's primary streaming model; docs quote **sub-300 ms streaming latency** with high accuracy. Use `nova-3` (English) or `nova-3` + `language=multi` if code-switching is needed (multilingual costs slightly more). |
| `language` | `en-US` (or `multi`) | Fixing the language avoids language-detection overhead. `multi` enables code-switching but is a pricier tier. |
| `encoding` | `linear16` | Raw PCM. No decode step server-side and no client-side encode step (vs Opus). Lowest end-to-end latency; larger bytes on the wire but negligible on a 1:1 call. |
| `sample_rate` | `16000` | 16 kHz is the STT sweet spot — full model accuracy with ~1/3 the bytes of 48 kHz. Downsample browser audio (48 kHz native) to 16 kHz in an AudioWorklet before sending. |
| `channels` / `multichannel` | `channels=2`, `multichannel=true` | Rep on ch 0 (mic), prospect on ch 1 (tab). Gives a clean per-speaker transcript with near-zero extra latency vs diarization (see §5). Each channel is billed separately (see §6). |
| `interim_results` | `true` | Streams preliminary transcripts (`is_final:false`) as audio arrives. This is your **fastest** signal to the LLM — do not wait for finals to start reasoning. Also **required** for `utterance_end_ms`. |
| `endpointing` | `300` (ms) | VAD-based; after this much silence, Deepgram finalizes a chunk with `speech_final:true`. Default is `10` ms (very eager but chatty). 300 ms is a good latency/stability balance for conversational speech; drop toward 100–200 ms for snappier finals at the cost of more fragmentation. Set `endpointing=false` to disable. |
| `utterance_end_ms` | `1000` | Fires an `UtteranceEnd` message after a 1000 ms word-gap. Robust to background noise (ignores non-speech). Do **not** go below 1000 — interims arrive ~every 1 s, so lower values add no benefit. Requires `interim_results=true`. |
| `vad_events` | `true` | Emits `SpeechStarted` the instant speech begins. Lets the copilot show "prospect is speaking" and pre-warm LLM calls before any transcript arrives. |
| `no_delay` | `true` | With `smart_format=true`, Deepgram normally buffers to finish formatting sequences (e.g. phone numbers/dates), adding delay. `no_delay=true` returns results instantly instead of waiting. **Turn this on for latency.** (Note: degrades redaction accuracy — irrelevant here since we don't redact.) |
| `smart_format` | `true` (optional) | Adds punctuation/formatting for LLM-readable text. Adds minor buffering, which `no_delay=true` mitigates. If you want absolute minimum latency and will let the LLM handle formatting, set `smart_format=false` + `punctuate=false`. |
| `punctuate` | `true` (or `false`) | Punctuation aids the LLM's turn/intent parsing. Small cost. Drop it for raw-speed mode. |
| `filler_words` | omit / `false` | Not needed; keeps transcript clean for the LLM. |

### Copy-pasteable WebSocket URL (Nova-3, low-latency, rep+prospect split)

```
wss://api.deepgram.com/v1/listen?model=nova-3&language=en-US&encoding=linear16&sample_rate=16000&channels=2&multichannel=true&interim_results=true&endpointing=300&utterance_end_ms=1000&vad_events=true&no_delay=true&smart_format=true&punctuate=true
```

Auth via header on connect: `Authorization: Token YOUR_DEEPGRAM_API_KEY` (or `?token=` / the `Sec-WebSocket-Protocol: token, <KEY>` pattern browsers require, since browser WebSocket can't set custom headers — use the subprotocol token auth or a short-lived key).

Raw-speed variant (LLM does formatting):
```
wss://api.deepgram.com/v1/listen?model=nova-3&language=en-US&encoding=linear16&sample_rate=16000&channels=2&multichannel=true&interim_results=true&endpointing=200&utterance_end_ms=1000&vad_events=true&smart_format=false&punctuate=false
```

---

## 2. Turn / end-of-thought detection strategy

You have three signals, fastest → most reliable:

1. **Interim results (`is_final:false`)** — arrive continuously (~every 1 s). Use these to stream partial context to the LLM *now*. Never block on finals.
2. **`SpeechStarted` (vad_events)** — earliest possible "someone started talking" edge. Use it to switch the active speaker and pre-warm.
3. **`speech_final:true` (endpointing)** — VAD-detected end after `endpointing` ms of silence. Fast, but **fragile in noisy audio**: background noise (music, ring tones) can keep the VAD "hot" and suppress `speech_final`. On a clean 1:1 sales call this is usually reliable.
4. **`UtteranceEnd` (utterance_end_ms)** — word-timing-based gap detector; **ignores non-speech noise**, so it fires even when `speech_final` doesn't.

**Recommended combined rule** (straight from Deepgram's guidance — run both endpointing + utterance-end, they're independent):
- Treat the speaker as *finished* when you get `speech_final:true` (a trailing `UtteranceEnd` can be ignored).
- If you get an `UtteranceEnd` with **no** preceding `speech_final:true`, treat the last-received transcript as final and send it to the LLM.

This gives you the speed of endpointing with UtteranceEnd as a noise-robust backstop — the right combo for live calls where prospect audio (tab) may have background noise.

**Fastest option — Deepgram Flux (`/v2/listen`):** Flux is a conversational STT model with **model-integrated turn detection** that *replaces* endpointing + utterance_end (which it lists as "replaced by model integrated turn detection") and interim results (replaced by Update Messages). It emits `StartOfTurn`, `EndOfTurn`, `Eager End of Turn`, and `Speech Resumed` events — purpose-built for "speaker finished a thought" with lower and more semantic end-of-turn latency than silence-based endpointing. Trade-offs vs Nova-3: Flux has **no smart formatting, no speaker diarization, and no multichannel-style splitting** in the same way, English + 10-language multilingual only. For a sales copilot where fastest turn-taking matters most, Flux is worth prototyping; if you need the rep/prospect channel split + smart formatting, stay on Nova-3 multichannel. (You could even run mic→Flux for the rep and tab→Flux for the prospect as two single-channel sockets.)

---

## 3. Quoted latency numbers

- **Nova-3 streaming: sub-300 ms latency** (Deepgram's "Measuring STT Latency" docs, Model Considerations → Nova-3).
- **Interim results cadence: ~every 1 second** — which is why `utterance_end_ms` below 1000 ms buys nothing.
- Deepgram bills and measures **per second of audio**. "Latency" in their model = time between the audio cursor and the returned transcript for that audio; the sub-300 ms figure is the model's contribution, on top of network RTT (browser → Deepgram) and your own audio buffer size. Keep your client-side chunk buffer small (§4) so it doesn't dominate.
- Endpointing/utterance-end add their configured silence window to *finalization* latency (e.g. 300 ms endpoint = ~300 ms after speech stops before `speech_final`). Interim latency is unaffected.

---

## 4. Browser capture pipeline (minimize added latency)

Capture:
- **Prospect audio** = tab audio via `chrome.tabCapture.capture({audio:true})` (extension) or `getDisplayMedia({audio:true})`.
- **Rep audio** = mic via `getUserMedia({audio:true})`.
- Feed both `MediaStream`s into one `AudioContext`. Route rep → channel 0, prospect → channel 1 with a `ChannelMergerNode` so you send **one stereo `linear16` stream** and let `multichannel=true` split it. (Simpler alternative: two separate WebSockets, one mono socket per source.)

Processing (all in an **AudioWorklet**, not the deprecated ScriptProcessor — Worklet runs on the audio thread with minimal added latency):
1. Downsample 48 kHz (browser native) → **16 kHz**.
2. Convert Float32 → **Int16 PCM (linear16)**.
3. Emit **small, frequent frames**: ~**50–100 ms** per chunk (≈1600–3200 bytes/ch at 16 kHz/16-bit). Small chunks = lower buffering latency; too small (<20 ms) wastes overhead. Send continuously via `ws.send(int16Buffer)`.

Guidance:
- **linear16 over Opus:** skip client-side Opus encoding — it adds encode latency and a server decode step. On a single 1:1 call the extra bandwidth is trivial.
- **Downsample to 16 kHz** rather than sending 48 kHz — full accuracy, 1/3 the bytes, less to transmit.
- Send a **KeepAlive** JSON message if audio pauses (Nova-3 socket times out at ~12 s of silence; Flux uses pings, 60 s).
- Don't batch chunks to "save requests" — stream them as produced.

---

## 5. Rep-vs-prospect separation (low overhead)

Use **`multichannel=true` with `channels=2`**, not diarization:
- Rep mic → channel 0, prospect tab → channel 1. Because they're already physically separated streams, each channel yields its own clean transcript with a `channel:[index,total]` tag (e.g. `[0,2]`). **No diarization guesswork, near-zero added latency**, and each speaker gets independent `speech_final` / `UtteranceEnd` events — ideal for a copilot that reacts to the *prospect* finishing a thought.
- Diarization (`diarize=true`) is only needed when speakers share one channel; it adds model work and can mislabel. Avoid it here.
- Cost note: multichannel is **billed per channel** (2 channels ≈ 2× minutes) — see §6.

---

## 6. Cost implications

Approximate Nova-3 streaming rates (Pay-As-You-Go, per minute of audio, opt-in to Model Improvement Program for listed pricing):
- **Nova-3 streaming (mono): ~$0.0048–0.0077/min.** (~$0.0048/min mono cited; ~$0.0077/min headline PAYG.)
- **Multilingual (`language=multi`): ~$0.0058/min.**
- **Growth plan: ~$0.0065/min** (~15% cheaper at volume vs PAYG).
- Billed **per second**, not rounded up to the minute.

Low-latency knobs (`interim_results`, `endpointing`, `vad_events`, `no_delay`, `utterance_end_ms`) are **free** — no price premium for turning them on.

**The real cost driver is `multichannel=true`: each channel is billed separately, so a 2-channel rep+prospect stream costs ~2× a mono stream** (mono ~$0.0048 → stereo ~$0.0096/min at that rate). For a 45-min sales call: ~$0.22 mono vs ~$0.43 stereo. Trade-off is worth it for clean speaker separation. If cost matters more than perfect separation, run mono and diarize, or run one socket and tag speaker by which source produced the audio client-side.

Opt out of the Model Improvement Program with `mip_opt_out=true` (forfeits the ~50% discount baked into listed pricing).

---

## Sources

- Measuring STT Latency — https://developers.deepgram.com/docs/measuring-streaming-latency
- Endpointing & Interim Results (config) — https://developers.deepgram.com/docs/understand-endpointing-interim-results
- Endpointing — https://developers.deepgram.com/docs/endpointing
- Utterance End — https://developers.deepgram.com/docs/utterance-end
- End of Speech Detection While Live Streaming (combined rule) — https://developers.deepgram.com/docs/understanding-end-of-speech-detection
- Interim Results — https://developers.deepgram.com/docs/interim-results
- Speech Started (vad_events) — https://developers.deepgram.com/docs/speech-started
- Smart Formatting / no_delay — https://developers.deepgram.com/docs/smart-format
- Multichannel — https://developers.deepgram.com/docs/multichannel
- Compare Flux to Nova-3 (turn detection, /v2/listen) — https://developers.deepgram.com/docs/flux/flux-nova-3-comparison
- Live Streaming API reference — https://developers.deepgram.com/reference/speech-to-text/listen-streaming
- Determining Your Audio Format — https://developers.deepgram.com/docs/determining-your-audio-format-for-live-streaming-audio
- Nova-3 pricing 2025/2026 breakdown — https://deepgram.com/learn/speech-to-text-api-pricing-breakdown-2025 ; https://convertaudiototext.com/blog/deepgram-nova-3-explained
