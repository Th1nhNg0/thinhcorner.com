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

## 5. Checks and test runs (2026-11-11, second pass)
- **METR 2025 RCT verified**: https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/
  - 16 experienced open source developers, 246 real issues, AI allowed on a random half. 19% longer with AI. They forecast a 24% speedup and afterwards still estimated 20%. Tools: mostly Cursor Pro with Claude 3.5/3.7 Sonnet.
  - METR now labels the page out of date. Follow-up (2026-02-24): https://metr.org/blog/2026-02-24-uplift-update/ says late-2025 tools likely speed developers up, but the data is unreliable (selection effects), so no clean number. Cite both together.
- **Doubling time correction**: Time Horizon 1.1 gives 131 days for models since 2023 and 89 days since 2024 (about 7x and 17x a year). The "3.5 months" in section 2 matches the older TH1.0 figure (109 days). "About 10x a year" is a rounding between the two, not a METR number.
- **TimeHorizon chart**: GPT-4 3.5, Claude 3.7 60, o3 121, GPT-5 214, Opus 4.5 320 min all match TH1.1. GPT-4o is 6 min in the chart; TH1.1 text gives about 5 [3, 10]. Opus 4.6 and Mythos values not re-checked (not on the pages fetched).
- **ModelGap chart**: all low/max scores match the AA leaderboard as fetched today. The page does not show an index version number, so "v5" is unconfirmed.
- **Rocket game runs** (prompt A, one try each, files in scratch/game-compare):
  - ChatGPT Plus, thinking set to Medium (default), 2m 14s. Model name not shown in the UI. Bug: bottom walls are drawn as a thin line only (collision still works).
  - Claude, Fable 5.2, medium effort. No bugs found in the recorded run.
  - Gemini, 3.8 Flash (default "All-around help"), run on a Pro account, so label it by model and not as "Gemini Free". Bug: ignores devicePixelRatio when drawing, so on a 2x screen the game fills only the top-left quarter. Looks normal on a 1x desktop monitor.
  - ChatGPT Free: not run yet. Also pending: B-lazy, B-good.
  - Clips: 360x640 viewport at 2x, touch input, Playwright fake clock, same bot for every game (flies 3 gaps, crashes, taps restart).
- **ChatGPT Free runs** (done later the same day in a clean Chromium window with no account, so "Free" here means logged out):
  - Prompt A, first try: no game. Reply said the request "triggered an image-generation capability that requires logging in", with a "Log in to create and download files for free" box. Screenshot: A-free-loggedout.webp.
  - Prompt A, second try in a new chat: wrote the game inline (about 12 KB). It plays correctly in the recorded run, no bugs found. This is the clip, so it is not a first try like the others.
  - Prompt B lazy: a generic 3-day list (Xuan Huong Lake, railway station, night market, Datanla, cable car, strawberry farm) with photo strips, then a 6-question form. No costs. Screenshot: B-lazy.webp.
  - Prompt B good: asked 3 questions (dates, bus type, room type). I answered "that weekend, overnight sleeper bus, budget guesthouse private room" as stand-ins. Plan: 4.5M VND budget table, noticed "back Monday morning" means the Sunday night bus so only one guesthouse night, per-item costs, flagged fares as needing confirmation. After the follow-up it cut Sunday to one walk, one cafe, meals, and listed 5 things removed. A sign-up dialog appeared after the second reply, and a sponsored hotel ad sits under the last one. Screenshot: B-good.webp (720 x 11713, needs cropping for the post). Full text in the scratchpad only.
