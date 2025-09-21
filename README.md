# Personal Blog & Portfolio Site

> My blog tone is curious, analytical, and nerdy-intellectual—mixing computer science depth, systems thinking, and reflective explorations of tech, games, and society in a way that’s both technical and philosophical.

This is a personal website built with [Astro](https://astro.build/), featuring a blog, project showcases (implied, common use case), and integrations with external services like Spotify and Goodreads.

## ✨ Features

- **Blog:** Content managed using Astro's Content Collections (`src/content/blog`).
- **RSS Feed:** Automatically generated RSS feed available at `/rss.xml` (`src/pages/rss.xml.ts`).
- **SEO Friendly:** Includes a `robots.txt` file (`src/pages/robots.txt.ts`).
- **Dynamic Open Graph Images:** Automatically generates OG images for blog posts (`src/pages/blog/[...id]/og.png.ts`).
- **Spotify Integration:** Shows current listening activity or favorite tracks (powered by `src/lib/spotify.ts`). _Note: Requires environment variables for API keys._
- **Goodreads Integration:** Displays reading activity or book lists (powered by `src/lib/goodread.ts`). _Note: Requires environment variables for API keys._
- **Styled Components:** Uses global CSS for styling (`src/styles/global.css`).
- **Built with Astro:** Fast performance, zero JS by default.
- **TypeScript:** Type safety throughout the project.

## 🚀 Getting Started

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Th1nhNg0/thinhcorner.com
    cd thinhcorner.com
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or yarn install or pnpm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory and add the necessary API keys and secrets for Spotify and Goodreads integrations. Refer to `src/lib/spotify.ts` and `src/lib/goodread.ts` for potential required variables.

    ```env
    # Example (check required variables in the .ts files)
    SPOTIFY_CLIENT_ID=your_client_id
    SPOTIFY_CLIENT_SECRET=your_client_secret
    SPOTIFY_REFRESH_TOKEN=your_refresh_token
    GOODREADS_API_KEY=your_api_key
    GOODREADS_USER_ID=your_user_id
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    # or yarn dev or pnpm dev
    ```

    Open [http://localhost:4321](http://localhost:4321) (or the port specified in the terminal) to view the site.

5.  **Build for production:**
    ```bash
    npm run build
    # or yarn build or pnpm build
    ```
    This will create a `dist/` directory with the optimized static files.

## � Creating Blog Posts

To create a new blog post, add a new folder under `src/content/blog/` with an `index.md` or `index.mdx` file. Use the following template:

````markdown
---
title: "Your Blog Post Title"
description: "A brief description of your post for SEO and previews"
date: "YYYY-MM-DD"
lang: "en" # Optional: language code (e.g., "en", "vi")
---

Your blog post content goes here. You can use Markdown formatting.

## Section Header

- List item
- Another item

> Blockquote example

![Image alt text](path/to/image.jpg)

Code example:

```javascript
console.log("Hello, world!");
```
````

```

### File Structure
```

src/content/blog/
your-post-slug/
index.md # Main content file
image1.jpg # Optional: images/assets
chart.html # Optional: embedded HTML content

```

### Tips
- Use descriptive folder names (URL slugs)
- Include relevant images in the post folder
- For MDX files, you can use JSX components
- Dates should be in YYYY-MM-DD format
- Keep descriptions under 160 characters for SEO

## ☁️ Deployment

This Astro site can be deployed to various static hosting platforms like:

- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages
- AWS Amplify
- ...and many others!

Refer to the [Astro Deployment Guides](https://docs.astro.build/en/guides/deploy/) for specific instructions. Remember to configure your environment variables in your hosting provider's settings.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request if you have suggestions or improvements. (You can remove or modify this section as needed).
```
