// Gorgias Sales Call Companion — side panel: Claude copilot + live call notes.
(function () {
  const BATTLECARDS = window.BATTLECARDS || {};
  const FOUNDATION = window.FOUNDATION || { positioning: {}, personas: {} };
  const PROOFPOINTS = window.PROOFPOINTS || {};
  const CUSTOMER_STORIES = window.CUSTOMER_STORIES || [];
  const PODCAST = window.PODCAST || [];
  const SALES_DATA = window.SALES_DATA || { roadmap: {} };

  const $ = (id) => document.getElementById(id);
  const els = {
    gear: $("gear"), settings: $("settings"), banner: $("banner"), bannerOpen: $("banner-open"),
    apiKey: $("api-key"), dgKey: $("dg-key"), model: $("model"), save: $("save-settings"),
    brand: $("brand"), vertical: $("vertical"), competitor: $("competitor"), persona: $("persona"),
    chat: $("chat"), suggest: $("suggest"), input: $("input"), send: $("send"),
    copilotView: $("copilot-view"), notesView: $("notes-view"),
    recBtn: $("rec-btn"), recStatus: $("rec-status"), consent: $("consent"),
    notesOut: $("notes-out"), transcriptWrap: $("transcript-wrap"), transcript: $("transcript"),
    notesActions: $("notes-actions"), copyNotes: $("copy-notes"), refreshNotes: $("refresh-notes"),
  };

  const settings = { apiKey: "", deepgramKey: "", model: "claude-opus-4-8" };
  const ctx = { brand: "", vertical: "", competitor: "", persona: "" };
  let history = [];
  let busy = false;

  // ---------- Populate controls ----------
  Object.entries(BATTLECARDS).sort((a, b) => a[1].name.localeCompare(b[1].name))
    .forEach(([k, c]) => els.competitor.add(new Option(c.name, k)));
  Object.keys(FOUNDATION.personas || {}).forEach((p) => els.persona.add(new Option(p, p)));

  // ---------- Storage ----------
  chrome.storage.local.get(["gsccSettings", "gsccCtx"], (r) => {
    if (r.gsccSettings) Object.assign(settings, r.gsccSettings);
    if (r.gsccCtx) Object.assign(ctx, r.gsccCtx);
    els.apiKey.value = settings.apiKey || "";
    els.dgKey.value = settings.deepgramKey || "";
    els.model.value = settings.model || "claude-opus-4-8";
    els.brand.value = ctx.brand || ""; els.vertical.value = ctx.vertical || "";
    els.competitor.value = ctx.competitor || ""; els.persona.value = ctx.persona || "";
    updateBanner(); updateSuggestions();
    if (!els.chat.children.length) renderEmpty();
  });
  function saveSettings() {
    settings.apiKey = els.apiKey.value.trim();
    settings.deepgramKey = els.dgKey.value.trim();
    settings.model = els.model.value;
    chrome.storage.local.set({ gsccSettings: settings });
    updateBanner();
  }
  function saveCtx() { chrome.storage.local.set({ gsccCtx: ctx }); }

  // ---------- Formatting ----------
  function esc(s) { const d = document.createElement("div"); d.textContent = s == null ? "" : s; return d.innerHTML; }
  function fmt(text) {
    const lines = esc(text).split("\n");
    let html = "", inList = false;
    const inline = (s) => s
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    for (let line of lines) {
      const bullet = line.match(/^\s*[-•]\s+(.*)/);
      const header = line.match(/^#{1,4}\s+(.*)/);
      if (bullet) { if (!inList) { html += "<ul>"; inList = true; } html += `<li>${inline(bullet[1])}</li>`; continue; }
      if (inList) { html += "</ul>"; inList = false; }
      if (header) html += `<h4>${inline(header[1])}</h4>`;
      else if (line.trim()) html += `<div>${inline(line)}</div>`;
    }
    if (inList) html += "</ul>";
    return html;
  }
  function scrollDown(el) { el.scrollTop = el.scrollHeight; }
  function renderEmpty() { els.chat.innerHTML = `<div class="empty">Pick a competitor and persona, or just ask.<br>Loaded from your live Notion battlecards.</div>`; }
  function addBubble(who, cls) {
    const wrap = document.createElement("div");
    wrap.className = "msg " + (who === "You" ? "user" : "assistant");
    wrap.innerHTML = `<div class="who">${esc(who)}</div><div class="bubble ${cls || ""}"></div>`;
    els.chat.appendChild(wrap); scrollDown(els.chat);
    return wrap.querySelector(".bubble");
  }

  // ---------- Static battlecard ----------
  function renderCard(key) {
    const c = BATTLECARDS[key]; if (!c) return;
    if (els.chat.querySelector(".empty")) els.chat.innerHTML = "";
    const b = addBubble("Battlecard", "brief");
    const link = c.notionUrl ? ` · <a href="${esc(c.notionUrl)}" target="_blank">open card</a>` : "";
    const sub = [c.lastEdited && c.lastEdited !== "unknown" ? "updated " + esc(c.lastEdited) : ""].filter(Boolean).join("");
    const say = (c.quickDismiss || "").split(/(?<=[.!?])\s+/)[0];
    const li3 = (arr) => (arr || []).slice(0, 3).map((x) => `<li>${esc(x)}</li>`).join("");
    b.innerHTML = `
      <div class="card-head">
        <div class="card-title">${esc(c.name)} <span class="vs">vs Gorgias</span></div>
        <div class="card-sub">${sub}${link}</div>
      </div>
      ${say ? `<div class="say"><span>Say this</span>${esc(say)}</div>` : ""}
      <h4>Why we win</h4><ul>${li3(c.whyWeWin)}</ul>
      <h4>Their weakness</h4><ul>${li3(c.theirWeakness)}</ul>`;
    scrollDown(els.chat);
  }

  // ---------- Knowledge base + prompts ----------
  function verticalProof() {
    const v = ctx.vertical;
    if (v && PROOFPOINTS[v]) return PROOFPOINTS[v];
    return null;
  }
  function matchingStory() {
    const c = BATTLECARDS[ctx.competitor];
    const compName = c && c.name ? c.name.toLowerCase() : "";
    return CUSTOMER_STORIES.find((st) =>
      (ctx.vertical && st.vertical === ctx.vertical) ||
      (compName && st.prevHelpdesk && compName.includes(st.prevHelpdesk.toLowerCase()))
    ) || null;
  }
  function knowledgeBase() {
    return JSON.stringify({
      positioning: FOUNDATION.positioning,
      competitors: BATTLECARDS,
      personas: FOUNDATION.personas,
      proofPoints: PROOFPOINTS,
      customerStories: CUSTOMER_STORIES,
      podcast: PODCAST,
      roadmap: SALES_DATA.roadmap,
    });
  }
  function contextLine() {
    const c = BATTLECARDS[ctx.competitor];
    return [
      ctx.brand ? `Brand on the call: ${ctx.brand}.` : "",
      ctx.vertical ? `Vertical: ${ctx.vertical.replace(/_/g, " ")}.` : "",
      c ? `Competitor in play: ${c.name} (battlecard last updated ${c.lastEdited}, Notion: ${c.notionUrl}).` : "",
      ctx.persona ? `Talking to: ${ctx.persona}.` : "",
    ].filter(Boolean).join(" ");
  }
  const STYLE_RULES = [
    "STYLE (strict):",
    "- Plain language. No jargon, no buzzwords, no filler. Write like you are talking to a busy rep on a call.",
    "- Bullet points, short. Lead with the answer. No preamble like 'Here is' or 'Sure'.",
    "- Never use em dashes. Use commas, parentheses, or short sentences.",
    "- Cite your sources. When you use a battlecard claim, link to that competitor's Notion card using its notionUrl as a markdown link, e.g. [Intercom battlecard](URL). Mention when it was last updated.",
    "- When the brand's vertical is known and a matching proof point exists, include ONE proof point (brand + metric) as a markdown link to its sourceUrl.",
    "- For a fuller story, use customerStories: prefer one whose vertical matches the brand, or whose prevHelpdesk matches the competitor being switched from. Give the brand, the headline metric, one short line, and a markdown link to its url.",
    "- Roadmap: you may reference roadmap.shippedRecently and roadmap.nextThreeMonths freely. NEVER promise or give a date for roadmap.horizon items, they are exploratory bets, not commitments. If asked about something only in horizon, say it is being explored, no timeline.",
    "- Only use facts from the knowledge base. If it is not covered, say so in one line.",
  ].join("\n");
  function copilotSystem() {
    const cl = contextLine();
    return [
      "You are a live sales-call copilot for a Gorgias Account Executive. Gorgias is the Conversational Commerce platform for Shopify brands.",
      STYLE_RULES, "",
      cl ? "CURRENT CALL CONTEXT: " + cl : "",
      "", "KNOWLEDGE BASE (JSON):", knowledgeBase(),
    ].join("\n");
  }
  function notesSystem() {
    return [
      "You are a note-taker for a Gorgias sales rep, working from a live call transcript.",
      "Produce clean, current call notes. Rewrite the full notes each time from the whole transcript.",
      STYLE_RULES, "",
      "Use these sections (skip any with nothing yet):",
      "- **Summary** (2-3 bullets)",
      "- **Customer needs / pain**",
      "- **Objections raised** — for each, the objection and the Gorgias answer, linking the relevant battlecard Notion card",
      "- **Competitors mentioned**",
      "- **Proof point to send** — if the vertical matches one, a brand + metric with its source link",
      "- **Action items**",
      "- **Suggested next step**",
      "", "CURRENT CALL CONTEXT: " + (contextLine() || "none set"),
      "", "KNOWLEDGE BASE (JSON):", knowledgeBase(),
    ].join("\n");
  }

  // ---------- Claude streaming ----------
  async function callClaude(messages, onDelta, systemText) {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": settings.apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({ model: settings.model || "claude-opus-4-8", max_tokens: 1500, system: systemText, messages, stream: true }),
    });
    if (!resp.ok) {
      let detail = resp.status + " " + resp.statusText;
      try { const j = await resp.json(); if (j.error && j.error.message) detail = j.error.message; } catch (e) {}
      throw new Error(detail);
    }
    const reader = resp.body.getReader(); const dec = new TextDecoder();
    let buf = "", full = "";
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n"); buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim(); if (!data) continue;
        try { const ev = JSON.parse(data); if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") { full += ev.delta.text; onDelta(full); } } catch (e) {}
      }
    }
    return full;
  }

  // ---------- Copilot ----------
  async function run(userText, opts) {
    opts = opts || {};
    if (busy) return;
    if (!settings.apiKey) { openSettings(); return; }
    busy = true; els.send.disabled = true;
    if (els.chat.querySelector(".empty")) els.chat.innerHTML = "";
    if (opts.showUser !== false) addBubble("You", "").textContent = userText;
    history.push({ role: "user", content: userText });
    const bubble = addBubble("Gorgias Copilot", "");
    bubble.innerHTML = "<span class='meta'>thinking…</span>";
    try {
      const text = await callClaude(history, (p) => { bubble.innerHTML = fmt(p); scrollDown(els.chat); }, copilotSystem());
      history.push({ role: "assistant", content: text });
    } catch (e) { bubble.innerHTML = `<span class="meta">⚠ ${esc(e.message)}</span>`; }
    finally { busy = false; els.send.disabled = false; }
  }
  function proactiveBrief() {
    if (!settings.apiKey || !ctx.competitor) return;
    const c = BATTLECARDS[ctx.competitor];
    const who = ctx.persona ? ` to a ${ctx.persona}` : "";
    const brand = ctx.brand ? ` at ${ctx.brand}` : "";
    run(`My opening play against ${c.name}${brand}${who}: the one-line dismiss, the sharpest wedge, one discovery question. Keep it to 4 bullets.`, { showUser: false });
  }
  function updateSuggestions() {
    const c = BATTLECARDS[ctx.competitor];
    const brand = (ctx.brand || "").trim();
    // Always four quick questions: competitor stacking, customer proof, roadmap, objection.
    const s = [
      // 1. Competitor stacking
      c ? `How do we stack up vs ${c.name}? Give me the head-to-head.`
        : "How does Gorgias stack up vs the main competitors?",
      // 2. Customer proof
      (matchingStory() || verticalProof())
        ? `Customer proof that fits ${brand || "this brand"}`
        : "Give me a customer proof point to use",
      // 3. Roadmap
      "What's on the roadmap I can tease?",
      // 4. Objection handling
      c ? `Top objection vs ${c.name} and how to answer it`
        : (ctx.persona ? `Top objection for ${ctx.persona} and how to answer it`
                       : "Handle the price objection"),
    ];
    els.suggest.innerHTML = "";
    s.forEach((q) => { const b = document.createElement("button"); b.textContent = q; b.onclick = () => { switchTab("copilot"); run(q); }; els.suggest.appendChild(b); });
  }

  // ---------- Live call notes ----------
  let recording = false, dgSocket = null, mediaRecorder = null, audioCtx = null, keepAlive = null, notesTimer = null;
  let transcript = "", lastNotesLen = 0, notesBusy = false, tabStream = null, micStream = null;

  function setRecStatus(msg) { els.recStatus.textContent = msg || ""; }

  async function startRecording() {
    if (recording) return;
    if (!settings.apiKey) { openSettings(); return; }
    if (!settings.deepgramKey) { setRecStatus("Add a Deepgram key in settings first."); openSettings(); return; }
    setRecStatus("starting…");
    try {
      const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id });
      tabStream = await navigator.mediaDevices.getUserMedia({ audio: { mandatory: { chromeMediaSource: "tab", chromeMediaSourceId: streamId } } });
      try { micStream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e) { micStream = null; }

      audioCtx = new AudioContext();
      const dest = audioCtx.createMediaStreamDestination();
      const tabSrc = audioCtx.createMediaStreamSource(tabStream);
      tabSrc.connect(dest);
      tabSrc.connect(audioCtx.destination); // keep the call audible to the rep
      if (micStream) audioCtx.createMediaStreamSource(micStream).connect(dest);

      const url = "wss://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&punctuate=true&interim_results=false";
      dgSocket = new WebSocket(url, ["token", settings.deepgramKey]);
      dgSocket.onopen = () => {
        const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
        mediaRecorder = new MediaRecorder(dest.stream, { mimeType: mime });
        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0 && dgSocket && dgSocket.readyState === 1) dgSocket.send(e.data); };
        mediaRecorder.start(250);
        keepAlive = setInterval(() => { if (dgSocket && dgSocket.readyState === 1) dgSocket.send(JSON.stringify({ type: "KeepAlive" })); }, 5000);
        setRecStatus("listening" + (micStream ? " (call + your mic)" : " (call audio)"));
      };
      dgSocket.onmessage = (ev) => {
        try {
          const d = JSON.parse(ev.data);
          if (d.type === "Results" && d.is_final) {
            const t = d.channel && d.channel.alternatives && d.channel.alternatives[0].transcript;
            if (t) { transcript += (transcript ? " " : "") + t; els.transcript.textContent = transcript; }
          }
        } catch (e) {}
      };
      dgSocket.onerror = () => setRecStatus("transcription error (check Deepgram key)");
      dgSocket.onclose = () => { if (recording) setRecStatus("disconnected"); };

      recording = true;
      els.recBtn.textContent = "■ Stop notes"; els.recBtn.classList.add("live");
      els.consent.style.display = "block"; els.transcriptWrap.style.display = "block"; els.notesActions.style.display = "flex";
      els.notesOut.innerHTML = `<div class="empty">Listening… first notes in ~30s.</div>`;
      notesTimer = setInterval(refreshNotes, 30000);
    } catch (e) {
      setRecStatus("could not start: " + e.message);
      cleanupAudio();
    }
  }

  function cleanupAudio() {
    if (keepAlive) clearInterval(keepAlive), (keepAlive = null);
    if (notesTimer) clearInterval(notesTimer), (notesTimer = null);
    try { if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop(); } catch (e) {}
    try { if (dgSocket && dgSocket.readyState === 1) { dgSocket.send(JSON.stringify({ type: "CloseStream" })); dgSocket.close(); } } catch (e) {}
    [tabStream, micStream].forEach((s) => { if (s) s.getTracks().forEach((t) => t.stop()); });
    try { if (audioCtx) audioCtx.close(); } catch (e) {}
    mediaRecorder = null; dgSocket = null; audioCtx = null; tabStream = null; micStream = null;
  }
  function stopRecording() {
    if (!recording) return;
    recording = false;
    els.recBtn.textContent = "● Start notes"; els.recBtn.classList.remove("live");
    els.consent.style.display = "none";
    setRecStatus("stopped");
    cleanupAudio();
    refreshNotes(); // final pass
  }

  async function refreshNotes(force) {
    if (notesBusy) return;
    if (!settings.apiKey) return;
    if (!transcript || (!force && transcript.length - lastNotesLen < 40)) return;
    notesBusy = true; lastNotesLen = transcript.length;
    const target = els.notesOut;
    if (target.querySelector(".empty")) target.innerHTML = "";
    let bubble = target.querySelector(".bubble");
    if (!bubble) { bubble = document.createElement("div"); bubble.className = "bubble"; target.innerHTML = ""; target.appendChild(bubble); }
    try {
      await callClaude([{ role: "user", content: "Live call transcript so far:\n\n" + transcript }], (p) => { bubble.innerHTML = fmt(p); }, notesSystem());
    } catch (e) { setRecStatus("notes error: " + e.message); }
    finally { notesBusy = false; }
  }

  // ---------- Tabs ----------
  function switchTab(name) {
    document.querySelectorAll("#tabs button").forEach((b) => b.classList.toggle("on", b.dataset.tab === name));
    els.copilotView.style.display = name === "copilot" ? "flex" : "none";
    els.notesView.style.display = name === "notes" ? "flex" : "none";
  }
  document.querySelectorAll("#tabs button").forEach((b) => (b.onclick = () => switchTab(b.dataset.tab)));

  // ---------- Banner / settings ----------
  function updateBanner() { els.banner.style.display = settings.apiKey ? "none" : "block"; }
  function openSettings() { els.settings.classList.add("open"); }
  els.gear.onclick = () => els.settings.classList.toggle("open");
  els.bannerOpen.onclick = openSettings;
  els.save.onclick = () => { saveSettings(); els.settings.classList.remove("open"); };

  // ---------- Control events ----------
  els.brand.addEventListener("input", (e) => { ctx.brand = e.target.value; saveCtx(); });
  els.vertical.addEventListener("change", (e) => { ctx.vertical = e.target.value; saveCtx(); updateSuggestions(); });
  els.competitor.addEventListener("change", (e) => {
    ctx.competitor = e.target.value; saveCtx(); updateSuggestions();
    if (ctx.competitor) { renderCard(ctx.competitor); proactiveBrief(); }
  });
  els.persona.addEventListener("change", (e) => { ctx.persona = e.target.value; saveCtx(); updateSuggestions(); });

  els.send.onclick = () => { const t = els.input.value.trim(); if (t) { els.input.value = ""; run(t); } };
  els.input.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); els.send.click(); } });

  els.recBtn.onclick = () => (recording ? stopRecording() : startRecording());
  els.refreshNotes.onclick = () => refreshNotes(true);
  els.copyNotes.onclick = () => { navigator.clipboard.writeText(els.notesOut.innerText || "").then(() => setRecStatus("notes copied")); };
})();
