# Project: thinhcorner.com

Personal blog and portfolio site for Ngô Phú Thịnh.

## Tech Stack

- **Framework**: Astro 5 with MDX
- **Styling**: Tailwind CSS 4 with `@tailwindcss/typography`
- **Deployment**: Vercel (with ISR for `/reading` and `/music`)
- **Package Manager**: bun (always use `bun` instead of `npm`/`yarn`/`pnpm`)

## Commands

```bash
bun install        # Install dependencies
bun run dev        # Start dev server
bun run build      # Build for production
bun run preview    # Preview production build
```

## Design System

### Theme & Colors

- **Dark mode only** — `bg-zinc-900` body, `text-white` default
- **Accent**: `text-yellow-500` for links, highlights, interactive elements. Hover: `hover:text-yellow-400` or `hover:text-yellow-500`
- **Theme color**: `#18181b` (zinc-900)

### Fonts

- **Headings**: `font-heading` → "Iosevka Etoile" (defined as `--font-heading`)
- **Body**: "Iosevka Aile" (defined as `--font-normal`, set on `body`)
- Installed via `@fontsource/iosevka-etoile` and `@fontsource/iosevka-aile`, preloaded in `Head.astro`

### Text Hierarchy

- **Primary**: `text-white` (headings, important text)
- **Secondary**: `text-zinc-200` (nav active, section headers, names)
- **Body**: `text-zinc-300` (list items, descriptions)
- **Muted**: `text-zinc-400` (paragraphs, subtitles, metadata)
- **Subtle**: `text-zinc-500` (labels, tags, section labels, timestamps)
- **Faint**: `text-zinc-600` (dates in lists, year badges)

### Border Radius

- Use `rounded-surface` (1rem via `--radius-surface`) for cards, containers, and nav links
- Use `rounded-lg` for hover states on list items
- Use `rounded-full` for tags/badges
- Use `rounded-md` for images

### Frequently Used Patterns

**Card / Container**:

```
bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 backdrop-blur-sm rounded-surface border border-zinc-700/50
```

**Card (alternate, lower opacity)**:

```
bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 backdrop-blur-sm rounded-surface border border-zinc-700/40
```

**Card hover**: `hover:border-zinc-600/60 hover:from-zinc-800/80 transition-all`

**Section label**: `text-sm font-mono text-zinc-500 uppercase tracking-wider`

**Section header with divider line**:

```html
<div class="flex items-center gap-3 mb-5">
  <h2 class="text-xl text-zinc-200 font-mono font-bold">Title</h2>
  <div class="flex-1 h-px bg-zinc-800" />
</div>
```

**Page title**: `text-4xl tracking-tight font-bold sm:text-6xl font-heading`

**List item row (blog post style)**:

```
group flex items-baseline gap-4 py-2 px-3 -mx-3 rounded-lg hover:bg-zinc-800/40 transition-colors
```

**Timestamp**: `text-xs font-mono text-zinc-600 min-w-[5.5rem]`

**Tag / Badge**: `text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-500 border border-zinc-700/50`

**External link**: `text-yellow-500 hover:underline` or `hover:text-yellow-500 transition-colors`

**Prev/Next nav card**: `rounded-surface border border-zinc-700/50 p-4 transition-colors hover:border-gray-600`

**Draft banner**: `rounded-surface border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-yellow-500`

**Footer**: `border-t border-zinc-800 pt-8 pb-12 text-sm text-zinc-400`

**Page bottom spacing**: `pb-24`

### Prose (Article Content)

Blog articles use Tailwind Typography with these overrides:

```
prose prose-invert max-w-none
prose-h2:font-heading prose-h3:font-heading prose-h4:font-heading
prose-a:text-yellow-500
prose-hr:border-zinc-700
prose-code:bg-[#24292e] prose-code:p-0.5 prose-code:rounded
prose-code:before:content-[''] prose-code:after:content-['']
prose-img:mx-auto
prose-table:my-auto
```

## Components

### Layout (`src/layouts/Layout.astro`)

Top-level page wrapper. Props: `title`, `description`, `image?`, `lang?` (default "en"), SEO props (`type`, `author`, `publishedTime`, `structuredData`, etc.). Renders `<Head>`, `<Header>`, `<main id="main-content">`, and Vercel SpeedInsights.

### Container (`src/components/Container.astro`)

Content width wrapper: `max-w-3xl mx-auto px-4 sm:px-6 lg:px-8`. Used by every page.

### Header (`src/components/Header.astro`)

Site navigation with `transition:persist`. Nav links: home, now, projects, blog, reading, music. Active link: `text-white font-semibold`. Inactive: `text-gray-300 hover:text-white`. All uppercase.

### TimelineItem (`src/components/TimelineItem.astro`)

Used on `/now` page. Props: `title`, `icon` (emoji), `time?`. Renders a timeline dot with icon and formatted relative time.

### EditOnGithub (`src/components/EditOnGithub.astro`)

Shown at the bottom of blog posts. Props: `slug`. Links to GitHub source for the post.

### ChatGPTFrame (`src/components/ChatGPTFrame.astro`)

Embeddable AI chat conversation frame for MDX posts. Props: `title?`, `date?`, `model?`, `chatbot?` ("chatgpt" | "gemini" | "grok"). Dark themed (`bg-[#212121]`).

### Head (`src/components/Head.astro`)

Full `<head>` with meta tags, Open Graph, Twitter Cards, canonical URL, font preloading, and optional structured data (JSON-LD).

## Content

### Blog Collection (`src/content/blog/`)

- Each post is a folder with `index.md` or `index.mdx`
- Schema: `title`, `description`, `date`, `draft?`, `lang?`
- Sorted by date descending everywhere
- Remark plugins: reading time, modified time, rehype-figure
- Images in posts get `medium-zoom` (lazy-loaded on idle)

### Pages

| Route        | Prerender | Description                             |
| ------------ | --------- | --------------------------------------- |
| `/`          | Yes       | Homepage with intro + latest 5 posts    |
| `/now`       | Yes       | Timeline of life events                 |
| `/projects`  | Yes       | Project showcase cards                  |
| `/blog`      | Yes       | All posts grouped by year               |
| `/blog/[id]` | Yes       | Individual blog post with prev/next nav |
| `/reading`   | No (ISR)  | Goodreads integration, books by year    |
| `/music`     | No (ISR)  | Spotify integration, recent tracks      |
| `/rss.xml`   | Yes       | RSS feed                                |

## Path Aliases

- `@/` → `src/` (configured in tsconfig)
