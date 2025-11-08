// @ts-check
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import rehypeFigure from "./remark/rehype-figure.mjs";
import { remarkModifiedTime } from "./remark/remark-modified-time.mjs";
import { remarkReadingTime } from "./remark/remark-reading-time.mjs";

import yeskunallumami from "@yeskunall/astro-umami";

export default defineConfig({
  site: "https://thinhcorner.com",
  adapter: vercel({
    imageService: true,
    isr: {
      expiration: 60 * 15,
    },
    webAnalytics: {
      enabled: true,
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
    yeskunallumami({
      id: process.env.PUBLIC_UMAMI_ID || "",
      hostUrl: process.env.PUBLIC_UMAMI_HOST_URL || "",
      withPartytown: true,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkReadingTime, remarkModifiedTime, remarkMath],
    rehypePlugins: [rehypeKatex, rehypeFigure],
    gfm: true,
  },
});
