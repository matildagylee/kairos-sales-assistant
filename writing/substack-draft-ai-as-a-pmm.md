# Substack draft: How I use AI as a PMM (built from the Kairos repo)

> **Notes for Matilda before publishing (delete this box)**
> - The repo is private and holds internal data. This draft keeps it public-safe: no battlecard content, no Gong quotes, no customer names, no internal roadmap items.
> - I wrote "my company" instead of naming Gorgias. Swap it in if you are comfortable naming your employer.
> - Numbers used (9 battlecards, 9 personas, 27 customer stories, 3 bullets, under 2 seconds) all come from the repo. Double check you are fine sharing them.
> - Pick a title below, then cut anything that does not sound like you.

---

## Title options
1. I'm a product marketer. I built a sales tool with AI. Here's every skill it took.
2. The PMM stack is changing: what building an AI sales copilot taught me
3. From battlecard to side panel: how I actually use AI as a PMM

**Subtitle:** Competitive intel, positioning, customer proof, and a live-call copilot. A real project, not a prompt list.

---

## The draft

Most "how I use AI at work" posts are a list of prompts. This one is different. Over the last few months I built **Kairos**, a Chrome side panel that sits next to a sales call and helps an account executive answer questions in real time. I'm not an engineer. I'm a product marketer.

What surprised me is that the hard parts were not the code. The hard parts were the same things I do every day as a PMM: knowing the competition, knowing the buyer, picking the right proof, and saying less. AI just made it possible for me to ship those skills as a product instead of a slide deck.

Here is what that looked like, skill by skill.

### 1. Competitive intelligence, compressed to one move

**The old way:** a battlecard is a long doc. Strengths, weaknesses, landmines, discovery questions. Reps read it before a call, maybe.

**What I learned:** on a live call, a rep glances at a screen for under two seconds. A great battlecard that takes 30 seconds to read is useless in that moment.

**What I built:** each of our 9 competitor battlecards now opens as one line: "Say this." Everything else (why we win, their weak spot, discovery questions) sits behind a tap.

**How AI helped:** I gave the AI the full battlecards and asked it to rewrite each one into a single sayable sentence, then I edited every line by hand. AI is great at the first cut. The judgment of which line a rep will actually say out loud is still mine.

**Real use case:** a prospect says "we're also looking at [competitor]." The rep picks the competitor from a dropdown and sees one opening line instantly, not a wall of text.

### 2. Positioning and personas, as rules the AI must follow

Positioning is usually a doc people agree with and then ignore. I turned ours into something the AI has to obey.

- I loaded 9 buyer personas and our core positioning into the tool.
- The rep picks who they are talking to (for example, a founder versus a head of support).
- The answer changes to match. A founder hears about revenue. A support leader hears about workload.

**The PMM lesson:** if your positioning cannot be written as clear rules, it is not clear enough yet. Writing it for an AI forced me to sharpen it.

### 3. Customer proof that matches the prospect

Every PMM has a pile of case studies. The problem is finding the right one in the moment.

- I curated **27 flagship customer stories** (out of roughly 100 public ones).
- Each one is tagged by industry, company size, and the tool they switched from.
- When a rep sets the prospect's industry or competitor, Kairos suggests the story that fits.

**Why curated and not all 100:** a live call needs a few high-signal stories, not everything. I chose quality over coverage on purpose, and I wrote that choice down (more on that below).

**Real use case:** a beauty brand switching from a competitor asks "who else like us has done this?" The rep gets a beauty brand that made the same switch, with one metric and a link to send after the call.

### 4. Voice of the customer, straight from call recordings

This was my favorite part. I used AI to search our recorded sales calls for closed-won deals and pull out **verbatim quotes** where customers explained why they left a competitor.

- Exact words, not paraphrased.
- Tagged by competitor, company size, and the reason.
- Linked back to the original call so anyone can check it.

**The PMM lesson:** a real customer saying "we left because X" beats any message I could write. AI made it possible to find those quotes across hundreds of calls in an afternoon instead of a quarter.

### 5. Competitive teardowns, with honesty built in

Before building, I had AI help me research the closest product on the market and how it works under the hood.

One habit I'd recommend to every PMM: **label every claim as a fact or a guess.** In my teardown, anything the company stated or a reviewer saw is marked FACT. Anything I reasoned from the outside is marked INFER. AI research tools will happily blend the two. Your credibility depends on you keeping them apart.

### 6. Roadmap messaging with guardrails

Reps love to talk about what is coming next. That is also how promises get made that product cannot keep.

So I split the roadmap into three buckets:
- **Shipped recently:** talk about it freely.
- **Next three months:** fine to tease.
- **Later:** the AI is told it can never promise or put a date on these.

**The PMM lesson:** guardrails are messaging. Deciding what a rep must never say is just as much our job as deciding what they should say.

### 7. Sales enablement is a speed problem

I did not expect to spend weeks reading about speed. But a slow answer on a live call is a wrong answer.

The biggest insight, in plain words:
- The AI reads all the source material once and remembers it, so each new question only adds a few words of work.
- Short answers are fast answers. Capping replies at **3 short bullets** made them several times faster.

So "keep it to three bullets" turned out to be both a messaging rule and a technical one. That is the most PMM sentence I have ever written.

### 8. Working with AI like a teammate, not a vending machine

This is the part I think most people skip. Here is the working agreement I gave my AI assistant:

- **Work in phases.** Each phase is its own branch of work, so I can undo it cleanly.
- **Nothing is "done" until I test it for real.** Not when it compiles. Not when it looks right. When I play a real sales call and it works.
- **Always ask before merging.** The AI asks me "merge this? yes or no" every time.
- **Log every decision.** What we decided, why, and when. If the AI is unsure whether something counts, it asks.
- **Push back on me.** If an idea will not help a rep on a call, say so.

That decision log ended up being the most valuable file in the project. When I changed the design three times (light, then dark and glassy, then flat and on-brand), the log shows exactly why each version replaced the last. That is a habit I now bring to launches too.

---

## What I'd tell another PMM starting out with AI

- **Start with a real problem, not a tool.** Mine was "reps can't find the right answer fast enough on a call."
- **Use AI for the first draft, keep the judgment.** It writes the 80%. You decide the line a rep actually says.
- **Make your thinking explicit.** Positioning, guardrails, and style rules all got better once I had to write them down for a machine.
- **Write down your decisions.** Future you (and your stakeholders) will thank you.
- **Test with reality.** A real call, a real rep, a real objection.

I'm still building. Next up: having the tool notice a competitor mention on its own and surface the right card without the rep asking.

If you are a PMM using AI in a way that goes beyond prompts, I'd love to hear about it. Reply or leave a comment.
