# Copilot Instructions for Thinh's Corner Blog

## Project Architecture

This is an **Astro-based personal blog** with Vietnamese/English content, external API integrations, and custom remark plugins. The site focuses on performance with SSG + selective ISR.

### Key Technologies

- **Astro 5** with Vercel adapter (ISR enabled, 15min cache)
- **TailwindCSS 4** with Typography plugin for prose
- **pnpm** as package manager
- **Custom remark/rehype plugins** for enhanced markdown processing

### Content Management Pattern

**Blog posts** live in `src/content/blog/[slug]/index.{md,mdx}` with this frontmatter schema:

```yaml
title: string (required)
description: string (required)
date: string|Date (required)
draft: boolean (optional)
tags: string[] (optional)
lang: string (optional) # for Vietnamese posts
```

**Auto-injected frontmatter** via remark plugins:

- `minutesRead`: Reading time via `remark-reading-time.mjs`
- `lastModified`: Git commit date via `remark-modified-time.mjs`

### External API Integration Pattern

**Spotify integration** (`src/lib/spotify.ts`):

- Uses OAuth refresh token flow
- Requires `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN` env vars
- Pages using Spotify **must set `export const prerender = false`** (see `src/pages/music.astro`)

**Environment setup**:

- Copy `.env.example` → `.env` for local development
- All API integrations are optional - pages gracefully handle missing env vars

### Development Workflow

**Commands**:

- `pnpm dev` - Development server (port 4321)
- `pnpm build` - Production build with Vercel optimizations
- `pnpm preview` - Preview production build

**Key file patterns**:

- `src/pages/*.astro` - Route pages
- `src/pages/[...id]/` - Dynamic routing (used for blog posts)
- `src/components/*.astro` - Reusable UI components
- `src/lib/*.ts` - Utility functions and API clients

### Styling Conventions

**TailwindCSS patterns**:

- Dark theme default: `bg-zinc-900 text-white`
- Prose styling: `prose max-w-none prose-invert prose-a:text-yellow-500`
- Responsive grids: `grid grid-cols-2 md:grid-cols-3`
- Hover states: `hover:bg-zinc-700/50 transition-all`

**Typography**:

- Headings use `@fontsource-variable/genos`
- Body text uses `@fontsource-variable/lexend`
- Gradient text effect: `gradient-text` class

### Custom Remark/Rehype Processing

**Math support**:

- `remark-math` + `rehype-katex` for LaTeX equations
- KaTeX CSS automatically included

**Image enhancement**:

- `rehype-figure.mjs` - Wraps images in `<figure>` with captions
- `medium-zoom` for image lightbox (configured in `Layout.astro`)

**Content enhancement**:

- Reading time calculation from markdown AST
- Git-based last modified dates (falls back to filesystem if needed)

### Component Architecture

**Layout hierarchy**:

- `Layout.astro` - Base layout with Head, Header, medium-zoom setup
- `Container.astro` - Content wrapper with consistent spacing
- Page-specific components in `src/components/`

**Data fetching pattern**:

- API calls in page frontmatter (Astro's top-level await)
- External APIs return typed interfaces (see `spotify.ts` exports)
- Error handling via optional chaining and fallback states

### Constants and Configuration

**Site config** (`src/consts.ts`):

- `SITE` - Core metadata (title, description)
- `SOCIAL_MEDIA` - External profile URLs
- `GITHUB_CONTENT_SOURCE` - Links to source files for edit functionality

### Performance Considerations

**Vercel ISR setup**:

- 15-minute cache expiration for dynamic pages
- Image optimization enabled
- Web Analytics enabled

**Image handling**:

- Use Astro's built-in image optimization
- Store images in `public/` for static assets
- Co-locate blog images in content directories
