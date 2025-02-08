// @ts-check
import { defineConfig } from "astro/config";

import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { remarkModifiedTime } from "./remark/remark-modified-time.mjs";
import { remarkReadingTime } from "./remark/remark-reading-time.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://thinhcorner.com",
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
