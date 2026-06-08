import { defineConfig, fontProviders } from "astro/config";

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
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Quicksand",
      cssVariable: "--font-quicksand",
      weights: [400, 500, 600, 700],
      styles: ["normal"],
      subsets: ["latin", "latin-ext", "vietnamese"],
      formats: ["woff2", "woff"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Asimovian",
      cssVariable: "--font-asimovian",
      weights: [400],
      styles: ["normal"],
      subsets: ["latin", "latin-ext", "vietnamese"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "JetBrains Mono",
      cssVariable: "--font-jetbrains-mono",
      weights: [400, 700],
      styles: ["normal"],
      subsets: ["latin", "latin-ext"],
      fallbacks: ["monospace"],
    },
  ],
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
