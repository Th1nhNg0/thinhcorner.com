// @ts-check
import { defineConfig, memoryCache } from "astro/config";

import mdx from "@astrojs/mdx";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import rehypeFigure from "./remark/rehype-figure.mjs";
import { remarkModifiedTime } from "./remark/remark-modified-time.mjs";
import { remarkReadingTime } from "./remark/remark-reading-time.mjs";

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://thinhcorner.com",
  trailingSlash: "never",
  adapter: cloudflare({
    imageService: "cloudflare-binding",
    prerenderEnvironment: "node",
  }),
  integrations: [
    sitemap(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
    mdx(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  experimental: {
    cache: {
      provider: memoryCache(),
    },
  },
  markdown: {
    remarkPlugins: [remarkReadingTime, remarkModifiedTime, remarkMath],
    rehypePlugins: [rehypeKatex, rehypeFigure],
    gfm: true,
  },
});
