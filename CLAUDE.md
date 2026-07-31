# Kairos — Working Agreement (read me first)

Kairos is a Chrome side-panel AI sales assistant for account executives to use during live calls.

- **Repo:** `matildagylee/kairos-sales-assistant` (private, personal account). Push with `gh auth switch --user matildagylee` first.
- **Owner:** Matilda.

## How we work: phases
- Work happens in **phases**. Each phase = a dedicated git **branch** (and a worktree folder when useful, e.g. `../kairos-<phase>`).
- A phase is **only "done" when Matilda confirms it with a real test**, not when the code compiles or looks right.
- At the end of every phase:
  1. Push the phase branch to GitHub.
  2. **ALWAYS ask Matilda: "Merge this into `main`? yes / no."** Never merge without an explicit yes. She wants to be able to revert, so `main` stays clean and each phase stays isolated until approved.
  3. Start the next phase on a new branch.

## Strategic decisions
- **Always use the AskUserQuestion tool** when discussing strategic phases, the roadmap, scope, or any choice with real tradeoffs. Lead with a recommendation, but let Matilda decide.
- Challenge assumptions. Push back when something won't serve the AE-on-a-call use case.

## Records to keep current
- `planning/roadmap.md` — the living roadmap: phases, status, what's left to build.
- `docs/decision-log.md` — **automatically log every decision we make, as we make it** (what + why + date). Do not wait to be asked.
  - This includes product, scope, design, technical, and workflow decisions.
  - **If you are unsure whether something counts as a decision worth logging, ask Matilda** ("log this or not?") rather than silently skipping it.

## Output style (everything)
- Plain language, no jargon, bullets, no em dashes. Straightforward, concise, relevant.
