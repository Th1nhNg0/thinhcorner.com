# Project: thinhcorner.com

Personal blog and portfolio site for Ngô Phú Thịnh.

## Tech Stack

- **Framework**: Astro 5 with MDX
- **Styling**: Tailwind CSS 4
- **Deployment**: Vercel (with ISR)
- **Package Manager**: bun (always use `bun` instead of `npm`/`yarn`/`pnpm`)

## Commands

```bash
bun install        # Install dependencies
bun run dev        # Start dev server
bun run build      # Build for production
bun run preview    # Preview production build
```

## Design System

- **Theme**: Dark mode only (zinc-900 background)
- **Accent**: yellow-500 for links, highlights, interactive elements
- **Fonts**: "Iosevka Etoile" (headings, `font-heading`), "Iosevka Aile" (body)
- **Cards**: `bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 backdrop-blur-sm rounded-surface border border-zinc-700/50`
- **Section labels**: `text-sm font-mono text-zinc-500 uppercase tracking-wider`
- **Text hierarchy**: white → zinc-200 → zinc-400 → zinc-500 → zinc-600
- **Border radius**: use `rounded-surface` (1rem) for cards
