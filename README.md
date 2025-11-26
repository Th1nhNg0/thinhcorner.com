# Thinh's Corner

> My blog tone is curious, analytical, and nerdy-intellectual—mixing computer science depth, systems thinking, and reflective explorations of tech, games, and society in a way that's both technical and philosophical.

A personal website built with [Astro](https://astro.build/), featuring a blog with MDX support, and integrations with Spotify and Goodreads.

## ✨ Features

- **Blog:** Content managed using Astro's Content Collections with MD/MDX support (`src/content/blog`).
- **Pages:** Home, Blog, Music, Reading, Crypto, and Now page.
- **RSS Feed:** Automatically generated at `/rss.xml`.
- **Dynamic Open Graph Images:** Auto-generates OG images for blog posts using `@vercel/og`.
- **Spotify Integration:** Shows current listening activity (`/music` page).
- **Goodreads Integration:** Displays reading activity (`/reading` page).
- **Math Support:** KaTeX integration via `remark-math` and `rehype-katex`.
- **Reading Time:** Auto-calculated reading time for blog posts.
- **Tailwind CSS v4:** Modern styling with typography plugin.
- **TypeScript:** Type safety throughout the project.

## 🛠️ Tech Stack

- [Astro](https://astro.build/) v5 - Static site generator
- [Tailwind CSS](https://tailwindcss.com/) v4 - Styling
- [MDX](https://mdxjs.com/) - Enhanced Markdown with JSX
- [KaTeX](https://katex.org/) - Math rendering
- [ECharts](https://echarts.apache.org/) - Data visualization
- [Vercel](https://vercel.com/) - Deployment
- [Bun](https://bun.sh/) - JavaScript runtime & package manager

## 🚀 Getting Started

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Th1nhNg0/thinhcorner.com
    cd thinhcorner.com
    ```

2.  **Install dependencies:**

    ```bash
    bun install
    ```

3.  **Environment Variables:**
    Create a `.env` file with the necessary API keys:

    ```env
    SPOTIFY_CLIENT_ID=your_client_id
    SPOTIFY_CLIENT_SECRET=your_client_secret
    SPOTIFY_REFRESH_TOKEN=your_refresh_token
    PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id
    ```

4.  **Run the development server:**

    ```bash
    bun dev
    ```

    Open [http://localhost:4321](http://localhost:4321) to view the site.

5.  **Build for production:**
    ```bash
    bun run build
    ```

## 📝 Creating Blog Posts

Add a new folder under `src/content/blog/` with an `index.md` or `index.mdx` file:

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
src/content/blog/
  your-post-slug/
    index.md      # Main content file
    image.jpg     # Optional: images/assets
    chart.html    # Optional: embedded content
```

## ☁️ Deployment

Deployed on [Vercel](https://vercel.com/). See [Astro Deployment Guides](https://docs.astro.build/en/guides/deploy/) for other options.

## 📄 License

MIT
