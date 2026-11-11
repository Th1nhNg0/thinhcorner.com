# Research notes: "Why you should learn to use AI before it's too late"
Collected 2026-11-11. Primary sources first; secondary ones flagged.

## 1. Who pays for AI
- **Menlo Ventures, State of Consumer AI 2026** (survey of 5,067 US adults with Morning Consult, July 2026)
  https://www.menlovc.com/perspective/2026-the-state-of-consumer-ai/ · PDF: https://menlovc.com/wp-content/uploads/2026/09/menlo_ventures_consumer_ai_report-2026.pdf
  - 55% of US AI users pay for at least one AI product (~90M Americans).
  - 2025 report said only 3% of AI users paid, but that was a *global* estimate over 1.8B users. Not the same base, don't chart 3% → 55% as one line.
  - 25% of Americans use AI daily (19% a year ago). Among AI users, daily use 31% → 39%.
  - Consumer AI spend: ~$12B (2025) → ~$40B (2026, estimate).
  - Typical payer spends $20–49/mo; the 14% who spend $100+/mo are 60% of all consumer spend.
  - **Payers vs non-payers:** daily use 50% vs 26%; use an AI agent 65% vs 13%; among agent users 92% pay.
- **OpenAI (via TechCrunch, 2026-02-27):** 900M weekly users, 50M paying subscribers (all tiers incl. business) → ~5.6% of weekly users.
  https://techcrunch.com/2026/02/27/chatgpt-reaches-900m-weekly-active-users
  - Weekly users later 1.2B (DevDay, 2026-09-29, per technologychecker.io, secondary). No newer subscriber number published.

## 2. How fast AI changed (METR time horizon)
Length of software task (in human time) a model finishes with 50% success.
- Page: https://metr.org/time-horizons/ (no longer updated since 2026-09-08; measurements >16h unreliable)
- Time Horizon 1.1: https://metr.org/blog/2026-01-29-time-horizon-1-1/ → doubling ~every 3.5 months for 2024–25 models (~10x/year); original paper said 7 months.
- Values (from METR page + agitracker.io summary, 2026-09-23, secondary for some numbers):
  - GPT-4o, mid-2024: ~4 min
  - GPT-5, Aug 2025: ~2h17m (METR page)
  - Claude Opus 4.5, Nov 2025: ~293–320 min (~5h)
  - Claude Opus 4.6, Feb 2026: ~12h (CI 5–60h)
  - Claude Mythos Preview (early), tested Mar 2026: ~17.4h (CI 8.5–55h)
  - GPT-5.6 Sol, Jun 2026: ~11.3h, METR said not robust (cheating runs)
  - After that METR stopped headline time horizons (task suite saturated). That itself is a point: the ruler ran out.
- Caveat note from METR: https://metr.org/notes/2026-01-22-time-horizon-limitations/

## 3. Free vs paid vs frontier (Nov 2026)
- ChatGPT Free and Go: GPT-6 Luna in Chat (from ~Oct 8 2026). Plus/Pro/Business: GPT-6 Sol. (layer3labs.io guide, updated 2026-10-11, secondary; help.openai.com page couldn't be fetched)
- Plans: Plus $20, Pro $100 / $200 (Pro $200 sign-ups paused 2026-09-10). Manual higher reasoning levels are paid-only. (buildfastwithai.com, 2026-09-25, secondary)
- **Artificial Analysis Intelligence Index v5** (leaderboard fetched 2026-11-11, https://artificialanalysis.ai/leaderboards/models), highest variant:
  - Claude Fable 5.2: 65
  - Claude Opus 5.5: 59
  - GPT-6 Astra: 57
  - GPT-6.1 Sol: 55
  - GPT-6.1 Terra: 51
  - Claude Haiku 5.5: 36
  - Gemini 3.8 Flash: 31
  - GPT-6 Luna (free ChatGPT): 28
  → the free ChatGPT model scores less than half of the best paid model.
- TODO: confirm exact Luna/Sol variants on AA before publishing; capture real side-by-side outputs (same prompt on Free / Plus / Claude).

## 4. Skill gap (added after brainstorm)
- Anthropic Economic Index "Learning curves" (Feb 5–12 2026 data): https://www.anthropic.com/research/economic-index-march-2026-report
  - Users who signed up 6+ months earlier: ~10% higher conversation success (3–5 pp in regressions, within same task). They iterate more, delegate less, use it more for work (+7 pp), on tasks needing more education. Caveat: self-selection/survivorship, association not proof.
- Anthropic AI Fluency Index (Feb 23 2026, 9,830 conversations): https://www.anthropic.com/research/AI-fluency-index
  - 85.7% iterate; iterative chats 5.6x more likely to question reasoning, 4x more likely to flag missing context. Only 30% tell the AI how to work with them.
- METR 2025 developer RCT (verify before use): experienced OSS devs were ~19% slower with AI while believing they were faster.
