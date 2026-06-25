import { defineConfig, fontProviders } from "astro/config";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { satteri } from "@astrojs/markdown-satteri";
import rehypeFigure from "./remark/rehype-figure.mjs";
import satteriKatex from "./remark/satteri-katex.mjs";

import cloudflare from "@astrojs/cloudflare";

const markdownProcessor = satteri({
  features: { math: true },
  mdastPlugins: [satteriKatex],
  hastPlugins: [rehypeFigure],
});

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
  integrations: [sitemap(), mdx({ processor: markdownProcessor })],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    processor: markdownProcessor,
  },
});
