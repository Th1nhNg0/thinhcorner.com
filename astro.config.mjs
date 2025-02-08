// @ts-check
import { defineConfig } from "astro/config";

import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { remarkModifiedTime } from "./remark/remark-modified-time.mjs";
import { remarkReadingTime } from "./remark/remark-reading-time.mjs";

export default defineConfig({
  site: "https://thinhcorner.com",
  adapter: vercel({
    imageService: true,

    isr: {
      expiration: 60 * 60 * 24,
    },
  }),
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkReadingTime, remarkModifiedTime, remarkMath],
    rehypePlugins: [rehypeKatex],
    gfm: true,
  },
});
