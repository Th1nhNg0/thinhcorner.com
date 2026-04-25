// @ts-check
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import rehypeFigure from "./remark/rehype-figure.mjs";
import { remarkReadingTime } from "./remark/remark-reading-time.mjs";

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://thinhcorner.com",
  trailingSlash: "never",
  adapter: cloudflare({
    prerenderEnvironment: "node",
  }),
  integrations: [sitemap(), mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkReadingTime, remarkMath],
    rehypePlugins: [rehypeKatex, rehypeFigure],
    gfm: true,
  },
});
