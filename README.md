# Thinh's Corner

> My blog tone is curious, analytical, and nerdy-intellectual—mixing computer science depth, systems thinking, and reflective explorations of tech, games, and society in a way that's both technical and philosophical.

A personal website built with [Astro](https://astro.build/), featuring a blog with MDX support and a set of live personal data pages.

## Features

- **Blog:** Content managed using Astro's Content Collections with MD/MDX support (`data/writing`).
- **RSS Feeds:** Full-content feeds at `/rss.xml` (all posts), `/rss/en.xml` and `/rss/vi.xml`.
- **Dynamic Open Graph Images:** Generated for every post with [Satori](https://github.com/vercel/satori) and `sharp`.
- **Data pages (`/data`):** live pages for Spotify (`/data/music`), Goodreads (`/data/books`),
  Chess.com (`/data/chess`), Steam (`/data/steam`) and AI token usage (`/data/token-usage`),
  rendered on request and cached in Cloudflare KV.
- **Math Support:** KaTeX integration on Astro's Sätteri Markdown pipeline.
- **Reading Time:** Auto-calculated reading time for blog posts.
- **Tailwind CSS v4:** Modern styling with typography plugin.
- **TypeScript:** Type safety throughout the project.

## Tech Stack

- [Astro](https://astro.build/) v7
- [Tailwind CSS](https://tailwindcss.com/) v4
- [MDX](https://mdxjs.com/) - Enhanced Markdown with JSX
- [KaTeX](https://katex.org/) - Math rendering
- [Cloudflare Workers](https://workers.cloudflare.com/) - Deployment
- [Bun](https://bun.sh/) - Package manager

## Getting Started

1. **Clone the repository:**

    ```bash
    git clone https://github.com/Th1nhNg0/thinhcorner.com
    cd thinhcorner.com
    ```

2. **Install dependencies:**

    ```bash
    bun install
    ```

3. **Set up secrets** (read by the Cloudflare runtime, locally from `.dev.vars`):

    ```bash
    cp .dev.vars.example .dev.vars
    bun run generate-types   # regenerate worker-configuration.d.ts
    ```

    | Variable | Description |
    |---|---|
    | `SPOTIFY_CLIENT_ID` | Spotify app client ID |
    | `SPOTIFY_CLIENT_SECRET` | Spotify app client secret |
    | `SPOTIFY_REFRESH_TOKEN` | Spotify OAuth refresh token |
    | `STEAM_API_KEY` | Steam Web API key for `/data/steam` |

    Site settings (author, social links, Goodreads/Chess.com/Steam usernames, Google
    Analytics ID) live in `data/consts.ts`.

4. **Run the development server:**

    ```bash
    bun run dev
    ```

    Open [http://localhost:4321](http://localhost:4321) to view the site.

5. **Build for production:**

    ```bash
    bun run build
    ```

6. **Type check** (CI runs this and the build on every PR):

    ```bash
    bunx astro check
    ```

## Creating Blog Posts

Add a new folder under `data/writing/` with an `index.md` or `index.mdx` file:

```markdown
---
title: "Your Blog Post Title"
description: "A brief description for SEO and previews"
date: "YYYY-MM-DD"
lang: "en" # Optional: "en" or "vi"
updated: "YYYY-MM-DD" # Optional: last substantial revision (sets dateModified)
---

Your content here...
```

### File Structure

```
data/writing/
  your-post-slug/
    index.md      # Main content file
    image.jpg     # Optional: images/assets
```

## Deployment

Deployed on [Cloudflare Workers](https://workers.cloudflare.com/).

### Via Git (recommended)

Connect the repo in **Cloudflare Dashboard → Workers & Pages → Create → Connect to Git**, then set:

- Build command: `bun run build`
- Build output directory: `dist`
- Add the secrets above under **Settings → Variables and Secrets**
- Exclude the `ccusage-data` branch from non-production branch builds (it only holds data)

### Manual deploy

```bash
bun run build
bunx wrangler deploy
```

## Token usage sync

The `/data/token-usage` page renders `data/ccusage.json`, a compact snapshot of local
[ccusage](https://github.com/ryoppippi/ccusage) data merged from every machine I use.
The live copy lives on the orphan `ccusage-data` branch, so syncs never add commits to
`master` or trigger a rebuild: the page fetches it at request time (KV-cached ~15 min)
and falls back to the snapshot bundled from `master` if GitHub is unreachable.
`master`'s `data/ccusage.json` is that frozen fallback: it is expected to lag behind,
so don't update it by hand.
Machines push their own slice with a one-liner — no manual clone:

```bash
# sync this machine's usage, commit and push
curl -fsSL https://raw.githubusercontent.com/Th1nhNg0/thinhcorner.com/master/scripts/sync-ccusage.sh | sh

# same script, served from the deployed site (public/sync.sh)
curl -fsSL https://thinhcorner.com/sync.sh | sh

# also install a daily scheduler with auto boot/login catch-up (cron / launchd / Task Scheduler)
curl -fsSL https://thinhcorner.com/sync.sh | sh -s -- --install-cron
curl -fsSL https://thinhcorner.com/sync.sh | sh -s -- --install-cron --at 08:30
curl -fsSL https://thinhcorner.com/sync.sh | sh -s -- --uninstall-cron

# inspect the setup, or compute without committing
curl -fsSL https://thinhcorner.com/sync.sh | sh -s -- --status
curl -fsSL https://thinhcorner.com/sync.sh | sh -s -- --dry-run
```

The bootstrap clones the `ccusage-data` branch (a single JSON file) into a temp dir,
downloads `scripts/update-ccusage.ts` from `master` next to it, runs it, commits and
pushes to `ccusage-data` (the first run creates the branch from `master`'s snapshot).
`bun run data:usage` on a `master` checkout only updates the local file and never
commits. Nothing is left behind except the cached copy the scheduler runs, which
refreshes itself from `master` on every scheduled run and catches up automatically
on boot/login if the machine was off during the scheduled time; `--help` lists the passthrough flags (`--no-commit`,
`--no-push`, `ccusage` filters, …). `bun` and `git` are required, and git needs push
credentials: a stored credential helper, or `GH_TOKEN` in the config file below.

### Machine identity

`data/ccusage.json` keys usage by source id, defaulting to the hostname, and the site
sums sources per day. Keep the id stable per machine — two ids for one box double-count
every overlapping day. To pin it (and give headless runs a token):

```bash
mkdir -p ~/.config/thinhcorner
cat > ~/.config/thinhcorner/ccusage-sync.env <<'EOF'
CCUSAGE_SOURCE=DESKTOP-3CH2JO3
# GH_TOKEN=github_pat_...   # needed for cron/launchd/Task Scheduler runs
# THINHCORNER_AT=23:55
EOF
```

Scripts: [`scripts/sync-ccusage.sh`](scripts/sync-ccusage.sh) is the bootstrap and the
scheduler payload; [`public/sync.sh`](public/sync.sh) is a thin `curl | sh` shim served
at `/sync.sh` so the script has a single source of truth in the repo.

## License

MIT
