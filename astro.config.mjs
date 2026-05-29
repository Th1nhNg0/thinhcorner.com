import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import rehypeFigure from "./remark/rehype-figure.mjs";
import { remarkReadingTime } from "./remark/remark-reading-time.mjs";
import { unified } from "@astrojs/markdown-remark";

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
    processor: unified({
      remarkPlugins: [remarkReadingTime, remarkMath],
      rehypePlugins: [rehypeKatex, rehypeFigure],
      gfm: true,
    }),
  },
});
