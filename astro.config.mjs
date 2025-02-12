// @ts-check
import { defineConfig } from "astro/config";

import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { remarkModifiedTime } from "./remark/remark-modified-time.mjs";
import { remarkReadingTime } from "./remark/remark-reading-time.mjs";
import mdx from "@astrojs/mdx";

export default defineConfig({
  site: "https://thinhcorner.com",
  adapter: vercel({
    imageService: true,
    isr: {
      expiration: 60 * 15,
    },
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
  markdown: {
    remarkPlugins: [remarkReadingTime, remarkModifiedTime, remarkMath],
    rehypePlugins: [rehypeKatex],
    gfm: true,
  },
});
