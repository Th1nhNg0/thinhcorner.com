# Thinh's Corner

> My blog tone is curious, analytical, and nerdy-intellectual—mixing computer science depth, systems thinking, and reflective explorations of tech, games, and society in a way that's both technical and philosophical.

A personal website built with [Astro](https://astro.build/), featuring a blog with MDX support, and integrations with Spotify and Goodreads.

## Features

- **Blog:** Content managed using Astro's Content Collections with MD/MDX support (`data/writing`).
- **RSS Feed:** Automatically generated at `/rss.xml`.
- **Dynamic Open Graph Images:** Auto-generates OG images for blog posts using `@vercel/og`.
- **Spotify Integration:** Shows listening activity (`/music` page).
- **Goodreads Integration:** Displays reading activity (`/reading` page).
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

3. **Set up environment variables:**

    ```bash
    cp .env.example .env
    ```

    | Variable | Description |
    |---|---|
    | `SPOTIFY_CLIENT_ID` | Spotify app client ID |
    | `SPOTIFY_CLIENT_SECRET` | Spotify app client secret |
    | `SPOTIFY_REFRESH_TOKEN` | Spotify OAuth refresh token |
    | `PUBLIC_GOOGLE_ANALYTICS_ID` | Google Analytics measurement ID |

4. **Run the development server:**

    ```bash
    bun run dev
    ```

    Open [http://localhost:4321](http://localhost:4321) to view the site.

5. **Build for production:**

    ```bash
    bun run build
    ```

## Creating Blog Posts

Add a new folder under `data/writing/` with an `index.md` or `index.mdx` file:

```markdown
---
title: "Your Blog Post Title"
description: "A brief description for SEO and previews"
date: "YYYY-MM-DD"
lang: "en" # Optional: "en" or "vi"
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
- Add environment variables under **Settings → Environment variables**

### Manual deploy

```bash
bun run build
bunx wrangler deploy
```

## Token usage sync

The `/data/token-usage` page renders `data/ccusage.json`, a compact snapshot of local
[ccusage](https://github.com/ryoppippi/ccusage) data merged from every machine I use.
Machines push their own slice with a one-liner — no manual clone:

```bash
# sync this machine's usage, commit and push
curl -fsSL https://raw.githubusercontent.com/Th1nhNg0/thinhcorner.com/master/scripts/sync-ccusage.sh | sh

# same script, served from the deployed site (public/sync.sh)
curl -fsSL https://thinhcorner.com/sync.sh | sh

# also install a daily scheduler (cron / launchd / Task Scheduler)
curl -fsSL https://thinhcorner.com/sync.sh | sh -s -- --install-cron
curl -fsSL https://thinhcorner.com/sync.sh | sh -s -- --install-cron --at 08:30
curl -fsSL https://thinhcorner.com/sync.sh | sh -s -- --uninstall-cron

# inspect the setup, or compute without committing
curl -fsSL https://thinhcorner.com/sync.sh | sh -s -- --status
curl -fsSL https://thinhcorner.com/sync.sh | sh -s -- --dry-run
```

The bootstrap shallow-clones this repo into a temp dir, runs
`bun scripts/update-ccusage.ts` (same as `bun run data:usage`), commits, pushes;
Cloudflare Workers then rebuilds the site. Nothing is left behind except the cached
copy the scheduler runs, and `--help` lists the passthrough flags (`--no-commit`,
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
